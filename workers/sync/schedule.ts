import { DETAIL_DISCOVERY_SUPPLEMENTS, sourceFor } from '../../src/lib/data/catalogue.ts';
import { discoverMunicipalities } from '../../src/lib/data/normalize.ts';
import { hintHash, LIVE_YEAR, PENDING_TIMEOUT_MS, RECHECK_MS, JOBS_PER_MESSAGE, type RefreshJob, type RefreshBatch } from './helpers.ts';
import { reserveBudget } from './budget.ts';
import { election, partyNames, refreshSource } from './publish.ts';
import { acquireLock, backoffSeconds, clearPending, ensureSource, recordFailure, releaseLock } from './state.ts';
import { enqueueDistricts } from './districts.ts';

async function saveDiscovery(db: D1Database, root: Record<string, unknown>) {
  const hints = new Map<string, string>();
  const provinces = root.ProvinceResults as Array<{ MunicipalityResults: Array<{ MunicipalityID: string | number }> }>;
  for (const province of provinces) for (const municipality of province.MunicipalityResults) {
    hints.set(String(municipality.MunicipalityID), hintHash(municipality));
  }
  const ids = new Set([...discoverMunicipalities(root), ...DETAIL_DISCOVERY_SUPPLEMENTS[LIVE_YEAR] ?? []]);
  let statements: D1PreparedStatement[] = [];
  const now = new Date().toISOString();
  for (const id of ids) {
    const source = sourceFor(election, id);
    statements.push(db.prepare(`INSERT OR IGNORE INTO source_documents(id,year,kind,area_id,url,last_checked_at)
      VALUES (?,?,?,?,?,?)`).bind(source.id, source.year, source.kind, source.areaId, source.url, now));
    statements.push(db.prepare(`INSERT INTO sync_state(source_id,hint_sha256) VALUES (?,?)
      ON CONFLICT(source_id) DO UPDATE SET hint_sha256=excluded.hint_sha256
      WHERE sync_state.hint_sha256 IS NOT excluded.hint_sha256`).bind(source.id, hints.get(id) ?? null));
    if (statements.length >= 50) { await db.batch(statements); statements = []; }
  }
  if (statements.length) await db.batch(statements);
}

export async function enqueueDue(env: SyncEnv) {
  const db = env.RESULTS_DB;
  // Retain known sources even when the latest summary temporarily omits them.
  await db.prepare(`INSERT OR IGNORE INTO sync_state(source_id)
    SELECT id FROM source_documents WHERE year=? AND kind='municipality'`).bind(LIVE_YEAR).run();
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - RECHECK_MS).toISOString();
  const pendingCutoff = new Date(Date.now() - PENDING_TIMEOUT_MS).toISOString();
  const due = await db.prepare(`SELECT d.id,d.area_id,s.hint_sha256 FROM source_documents d
    JOIN sync_state s ON s.source_id=d.id WHERE d.year=? AND d.kind='municipality'
    AND (s.retry_after IS NULL OR s.retry_after<=?)
    AND (s.pending_token IS NULL OR s.pending_since<=?)
    AND (d.last_success_at IS NULL OR d.last_success_at<=? OR s.content_snapshot_id IS NULL
      OR NOT EXISTS(SELECT 1 FROM result_bundles b WHERE b.source_id=d.id)
      OR s.hint_sha256 IS NOT s.applied_hint_sha256)
    ORDER BY (s.hint_sha256 IS NOT s.applied_hint_sha256) DESC,COALESCE(d.last_success_at,'') ASC,d.id`)
    .bind(LIVE_YEAR, now, pendingCutoff, cutoff).all<{ id: string; area_id: string; hint_sha256: string | null }>();
  let enqueued = 0;
  for (let index = 0; index < due.results.length; index += 50) {
    const rows = due.results.slice(index, index + 50);
    const jobs: RefreshJob[] = rows.map((row) => ({ municipalityId: row.area_id, token: crypto.randomUUID(), hint: row.hint_sha256, enqueuedAt: now }));
    const claimed = await db.batch(rows.map((row, i) => db.prepare(`UPDATE sync_state
      SET pending_token=?,pending_since=?,last_enqueued_at=? WHERE source_id=?
      AND (pending_token IS NULL OR pending_since<=?) AND (retry_after IS NULL OR retry_after<=?)`)
      .bind(jobs[i]!.token, now, now, row.id, pendingCutoff, now)));
    const ready = jobs.filter((_, i) => claimed[i]!.meta.changes === 1);
    if (!ready.length) continue;
    try {
      const messages: { body: RefreshBatch; contentType: 'json' }[] = [];
      for (let i = 0; i < ready.length; i += JOBS_PER_MESSAGE) {
        messages.push({ body: { version: 1, jobs: ready.slice(i, i + JOBS_PER_MESSAGE) }, contentType: 'json' });
      }
      await reserveBudget(db, 'queue_messages', messages.length);
      await env.RESULT_JOBS.sendBatch(messages);
      enqueued += ready.length;
    } catch (error) {
      // A failed send must not suppress this source until the pending timeout.
      for (const job of ready) await clearPending(db, sourceFor(election, job.municipalityId).id, job.token);
      throw error;
    }
  }
  return enqueued;
}

export async function scheduledSync(env: SyncEnv) {
  const db = env.RESULTS_DB;
  const lock = await acquireLock(db, 'scheduler', 3 * 60_000);
  if (!lock) return;
  const started = new Date().toISOString();
  await db.prepare(`INSERT INTO sync_status(id,last_started_at) VALUES ('live',?)
    ON CONFLICT(id) DO UPDATE SET last_started_at=excluded.last_started_at`).bind(started).run();
  try {
    const delay = await backoffSeconds(db);
    if (delay) {
      console.log(JSON.stringify({ event: 'scheduler_backoff', retry_seconds: delay }));
      return;
    }
    const summary = sourceFor(election);
    let summaryError: string | null = null;
    await ensureSource(db, summary);
    try {
      const names = await partyNames(env, true);
      const refreshed = await refreshSource(env, summary, names);
      if (refreshed.root) await saveDiscovery(db, refreshed.root);
    } catch (error) {
      await recordFailure(db, summary, error);
      summaryError = String(error).slice(0, 1000);
    }
    // An unavailable index cannot prevent independent detail reconciliation.
    let enqueued = 0;
    if (!await backoffSeconds(db)) {
      enqueued = await enqueueDue(env);
      enqueued += await enqueueDistricts(env);
    }
    await db.prepare(`UPDATE sync_status SET last_completed_at=?,last_error=?,enqueued_count=? WHERE id='live'`)
      .bind(new Date().toISOString(), summaryError, enqueued).run();
    console.log(JSON.stringify({ event: 'scheduler_completed', enqueued, summary_error: summaryError }));
  } catch (error) {
    await db.prepare("UPDATE sync_status SET last_error=? WHERE id='live'").bind(String(error).slice(0, 1000)).run();
    throw error;
  } finally { await releaseLock(db, 'scheduler', lock); }
}
