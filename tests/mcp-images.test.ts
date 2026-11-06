import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import sharp from 'sharp';
import { resultFromRow } from '../src/lib/places/results.ts';
import { areaSummary } from '../src/lib/mcp/summaries.ts';
import { resultImage } from '../src/lib/mcp/images/model.ts';
import { resultImageSvg, imageDimensions } from '../src/lib/mcp/images/svg.ts';
import { createImageService, imagePrefix } from '../src/lib/mcp/images/service.ts';
import { readResultImage } from '../src/lib/mcp/images/http.ts';
import type { DataReader } from '../src/lib/mcp/data.ts';
import { changeImage, areaComparisonImage } from '../src/lib/mcp/images/comparison.ts';
import { councilImage } from '../src/lib/mcp/images/council.ts';
import { imageWidgetHtml } from '../src/lib/mcp/images/widget.ts';

export function fixture(year = 2026) {
  return resultFromRow({ year, level: 'municipality', area_id: '9909', name: 'Witzenberg', municipality_id: '9909',
    snapshot_id: `snapshot-${year}`, url: 'https://iec.example/results', reported_at: '2026-11-01T00:00:00Z',
    last_checked_at: '2026-11-01T00:00:00Z', last_success_at: '2026-11-01T00:00:00Z', last_error: null,
    payload: JSON.stringify({ party_list_scope: 'all_rows_in_source', ballot_scope: 'source_combined',
      parties: [140, 60, 0, 0].map((n, i) => ({ source_entry_id: String(i + 1), party_id: String(i + 1),
        party_name: ['DEMOCRATIC ALLIANCE', 'AFRICAN NATIONAL CONGRESS', 'INDEPENDENT CIVIC ORGANISATION OF SOUTH AFRICA', '<script>&"Test'][i],
        party_name_source: 'result_file', candidate_name: null, entry_type: 'party_or_candidate',
        votes: { source_total: n, pr: i === 0 ? 80 : i === 1 ? 20 : 0, ward: i === 0 ? 60 : i === 1 ? 40 : 0 },
        seats: { ward: 0, pr: 0, total: 0 }, source_share_percent: n / 2 })),
      reported_totals: { valid_ballot_papers: 200, registered_voters: null, ballot_papers_cast: null, spoilt_ballot_papers: null },
      progress: { municipalities: null, voting_districts: { expected: 10, completed: 5 },
        wards: { expected: 2, completed: 0 }, seats: { expected: 4, completed: 0 } } }) });
}

test('result images preserve full denominators, partial coverage, nulls and ballot fallback', () => {
  const r = fixture();
  let s = areaSummary(r, 'pr', 2000);
  const image = resultImage({ ...s, available_years: [2026] }, 3, '4');
  assert.equal(image.rows[0]!.value, 80);
  assert.equal(image.rows[2]!.id, '4');
  assert.equal(image.data.omitted_entries, 1);
  assert.match(image.alt, /PROVISIONAL/);
  assert.match(resultImageSvg(image), /&lt;script&gt;&amp;&quot;/);
  assert.doesNotMatch(resultImageSvg(image), /<script>/);
  assert.throws(() => resultImage({ ...s, available_years: [], party_page: { ...s.party_page, next_offset: 3 } }, 3), /complete party list/);
  assert.throws(() => resultImage({ ...s, available_years: [] }, 3, '999'), /exactly one/);
  r.level = 'national'; r.id = 'ZA'; r.results.party_list_scope = 'leading_parties_only';
  r.results.reported_totals.valid_ballot_papers = 1000;
  s = areaSummary(r, 'pr', 2000);
  const partial = resultImage({ ...s, available_years: [] }, 3);
  assert.ok(Math.abs(partial.rows[0]!.value! - 14) < 1e-10);
  assert.match(partial.alt, /selected parties only/);
  r.level = 'municipality'; r.id = '9909'; r.results.party_list_scope = 'all_rows_in_source';
  r.results.parties[0]!.votes.pr = null;
  s = areaSummary(r, 'pr', 2000);
  assert.equal(resultImage({ ...s, available_years: [] }, 3).rows[0]!.value, null);
  for (const p of r.results.parties) { p.votes.pr = null; p.votes.ward = null; }
  s = areaSummary(r, 'pr', 2000);
  assert.match(resultImage({ ...s, available_years: [] }, 3).alt, /combined ballots shown/);
});

test('actual WASM renderer produces a bounded PNG at the declared dimensions', async () => {
  await initWasm(readFileSync(new URL(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'))));
  const fonts = ['Medium', 'Bold'].map(w => readFileSync(new URL(`../src/lib/og/fonts/SpaceGrotesk-${w}.ttf`, import.meta.url)));
  const model = resultImage({ ...areaSummary(fixture(), 'pr', 2000), available_years: [2026] }, 4);
  const renderer = new Resvg(resultImageSvg(model), { font: { fontBuffers: fonts, defaultFontFamily: 'Space Grotesk' } });
  const png = renderer.render();
  try {
    const metadata = await sharp(png.asPng()).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, imageDimensions(model).width);
    assert.equal(metadata.height, imageDimensions(model).height);
  } finally { png.free(); renderer.free(); }
});

test('image publication is immutable, cached, and exposes only generated objects', async () => {
  const objects = new Map<string, Uint8Array>();
  const writes: string[] = [];
  const bucket = {
    async get(key: string) {
      const bytes = objects.get(key);
      return bytes ? { size: bytes.length, httpEtag: '"fixture"', body: new Response(new Uint8Array(bytes)).body,
        arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) } : null;
    },
    async put(key: string, value: string | Uint8Array) { writes.push(key); objects.set(key, typeof value === 'string' ? new TextEncoder().encode(value) : value); },
  } as unknown as R2Bucket;
  let s = { ...areaSummary(fixture(), 'pr', 2000), available_years: [2026] };
  const reader = { summary: async () => s } as unknown as DataReader;
  let renders = 0;
  const service = createImageService(reader, bucket, () => { renders++; return new Uint8Array([137, 80, 78, 71]); });
  const args = { year: 2026, level: 'municipality', area_id: '9909', ballot: 'pr', top: 3 } as const;
  const first = await service.results(args);
  const again = await service.results(args);
  assert.equal(renders, 1); assert.equal(writes.length, 2);
  assert.match(writes[0]!, /\.json$/); assert.match(writes[1]!, /\.png$/);
  assert.deepEqual(first.content.slice(1), again.content.slice(1));
  assert.deepEqual((first.structuredContent as Record<string, unknown>).data, (again.structuredContent as Record<string, unknown>).data);
  assert.deepEqual(first.content.map(c => c.type), ['text', 'image']);
  const filename = writes[1]!.slice(imagePrefix.length);
  const response = await readResultImage(new Request(`https://counted.co.za/images/results/${filename}`), filename, bucket);
  assert.equal(response.status, 200); assert.equal(response.headers.get('Content-Type'), 'image/png');
  assert.match(response.headers.get('Cache-Control')!, /immutable/);
  s = { ...s, source: { ...s.source, snapshotId: 'new-snapshot' } };
  await service.results(args);
  assert.equal(renders, 2); assert.equal(objects.size, 4);
  assert.equal((await readResultImage(new Request('https://counted.co.za'), '../private.pack', bucket)).status, 404);
  assert.equal((await readResultImage(new Request('https://counted.co.za', { method: 'HEAD' }), filename, bucket)).body, null);
});

test('change charts use comparable ballots and keep unknown baselines out of rankings', () => {
  const r = fixture(), previous = fixture(2021);
  previous.results.parties[0]!.votes = { source_total: 100, pr: null, ward: null };
  previous.results.parties[1]!.votes = { source_total: 100, pr: null, ward: null };
  for (const p of previous.results.parties) { p.votes.pr = null; p.votes.ward = null; }
  previous.results.parties[2]!.entry_type = 'aggregate';
  previous.results.parties[2]!.party_id = null;
  const s = { ...areaSummary({ ...r, previous }, 'pr', 2000), available_years: [2021,2026] };
  const model = changeImage(s, 10);
  assert.equal(model.unit, 'pp');
  assert.equal(model.rows.find(p=>p.id==='1')!.value, 20);
  assert.equal(model.rows.some(p=>p.id==='3'), false);
  assert.match(model.alt, /Combined ballots used for both elections/);
  assert.match(model.alt, /not boundary-adjusted/);
  assert.match(resultImageSvg(model), /decrease/);
  assert.throws(()=>changeImage(s, 10, '3'), /aggregate/);
});

test('area comparison refuses mixed ballots and shows absent parties as unavailable', () => {
  const r = fixture();
  const first = { ...areaSummary(r, 'pr', 2000), available_years: [] };
  r.id = '9910'; r.name = 'Second area'; r.results.parties = r.results.parties.filter(p=>p.party_id!=='1');
  const second = { ...areaSummary(r, 'pr', 2000), available_years: [] };
  const model = areaComparisonImage([first,second], '1');
  assert.equal(model.rows[1]!.value, null);
  assert.match(model.rows[1]!.detail, /unavailable/);
  assert.match(model.alt, /not a nationwide ranking/);
  assert.throws(()=>areaComparisonImage([first,{ ...second, ballot: {...second.ballot,basis:'source_total'} }], '1'), /same ballot/);
  assert.throws(()=>areaComparisonImage([first,second], '0'), /named party/);
});

test('council images keep estimates and hypothetical selections explicit with exact seat totals', () => {
  const r = fixture();
  let s = { ...areaSummary(r, 'auto', 2000), available_years: [] };
  const estimated = councilImage(s, ['1']);
  assert.match(estimated.status, /HYPOTHETICAL.*ESTIMATED/);
  assert.equal(estimated.council!.majority, 3);
  assert.equal(estimated.council!.selected, 3);
  assert.equal(estimated.council!.groups.reduce((n,g)=>n+g.seats,0), 4);
  assert.equal((resultImageSvg(estimated).match(/<circle /g)??[]).length, 4);
  assert.match(estimated.alt, /No coalition agreement/);
  assert.throws(()=>councilImage(s,['0']), /independents/);
  assert.throws(()=>councilImage(s,['1','1']), /distinct/);
  assert.throws(()=>councilImage(s,['999']), /not uniquely listed/);
  r.results.progress.seats!.completed = 4;
  r.results.progress.wards!.completed = 2;
  r.results.parties[0]!.seats = {ward:1,pr:2,total:3};
  r.results.parties[1]!.seats = {ward:1,pr:0,total:1};
  s = { ...areaSummary(r, 'auto', 2000), available_years: [] };
  const reported = councilImage(s, []);
  assert.match(reported.status, /PROVISIONAL.*REPORTED/);
  assert.equal(reported.council!.selected, null);
  assert.doesNotMatch(reported.status, /ESTIMATED/);
});

test('image viewer accepts only generated Counted URLs and uses the MCP Apps bridge', () => {
  const source = imageWidgetHtml.slice(imageWidgetHtml.indexOf('function validUrl'), imageWidgetHtml.indexOf('function notify'));
  const validate = new Function('value','ext',source+'return validUrl(value,ext)') as (value:string,ext:string)=>boolean;
  const path = '/images/results/'+'a'.repeat(64)+'.png';
  assert.equal(validate('https://counted.co.za'+path,'png'),true);
  for (const url of ['https://attacker.example'+path,'https://counted.co.za/other.png','javascript:alert(1)','https://counted.co.za'+path+'?secret=x']) assert.equal(validate(url,'png'),false);
  assert.match(imageWidgetHtml,/ui\/notifications\/tool-result/);
  assert.match(imageWidgetHtml,/ui\/initialize/);
});
