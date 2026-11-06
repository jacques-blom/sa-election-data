import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { getPlatformProxy } from 'wrangler';
import { handleMcp } from '../src/lib/mcp/http.ts';
import { createDataReader, type McpBindings } from '../src/lib/mcp/data.ts';
import { resultsApi } from '../src/lib/api/results.ts';
import { migrateD1 } from '../scripts/lib/migrations.ts';
import { ELECTIONS, sourceFor } from '../src/lib/data/catalogue.ts';
import { normalize } from '../src/lib/data/normalize.ts';
import type { AreaRecord } from '../src/lib/data/normalize.ts';
import { resultQuality } from '../src/lib/data/quality.ts';
import { packRecords, prepareRecords } from '../workers/sync/pack.ts';
import { findPlace } from '../src/lib/places/catalogue.ts';

const endpoint = new URL('http://localhost/mcp');
const options = { allowedHosts: ['counted.co.za', 'localhost'] };
const unavailable: McpBindings = { RESULTS_DB: null!, RAW_RESULTS: null! };
const headers = { host: 'localhost', 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };

async function connect(bindings: McpBindings, modern = false) {
  const client = new Client({ name: 'counted-test', version: '1' }, modern ? { versionNegotiation: { mode: { pin: '2026-07-28' } } } : {});
  await client.connect(new StreamableHTTPClientTransport(endpoint, {
    fetch: async (input, init) => {
      const request = new Request(input, init);
      request.headers.set('Host', 'localhost');
      return handleMcp(request, bindings, options);
    },
  }));
  return client;
}

async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });
  return { ...result, structuredContent: result.structuredContent as Record<string, unknown> | undefined };
}

type ResultData = {
  source: { freshness: string; snapshot_id: string };
  quality: ReturnType<typeof resultQuality>;
  caveats: string[];
  results: AreaRecord['payload'];
  party_page: { next_offset: number | null };
};

test('MCP supports real legacy and modern clients without a database or sessions for discovery', async t => {
  for (const modern of [false, true]) await t.test(modern ? '2026 protocol' : '2025 protocol', async () => {
    const client = await connect(unavailable, modern);
    try {
      const tools = await client.listTools();
      assert.equal(tools.tools.length, 8);
      assert.ok(tools.tools.every(tool => tool.annotations?.readOnlyHint && !tool.annotations?.destructiveHint));
      assert.ok(tools.tools.every(tool => tool.inputSchema.additionalProperties === false && tool.outputSchema));
      const resources = await client.listResources();
      assert.equal(resources.resources[0]?.uri, 'counted://methodology');
      const resource = await client.readResource({ uri: 'counted://methodology' });
      const content = resource.contents[0];
      assert.ok(content && 'text' in content);
      assert.match(content.text, /not unique voters/);
      const bad = await call(client, 'get_results', { year: 2024, level: 'municipality', area_id: '9909' });
      assert.equal(bad.isError, true);
      await assert.rejects(call(client, 'run_sql', { sql: 'DELETE FROM elections' }), /Tool run_sql not found/);
    } finally { await client.close(); }
  });
});

test('MCP rejects invalid hosts, origins, methods, malformed and oversized requests before data reads', async () => {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
  async function request(extraHeaders = {}, payload = body, method = 'POST') {
    return handleMcp(new Request(endpoint, { method, headers: { ...headers, ...extraHeaders },
      ...(method === 'GET' ? {} : { body: payload }) }), unavailable, options);
  }
  assert.equal((await request({ Host: 'attacker.example' })).status, 403);
  assert.equal((await request({ Origin: 'https://attacker.example' })).status, 403);
  assert.equal((await request({ Origin: 'null' })).status, 403);
  assert.equal((await request({}, '', 'GET')).status, 405);
  assert.equal((await request({}, '', 'DELETE')).status, 405);
  assert.equal((await request({}, '{')).status, 400);
  assert.equal((await request({}, ' '.repeat(32769))).status, 413);
  const preflight = await request({ Origin: 'http://localhost' }, '', 'OPTIONS');
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'http://localhost');
  const result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.equal(result.headers.get('Mcp-Session-Id'), null);
  await result.text();
  const publicRequest = new Request('https://counted.co.za/mcp', {
    method: 'POST', headers: { ...headers, host: 'counted.co.za', Origin: 'https://counted.co.za' }, body,
  });
  const publicResponse = await handleMcp(publicRequest, unavailable, options);
  assert.equal(publicResponse.status, 200);
  assert.equal(publicResponse.headers.get('Access-Control-Allow-Origin'), 'https://counted.co.za');
  await publicResponse.text();
});

test('MCP validates bounds, path inputs, unknown fields and conflicting cursors', async () => {
  const client = await connect(unavailable);
  try {
    for (const [name, args] of [
      ['get_results', { year: 2026, level: 'ward', area_id: '../sync' }],
      ['get_results', { year: 2026, level: 'national', area_id: '9909' }],
      ['get_results', { year: 2026, level: 'municipality', area_id: '9909', party_limit: 51 }],
      ['get_results', { level: 'national', area_id: 'ZA' }],
      ['search_places', { limit: 500 }], ['search_places', { offset: -1 }],
      ['get_place', { slug: '../../admin' }], ['list_areas', { year: 2026, query: 'x'.repeat(81) }],
      ['get_updates', { before: 1, after: 2 }], ['get_updates', { demo: true }],
    ] as const) assert.equal((await call(client, name, args)).isError, true, name);
  } finally { await client.close(); }
});

test('MCP queries isolated D1/R2, preserves REST evidence, and keeps historical and town scopes explicit', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'counted-mcp-test-'));
  const proxy = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc', persist: { path: directory }, remoteBindings: false });
  const db = proxy.env.RESULTS_DB;
  let client: Client | undefined;
  try {
    await migrateD1(db);
    for (const year of [2021, 2026]) {
      const election = ELECTIONS.find(e => e.year === year)!;
      const source = sourceFor(election, '9909');
      const reportedAt = '2026-11-01T10:00:00.000Z';
      const fixture = { ElectoralEventID: election.eventId, ProvinceID: 9, MunicipalityID: 9909,
        Municipality: 'Example municipality', ReportDate: reportedAt, VDExpected: 2, VDsComplete: 1,
        PartyBallotResults: [
          { ID: 7, Name: 'First', TotalValidVotes: 30, ValidVotesCast: 100, PRVotes: 20, WardSeatsWon: -1 },
          { ID: 8, Name: 'Second', TotalValidVotes: 20, PRVotes: 10 },
        ], WardResults: [] };
      const records = [...normalize(fixture, source)];
      const snapshot = `snapshot-${year}`;
      await db.prepare('INSERT INTO elections VALUES(?,?,?)').bind(year, election.eventId, election.status).run();
      await db.prepare('INSERT INTO snapshots VALUES(?,?,?,?,?,?,?,?)')
        .bind(snapshot, source.id, year, `hash-${year}`, reportedAt, reportedAt, 'fixture', records.length).run();
      await db.prepare(`INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at,last_success_at)
        VALUES(?,?,?,?,?,?,?,?)`).bind(source.id, year, 'municipality', '9909', source.url, snapshot, reportedAt, reportedAt).run();
      for (const r of records) await db.prepare(`INSERT INTO area_results
        (snapshot_id,source_id,year,level,area_id,province_id,municipality_id,ward_id,name,reported_at,payload) VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(snapshot, source.id, year, r.level, r.id, r.provinceId, r.municipalityId, r.wardId, r.name, r.reportedAt, JSON.stringify(r.payload)).run();
      if (year === 2026) {
        const pack = packRecords(Buffer.from('test-source'), prepareRecords(records));
        await proxy.env.RAW_RESULTS.put('test.pack', pack.body);
        await db.prepare(`INSERT INTO result_bundles(source_id,directory_snapshot_id,object_key,raw_length,normalizer_version,party_directory_hash,index_json)
          VALUES(?,?,?, ?,2,'test',?)`).bind(source.id, snapshot, 'test.pack', pack.rawLength, pack.indexJson).run();
        // Prove the live path hydrates R2, not the directory's payload.
        await db.prepare("UPDATE area_results SET payload='{}' WHERE year=2026").run();
      }
    }
    const place = findPlace('witzenberg')!;
    const town = { ...place, id: 'test-town', slug: 'test-town', name: 'Test Town', kind: 'town',
      relationships: [{ election: 2026, level: 'ward', areaId: '10202001', relation: 'overlaps', boundaryVersion: '2026', method: 'fixture' }] };
    for (const p of [place, town]) await db.prepare('INSERT INTO place_directory VALUES(?,?,?,?,?,?,?,?,?)')
      .bind(p.id, p.slug, p.name, JSON.stringify(p.aliases), p.province, p.municipalityName ?? '', p.kind, 0, JSON.stringify(p)).run();
    await db.prepare("INSERT INTO place_search(place_search) VALUES('rebuild')").run();
    client = await connect(proxy.env, true);

    await t.test('result party paging retains complete quality, nulls, freshness and provenance', async () => {
      const rest = await (await resultsApi(new Request('http://localhost/api/v1/elections/2026/areas/municipality/9909'), proxy.env)).json() as ResultData;
      const result = await call(client!, 'get_results', { year: 2026, level: 'municipality', area_id: '9909', party_limit: 1 });
      assert.equal(result.isError, undefined);
      const envelope = result.structuredContent!;
      const data = envelope.data as typeof rest;
      assert.deepEqual(data.source, rest.source);
      assert.deepEqual(data.quality, rest.quality);
      assert.deepEqual(data.caveats, rest.caveats);
      assert.equal(data.source.freshness, 'stale');
      assert.equal(data.source.snapshot_id, 'snapshot-2026');
      assert.equal(data.results.parties.length, 1);
      assert.equal(data.results.parties[0].votes.ward, null);
      assert.equal(data.results.reported_totals.valid_ballot_papers, 100);
      assert.equal(data.quality.vote_total_reconciliation.sum_of_published_rows, 50);
      assert.equal(data.quality.vote_total_reconciliation.status, 'differs_from_reported_total');
      assert.equal(data.party_page.next_offset, 1);
      assert.equal(envelope.data_url, 'https://counted.co.za/api/v1/elections/2026/areas/municipality/9909');
      assert.equal(envelope.documentation_url, 'https://counted.co.za/api');
      const next = await call(client!, 'get_results', { year: 2026, level: 'municipality', area_id: '9909', party_limit: 1, party_offset: 1 });
      const nextData = next.structuredContent!.data as typeof data;
      assert.equal(nextData.results.parties[0].party_name, 'Second');
      assert.equal(nextData.party_page.next_offset, null);
    });

    await t.test('historical lookup and literal search use election-specific rows', async () => {
      const result = await call(client!, 'get_results', { year: 2021, level: 'municipality', area_id: '9909' });
      const data = result.structuredContent!.data as { election: { year: number }; source: { freshness: string } };
      assert.equal(data.election.year, 2021);
      assert.equal(data.source.freshness, 'historical');
      const found = await call(client!, 'list_areas', { year: 2021, query: 'Example' });
      assert.equal((found.structuredContent!.data as { total: number }).total, 1);
      // National voting-district catalogues exceed 20,000 rows. Their later pages
      // must remain reachable, independently of the named-place search ceiling.
      const laterPage = await call(client!, 'list_areas', { year: 2021, level: 'voting-district', offset: 22000 });
      assert.equal(laterPage.isError, undefined);
      for (const query of ["%' OR 1=1 --", '_']) {
        const empty = await call(client!, 'list_areas', { year: 2021, query });
        assert.equal((empty.structuredContent!.data as { total: number }).total, 0);
      }
    });

    await t.test('place discovery describes whole overlapping wards without fetching town totals', async () => {
      const search = await call(client!, 'search_places', { query: 'Test Town' });
      const places = (search.structuredContent!.data as { places: { slug: string; url: string }[] }).places;
      assert.equal(places[0]?.slug, 'test-town');
      assert.equal(places[0]?.url, 'https://counted.co.za/2026/places/test-town');
      const result = await call(client!, 'get_place', { slug: 'test-town', limit: 1 });
      const data = result.structuredContent!.data as { scope: string; mapping_year: number; url: string; relationships: { results_url: string }[] };
      assert.equal(data.scope, 'whole_overlapping_wards_not_town_only');
      assert.equal(data.mapping_year, 2026);
      assert.equal(data.url, 'https://counted.co.za/2026/places/test-town');
      assert.equal(data.relationships[0]!.results_url, 'https://counted.co.za/api/v1/elections/2026/areas/ward/10202001');
      assert.equal((await call(client!, 'get_place', { slug: 'missing' })).isError, true);
    });

    await t.test('remaining tools report coverage, health, missing records and empty feed truthfully', async () => {
      for (const [name, args] of [['list_elections', {}], ['list_elections', { year: 2026 }],
        ['list_sources', { year: 2026 }], ['get_sync_status', {}], ['get_updates', {}]] as const) {
        const result = await call(client!, name, args);
        assert.equal(result.isError, undefined, name);
      }
      assert.equal((await call(client!, 'get_results', { year: 2026, level: 'ward', area_id: '999' })).isError, true);
      assert.equal((await call(client!, 'get_updates', { event: 999 })).isError, true);
    });

    await t.test('MCP data reads use the public GET cache without caching JSON-RPC IDs', async () => {
      const saved = new Map<string, Response>();
      const cache = {
        async match(request: Request) { return saved.get(request.url)?.clone(); },
        async put(request: Request, response: Response) { saved.set(request.url, response); },
      };
      const reader = createDataReader(proxy.env, endpoint.origin, cache);
      const first = await reader.api('/api/v1/elections/2021/areas/municipality/9909');
      assert.equal(saved.size, 1);
      const cached = createDataReader(unavailable, endpoint.origin, cache);
      assert.deepEqual(await cached.api('/api/v1/elections/2021/areas/municipality/9909'), first);
    });
  } finally {
    await client?.close();
    await proxy.dispose();
    rmSync(directory, { recursive: true, force: true });
  }
});
