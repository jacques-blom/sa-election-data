import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { composeVisual, visualParty } from '../src/lib/chat/visuals/model.ts';
import { parseVisualSpec } from '../src/lib/chat/visuals/catalog.ts';
import { readVisualData } from '../src/lib/chat/visuals/data.ts';
import { renderArtifact, enhanceSavedVisuals } from '../src/lib/chat/render.ts';
import { artifactMarkup } from '../src/lib/chat/markup.server.ts';
import { createChatTools } from '../src/lib/chat/tools.ts';
import { visualDataset, visualSpec, visualFixture } from './fixtures/chat-visual.ts';

test('composed visuals resolve immutable dataset snapshots and label custom values hypothetical', () => {
  assert.equal(visualParty('DA', 'DA', 8).color, '#2872ba');
  assert.equal(visualParty('ANC', 'ANC', 7).color, '#b29022');
  const datasets = new Map([['data_1', structuredClone(visualDataset)]]);
  const saved = composeVisual(visualSpec, datasets);
  assert.equal(saved.charts.ab!.columns[0]!.status, 'reported');
  assert.equal(saved.charts.support!.columns[1]!.status, 'hypothetical');
  assert.equal(saved.charts.support!.columns[1]!.parties[0]!.color, '#2872ba');
  datasets.get('data_1')!.columns[0]!.parties[0]!.value = 999;
  assert.equal(saved.charts.ab!.columns[0]!.parties[0]!.value, 8);
  const replay = JSON.parse(JSON.stringify(saved));
  assert.equal(replay.charts.ab.columns[0].provenance.snapshotId, 'test-snapshot-2021');
});

test('invalid trees, unknown components, props, dataset references and party selections are rejected', () => {
  for (const mutate of [
    (s: any) => s.elements.grid.children.push('root'),
    (s: any) => s.elements.grid.children.push('ab'),
    (s: any) => s.elements.grid.children.push('missing'),
    (s: any) => s.elements.ab.type = 'Script',
    (s: any) => s.elements.ab.props.html = '<script>alert(1)</script>',
    (s: any) => s.elements.ab.props.data.dataset_id = 'invented',
    (s: any) => s.elements.ab.props.selected_party_ids = ['invented'],
    (s: any) => s.elements.grid.props.columns = 99,
  ]) {
    const spec = structuredClone(visualSpec); mutate(spec);
    assert.throws(() => composeVisual(spec, new Map([['data_1', visualDataset]])));
  }
  const deep = structuredClone(visualSpec);
  deep.elements.ab!.children = ['ac'];
  assert.throws(() => parseVisualSpec(deep), /cannot contain/);
});

test('council allocations must be complete, integer and selectable; units and scopes cannot be mixed', () => {
  for (const mutate of [
    (d: any) => d.columns[0].parties[0].value = 7,
    (d: any) => d.columns[0].parties[0].value = 8.5,
    (d: any) => d.columns[0].parties[0].value = null,
    (d: any) => d.columns[0].parties[0].selectable = false,
    (d: any) => d.columns[0].parties[1].id = 'A',
  ]) { const data = structuredClone(visualDataset); mutate(data); assert.throws(() => composeVisual(visualSpec, new Map([['data_1', data]]))); }
  for (const mutate of [
    (s: any) => { s.elements.support.props.columns[1].unit = 'percent'; s.elements.support.props.columns[1].total = 100; },
    (s: any) => s.elements.support.props.columns[1].scope = 'Different council',
    (s: any) => s.elements.support.props.columns[1].parties[0].value = 100,
  ]) { const spec = structuredClone(visualSpec); mutate(spec); assert.throws(() => composeVisual(spec, new Map([['data_1', visualDataset]]))); }
});

test('council selection, reset, support highlighting and column selection work after JSON replay', () => {
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const artifact = JSON.parse(JSON.stringify(visualFixture()));
  const root = renderArtifact(artifact); window.document.body.append(root as any);
  const councils = root.querySelectorAll<HTMLElement>('[data-component="CouncilScenario"]');
  assert.equal(councils.length, 3); assert.equal(councils[0]!.dataset.selectedSeats, '15');
  assert.equal(councils[0]!.querySelectorAll('circle').length, 20);
  (councils[0]!.querySelector('.cv-party-choices button') as HTMLButtonElement).click();
  assert.equal(councils[0]!.dataset.selectedSeats, '7');
  assert.equal(councils[1]!.dataset.selectedSeats, '13', 'each scenario has independent state');
  (councils[0]!.querySelector('.cv-reset') as HTMLButtonElement).click();
  assert.equal(councils[0]!.dataset.selectedSeats, '15');
  const support = root.querySelector('[data-component="PartySupport"]')!;
  assert.match(support.querySelector('.cv-readout')!.textContent!, /Future scenario · Hypothetical/);
  (support.querySelector('.cv-column-labels button') as HTMLButtonElement).click();
  assert.match(support.querySelector('.cv-readout')!.textContent!, /2021 · Reported/);
  (support.querySelector('.cv-legend button') as HTMLButtonElement).click();
  assert.equal(support.querySelectorAll('.cv-readout-values>div').length, 1);
  assert.equal(root.querySelectorAll('.cv-evidence>section').length, 2, 'shared sources are deduplicated');
  assert.match(root.querySelector('.cv-evidence')!.textContent!, /test-snapshot-2021/);
  window.happyDOM.abort();
});

test('coalition seats fill from the left, preserve colours and restore whole-council ordering', () => {
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const artifact = visualFixture(), original = JSON.stringify(artifact);
  const root = renderArtifact(artifact);
  const councils = root.querySelectorAll('[data-component="CouncilScenario"]');
  const check = (index: number, owners: string[], selected: number, wholeCouncil = false) => {
    const dots = [...councils[index]!.querySelectorAll('circle')];
    assert.deepEqual(dots.map(dot => dot.getAttribute('data-party-id')), owners);
    assert.deepEqual(dots.map(dot => dot.getAttribute('opacity')), dots.map((_, i) => wholeCouncil || i < selected ? '1' : '.16'));
    for (const dot of dots) {
      const party = artifact.charts.ab!.columns[0]!.parties.find(p => p.id === dot.getAttribute('data-party-id'))!;
      assert.equal(dot.getAttribute('fill'), party.color);
      assert.equal(dot.querySelector('title')!.textContent, `${party.name}: ${party.value} seats`);
    }
    assert.equal(councils[index]!.querySelector('.cv-majority-label')!.textContent, '11 for majority');
    assert.ok(councils[index]!.querySelector('.cv-majority-marker'));
  };
  const a = Array(8).fill('A'), b = Array(7).fill('B'), c = Array(5).fill('C');
  check(0, [...a, ...b, ...c], 15);
  check(1, [...a, ...c, ...b], 13);
  check(2, [...b, ...c, ...a], 12);
  const buttons = councils[0]!.querySelectorAll<HTMLButtonElement>('.cv-party-choices button');
  buttons[0]!.click(); check(0, [...b, ...a, ...c], 7);
  buttons[1]!.click(); check(0, [...a, ...b, ...c], 0, true);
  (councils[0]!.querySelector('.cv-reset') as HTMLButtonElement).click(); check(0, [...a, ...b, ...c], 15);
  assert.equal(JSON.stringify(artifact), original, 'interaction does not rewrite the saved snapshot');
  window.happyDOM.abort();
});

test('model text is inert; missing support values remain gaps rather than zero', () => {
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const artifact = visualFixture();
  const support = artifact.spec.elements.support!; assert.equal(support.type, 'PartySupport');
  support.props.title = '<img src=x onerror=alert(1)>';
  artifact.charts.support!.columns[1]!.parties[0]!.value = null;
  const root = renderArtifact(artifact);
  assert.equal(root.querySelectorAll('img,script,iframe').length, 0);
  assert.match(root.textContent!, /<img src=x onerror=alert\(1\)>/);
  assert.match(root.querySelector('.cv-readout')!.textContent!, /Unavailable/);
  assert.equal(root.querySelectorAll('.cv-support-svg path[fill="#2872ba"]').length, 0, 'no connecting band for missing party value');
  window.happyDOM.abort();
});

test('server-rendered saved charts enhance to interactive layouts without another data fetch', () => {
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const artifact = visualFixture();
  window.document.body.innerHTML = artifactMarkup(artifact);
  assert.ok(window.document.querySelector('[data-saved-visual] table'));
  enhanceSavedVisuals(window.document.body as unknown as HTMLElement);
  assert.equal(window.document.querySelector('[data-saved-visual]'), null);
  assert.equal(window.document.querySelectorAll('.cv-grid [data-component="CouncilScenario"]').length, 3);
  assert.equal(window.document.querySelectorAll('[data-component="PartySupport"]').length, 1);
  window.happyDOM.abort();
});

test('historical naming changes do not break support comparisons for the same area ID', () => {
  const dataset = structuredClone(visualDataset);
  dataset.columns.push({ ...structuredClone(dataset.columns[0]!), id: '2000', label: '2000', year: 2000, scope: 'Older name for this council' });
  const spec = structuredClone(visualSpec);
  const support = spec.elements.support!;
  if (support.type === 'PartySupport') support.props.columns.unshift({ kind: 'dataset', dataset_id: 'data_1', column_id: '2000' });
  const resolved = composeVisual(spec, new Map([['data_1', dataset]]));
  assert.equal(resolved.charts.support!.columns.length, 3);
});

test('the visual data tool uses archived allocations and retains full denominators and provenance', async () => {
  const sql = new DatabaseSync(':memory:');
  for (const name of ['0001_results.sql', '0003_compact_results.sql']) sql.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
  const db = { prepare(query: string) { const statement = (args: unknown[] = []): any => ({
    async all() { return { results: sql.prepare(query).all(...args as never[]) }; },
    async first() { return sql.prepare(query).get(...args as never[]) ?? null; },
    bind(...values: unknown[]) { return statement(values); },
  }); return statement(); }, async batch(statements: any[]) { return Promise.all(statements.map(s => s.all())); } } as unknown as D1Database;
  try {
    const fixture = JSON.parse(readFileSync(new URL('./fixtures/buffalo-city-2021.json', import.meta.url), 'utf8'));
    sql.prepare("INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at) VALUES('source',2021,'municipality','1117',?,'snapshot','2026-11-07T10:00:00Z')").run(fixture.source.url);
    sql.prepare("INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,municipality_id,name,reported_at,payload) VALUES('snapshot','source',2021,'municipality','1117','1117',?,?,?)").run(fixture.area.name,fixture.source.area_reported_at,JSON.stringify(fixture.results));
    const bindings = { RESULTS_DB: db, RAW_RESULTS: undefined! };
    const council = await readVisualData(bindings, 'https://counted.co.za', { view: 'council', year: 2021, level: 'municipality', area_id: '1117', metric: 'seats' });
    assert.equal(council.columns[0]!.total, 100);
    assert.equal(council.columns[0]!.parties.find(p => p.id === '7')!.value, 61);
    assert.equal(council.columns[0]!.parties.reduce((n, p) => n + p.value!, 0), 100);
    const history = await readVisualData(bindings, 'https://counted.co.za', { view: 'party_support', year: 2021, level: 'municipality', area_id: '1117', metric: 'percent' });
    assert.equal(history.columns[0]!.total, 100);
    assert.equal(history.columns[0]!.parties.find(p => p.id === '7')!.value!.toFixed(2), '59.43');
    assert.match(JSON.stringify(history), /snapshot/);
    const parties = await readVisualData(bindings, 'https://counted.co.za', { view: 'parties', year: 2021, level: 'municipality', area_id: '1117', metric: 'percent' });
    assert.equal(parties.table!.rows.find(r => r.id === '7')!.values.seats, 61);
    assert.equal(Number(parties.table!.rows.find(r => r.id === '7')!.values.share).toFixed(2), '59.43');
    const summary = await readVisualData(bindings, 'https://counted.co.za', { view: 'summary', year: 2021, level: 'municipality', area_id: '1117', metric: 'seats' });
    assert.equal(summary.table!.rows[0]!.values.majority, 51);
    assert.match(summary.table!.notes.join(' '), /not voter turnout/);
    const areas = await readVisualData(bindings, 'https://counted.co.za', { view: 'areas', year: 2021, level: 'municipality', area_id: 'all', metric: 'percent', party_id: '7' });
    assert.equal(areas.table!.rows[0]!.id, '1117');
    assert.equal(Number(areas.table!.rows[0]!.values.share).toFixed(2), '59.43');
    assert.match(areas.table!.rows[0]!.href!, /2021\/places\//);
    const events: any[] = [];
    const session = await createChatTools({ bindings, origin: 'https://counted.co.za', documentation: '', renderImage: () => new Uint8Array(), runAnalysis: () => null, signal: new AbortController().signal, emit: e => events.push(e) });
    try {
      const options = { toolCallId: 'test', messages: [], context: undefined };
      const loaded = await session.tools.get_visualisation_data!.execute!({ summary_for_user: 'Loading council seats', view: 'council', year: 2021, level: 'municipality', area_id: '1117', metric: 'seats' }, options) as any;
      const spec = { root: 'c', elements: { c: { type: 'CouncilScenario', props: { title: 'ANC seats', size: 'compact', selected_party_ids: ['7'], data: { kind: 'dataset', dataset_id: loaded.dataset_id, column_id: '2021' } }, children: [] } } };
      const rendered = await session.tools.render_visualisation!.execute!({ summary_for_user: 'Showing the council', spec }, options) as any;
      assert.equal(rendered.charts[0].selectedSeats, 61); assert.equal(rendered.charts[0].majority, 51);
      assert.equal(events.find(e => e.type === 'artifact').artifact.kind, 'visual');
    } finally { await session.close(); }
  } finally { sql.close(); }
});
