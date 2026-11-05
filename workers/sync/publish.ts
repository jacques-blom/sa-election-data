import { gunzipSync, gzipSync } from 'node:zlib';
import { ELECTIONS, type Source } from '../../src/lib/data/catalogue.ts';
import { fetchDocument } from '../../src/lib/data/fetch.ts';
import { normalize, NORMALIZER_VERSION, validateDocument, type AreaRecord } from '../../src/lib/data/normalize.ts';
import { fingerprint, LIVE_YEAR, parsePartyNames, PARTY_DIRECTORY_URL, sha256, SOURCE_LIMIT } from './helpers.ts';
import { acquireLock, ensureSource, readState, releaseLock, waitForFetchSlot, type SourceState } from './state.ts';

export const election = ELECTIONS.find((entry) => entry.year === LIVE_YEAR)!;

export async function partyNames(env: SyncEnv, refresh = false): Promise<ReadonlyMap<string, string>> {
  const key = 'support/party-directory/current.json';
  const cached = await env.RAW_RESULTS.get(key);
  const cachedBody = cached ? await cached.text() : null;
  const fetchedAt = cached?.customMetadata?.fetched_at;
  if (cachedBody && (!refresh || (fetchedAt && Date.now() - Date.parse(fetchedAt) < 86_400_000))) {
    return parsePartyNames(cachedBody);
  }
  try {
    await waitForFetchSlot(env.RESULTS_DB);
    const fetched = await fetchDocument({ id: 'party-directory', year: 2016, kind: 'summary', areaId: 'ZA', url: PARTY_DIRECTORY_URL }, {}, { maxBytes: 2 * 1024 * 1024 });
    if (fetched.unchanged) throw new Error('Unexpected party-directory 304 without validators');
    const names = parsePartyNames(fetched.body);
    const hash = sha256(fetched.body);
    const metadata = { fetched_at: fetched.checkedAt, sha256: hash, url: PARTY_DIRECTORY_URL };
    await env.RAW_RESULTS.put(`raw/party-directory/${hash}.json.gz`, gzipSync(fetched.body), {
      httpMetadata: { contentType: 'application/gzip' }, customMetadata: metadata,
      onlyIf: { etagDoesNotMatch: '*' },
    });
    await env.RAW_RESULTS.put(key, fetched.body, { httpMetadata: { contentType: 'application/json' }, customMetadata: metadata });
    return names;
  } catch (error) {
    if (!cachedBody) throw error;
    console.error(JSON.stringify({ event: 'party_directory_refresh_failed', error: String(error), using_cached: true }));
    return parsePartyNames(cachedBody);
  }
}

async function stageRows(db: D1Database, source: Source, snapshotId: string, records: Iterable<AreaRecord>) {
  let batch: D1PreparedStatement[] = [];
  let values: (string | number | null)[] = [];
  let rowCount = 0;
  let bytes = 0;
  const appendStatement = () => {
    if (!rowCount) return;
    batch.push(db.prepare(`INSERT OR REPLACE INTO area_results
      (snapshot_id,source_id,year,level,area_id,province_id,municipality_id,ward_id,name,reported_at,payload)
      VALUES ${Array.from({ length: rowCount }, () => '(?,?,?,?,?,?,?,?,?,?,?)').join(',')}`).bind(...values));
    values = [];
    rowCount = 0;
  };
  for (const record of records) {
    const payload = JSON.stringify(record.payload);
    values.push(snapshotId, source.id, source.year, record.level, record.id, record.provinceId,
      record.municipalityId, record.wardId, record.name, record.reportedAt, payload);
    rowCount++;
    bytes += new TextEncoder().encode(payload).byteLength;
    // 8 * 11 = 88 bound parameters, below D1's 100-parameter limit.
    if (rowCount === 8 || bytes >= 512 * 1024) appendStatement();
    if (batch.length >= 40 || bytes >= 512 * 1024) {
      await db.batch(batch);
      batch = [];
      bytes = 0;
    }
  }
  appendStatement();
  if (batch.length) await db.batch(batch);
}

async function markChecked(db: D1Database, source: Source, previous: SourceState, lock: string,
  checkedAt: string, metadata?: { etag: string | null; lastModified: string | null; reportedAt: string; rawHash: string; rawKey: string }) {
  const statements = [db.prepare(`UPDATE source_documents SET last_checked_at=?,last_success_at=?,last_error=NULL,
    etag=?,last_modified=? WHERE id=? AND active_snapshot_id IS ?
    AND EXISTS(SELECT 1 FROM sync_locks WHERE name=? AND token=? AND expires_at>?)`)
    .bind(checkedAt, checkedAt, metadata ? metadata.etag : previous.etag, metadata ? metadata.lastModified : previous.last_modified,
      source.id, previous.active_snapshot_id, source.id, lock, new Date().toISOString()),
  db.prepare(`UPDATE sync_state SET last_observed_at=?,consecutive_failures=0,retry_after=NULL,
    last_reported_at=?,last_sha256=?,last_raw_key=? WHERE source_id=?
    AND EXISTS(SELECT 1 FROM source_documents WHERE id=? AND last_success_at=?)`)
    .bind(checkedAt, metadata?.reportedAt ?? previous.last_reported_at,
      metadata?.rawHash ?? previous.last_sha256, metadata?.rawKey ?? previous.last_raw_key, source.id, source.id, checkedAt)];
  const results = await db.batch(statements);
  if (results[0]!.meta.changes !== 1) throw new Error('Lost source publication lease or active snapshot changed');
}

export async function refreshSource(env: SyncEnv, source: Source, names: ReadonlyMap<string, string>) {
  const db = env.RESULTS_DB;
  await ensureSource(db, source);
  const lock = await acquireLock(db, source.id);
  if (!lock) throw new Error('Source is already being refreshed');
  try {
    const previous = await readState(db, source);
    // The first live fetch must also populate the remote archive, even when the
    // local backfill's HTTP validators would return 304.
    await waitForFetchSlot(db);
    const fetched = await fetchDocument(source, previous.last_raw_key && previous.active_snapshot_id
      ? { etag: previous.etag, lastModified: previous.last_modified } : {}, { maxBytes: SOURCE_LIMIT });
    if (fetched.unchanged) {
      await markChecked(db, source, previous, lock, fetched.checkedAt);
      // Replay discovery on a 304 too: publication may have succeeded just
      // before a previous scheduler failed to save its municipality hints.
      let root: Record<string, unknown> | null = null;
      if (source.kind === 'summary' && previous.last_raw_key) {
        const archived = await env.RAW_RESULTS.get(previous.last_raw_key);
        if (!archived) throw new Error('Validated summary archive is missing');
        root = validateDocument(JSON.parse(gunzipSync(await archived.arrayBuffer()).toString('utf8')), election, source);
      }
      return { outcome: 'not_modified', root };
    }
    const rawHash = sha256(fetched.body);
    const rawKey = `raw/${source.year}/${source.kind}-${source.areaId}/${rawHash}.json.gz`;
    if (previous.last_sha256 !== rawHash) {
      await env.RAW_RESULTS.put(rawKey, gzipSync(fetched.body), {
        httpMetadata: { contentType: 'application/gzip' },
        customMetadata: { url: source.url, sha256: rawHash, fetched_at: fetched.checkedAt,
          etag: fetched.etag ?? '', last_modified: fetched.lastModified ?? '' },
        onlyIf: { etagDoesNotMatch: '*' },
      });
    }
    const root = validateDocument(JSON.parse(fetched.body), election, source);
    // The raw bytes are archived. Release the full response string before the
    // many asynchronous D1 writes, especially with concurrent metro jobs.
    fetched.body = '';
    const reportedAt = new Date(String(root.ReportDate)).toISOString();
    const previousDate = Math.max(Date.parse(previous.reported_at ?? '') || 0, Date.parse(previous.last_reported_at ?? '') || 0);
    if (Date.parse(reportedAt) < previousDate) throw new Error('Rejected a source snapshot older than the last validated report');
    const content = fingerprint(normalize(root, source, names));
    const metadata = { etag: fetched.etag, lastModified: fetched.lastModified, reportedAt, rawHash, rawKey };
    if (previous.content_snapshot_id === previous.active_snapshot_id && previous.content_sha256 === content.hash) {
      await markChecked(db, source, previous, lock, fetched.checkedAt, metadata);
      console.log(JSON.stringify({ event: 'source_checked', source: source.id, outcome: 'results_unchanged' }));
      return { outcome: 'results_unchanged', root };
    }

    // Include the normalized digest too: changed directory labels or parser
    // output must not mutate an existing raw-file snapshot's derived contents.
    const snapshotId = `${source.id}:v${NORMALIZER_VERSION}:${rawHash}:${content.hash}`;
    if (snapshotId !== previous.active_snapshot_id) await stageRows(db, source, snapshotId, normalize(root, source, names));
    const publishedAt = new Date().toISOString();
    const result = await db.batch([
      db.prepare(`INSERT OR IGNORE INTO snapshots(id,source_id,year,sha256,fetched_at,reported_at,raw_path,record_count)
        VALUES (?,?,?,?,?,?,?,?)`).bind(snapshotId, source.id, source.year, rawHash, fetched.checkedAt, reportedAt, rawKey, content.count),
      db.prepare(`UPDATE source_documents SET active_snapshot_id=?,etag=?,last_modified=?,last_checked_at=?,last_success_at=?,last_error=NULL
        WHERE id=? AND active_snapshot_id IS ?
        AND EXISTS(SELECT 1 FROM sync_locks WHERE name=? AND token=? AND expires_at>?)
        AND (SELECT COUNT(*) FROM area_results WHERE snapshot_id=?)=?`)
        .bind(snapshotId, fetched.etag, fetched.lastModified, fetched.checkedAt, fetched.checkedAt,
          source.id, previous.active_snapshot_id, source.id, lock, publishedAt, snapshotId, content.count),
      db.prepare(`UPDATE sync_state SET content_snapshot_id=?,content_sha256=?,last_observed_at=?,last_reported_at=?,
        last_sha256=?,last_raw_key=?,last_published_at=?,consecutive_failures=0,retry_after=NULL WHERE source_id=?
        AND EXISTS(SELECT 1 FROM source_documents WHERE id=? AND active_snapshot_id=? AND last_success_at=?)`)
        .bind(snapshotId, content.hash, fetched.checkedAt, reportedAt, rawHash, rawKey, publishedAt,
          source.id, source.id, snapshotId, fetched.checkedAt),
    ]);
    if (result[1]!.meta.changes !== 1) throw new Error('Snapshot publication failed: incomplete staging or source changed concurrently');
    console.log(JSON.stringify({ event: 'snapshot_published', source: source.id, snapshot_id: snapshotId,
      records: content.count, source_reported_at: reportedAt, published_at: publishedAt }));
    return { outcome: 'published', root };
  } finally {
    // Keep only active normalized rows. Immutable raw documents and snapshot
    // metadata remain available; failed staging never appears in API queries.
    try {
      await db.prepare(`DELETE FROM area_results WHERE source_id=?
        AND snapshot_id IS NOT (SELECT active_snapshot_id FROM source_documents WHERE id=?)
        AND EXISTS(SELECT 1 FROM sync_locks WHERE name=? AND token=? AND expires_at>?)`)
        .bind(source.id, source.id, source.id, lock, new Date().toISOString()).run();
    } finally { await releaseLock(db, source.id, lock); }
  }
}
