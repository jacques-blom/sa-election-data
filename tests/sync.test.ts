import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { getPlatformProxy } from 'wrangler';
import { sourceFor } from '../src/lib/data/catalogue.ts';
import { fetchDocument, UpstreamError } from '../src/lib/data/fetch.ts';
import { normalize } from '../src/lib/data/normalize.ts';
import { syncHealth } from '../src/lib/data/sync-health.ts';
import { fingerprint, retrySeconds, type RefreshJob } from '../workers/sync/helpers.ts';
import { election, refreshSource } from '../workers/sync/publish.ts';
import { enqueueDue, scheduledSync } from '../workers/sync/schedule.ts';
import { acquireLock, clearPending, readState, recordFailure, releaseLock, waitForFetchSlot } from '../workers/sync/state.ts';

const source = sourceFor(election, '9909');
const initialTime = '2026-11-05T13:00:00Z';
function fixture(time = initialTime, votes = 30) {
  const party = { ID: 7, Name: 'Example party', TotalValidVotes: votes, WardVotes: votes - 20, PRVotes: 20 };
  return { ElectoralEventID: 1887, ProvinceID: 9, MunicipalityID: 9909, Municipality: 'Example municipality',
    ReportDate: time, WardExpected: 1, WardsComplete: 1, VDExpected: 1, VDsComplete: 1,
    PartyBallotResults: [party], WardResults: [{ WardID: 10202001, ReportDate: time,
      PartyBallotResults: [party], VotingDistrictResults: [{ VotingDistrictID: 97410089,
        ReportDate: time, PartyBallotResults: [party] }] }] };
}

test('semantic fingerprints ignore timestamps and row ordering but detect downward corrections', () => {
  const first = [...normalize(fixture(), source)];
  assert.equal(fingerprint(first).hash, fingerprint([...first].reverse()).hash);
  assert.equal(fingerprint(first).hash, fingerprint(normalize(fixture('2026-11-05T13:02:00Z'), source)).hash);
  assert.notEqual(fingerprint(first).hash, fingerprint(normalize(fixture(initialTime, 29), source)).hash);
  assert.throws(() => fingerprint([...first, first[0]!]), /Duplicate area/);
});

test('backoff respects Retry-After and bounds exponential retries', () => {
  assert.equal(retrySeconds(new UpstreamError(429, source.url, '600'), 1), 600);
  assert.equal(retrySeconds(new Error('outage'), 1), 60);
  assert.equal(retrySeconds(new Error('outage'), 10), 900);
});

test('live ingestion uses isolated D1/R2 bindings and preserves publication integrity', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'election-sync-test-'));
  const proxy = await getPlatformProxy<SyncEnv>({ configPath: 'workers/sync/wrangler.jsonc',
    persist: { path: directory }, remoteBindings: false });
  const db = proxy.env.RESULTS_DB;
  const sent: RefreshJob[] = [];
  const env: SyncEnv = { ...proxy.env, RESULT_JOBS: {
    metrics: async () => ({ backlogCount: sent.length, backlogBytes: 0 }),
    send: async (body) => { sent.push(body as RefreshJob); return { metadata: { metrics: { backlogCount: sent.length, backlogBytes: 0 } } }; },
    sendBatch: async (messages) => {
      for (const message of messages) sent.push(message.body as RefreshJob);
      return { metadata: { metrics: { backlogCount: sent.length, backlogBytes: 0 } } };
    },
  } };
  const originalFetch = globalThis.fetch;
  let document = fixture();
  let httpStatus = 200;
  let etag = 'first';
  let lastHeaders: Headers | null = null;
  const mocked = t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).startsWith('https://results.elections.org.za/')) {
      lastHeaders = new Headers(init?.headers);
      return new Response(httpStatus === 304 ? null : JSON.stringify(document), {
        status: httpStatus, headers: { ETag: etag, ...(httpStatus === 429 ? { 'Retry-After': '600' } : {}) },
      });
    }
    return originalFetch(input, init);
  });
  try {
    for (const file of readdirSync('migrations').filter((name) => name.endsWith('.sql')).sort()) {
      await db.batch(readFileSync(`migrations/${file}`, 'utf8').split(';').map((sql) => sql.trim()).filter(Boolean).map((sql) => db.prepare(sql)));
    }
    await db.prepare('INSERT INTO elections VALUES (2026,1887,\'provisional\')').run();
    const names = new Map<string, string>();
    let firstId: string | null = null;

    await t.test('publishes all rows, archives exact source bytes, and deduplicates a repeated fetch', async () => {
      assert.equal((await refreshSource(env, source, names)).outcome, 'published');
      const state = await readState(db, source);
      firstId = state.active_snapshot_id;
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM area_results').first<{ n: number }>())!.n, 3);
      const archive = await env.RAW_RESULTS.get(state.last_raw_key!);
      assert.equal(gunzipSync(await archive!.arrayBuffer()).toString(), JSON.stringify(document));
      const uploaded = (await env.RAW_RESULTS.head(state.last_raw_key!))!.uploaded.toISOString();
      assert.equal((await refreshSource(env, source, names)).outcome, 'results_unchanged');
      assert.equal((await env.RAW_RESULTS.head(state.last_raw_key!))!.uploaded.toISOString(), uploaded);
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM snapshots').first<{ n: number }>())!.n, 1);
    });

    await t.test('clock-only regeneration retains the result snapshot and advances observed source time', async () => {
      document = fixture('2026-11-05T13:02:00Z');
      etag = 'clock-only';
      assert.equal((await refreshSource(env, source, names)).outcome, 'results_unchanged');
      const state = await readState(db, source);
      assert.equal(state.active_snapshot_id, firstId);
      assert.equal(state.last_reported_at, '2026-11-05T13:02:00.000Z');
      assert.equal(state.reported_at, '2026-11-05T13:00:00.000Z');
      document = fixture('2026-11-05T13:01:00Z', 29);
      await assert.rejects(refreshSource(env, source, names), /older/);
      assert.equal((await readState(db, source)).active_snapshot_id, firstId);
    });

    await t.test('a failed publication rolls back the pointer and removes hidden staged rows', async () => {
      document = fixture('2026-11-05T13:03:00Z', 29);
      await db.prepare(`CREATE TRIGGER fail_publication BEFORE UPDATE OF active_snapshot_id ON source_documents
        BEGIN SELECT RAISE(ABORT,'simulated publication failure'); END`).run();
      await assert.rejects(refreshSource(env, source, names), /simulated publication failure/);
      assert.equal((await readState(db, source)).active_snapshot_id, firstId);
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM area_results').first<{ n: number }>())!.n, 3);
      await db.prepare('DROP TRIGGER fail_publication').run();
      assert.equal((await refreshSource(env, source, names)).outcome, 'published');
      assert.notEqual((await readState(db, source)).active_snapshot_id, firstId);
      const row = await db.prepare("SELECT payload FROM area_results WHERE level='municipality'").first<{ payload: string }>();
      assert.equal(JSON.parse(row!.payload).parties[0].votes.source_total, 29);
    });

    await t.test('conditional requests update freshness and outages keep the last good snapshot', async () => {
      httpStatus = 304;
      const previous = (await readState(db, source)).active_snapshot_id;
      assert.equal((await refreshSource(env, source, names)).outcome, 'not_modified');
      assert.equal(lastHeaders!.get('If-None-Match'), etag);
      httpStatus = 429;
      try { await refreshSource(env, source, names); assert.fail('Expected upstream error'); }
      catch (error) { assert.equal(await recordFailure(db, source, error), 600); }
      assert.equal((await readState(db, source)).active_snapshot_id, previous);
      assert.equal((await syncHealth(db)).failed_sources, 1);
      assert.equal((await syncHealth(db)).status, 'degraded');
      httpStatus = 304;
      await refreshSource(env, source, names);
      assert.equal((await syncHealth(db)).failed_sources, 0);
      await db.prepare("UPDATE sync_status SET backoff_until=NULL WHERE id='live'").run();
    });

    await t.test('one source lease is granted at a time and an expired lease cannot release its successor', async () => {
      const old = await acquireLock(db, 'example');
      assert.ok(old);
      assert.equal(await acquireLock(db, 'example'), null);
      await db.prepare("UPDATE sync_locks SET expires_at='2000-01-01' WHERE name='example'").run();
      const current = await acquireLock(db, 'example');
      assert.ok(current);
      await releaseLock(db, 'example', old!);
      assert.equal(await acquireLock(db, 'example'), null);
      await releaseLock(db, 'example', current!);
    });

    await t.test('changed summaries enqueue once and periodic reconciliation still checks unchanged sources', async () => {
      await db.prepare('UPDATE sync_state SET hint_sha256=? WHERE source_id=?').bind('changed', source.id).run();
      assert.equal(await enqueueDue(env), 1);
      assert.equal(await enqueueDue(env), 0);
      const job = sent.at(-1)!;
      await clearPending(db, source.id, job.token, job.hint);
      assert.equal(await enqueueDue(env), 0);
      await db.prepare("UPDATE source_documents SET last_success_at='2000-01-01' WHERE id=?").bind(source.id).run();
      assert.equal(await enqueueDue(env), 1);
      await clearPending(db, source.id, sent.at(-1)!.token);
    });

    await t.test('concurrent consumers share one upstream request throttle', async () => {
      await db.prepare("DELETE FROM sync_locks WHERE name='iec-fetch-slot'").run();
      const slots: number[] = [];
      await Promise.all([1, 2, 3].map(async () => { await waitForFetchSlot(db); slots.push(Date.now()); }));
      slots.sort((a, b) => a - b);
      assert.ok(slots[1]! - slots[0]! >= 450);
      assert.ok(slots[2]! - slots[1]! >= 450);
    });

    await t.test('summary failures do not stop reconciliation of known municipalities', async () => {
      await env.RAW_RESULTS.put('support/party-directory/current.json', JSON.stringify([{ ID: 7, PartyFullName: 'Example party' }]), {
        customMetadata: { fetched_at: new Date().toISOString() },
      });
      httpStatus = 500;
      const count = sent.length;
      await scheduledSync(env);
      assert.equal(sent.length, count + 1);
      assert.match((await syncHealth(db)).scheduler!.last_error!, /500/);
    });

    await t.test('oversized source bodies are rejected before publication', async () => {
      httpStatus = 200;
      await assert.rejects(fetchDocument(source, {}, { maxBytes: 32 }), /document limit/);
    });
  } finally {
    mocked.mock.restore();
    await proxy.dispose();
    rmSync(directory, { recursive: true, force: true });
  }
});
