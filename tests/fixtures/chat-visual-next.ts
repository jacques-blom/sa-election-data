import { composeVisual, type VisualDataset } from '../../src/lib/chat/visuals/model.ts';
import type { VisualSpec } from '../../src/lib/chat/visuals/catalog.ts';
import { visualDataset } from './chat-visual.ts';
export const nextDataset: VisualDataset = { columns: [], table: {
  label: '2026 examples', scope: 'Illustrative municipalities', year: 2026, geography: 'none', status: 'hypothetical', provisional: false,
  basis: 'Invented examples', notes: ['Fictional values for interface testing.'], sources: [], provenance: null,
  columns: [{ id: 'share', label: 'Vote share', unit: 'percent' }, { id: 'seats', label: 'Seats', unit: 'seats' }, { id: 'change', label: 'Change', unit: 'pp' }],
  rows: Array.from({ length: 23 }, (_, i) => ({ id: `area_${i}`, label: i === 0 ? 'A municipality with a deliberately long name' : `Example ${i + 1}`,
    values: { share: i === 2 ? null : 70 - i * 2, seats: 40 - i, change: 10 - i } })),
} };
export const nextSpec: VisualSpec = { root: 'root', elements: {
  root: { type: 'Stack', props: {}, children: ['first', 'second', 'third'] },
  first: { type: 'Grid', props: { columns: 2 }, children: ['metric', 'compare'] },
  second: { type: 'Grid', props: { columns: 2 }, children: ['bars', 'map'] },
  third: { type: 'Grid', props: { columns: 2 }, children: ['table', 'timeline'] },
  metric: { type: 'Metric', props: { title: 'Seats above majority', size: 'compact', data: { kind: 'council', column: { kind: 'dataset', dataset_id: 'council', column_id: '2021' }, calculation: 'surplus', party_ids: ['A', 'B'] } }, children: [] },
  compare: { type: 'Comparison', props: { title: 'What changes?', size: 'compact', party_ids: ['A', 'B', 'C'], before: { kind: 'dataset', dataset_id: 'council', column_id: '2021' }, after: {
    kind: 'hypothetical', label: 'Future', scope: 'Example council', year: 2026, unit: 'seats', total: 20,
    parties: [{ id: 'A', name: 'DA', value: 10 }, { id: 'B', name: 'ANC', value: 6 }, { id: 'C', name: 'EFF', value: 4 }], assumptions: 'An invented illustration, not a forecast.',
  } }, children: [] },
  bars: { type: 'RankedBars', props: { title: 'Where support is strongest', size: 'compact', data: { kind: 'dataset', dataset_id: 'table' }, value_column: 'share', top_n: 5, highlight_ids: [] }, children: [] },
  table: { type: 'DataTable', props: { title: 'The exact numbers', size: 'compact', data: { kind: 'dataset', dataset_id: 'table' }, column_ids: ['share', 'seats', 'change'] }, children: [] },
  map: { type: 'ResultsMap', props: { title: 'A hypothetical provincial picture', size: 'compact', value_column: 'share', data: {
    kind: 'hypothetical', label: '2026 scenario', scope: 'South Africa', year: 2026, geography: 'province', assumptions: 'Invented provincial shares to test the map. Not actual results.',
    columns: [{ id: 'share', label: 'Party share', unit: 'percent' }, { id: 'reporting', label: 'Reporting', unit: 'percent' }],
    rows: [{ id: '1', label: 'Eastern Cape', values: { share: 20, reporting: 95 } }, { id: '3', label: 'Gauteng', values: { share: 60, reporting: 75 } },
      { id: '9', label: 'Western Cape', values: { share: null, reporting: 100 } }],
  } }, children: [] },
  timeline: { type: 'GovernmentTimeline', props: { title: 'How the government could change', size: 'compact', data: { kind: 'hypothetical', scope: 'Example council', assumptions: 'Invented administrations, not historical events.',
    events: Array.from({ length: 5 }, (_, i) => ({ id: `event_${i}`, start: `${2022 + i}-01-01`, end: i === 4 ? null : `${2022 + i}-12-31`, title: `Scenario ${i + 1}`,
      members: i % 2 ? ['DA', 'EFF'] : ['DA', 'ANC'], supporters: ['Example party'], note: 'Outside supporters are not coalition members. This example is hypothetical.' })),
  } }, children: [] },
} };
export function nextFixture() { return composeVisual(nextSpec, new Map([['council', visualDataset], ['table', nextDataset]])); }
