import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { read, write } from 'xlsx';
import { getPlatformProxy } from 'wrangler';
import { parseDistrictReport, DISTRICT_MAX_BYTES } from '../src/lib/districts/parse.ts';
import { districtSourceUrl, districtView, getDistrictResults, type DistrictRow } from '../src/lib/districts/results.ts';
import { fetchDistrictReport } from '../src/lib/districts/fetch.ts';
import { findDistrict } from '../src/lib/maps/districts.ts';
import { migrateD1 } from '../scripts/lib/migrations.ts';
import { districtJobs, enqueueDistricts, ensureDistrictSources, failDistrict, refreshDistrict, runDistrictJobs, type DistrictJob } from '../workers/sync/districts.ts';
import { dashboardCouncils } from '../src/lib/overview/dashboard.ts';
import { syncHealth } from '../src/lib/data/sync-health.ts';

const garden = findDistrict('DC4')!, sedibeng = findDistrict('DC42')!;
const bytes = readFileSync('tests/fixtures/districts/garden-route-2026.xls');
const now = Date.parse('2026-11-08T00:00:00Z');
function amended(values: Record<string,string|number>) {
  const book = read(bytes,{type:'array'});
  for (const [cell,value] of Object.entries(values)) book.Sheets.Sheet2![cell] = {v:value,t:typeof value === 'number'?'n':'s'};
  return new Uint8Array(write(book,{type:'array',bookType:'biff8'}));
}

test('real district reports preserve ballot scope, numeric values and SAST source clocks', () => {
  const result = parseDistrictReport(bytes,garden,now);
  assert.equal(result.validVotes,228399); assert.equal(result.spoiltVotes,2631);
  assert.equal(result.reportedAt,'2026-11-06T11:26:06.000Z');
  assert.equal(result.parties[0]!.name,'DEMOCRATIC ALLIANCE');
  assert.equal(result.parties[0]!.votes,116431);
  assert.ok(Math.abs(result.parties[0]!.share!-50.97701828817114)<1e-10);
  const sed = parseDistrictReport(readFileSync('tests/fixtures/districts/sedibeng-2026.xls'),sedibeng,now);
  assert.equal(sed.validVotes,193531); assert.equal(sed.parties.length,29);
  assert.match(districtSourceUrl(findDistrict('DC25')!),/\/KN\/DC25\.xls$/);
  assert.match(districtSourceUrl(findDistrict('DC35')!),/\/NP\/DC35\.xls$/);
});

test('rejects wrong identity, invalid clocks, malformed downloads and unreconciled votes', () => {
  assert.throws(()=>parseDistrictReport(bytes,sedibeng,now),/identity/);
  assert.throws(()=>parseDistrictReport(amended({H7:'2021 Local Government Elections'}),garden,now),/identity/);
  assert.throws(()=>parseDistrictReport(amended({D5:'Printed on: 2026/02/30 12:00:00'}),garden,now),/timestamp/);
  assert.throws(()=>parseDistrictReport(bytes,garden,Date.parse('2026-11-05')),/timestamp/);
  assert.throws(()=>parseDistrictReport(amended({J18:-1}),garden,now),/party votes/);
  assert.throws(()=>parseDistrictReport(amended({J18:0.5}),garden,now),/party votes/);
  assert.throws(()=>parseDistrictReport(amended({J45:228400}),garden,now),/reconcile/);
  assert.throws(()=>parseDistrictReport(amended({E19:'ADVIESKANTOOR'}),garden,now),/duplicate/);
  assert.throws(()=>parseDistrictReport(new TextEncoder().encode('<html>Unavailable</html>'),garden,now),/BIFF/);
  assert.throws(()=>parseDistrictReport(new Uint8Array(DISTRICT_MAX_BYTES+1),garden,now),/bounded/);
});

test('district import archives bytes, validates publication, retries safely, and never infers council control', async t => {
  const directory = mkdtempSync(join(tmpdir(),'district-import-test-'));
  const proxy = await getPlatformProxy<SyncEnv>({configPath:'workers/sync/wrangler.jsonc',persist:{path:directory},remoteBindings:false});
  const sent: DistrictJob[] = [];
  const env: SyncEnv = {...proxy.env,RESULT_JOBS:{...proxy.env.RESULT_JOBS,
    sendBatch: async messages => { for (const m of messages) sent.push(...districtJobs(m.body)!); return {metadata:{metrics:{backlogCount:sent.length,backlogBytes:0}}}; },
  }};
  const db = env.RESULTS_DB;
  let responseBytes: Uint8Array = bytes, status = 200;
  let headers = new Headers();
  const realFetch = globalThis.fetch;
  const mock = t.mock.method(globalThis,'fetch',async (input:RequestInfo|URL,init?:RequestInit) => {
    if (!String(input).startsWith('https://results.elections.org.za/')) return realFetch(input,init);
    headers = new Headers(init?.headers);
    return new Response(status===304?null:new Uint8Array(responseBytes),{status,headers:{ETag:'district-test'}});
  });
  const stored = () => db.prepare('SELECT * FROM district_results WHERE id=?').bind(garden.id).first<DistrictRow>();
  try {
    await migrateD1(db); await ensureDistrictSources(db);
    assert.equal(await refreshDistrict(env,garden),'published');
    const initial = (await stored())!;
    assert.deepEqual(new Uint8Array(await (await env.RAW_RESULTS.get(initial.raw_key!))!.arrayBuffer()),new Uint8Array(bytes));
    assert.equal((await getDistrictResults(db)).get(garden.id)!.result.validVotes,228399);
    status = 304; assert.equal(await refreshDistrict(env,garden),'not_modified');
    assert.equal(headers.get('If-None-Match'),'district-test');
    assert.equal((await stored())!.published_at,initial.published_at);
    status = 200; responseBytes = amended({D5:'Printed on: 2026/11/06 13:27:06'});
    assert.equal(await refreshDistrict(env,garden),'results_unchanged');
    assert.equal((await stored())!.published_at,initial.published_at);
    responseBytes = amended({D5:'Printed on: 2026/11/06 13:28:06',J18:910,J45:228398});
    assert.equal(await refreshDistrict(env,garden),'published');
    const corrected = (await stored())!;
    assert.equal(JSON.parse(corrected.payload!).validVotes,228398);
    responseBytes = bytes;
    await assert.rejects(refreshDistrict(env,garden),/older/);
    responseBytes = amended({D5:'Printed on: 2026/11/06 13:29:06',J45:4});
    await assert.rejects(refreshDistrict(env,garden),/reconcile/);
    await failDistrict(db,garden.id,new Error('Bad upstream file'));
    assert.equal((await stored())!.payload,corrected.payload);
    assert.equal(districtView((await stored())!)!.stale,true);
    const districtData = await getDistrictResults(db);
    const councils = dashboardCouncils(new Map(),new Map(),[],new Set(),districtData);
    const council = councils.find(c=>c.id===garden.id)!;
    assert.equal(council.status,'pending'); assert.equal(council.winner,null);
    assert.equal(council.seats,null); assert.equal(council.winnerId,''); assert.equal(council.comparable,false);
    assert.equal(council.districtVotes!.result.validVotes,228398);
    assert.equal((await syncHealth(db)).latest_result_publication,corrected.published_at);
    await db.prepare('UPDATE district_results SET successful_at=NULL,retry_after=NULL WHERE id=?').bind(garden.id).run();
    assert.equal(await enqueueDistricts(env),44); assert.equal(sent.length,44);
    assert.equal(await enqueueDistricts(env),0);
    const job = sent.find(j=>j.districtId===garden.id)!;
    // A stale delivery cannot fetch or overwrite a newer claim.
    assert.equal(await runDistrictJobs(env,[{...job,token:'old'}],1),0);
    status=304;
    assert.equal(await runDistrictJobs(env,[job],1),0);
    assert.equal((await stored())!.pending_token,null);
    assert.equal((await stored())!.last_error,null);
    assert.equal(districtJobs({version:2,kind:'district',jobs:[{...job,districtId:'DC999'}]}),null);
    assert.equal(districtJobs({version:1,jobs:[job]}),null);
    status=503;
    await assert.rejects(fetchDistrictReport(districtSourceUrl(garden)),/503/);
  } finally { mock.mock.restore(); await proxy.dispose(); rmSync(directory,{recursive:true,force:true}); }
});
