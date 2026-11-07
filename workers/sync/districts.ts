import { createHash } from 'node:crypto';
import { districts, findDistrict, type District } from '../../src/lib/maps/districts.ts';
import { districtSourceUrl, DISTRICT_POLL_MS, type DistrictRow } from '../../src/lib/districts/results.ts';
import { parseDistrictReport } from '../../src/lib/districts/parse.ts';
import { fetchDistrictReport } from '../../src/lib/districts/fetch.ts';
import { UpstreamError } from '../../src/lib/data/fetch.ts';
import { reserveBudget } from './budget.ts';
import { acquireLock, backoffSeconds, releaseLock, waitForFetchSlot } from './state.ts';
import { JOBS_PER_MESSAGE, PENDING_TIMEOUT_MS, retrySeconds, sha256 } from './helpers.ts';

export type DistrictJob = { districtId: string; token: string; enqueuedAt: string };
type DistrictBatch = { version: 2; kind: 'district'; jobs: DistrictJob[] };
export function districtJobs(value: unknown): DistrictJob[] | null {
  const batch = value as Partial<DistrictBatch> | null;
  if (batch?.version !== 2 || batch.kind !== 'district' || !Array.isArray(batch.jobs)
    || !batch.jobs.length || batch.jobs.length > JOBS_PER_MESSAGE) return null;
  return batch.jobs.every(j => j && typeof j.districtId === 'string' && /^DC\d+$/.test(j.districtId) && !!findDistrict(j.districtId)
    && typeof j.token === 'string' && j.token.length > 0 && typeof j.enqueuedAt === 'string'
    && Number.isFinite(Date.parse(j.enqueuedAt))) ? batch.jobs : null;
}
export async function ensureDistrictSources(db: D1Database) {
  const known = await db.prepare('SELECT id FROM district_results').all<{id:string}>();
  const ids = new Set(known.results.map(r => r.id));
  const missing = districts.filter(d => !ids.has(d.id));
  if (missing.length) await db.batch(missing.map(d => db.prepare('INSERT OR IGNORE INTO district_results(id,source_url) VALUES (?,?)').bind(d.id,districtSourceUrl(d))));
}
export async function enqueueDistricts(env: SyncEnv) {
  const db = env.RESULTS_DB;
  await ensureDistrictSources(db);
  const now = new Date().toISOString(), cutoff = new Date(Date.now()-DISTRICT_POLL_MS).toISOString();
  const expired = new Date(Date.now()-PENDING_TIMEOUT_MS).toISOString();
  const due = await db.prepare(`SELECT id FROM district_results WHERE (successful_at IS NULL OR successful_at<=?)
    AND (pending_token IS NULL OR pending_since<=?) AND (retry_after IS NULL OR retry_after<=?) ORDER BY COALESCE(successful_at,''),id`)
    .bind(cutoff,expired,now).all<{id:string}>();
  if (!due.results.length) return 0;
  const jobs = due.results.map(r => ({districtId:r.id, token:crypto.randomUUID(), enqueuedAt:now}));
  const claimed = await db.batch(jobs.map(j => db.prepare(`UPDATE district_results SET pending_token=?,pending_since=?
    WHERE id=? AND (pending_token IS NULL OR pending_since<=?) AND (retry_after IS NULL OR retry_after<=?)`)
    .bind(j.token,now,j.districtId,expired,now)));
  const ready = jobs.filter((_,i) => claimed[i]!.meta.changes === 1);
  if (!ready.length) return 0;
  try {
    const messages: { body: DistrictBatch; contentType: 'json' }[] = [];
    for (let i=0;i<ready.length;i+=JOBS_PER_MESSAGE) messages.push({body:{version:2,kind:'district',jobs:ready.slice(i,i+JOBS_PER_MESSAGE)},contentType:'json'});
    await reserveBudget(db,'queue_messages',messages.length);
    await env.RESULT_JOBS.sendBatch(messages);
    return ready.length;
  } catch (error) {
    await db.batch(ready.map(j => db.prepare('UPDATE district_results SET pending_token=NULL,pending_since=NULL WHERE id=? AND pending_token=?').bind(j.districtId,j.token)));
    throw error;
  }
}

export async function refreshDistrict(env: Pick<SyncEnv,'RESULTS_DB'|'RAW_RESULTS'>, district: District) {
  const db = env.RESULTS_DB, lockName = `district:${district.id}`;
  const lock = await acquireLock(db,lockName);
  if (!lock) throw new Error('District publication is already running');
  let uploadedKey: string | null = null, published = false;
  try {
    const before = await db.prepare('SELECT * FROM district_results WHERE id=?').bind(district.id).first<DistrictRow>();
    if (!before) throw new Error('District source not registered');
    await reserveBudget(db,'checks',1);
    await waitForFetchSlot(db);
    const fetched = await fetchDistrictReport(districtSourceUrl(district), before.payload ? {etag:before.etag,lastModified:before.last_modified} : {});
    const guard = `id=? AND EXISTS(SELECT 1 FROM sync_locks WHERE name=? AND token=? AND expires_at>?)`;
    const fence = () => [district.id,lockName,lock,new Date().toISOString()];
    if (fetched.unchanged) {
      if (!before.payload) throw new Error('District 304 without a stored result');
      const saved = await db.prepare(`UPDATE district_results SET checked_at=?,successful_at=?,last_error=NULL,retry_after=NULL,failures=0 WHERE ${guard}`)
        .bind(fetched.checkedAt,fetched.checkedAt,...fence()).run();
      if (saved.meta.changes !== 1) throw new Error('District publication lease expired');
      return 'not_modified';
    }
    await reserveBudget(db,'decoded_bytes',fetched.bytes.byteLength);
    const result = parseDistrictReport(fetched.bytes,district);
    if (before.reported_at && Date.parse(result.reportedAt) < Date.parse(before.reported_at)) throw new Error('Rejected an older district report');
    const {reportedAt:_time,...data} = result;
    const contentHash = sha256(JSON.stringify(data));
    const rawHash = createHash('sha256').update(fetched.bytes).digest('hex');
    const rawKey = `districts/2026/${district.id}/${rawHash}.xls`;
    if (rawKey !== before.raw_key) {
      await reserveBudget(db,'r2_writes',1);
      await env.RAW_RESULTS.put(rawKey,fetched.bytes,{httpMetadata:{contentType:'application/vnd.ms-excel'},
        customMetadata:{source_url:districtSourceUrl(district),fetched_at:fetched.checkedAt,sha256:rawHash}});
      uploadedKey = rawKey;
    }
    const changed = before.content_hash !== contentHash;
    const publishedAt = changed ? fetched.checkedAt : before.published_at;
    const previousKey = rawKey === before.raw_key ? before.previous_raw_key : before.raw_key;
    const saved = await db.prepare(`UPDATE district_results SET payload=?,reported_at=?,checked_at=?,successful_at=?,published_at=?,
      etag=?,last_modified=?,raw_hash=?,content_hash=?,raw_key=?,previous_raw_key=?,last_error=NULL,retry_after=NULL,failures=0 WHERE ${guard}`)
      .bind(JSON.stringify(result),result.reportedAt,fetched.checkedAt,fetched.checkedAt,publishedAt,
        fetched.etag,fetched.lastModified,rawHash,contentHash,rawKey,previousKey,...fence()).run();
    if (saved.meta.changes !== 1) throw new Error('District publication lease expired');
    published = true;
    if (before.previous_raw_key && before.previous_raw_key !== previousKey && before.previous_raw_key !== rawKey) {
      await env.RAW_RESULTS.delete(before.previous_raw_key).catch(error => console.error(JSON.stringify({event:'district_archive_cleanup_failed',district:district.id,error:String(error)})));
    }
    const outcome = changed ? 'published' : 'results_unchanged';
    console.log(JSON.stringify({event:'district_refreshed',district:district.id,outcome,reported_at:result.reportedAt,valid_votes:result.validVotes}));
    return outcome;
  } finally {
    if (uploadedKey && !published) try {
      const active = await db.prepare('SELECT id FROM district_results WHERE raw_key=? OR previous_raw_key=?').bind(uploadedKey,uploadedKey).first();
      if (!active) await env.RAW_RESULTS.delete(uploadedKey);
    } catch (error) { console.error(JSON.stringify({event:'district_archive_cleanup_failed',district:district.id,error:String(error)})); }
    await releaseLock(db,lockName,lock);
  }
}

export async function failDistrict(db: D1Database, id: string, error: unknown, attempt = 1) {
  const delay = retrySeconds(error,attempt), after = new Date(Date.now()+delay*1000).toISOString();
  await db.prepare('UPDATE district_results SET checked_at=?,last_error=?,retry_after=?,failures=failures+1 WHERE id=?')
    .bind(new Date().toISOString(),String(error).slice(0,1000),after,id).run();
  if (error instanceof UpstreamError && (error.status === 429 || error.status === 503)) {
    await db.prepare(`INSERT INTO sync_status(id,backoff_until) VALUES ('live',?) ON CONFLICT(id)
      DO UPDATE SET backoff_until=MAX(COALESCE(sync_status.backoff_until,''),excluded.backoff_until)`).bind(after).run();
  }
  console.error(JSON.stringify({event:'district_refresh_failed',district:id,error:String(error),retry_seconds:delay}));
  return delay;
}
export async function runDistrictJobs(env: SyncEnv, jobs: DistrictJob[], attempts: number) {
  let retry = 0;
  for (const job of jobs) {
    const row = await env.RESULTS_DB.prepare('SELECT pending_token FROM district_results WHERE id=?').bind(job.districtId).first<{pending_token:string|null}>();
    if (row?.pending_token !== job.token) continue;
    let done = false;
    try {
      const backoff = await backoffSeconds(env.RESULTS_DB);
      if (backoff) retry = Math.max(retry,backoff);
      else { await refreshDistrict(env,findDistrict(job.districtId)!); done = true; }
    } catch (error) { retry = Math.max(retry,await failDistrict(env.RESULTS_DB,job.districtId,error,attempts)); }
    if (done || attempts >= 6) await env.RESULTS_DB.prepare('UPDATE district_results SET pending_token=NULL,pending_since=NULL WHERE id=? AND pending_token=?').bind(job.districtId,job.token).run();
  }
  return Math.min(86_400,retry);
}
