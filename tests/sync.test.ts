import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { sourceFor } from '../src/lib/data/catalogue.ts';
import { migrateD1 } from '../scripts/lib/migrations.ts';
import { fetchDocument, UpstreamError } from '../src/lib/data/fetch.ts';
import { normalize } from '../src/lib/data/normalize.ts';
import { syncHealth } from '../src/lib/data/sync-health.ts';
import { fingerprint, sourceContentHash, retrySeconds, refreshJobs, type RefreshJob } from '../workers/sync/helpers.ts';
import { archivedRaw } from '../workers/sync/pack.ts';
import { hydrateResults, joinedResults, resultColumns } from '../src/lib/data/packed-results.ts';
import { budgetPeriod, SYNC_LIMITS, BudgetExhausted, reserveBudget, cpuBudgetReady } from '../workers/sync/budget.ts';
import { recordImporterCpu } from '../workers/usage/index.ts';
import { election, refreshSource } from '../workers/sync/publish.ts';
import { enqueueDue, scheduledSync } from '../workers/sync/schedule.ts';
import { acquireLock, clearPending, ensureSource, readState, recordFailure, releaseLock, waitForFetchSlot } from '../workers/sync/state.ts';
import { feedOptions, getUpdates } from '../src/lib/updates/feed.ts';
import { getCouncilDashboard } from '../src/lib/overview/dashboard.ts';
import { backfillDashboard } from '../scripts/lib/dashboard-backfill.ts';

const source = sourceFor(election, '9909');
const initialTime = '2026-11-05T13:00:00Z';
function fixture(time = initialTime, votes = 30) {
  const party = { ID: 7, Name: 'Example party', TotalValidVotes: votes, WardVotes: votes - 20, PRVotes: 20,
    WardSeatsWon: 0, PRSeatsWon: 0, TotalSeatsWon: 0 };
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

test('source fingerprints ignore valid report clocks and preserve invalid dates and quoted text', () => {
  const first = JSON.stringify(fixture());
  assert.equal(sourceContentHash(first), sourceContentHash(JSON.stringify(fixture('2026-11-05T13:02:00Z'))));
  assert.notEqual(sourceContentHash(first), sourceContentHash(JSON.stringify(fixture(initialTime, 29))));
  assert.notEqual(sourceContentHash(first), sourceContentHash(JSON.stringify(fixture('invalid'))));
  const quoted = (time: string) => JSON.stringify({ Name: `A \"ReportDate\":\"${time}\" party` });
  assert.notEqual(sourceContentHash(quoted(initialTime)), sourceContentHash(quoted('2026-11-05T13:02:00Z')));
});

test('live ingestion uses isolated D1/R2 bindings and preserves publication integrity', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'election-sync-test-'));
  const proxy = await getPlatformProxy<SyncEnv>({ configPath: 'workers/sync/wrangler.jsonc',
    persist: { path: directory }, remoteBindings: false });
  const db = proxy.env.RESULTS_DB;
  const sent: RefreshJob[] = [];
  const env: SyncEnv = { ...proxy.env, RESULT_JOBS: {
    metrics: async () => ({ backlogCount: sent.length, backlogBytes: 0 }),
    send: async (body) => { sent.push(...refreshJobs(body)!); return { metadata: { metrics: { backlogCount: sent.length, backlogBytes: 0 } } }; },
    sendBatch: async (messages) => {
      // District reports use a separate, versioned queue message.
      for (const message of messages) sent.push(...refreshJobs(message.body) ?? []);
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
    assert.equal((await getUpdates(db, feedOptions(new URLSearchParams()))).status, 'not_started');
    for (const file of readdirSync('migrations').filter((name) => name.endsWith('.sql')).sort()) {
      await db.batch(readFileSync(`migrations/${file}`, 'utf8').split(';').map((sql) => sql.trim()).filter(Boolean).map((sql) => db.prepare(sql)));
    }
    await migrateD1(db); // Reopening an existing store must tolerate additive columns.
    await db.prepare('INSERT INTO elections VALUES (2026,1887,\'provisional\')').run();
    const names = new Map<string, string>();
    let firstId: string | null = null;

    await t.test('publishes all rows, archives exact source bytes, and deduplicates a repeated fetch', async () => {
      assert.equal((await refreshSource(env, source, names)).outcome, 'published');
      const state = await readState(db, source);
      firstId = state.active_snapshot_id;
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM area_results').first<{ n: number }>())!.n, 3);
      assert.equal(await archivedRaw(env.RAW_RESULTS, state.last_raw_key!, state.raw_length), JSON.stringify(document));
      const uploaded = (await env.RAW_RESULTS.head(state.last_raw_key!))!.uploaded.toISOString();
      assert.equal((await refreshSource(env, source, names)).outcome, 'results_unchanged');
      assert.equal((await env.RAW_RESULTS.head(state.last_raw_key!))!.uploaded.toISOString(), uploaded);
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM snapshots').first<{ n: number }>())!.n, 1);
    });

    await t.test('clock-only regeneration retains the result snapshot and advances observed source time', async () => {
      const beforeBytes = await db.prepare('SELECT SUM(decoded_bytes) AS bytes FROM sync_budget').first();
      document = fixture('2026-11-05T13:02:00Z');
      etag = 'clock-only';
      assert.equal((await refreshSource(env, source, names)).outcome, 'results_unchanged');
      const state = await readState(db, source);
      assert.equal(state.active_snapshot_id, firstId);
      assert.equal(state.last_reported_at, '2026-11-05T13:02:00.000Z');
      assert.equal(state.reported_at, '2026-11-05T13:00:00.000Z');
      assert.deepEqual(await db.prepare('SELECT SUM(decoded_bytes) AS bytes FROM sync_budget').first(), beforeBytes);
      document = fixture('2026-11-05T13:02:00Z');
      document.WardResults[0]!.ReportDate = 'invalid';
      await assert.rejects(refreshSource(env, source, names), /Invalid ReportDate/);
      document = fixture('2026-11-05T13:01:00Z', 29);
      await assert.rejects(refreshSource(env, source, names), /older/);
      assert.equal((await readState(db, source)).active_snapshot_id, firstId);
    });

    await t.test('a failed publication rolls back the pointer and removes hidden staged rows', async () => {
      document = fixture('2026-11-05T13:03:00Z', 29);
      await db.prepare(`CREATE TRIGGER fail_publication BEFORE UPDATE OF active_snapshot_id ON source_documents
        BEGIN SELECT RAISE(ABORT,'simulated publication failure'); END`).run();
      await assert.rejects(refreshSource(env, source, names), /simulated publication failure/);
      assert.equal((await db.prepare('SELECT snapshot_id FROM council_dashboard WHERE source_id=?').bind(source.id).first<{snapshot_id:string}>())!.snapshot_id, firstId);
      assert.equal((await readState(db, source)).active_snapshot_id, firstId);
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM area_results').first<{ n: number }>())!.n, 3);
      await db.prepare('DROP TRIGGER fail_publication').run();
      assert.equal((await refreshSource(env, source, names)).outcome, 'published');
      assert.notEqual((await readState(db, source)).active_snapshot_id, firstId);
      const rows = await db.prepare(`SELECT ${resultColumns} ${joinedResults} WHERE r.level='municipality'`).all<{
        level: 'municipality'; area_id: string; source_id: string; bundle_key: string; payload: string;
        reported_at: string; name: string;
      }>();
      const row = (await hydrateResults(db, env.RAW_RESULTS, rows.results))[0]!;
      assert.equal(JSON.parse(row.payload).parties[0].votes.source_total, 29);
    });

    await t.test('dashboard summaries backfill unchanged results and only match the active source snapshot', async () => {
      const pointer=(await readState(db,source)).active_snapshot_id;
      await db.prepare('DELETE FROM council_dashboard WHERE source_id=?').bind(source.id).run();
      const events=(await getUpdates(db,feedOptions(new URLSearchParams()))).updates.length;
      assert.equal((await refreshSource(env,source,names)).outcome,'results_unchanged');
      assert.equal((await readState(db,source)).active_snapshot_id,pointer);
      assert.equal((await getUpdates(db,feedOptions(new URLSearchParams()))).updates.length,events);
      assert.equal((await db.prepare('SELECT snapshot_id FROM council_dashboard WHERE source_id=?').bind(source.id).first<{snapshot_id:string}>())!.snapshot_id,pointer);
      await db.prepare("UPDATE council_dashboard SET summary_json=json_set(summary_json,'$.version',1) WHERE source_id=?").bind(source.id).run();
      await refreshSource(env,source,names);
      assert.equal((await db.prepare("SELECT json_extract(summary_json,'$.version') AS version FROM council_dashboard WHERE source_id=?").bind(source.id).first<{version:number}>())!.version,2);
      assert.equal((await readState(db,source)).active_snapshot_id,pointer,'summary upgrades preserve result snapshots');
      let dashboard=await getCouncilDashboard(db,env.RAW_RESULTS);
      assert.equal(dashboard.councils.find(c=>c.id==='9909')!.snapshot!.id,'9909');
      await db.prepare("UPDATE council_dashboard SET snapshot_id='stale' WHERE source_id=?").bind(source.id).run();
      dashboard=await getCouncilDashboard(db,env.RAW_RESULTS);
      assert.equal(dashboard.councils.find(c=>c.id==='9909')!.snapshot,null,'stale summaries never enter highlights');
      await refreshSource(env,source,names);
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

    await t.test('dashboard backfill reads published packs without changing results or announcements', async () => {
      const pointer=(await readState(db,source)).active_snapshot_id;
      const events=(await getUpdates(db,feedOptions(new URLSearchParams()))).updates.length;
      await db.prepare('DELETE FROM council_dashboard WHERE source_id=?').bind(source.id).run();
      const dry=await backfillDashboard(db,env.RAW_RESULTS);
      assert.equal(dry.generated,1);assert.equal(dry.written,0);assert.deepEqual(dry.failures,[]);
      assert.equal(await db.prepare('SELECT 1 FROM council_dashboard WHERE source_id=?').bind(source.id).first(),null);
      const applied=await backfillDashboard(db,env.RAW_RESULTS,{apply:true});
      assert.equal(applied.written,1);assert.deepEqual(applied.failures,[]);
      assert.equal((await backfillDashboard(db,env.RAW_RESULTS,{apply:true})).checked,0);
      assert.equal((await readState(db,source)).active_snapshot_id,pointer);
      assert.equal((await getUpdates(db,feedOptions(new URLSearchParams()))).updates.length,events);
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

    await t.test('a recently checked legacy source is still queued for compact migration', async () => {
      const legacy = sourceFor(election, '9908');
      await ensureSource(db, legacy);
      await db.prepare('UPDATE source_documents SET active_snapshot_id=?,last_success_at=? WHERE id=?')
        .bind('legacy-bootstrap', new Date().toISOString(), legacy.id).run();
      await db.prepare('UPDATE sync_state SET content_snapshot_id=? WHERE source_id=?').bind('legacy-bootstrap', legacy.id).run();
      const before = sent.length;
      await enqueueDue(env);
      assert.ok(sent.slice(before).some(job => job.municipalityId === '9908'));
      for (const job of sent.slice(before)) await clearPending(db, sourceFor(election, job.municipalityId).id, job.token);
      await db.batch([db.prepare('DELETE FROM sync_state WHERE source_id=?').bind(legacy.id),
        db.prepare('DELETE FROM source_documents WHERE id=?').bind(legacy.id)]);
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

    await t.test('a counting update never rewrites directory rows and retains only two source packs', async () => {
      httpStatus = 200;
      const before = await db.prepare('SELECT * FROM area_results ORDER BY area_id').all();
      for (const [time, votes] of [['2026-11-05T13:04:00Z', 31], ['2026-11-05T13:05:00Z', 32]] as const) {
        document = fixture(time, votes);
        await refreshSource(env, source, names);
      }
      assert.deepEqual((await db.prepare('SELECT * FROM area_results ORDER BY area_id').all()).results, before.results);
      const objects = await env.RAW_RESULTS.list({ prefix: 'compact/v1/2026/municipality-9909/' });
      assert.equal(objects.objects.length, 2);
      const state = await readState(db, source);
      assert.equal(await archivedRaw(env.RAW_RESULTS, state.last_raw_key!, state.raw_length), JSON.stringify(document));
    });

    await t.test('party-directory changes invalidate identical-file shortcuts without publishing unused labels', async () => {
      const before = (await readState(db, source)).active_snapshot_id;
      assert.equal((await refreshSource(env, source, new Map([['7', 'Unused label']]))).outcome, 'results_unchanged');
      assert.equal((await readState(db, source)).active_snapshot_id, before);
      document = fixture('2026-11-05T13:06:00Z', 32);
      document.PartyBallotResults[0]!.Name = '';
      assert.equal((await refreshSource(env, source, new Map([['7', 'First directory name']]))).outcome, 'published');
      const first = (await readState(db, source)).active_snapshot_id;
      assert.equal((await refreshSource(env, source, new Map([['7', 'Corrected directory name']]))).outcome, 'published');
      assert.notEqual((await readState(db, source)).active_snapshot_id, first);
      assert.equal(lastHeaders!.get('If-None-Match'), null);
    });

    await t.test('milestones publish atomically, ignore refreshes, paginate, and retain linked corrections', async () => {
      const options = feedOptions(new URLSearchParams());
      assert.equal((await getUpdates(db, options)).updates.length, 0, 'initial imports and routine votes are not news');
      document = fixture('2026-11-05T13:07:00Z', 33);
      document.VDsComplete = 0;
      await refreshSource(env, source, names);
      assert.equal((await getUpdates(db, options)).updates.length, 0, 'an unannounced baseline is not retracted in the feed');
      document = fixture('2026-11-05T13:08:00Z', 34);
      document.WardResults[0]!.PartyBallotResults[0]!.WardSeatsWon = 1;
      await db.prepare(`CREATE TRIGGER fail_update_publication BEFORE UPDATE OF active_snapshot_id ON source_documents
        BEGIN SELECT RAISE(ABORT,'simulated event failure'); END`).run();
      await assert.rejects(refreshSource(env, source, names), /simulated event failure/);
      assert.equal((await getUpdates(db, options)).updates.length, 0, 'failed source publication cannot leak an update');
      await db.prepare('DROP TRIGGER fail_update_publication').run();
      await refreshSource(env, source, names);
      let feed = await getUpdates(db, options);
      assert.equal(feed.updates.length, 2);
      const original = feed.updates.find(u => u.kind === 'ward_won')!;
      assert.ok(original.from_snapshot_id);
      assert.equal(original.after!.winner!.id, '7');
      assert.equal(original.action, 'announced');
      await refreshSource(env, source, names);
      document.ReportDate = '2026-11-05T13:09:00Z';
      await refreshSource(env, source, names);
      assert.equal((await getUpdates(db, options)).updates.length, 2, 'retry and clock-only generation are quiet');
      const firstPage = await getUpdates(db, { ...options, limit: 1 });
      assert.ok(firstPage.next_before);
      const secondPage = await getUpdates(db, { ...options, limit: 1, before: firstPage.next_before });
      assert.equal(secondPage.updates.length, 1);
      assert.notEqual(secondPage.updates[0]!.id, firstPage.updates[0]!.id);
      assert.equal((await getUpdates(db, { ...options, province: '1' })).updates.length, 0);
      assert.equal((await getUpdates(db, { ...options, q: '%' })).updates.length, 0);
      assert.equal((await getUpdates(db, { ...options, type: 'wins', q: 'Example' })).updates.length, 1);
      document = fixture('2026-11-05T13:10:00Z', 35);
      document.WardResults[0]!.PartyBallotResults.push({ ID: 8, Name: 'New party', WardVotes: 50, PRVotes: 20,
        TotalValidVotes: 70, WardSeatsWon: 1, PRSeatsWon: 0, TotalSeatsWon: 1 });
      await refreshSource(env, source, names);
      feed = await getUpdates(db, options);
      const correction = feed.updates[0]!;
      assert.equal(correction.action, 'corrected');
      assert.equal(correction.previous_event_id, original.id);
      assert.equal(correction.before!.winner!.id, '7');
      assert.equal(correction.after!.winner!.id, '8');
      const saved = (await getUpdates(db, { ...options, event: original.id })).updates[0]!;
      assert.equal(saved.superseded_by, correction.id);
      assert.equal(saved.after!.winner!.id, '7', 'original announcement is preserved');
      document = fixture('2026-11-05T13:11:00Z', 36);
      document.VDsComplete = 0;
      await refreshSource(env, source, names);
      feed = await getUpdates(db, options);
      assert.equal(feed.updates.filter(u => u.action === 'withdrawn').length, 2);
      assert.equal((await getUpdates(db, { ...options, type: 'corrections' })).updates.length, 3);
      assert.equal((await getUpdates(db, { ...options, after: correction.id })).updates.length, 2);
    });

    await t.test('CPU telemetry gates ingestion, fails closed when stale, and ignores unrelated workers', async () => {
      assert.equal(await cpuBudgetReady(db), false);
      await recordImporterCpu(db, [{ scriptName: 'sa-election-data-sync', cpuTime: 1.1 },
        { scriptName: 'sa-election-data-sync', cpuTime: 2.3 }, { scriptName: 'unrelated', cpuTime: 1000 }]);
      assert.equal((await db.prepare('SELECT SUM(cpu_ms) AS cpu FROM sync_budget').first<{cpu:number}>())!.cpu, 5);
      assert.equal(await cpuBudgetReady(db), true);
      await db.prepare("UPDATE sync_budget SET cpu_meter_seen_at='2000-01-01'").run();
      assert.equal(await cpuBudgetReady(db), false);
      await recordImporterCpu(db, [{ scriptName: 'sa-election-data-sync', cpuTime: 0 }]);
      assert.equal(await cpuBudgetReady(db), true);
      await assert.rejects(recordImporterCpu(db, [{ scriptName: 'sa-election-data-sync', cpuTime: NaN }]), /Invalid CPU/);
    });

    await t.test('budget reservations are atomic and exhaustion preserves the published result', async () => {
      // Crossing a date/month boundary does not create a second allowance.
      const yesterday = budgetPeriod(new Date(Date.now() - 86400_000));
      await db.prepare('INSERT INTO sync_budget(period,checks) VALUES (?,?)').bind(yesterday, SYNC_LIMITS.checks - 1).run();
      await db.prepare('UPDATE sync_budget SET checks=0 WHERE period=?').bind(budgetPeriod()).run();
      const attempts = await Promise.allSettled([reserveBudget(db, 'checks', 1), reserveBudget(db, 'checks', 1)]);
      assert.equal(attempts.filter(r => r.status === 'fulfilled').length, 1);
      const failed = attempts.find(r => r.status === 'rejected') as PromiseRejectedResult;
      assert.ok(failed.reason instanceof BudgetExhausted);
      const previous = (await readState(db, source)).active_snapshot_id;
      await assert.rejects(refreshSource(env, source, names), BudgetExhausted);
      assert.equal((await readState(db, source)).active_snapshot_id, previous);
      assert.equal((await syncHealth(db)).status, 'budget_paused');
      await db.prepare('UPDATE sync_budget SET cpu_ms=? WHERE period=?').bind(SYNC_LIMITS.cpu_ms, budgetPeriod()).run();
      assert.equal(await cpuBudgetReady(db), false);
      assert.equal((await syncHealth(db)).ingestion_budget.usage!.exhausted_resource, 'cpu_ms');
    });
  } finally {
    mocked.mock.restore();
    await proxy.dispose();
    rmSync(directory, { recursive: true, force: true });
  }
});
