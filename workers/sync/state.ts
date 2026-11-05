import type { Source } from '../../src/lib/data/catalogue.ts';
import { UpstreamError } from '../../src/lib/data/fetch.ts';
import { retrySeconds } from './helpers.ts';

export type SourceState = {
  active_snapshot_id: string | null; etag: string | null; last_modified: string | null;
  reported_at: string | null; last_success_at: string | null;
  content_snapshot_id: string | null; content_sha256: string | null;
  last_reported_at: string | null; last_sha256: string | null; last_raw_key: string | null;
  last_source_content_sha256: string | null;
  pending_token: string | null; hint_sha256: string | null; consecutive_failures: number;
  object_key: string | null; previous_object_key: string | null;
  directory_snapshot_id: string | null; raw_length: number | null;
  normalizer_version: number | null; party_directory_hash: string | null;
};

export async function ensureSource(db: D1Database, source: Source) {
  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO source_documents(id,year,kind,area_id,url,last_checked_at)
      VALUES (?,?,?,?,?,?)`).bind(source.id, source.year, source.kind, source.areaId, source.url, new Date().toISOString()),
    db.prepare('INSERT OR IGNORE INTO sync_state(source_id) VALUES (?)').bind(source.id),
  ]);
}

export async function readState(db: D1Database, source: Source) {
  const value = await db.prepare(`SELECT d.active_snapshot_id,d.etag,d.last_modified,d.last_success_at,
    s.reported_at,t.content_snapshot_id,t.content_sha256,t.last_reported_at,t.last_sha256,t.last_raw_key,t.last_source_content_sha256,
    t.pending_token,t.hint_sha256,t.consecutive_failures,
    b.object_key,b.previous_object_key,b.directory_snapshot_id,b.raw_length,b.normalizer_version,b.party_directory_hash FROM source_documents d
    LEFT JOIN snapshots s ON s.id=d.active_snapshot_id LEFT JOIN sync_state t ON t.source_id=d.id
    LEFT JOIN result_bundles b ON b.source_id=d.id
    WHERE d.id=?`).bind(source.id).first<SourceState>();
  if (!value) throw new Error(`Source not registered: ${source.id}`);
  return value;
}

export async function acquireLock(db: D1Database, name: string, ttlMs = 15 * 60_000) {
  const token = crypto.randomUUID();
  const now = new Date();
  const result = await db.prepare(`INSERT INTO sync_locks(name,token,expires_at) VALUES (?,?,?)
    ON CONFLICT(name) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at
    WHERE sync_locks.expires_at <= ?`)
    .bind(name, token, new Date(now.getTime() + ttlMs).toISOString(), now.toISOString()).run();
  return result.meta.changes === 1 ? token : null;
}

export async function releaseLock(db: D1Database, name: string, token: string) {
  await db.prepare('DELETE FROM sync_locks WHERE name=? AND token=?').bind(name, token).run();
}

export async function waitForFetchSlot(db: D1Database) {
  // Shared across the scheduler and all queue consumers, not an isolate-local
  // counter. Keep the slot until its expiry to cap source request starts at 2/s.
  for (let attempt = 0; attempt < 20; attempt++) {
    if (await acquireLock(db, 'iec-fetch-slot', 500)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('IEC request throttle is busy; retry later');
}

export async function backoffSeconds(db: D1Database) {
  const state = await db.prepare("SELECT backoff_until FROM sync_status WHERE id='live'")
    .first<{ backoff_until: string | null }>();
  return state?.backoff_until ? Math.max(0, Math.ceil((Date.parse(state.backoff_until) - Date.now()) / 1000)) : 0;
}

export async function recordFailure(db: D1Database, source: Source, error: unknown, attempt = 1) {
  const now = new Date().toISOString();
  const delay = retrySeconds(error, attempt);
  const after = new Date(Date.now() + delay * 1000).toISOString();
  await db.batch([
    db.prepare('UPDATE source_documents SET last_checked_at=?,last_error=? WHERE id=?')
      .bind(now, String(error).slice(0, 1000), source.id),
    db.prepare('UPDATE sync_state SET consecutive_failures=consecutive_failures+1,retry_after=? WHERE source_id=?')
      .bind(after, source.id),
  ]);
  if (error instanceof UpstreamError && (error.status === 429 || error.status === 503)) {
    await db.prepare(`INSERT INTO sync_status(id,backoff_until) VALUES ('live',?) ON CONFLICT(id)
      DO UPDATE SET backoff_until=MAX(COALESCE(sync_status.backoff_until,''),excluded.backoff_until)`)
      .bind(after).run();
  }
  console.error(JSON.stringify({ event: 'source_refresh_failed', source: source.id, error: String(error), retry_seconds: delay }));
  return delay;
}

export async function clearPending(db: D1Database, sourceId: string, token: string, appliedHint?: string | null) {
  if (appliedHint === undefined) {
    await db.prepare('UPDATE sync_state SET pending_token=NULL,pending_since=NULL WHERE source_id=? AND pending_token=?')
      .bind(sourceId, token).run();
  } else {
    await db.prepare(`UPDATE sync_state SET pending_token=NULL,pending_since=NULL,applied_hint_sha256=?
      WHERE source_id=? AND pending_token=?`).bind(appliedHint, sourceId, token).run();
  }
}
