import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { nextFixture, nextSpec, nextDataset } from './fixtures/chat-visual-next.ts';
import { visualDataset } from './fixtures/chat-visual.ts';
import { composeVisual } from '../src/lib/chat/visuals/model.ts';
import { renderVisual } from '../src/lib/chat/visuals/render.ts';
import { tableCSV } from '../src/lib/chat/visuals/table-format.ts';
import { readVisualData } from '../src/lib/chat/visuals/data.ts';
import { artifactMarkup } from '../src/lib/chat/markup.server.ts';

test('all six components survive JSON replay and server rendering with their evidence', () => {
  const artifact = JSON.parse(JSON.stringify(nextFixture()));
  assert.equal(artifact.charts.metric.metric.value, 4);
  assert.equal(artifact.charts.compare.columns[1].status, 'hypothetical');
  assert.equal(artifact.charts.map.table.rows[2].values.share, null);
  assert.match(artifact.charts.map.table.rows[0].href, /^\/2026\/provinces\//);
  const html = artifactMarkup(artifact);
  assert.match(html, /Seats above majority/); assert.match(html, /Outside supporters/); assert.match(html, /Unavailable/);
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const root = renderVisual(artifact); assert.equal(root.querySelectorAll('[data-component]').length, 6);
  assert.match(root.querySelector('[data-component=Comparison]')!.textContent!, /\+2 seats/);
  assert.equal(root.querySelectorAll('.cv-evidence>section').length, 5);
  window.happyDOM.abort();
});

test('sorting, filtering, pagination, highlighting and timeline expansion stay local', () => {
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const artifact = nextFixture(), saved = JSON.stringify(artifact), root = renderVisual(artifact);
  const table = root.querySelector('[data-component=DataTable]')!, input = table.querySelector('input')!;
  assert.equal(table.querySelectorAll('tbody tr').length, 5); assert.equal(table.querySelectorAll('tbody a').length, 0, 'rows without URLs must not link to the site root');
  assert.match(table.querySelector('tbody tr')!.textContent!, /70%/);
  (table.querySelectorAll('thead button')[1] as HTMLButtonElement).click();
  assert.match(table.querySelector('tbody tr')!.textContent!, /Example 23/);
  (table.querySelectorAll('.cv-pagination button')[1] as HTMLButtonElement).click();
  assert.match(table.querySelector('.cv-pagination')!.textContent!, /6–10 of 23/);
  input.value = 'Example 23'; input.dispatchEvent(new window.Event('input') as any);
  assert.equal(table.querySelectorAll('tbody tr').length, 1); assert.match(table.querySelector('tbody')!.textContent!, /Example 23/);
  const bars = root.querySelector('[data-component=RankedBars]')!;
  assert.equal(bars.querySelectorAll('.cv-ranked li').length, 5);
  (bars.querySelector('.cv-rank-row') as HTMLButtonElement).click(); assert.equal(bars.querySelector('.cv-rank-row')!.getAttribute('aria-pressed'), 'true');
  (bars.querySelector('.cv-toolbar button') as HTMLButtonElement).click(); assert.match(bars.querySelector('.cv-rank-label')!.textContent!, /Example 23/);
  (bars.querySelectorAll('.cv-toolbar button')[1] as HTMLButtonElement).click(); assert.match(bars.querySelector('.cv-ranked li:last-child')!.textContent!, /Unavailable/);
  const timeline = root.querySelector('[data-component=GovernmentTimeline]')!;
  assert.equal(timeline.querySelectorAll('.cv-timeline>li').length, 3); (timeline.querySelector('button') as HTMLButtonElement).click();
  assert.equal(timeline.querySelectorAll('.cv-timeline>li').length, 5);
  assert.equal(JSON.stringify(artifact), saved); window.happyDOM.abort();
});

test('invalid metrics, mixed column types, duplicate rows, historical maps and bad dates are rejected', () => {
  const datasets = new Map([['council', visualDataset], ['table', nextDataset]]);
  for (const mutate of [
    (s: any) => s.elements.metric.props.data.party_ids.push('A'),
    (s: any) => s.elements.table.props.column_ids.push('invented'),
    (s: any) => s.elements.map.props.data.rows[0].id = '99999',
    (s: any) => s.elements.map.props.data.rows[1].id = '1',
    (s: any) => s.elements.map.props.data.rows[0].values.share = 101,
    (s: any) => s.elements.map.props.data.rows[0].values.share = '70',
    (s: any) => s.elements.timeline.props.data.events[0].end = '2020-01-01',
    (s: any) => s.elements.timeline.props.data.events[0].start = '2026-02-31',
  ]) { const spec = structuredClone(nextSpec); mutate(spec); assert.throws(() => composeVisual(spec, datasets)); }
  const artifact = nextFixture(), spec = structuredClone(nextSpec);
  const map = spec.elements.map!; assert.equal(map.type, 'ResultsMap'); map.props.data = { kind: 'dataset', dataset_id: 'historical' };
  assert.throws(() => composeVisual(spec, new Map([...datasets, ['historical', { columns: [], table: { ...artifact.charts.map!.table!, year: 2021, status: 'reported' } }]])), /Historical boundaries/);
});

test('CSV keeps missing values, exact numbers and inert spreadsheet/text content', () => {
  const data = structuredClone(nextDataset.table!); data.rows[0]!.label = '=HYPERLINK("https://evil.example")';
  data.rows[0]!.values.change = -2.12345;
  const csv = tableCSV(data, ['share', 'change']); assert.match(csv, /'=HYPERLINK/); assert.match(csv, /-2.12345/); assert.match(csv, /Unavailable/);
  const artifact = nextFixture(); artifact.charts.table!.table!.rows[0]!.label = '<img src=x onerror=alert(1)>';
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const root = renderVisual(artifact); assert.equal(root.querySelectorAll('script,img,iframe').length, 0);
  assert.match(artifactMarkup(artifact), /&lt;img/); window.happyDOM.abort();
});

test('government data includes dated source records and keeps supporters separate', async () => {
  const data = await readVisualData({} as any, 'https://counted.co.za', { view: 'government', year: 2026, level: 'municipality', area_id: '3003', metric: 'seats' });
  assert.equal(data.timeline!.cutoff, '2026-02-28'); assert.ok(data.timeline!.events.length > 1);
  assert.match(data.timeline!.notes.join(' '), /not today/); assert.ok(data.timeline!.sources.length);
  assert.ok(data.timeline!.events.every(e => e.start && Array.isArray(e.supporters)));
});

test('map loads pinned site geometry and provides selection, metric switching and fallback', async () => {
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json(JSON.parse(readFileSync(new URL('../public/maps/geometry/provinces-2026-20261105-v3.geojson', import.meta.url), 'utf8')));
  try {
    const { mountResultsMap } = await import('../src/lib/chat/visuals/map-render.ts');
    const card = document.createElement('section'), status = document.createElement('p'); card.appendChild(status); document.body.appendChild(card);
    await mountResultsMap(card, nextFixture().charts.map!.table!, 'share', status);
    assert.equal(card.querySelectorAll('svg path').length, 9, 'all province outlines provide geographic context');
    const pick = card.querySelectorAll('select')[1]!; pick.value = '9'; pick.dispatchEvent(new window.Event('change') as any);
    assert.match(card.querySelector('.cv-map-readout')!.textContent!, /Western Cape.*Unavailable/);
    const metric = card.querySelector('select')!; metric.value = 'reporting'; metric.dispatchEvent(new window.Event('change') as any);
    assert.match(card.querySelector('.cv-map-readout')!.textContent!, /Reporting: 100%/);
    assert.match(card.querySelector('.cv-map-readout a')!.getAttribute('href')!, /western-cape/);
    globalThis.fetch = async () => { throw new Error('offline'); };
    const failed = document.createElement('section'), error = document.createElement('p'); failed.appendChild(error); document.body.appendChild(failed);
    await mountResultsMap(failed, { ...nextFixture().charts.map!.table!, geography: 'municipality' }, 'share', error);
    assert.match(failed.querySelector('.cv-map-loading')!.textContent!, /Map unavailable/); assert.ok(failed.querySelector('select'));
  } finally { globalThis.fetch = original; window.happyDOM.abort(); }
});
