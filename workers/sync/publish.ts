import { gzipSync } from 'node:zlib';
import { ELECTIONS, type Source } from '../../src/lib/data/catalogue.ts';
import { fetchDocument } from '../../src/lib/data/fetch.ts';
import { normalize, NORMALIZER_VERSION, validateDocument } from '../../src/lib/data/normalize.ts';
import { LIVE_YEAR, parsePartyNames, PARTY_DIRECTORY_URL, sha256, sourceContentHash, SOURCE_LIMIT } from './helpers.ts';
import { acquireLock, ensureSource, readState, releaseLock, waitForFetchSlot, type SourceState } from './state.ts';

import { archivedRaw, packRecords, prepareRecords, type DirectoryRecord } from './pack.ts';
import { reserveBudget } from './budget.ts';
import { updateStatements } from './updates.ts';

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
    await reserveBudget(env.RESULTS_DB, 'r2_writes', 2);
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

async function markChecked(db: D1Database, source: Source, previous: SourceState, lock: string,
  checkedAt: string, metadata?: { etag: string | null; lastModified: string | null; reportedAt: string; rawHash: string; rawKey: string; sourceHash: string | null }) {
  const statements = [db.prepare(`UPDATE source_documents SET last_checked_at=?,last_success_at=?,last_error=NULL,
    etag=?,last_modified=? WHERE id=? AND active_snapshot_id IS ?
    AND EXISTS(SELECT 1 FROM sync_locks WHERE name=? AND token=? AND expires_at>?)`)
    .bind(checkedAt, checkedAt, metadata ? metadata.etag : previous.etag, metadata ? metadata.lastModified : previous.last_modified,
      source.id, previous.active_snapshot_id, source.id, lock, new Date().toISOString()),
  db.prepare(`UPDATE sync_state SET last_observed_at=?,consecutive_failures=0,retry_after=NULL,
    last_reported_at=?,last_sha256=?,last_raw_key=?,last_source_content_sha256=? WHERE source_id=?
    AND EXISTS(SELECT 1 FROM source_documents WHERE id=? AND last_success_at=?)`)
    .bind(checkedAt, metadata?.reportedAt ?? previous.last_reported_at,
      metadata?.rawHash ?? previous.last_sha256, metadata?.rawKey ?? previous.last_raw_key,
      metadata?.sourceHash ?? previous.last_source_content_sha256, source.id, source.id, checkedAt)];
  const results = await db.batch(statements);
  if (results[0]!.meta.changes !== 1) throw new Error('Lost source publication lease or active snapshot changed');
}

export async function refreshSource(env: SyncEnv, source: Source, names: ReadonlyMap<string, string>) {
  const db = env.RESULTS_DB;
  await ensureSource(db, source);
  const lock = await acquireLock(db, source.id);
  if (!lock) throw new Error('Source is already being refreshed');
  let uploadedKey: string | null = null;
  let published = false;
  try {
    const previous = await readState(db, source);
    const partyDirectoryHash = sha256(JSON.stringify([...names].sort(([a], [b]) => a.localeCompare(b))));
    const reusable = previous.object_key && previous.normalizer_version === NORMALIZER_VERSION
      && previous.party_directory_hash === partyDirectoryHash;
    await reserveBudget(db, 'checks', 1);
    await waitForFetchSlot(db);
    // Existing D1 snapshots migrate once. A 304 cannot create their result pack.
    const fetched = await fetchDocument(source, reusable
      ? { etag: previous.etag, lastModified: previous.last_modified } : {}, { maxBytes: SOURCE_LIMIT });
    if (fetched.unchanged) {
      await markChecked(db, source, previous, lock, fetched.checkedAt);
      const root = source.kind === 'summary' && previous.last_raw_key
        ? validateDocument(JSON.parse(await archivedRaw(env.RAW_RESULTS, previous.last_raw_key, previous.raw_length)), election, source) : null;
      return { outcome: 'not_modified', root };
    }
    const rawHash = sha256(fetched.body);
    if (reusable && rawHash === previous.last_sha256) {
      await markChecked(db, source, previous, lock, fetched.checkedAt, {
        etag: fetched.etag, lastModified: fetched.lastModified, reportedAt: previous.last_reported_at!,
        rawHash, rawKey: previous.last_raw_key!, sourceHash: previous.last_source_content_sha256,
      });
      // The index must still be replayed after a scheduler retry.
      const root = source.kind === 'summary'
        ? validateDocument(JSON.parse(fetched.body), election, source) : null;
      return { outcome: 'results_unchanged', root };
    }
    let root: Record<string, unknown> | null = validateDocument(JSON.parse(fetched.body), election, source);
    const reportedAt = new Date(String(root.ReportDate)).toISOString();
    const previousDate = Math.max(Date.parse(previous.reported_at ?? '') || 0, Date.parse(previous.last_reported_at ?? '') || 0);
    if (Date.parse(reportedAt) < previousDate) throw new Error('Rejected a source snapshot older than the last validated report');
    const sourceHash = sourceContentHash(fetched.body);
    if (reusable && sourceHash === previous.last_source_content_sha256) {
      await markChecked(db, source, previous, lock, fetched.checkedAt, {
        etag: fetched.etag, lastModified: fetched.lastModified, reportedAt, rawHash,
        rawKey: previous.last_raw_key!, sourceHash,
      });
      return { outcome: 'results_unchanged', root: source.kind === 'summary' ? root : null };
    }
    await reserveBudget(db, 'decoded_bytes', Buffer.byteLength(fetched.body));
    const content = prepareRecords(normalize(root, source, names));
    if (previous.object_key && previous.content_snapshot_id === previous.active_snapshot_id && previous.content_sha256 === content.hash) {
      let rawKey = previous.last_raw_key!;
      // Summary discovery contains details absent from the normalized national
      // rows. Keep its latest validated body for conditional-request replays.
      if (source.kind === 'summary') {
        await reserveBudget(db, 'r2_writes', 1);
        rawKey = `support/${source.year}/latest-summary.json.gz`;
        await env.RAW_RESULTS.put(rawKey, gzipSync(fetched.body, { level: 1 }), {
          httpMetadata: { contentType: 'application/gzip' }, customMetadata: { sha256: rawHash },
        });
      }
      await markChecked(db, source, previous, lock, fetched.checkedAt,
        { etag: fetched.etag, lastModified: fetched.lastModified, reportedAt, rawHash, rawKey, sourceHash });
      if (!reusable) await db.prepare(`UPDATE result_bundles SET normalizer_version=?,party_directory_hash=?
        WHERE source_id=? AND object_key=?`).bind(NORMALIZER_VERSION, partyDirectoryHash, source.id, previous.object_key).run();
      return { outcome: 'results_unchanged', root: source.kind === 'summary' ? root : null };
    }

    // Exact raw bytes are the first gzip member; each area is separately
    // compressed and indexed. Both archive and serving data cost one R2 PUT.
    const raw = gzipSync(fetched.body, { level: 1 });
    fetched.body = '';
    if (source.kind === 'municipality') root = null;
    const pack = packRecords(raw, content);
    const objectKey = `compact/v1/${source.year}/${source.kind}-${source.areaId}/${rawHash}-${content.hash}.pack`;
    await reserveBudget(db, 'r2_writes', 1);
    await env.RAW_RESULTS.put(objectKey, pack.body, {
      httpMetadata: { contentType: 'application/octet-stream' },
      customMetadata: { sha256: rawHash, fetched_at: fetched.checkedAt, raw_length: String(pack.rawLength), format: 'election-pack-v1' },
    });
    uploadedKey = objectKey;
    const snapshotId = `${source.id}:v${NORMALIZER_VERSION}:pack1:${rawHash}:${content.hash}`;
    const directoryId = previous.directory_snapshot_id ?? previous.active_snapshot_id ?? `${source.id}:directory`;
    const existing = await db.prepare(`SELECT level,area_id AS id,province_id AS provinceId,
      municipality_id AS municipalityId,ward_id AS wardId,name FROM area_results WHERE source_id=? AND snapshot_id=?`)
      .bind(source.id, directoryId).all<DirectoryRecord>();
    const directory = new Map(existing.results.map(row => [`${row.level}:${row.id}`, row]));
    const publishedAt = new Date().toISOString();
    const guard = `EXISTS(SELECT 1 FROM sync_locks WHERE name=? AND token=? AND expires_at>?)
      AND EXISTS(SELECT 1 FROM source_documents WHERE id=? AND active_snapshot_id IS ?)`;
    const fence = [source.id, lock, publishedAt, source.id, previous.active_snapshot_id];
    const statements: D1PreparedStatement[] = await updateStatements(env, source, content,
      previous.active_snapshot_id, snapshotId, fetched.checkedAt, publishedAt, guard, fence);
    for (const { key, directory: row } of content.records) {
      const old = directory.get(key);
      directory.delete(key);
      if (old && Object.entries(row).every(([k, value]) => old[k as keyof DirectoryRecord] === value)) continue;
      // Only additions, removals or changed area names/relationships write the
      // directory. Ordinary counting updates never rewrite these rows.
      statements.push(db.prepare(`INSERT INTO area_results
        (snapshot_id,source_id,year,level,area_id,province_id,municipality_id,ward_id,name,reported_at,payload)
        SELECT ?,?,?,?,?,?,?,?,?,?,'{}' WHERE ${guard}
        ON CONFLICT(snapshot_id,level,area_id) DO UPDATE SET province_id=excluded.province_id,
          municipality_id=excluded.municipality_id,ward_id=excluded.ward_id,name=excluded.name`)
        .bind(directoryId, source.id, source.year, row.level, row.id, row.provinceId, row.municipalityId, row.wardId, row.name, reportedAt, ...fence));
    }
    for (const row of directory.values()) statements.push(db.prepare(`DELETE FROM area_results
      WHERE snapshot_id=? AND level=? AND area_id=? AND ${guard}`).bind(directoryId, row.level, row.id, ...fence));
    statements.push(
      db.prepare(`INSERT OR IGNORE INTO snapshots(id,source_id,year,sha256,fetched_at,reported_at,raw_path,record_count)
        VALUES (?,?,?,?,?,?,?,?)`).bind(snapshotId, source.id, source.year, rawHash, fetched.checkedAt, reportedAt, objectKey, content.count),
      db.prepare(`INSERT INTO result_bundles(source_id,directory_snapshot_id,object_key,raw_length,index_json,normalizer_version,party_directory_hash)
        SELECT ?,?,?,?,?,?,? WHERE ${guard}
        ON CONFLICT(source_id) DO UPDATE SET previous_object_key=result_bundles.object_key,
          previous_index_json=result_bundles.index_json,object_key=excluded.object_key,
          raw_length=excluded.raw_length,index_json=excluded.index_json,
          normalizer_version=excluded.normalizer_version,party_directory_hash=excluded.party_directory_hash`)
        .bind(source.id, directoryId, objectKey, pack.rawLength, pack.indexJson, NORMALIZER_VERSION, partyDirectoryHash, ...fence),
      db.prepare(`UPDATE source_documents SET active_snapshot_id=?,etag=?,last_modified=?,last_checked_at=?,last_success_at=?,last_error=NULL
        WHERE id=? AND active_snapshot_id IS ? AND EXISTS(SELECT 1 FROM sync_locks WHERE name=? AND token=? AND expires_at>?)`)
        .bind(snapshotId, fetched.etag, fetched.lastModified, fetched.checkedAt, fetched.checkedAt,
          source.id, previous.active_snapshot_id, source.id, lock, publishedAt),
      db.prepare(`UPDATE sync_state SET content_snapshot_id=?,content_sha256=?,last_observed_at=?,last_reported_at=?,
        last_sha256=?,last_raw_key=?,last_source_content_sha256=?,last_published_at=?,consecutive_failures=0,retry_after=NULL WHERE source_id=?
        AND EXISTS(SELECT 1 FROM source_documents WHERE id=? AND active_snapshot_id=?)`)
        .bind(snapshotId, content.hash, fetched.checkedAt, reportedAt, rawHash, objectKey, sourceHash, publishedAt, source.id, source.id, snapshotId),
    );
    const result = await db.batch(statements);
    if (result[result.length - 2]!.meta.changes !== 1) throw new Error('Snapshot publication lease or source pointer changed');
    published = true;
    // Retain current + previous packs, including their exact raw source bytes.
    // Earlier raw/ archives are untouched. Deletes have no R2 operation charge.
    if (previous.previous_object_key?.startsWith('compact/v1/') && previous.previous_object_key !== objectKey) {
      try { await env.RAW_RESULTS.delete(previous.previous_object_key); }
      catch (error) { console.error(JSON.stringify({ event: 'pack_cleanup_failed', source: source.id, error: String(error) })); }
    }
    console.log(JSON.stringify({ event: 'snapshot_published', storage: 'r2_pack', source: source.id, snapshot_id: snapshotId,
      records: content.count, pack_bytes: pack.body.length, d1_rows_written: result.reduce((sum, r) => sum + r.meta.rows_written, 0),
      source_reported_at: reportedAt, published_at: publishedAt }));
    return { outcome: 'published', root };
  } finally {
    if (uploadedKey && !published) {
      // A failed transaction must not leak staged blobs or remove a pack another
      // publisher already made visible. Failed cleanup leaves data, never loss.
      try {
        const active = await db.prepare('SELECT 1 AS present FROM result_bundles WHERE object_key=? OR previous_object_key=?')
          .bind(uploadedKey, uploadedKey).first();
        if (!active) await env.RAW_RESULTS.delete(uploadedKey);
      } catch (error) { console.error(JSON.stringify({ event: 'unpublished_pack_cleanup_failed', error: String(error) })); }
    }
    await releaseLock(db, source.id, lock);
  }
}
