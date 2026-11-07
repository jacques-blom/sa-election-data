import { composeVisual, visualParty, type VisualDataset } from '../../src/lib/chat/visuals/model.ts';
import type { VisualSpec } from '../../src/lib/chat/visuals/catalog.ts';

export const visualDataset: VisualDataset = { columns: [{
  id: '2021', label: '2021', scope: 'Example council', scopeId: 'municipality:example', year: 2021,
  unit: 'seats', total: 20, status: 'reported', provisional: false, basis: 'Council seats',
  parties: [visualParty('A', 'DEMOCRATIC ALLIANCE', 8), visualParty('B', 'AFRICAN NATIONAL CONGRESS', 7), visualParty('C', 'ECONOMIC FREEDOM FIGHTERS', 5)],
  notes: ['Test dataset; not real election results.'], sources: [{ title: 'Example source', url: 'https://counted.co.za/api/example' }],
  provenance: { snapshotId: 'test-snapshot-2021' },
}] };
export const visualSpec: VisualSpec = { root: 'root', elements: {
  root: { type: 'Stack', props: {}, children: ['grid', 'support'] },
  grid: { type: 'Grid', props: { columns: 3 }, children: ['ab', 'ac', 'bc'] },
  ab: { type: 'CouncilScenario', props: { title: 'DA + ANC', data: { kind: 'dataset', dataset_id: 'data_1', column_id: '2021' }, selected_party_ids: ['A', 'B'], size: 'compact' }, children: [] },
  ac: { type: 'CouncilScenario', props: { title: 'DA + EFF', data: { kind: 'dataset', dataset_id: 'data_1', column_id: '2021' }, selected_party_ids: ['A', 'C'], size: 'compact' }, children: [] },
  bc: { type: 'CouncilScenario', props: { title: 'ANC + EFF', data: { kind: 'dataset', dataset_id: 'data_1', column_id: '2021' }, selected_party_ids: ['B', 'C'], size: 'compact' }, children: [] },
  support: { type: 'PartySupport', props: { title: 'Previous council versus hypothetical seats', size: 'standard', party_ids: [], columns: [
    { kind: 'dataset', dataset_id: 'data_1', column_id: '2021' },
    { kind: 'hypothetical', label: 'Future scenario', scope: 'Example council', year: 2026, unit: 'seats', total: 20,
      parties: [{ id: 'A', name: 'DA', value: 10 }, { id: 'B', name: 'ANC', value: 6 }, { id: 'C', name: 'EFF', value: 4 }], assumptions: 'Illustrative seat changes; this is not a forecast.' },
  ] }, children: [] },
} };
export const visualFixture = () => composeVisual(visualSpec, new Map([['data_1', visualDataset]]));
