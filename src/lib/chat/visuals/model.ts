import { partyStyle } from '../../places/format.ts';
import { governmentParties } from '../../governance/parties.ts';
import { parseVisualSpec, type VisualInput, type VisualSpec } from './catalog.ts';
import type { SourceLink } from '../contracts.ts';
import type { TableColumn, TimelineEvent } from './extra-schema.ts';
import { resolveTable, resolveTimeline, numericColumn, validateMap } from './extra-model.ts';

export type VisualParty = { id: string; name: string; short: string; color: string; value: number | null; selectable: boolean };
export type VisualColumn = {
  id: string; label: string; scope: string; scopeId: string; year: number; unit: 'seats' | 'percent'; total: number | null;
  status: 'reported' | 'estimated' | 'hypothetical' | 'unavailable'; provisional: boolean; basis: string;
  parties: VisualParty[]; notes: string[]; sources: SourceLink[];
  provenance: unknown;
};
export type VisualMeta = Pick<VisualColumn, 'label' | 'scope' | 'status' | 'provisional' | 'basis' | 'notes' | 'sources' | 'provenance'>;
export type VisualTable = VisualMeta & { year: number; geography: 'none' | 'province' | 'municipality'; columns: TableColumn[];
  rows: { id: string; label: string; values: Record<string, string | number | null>; color?: string; href?: string }[] };
export type VisualTimeline = VisualMeta & { cutoff: string | null; events: TimelineEvent[] };
export type VisualDataset = { columns: VisualColumn[]; table?: VisualTable; timeline?: VisualTimeline };
export type ResolvedChart = { columns: VisualColumn[]; partyIds: string[]; table?: VisualTable; timeline?: VisualTimeline;
  metric?: { value: number | null; unit: string; detail: string } };
export type VisualArtifact = { kind: 'visual'; version: 1; spec: VisualSpec; charts: Record<string, ResolvedChart> };

export function visualParty(id: string, name: string, value: number | null, selectable = true): VisualParty {
  // Hypothetical inputs often use familiar abbreviations rather than IEC names.
  const alias = Object.values(governmentParties).find(p => [p.key, p.short].some(label => label.toLowerCase() === name.trim().toLowerCase()));
  const styledName = alias?.key === 'FFPlus' ? 'Freedom Front Plus' : alias?.name ?? (name.toUpperCase() === 'MK' ? 'UMKHONTO WESIZWE PARTY' : name);
  const [short, color] = partyStyle(styledName);
  return { id, name, short: short!, color: color!, value, selectable };
}

function validateColumn(column: VisualColumn, council: boolean) {
  if (column.parties.length > 100 || new Set(column.parties.map(p => p.id)).size !== column.parties.length) throw new Error('Party IDs must be unique; at most 100 parties.');
  if (column.unit === 'percent' && column.total !== null && column.total !== 100) throw new Error('Percent columns must have a total of 100.');
  if (column.total !== null && (!Number.isFinite(column.total) || column.total <= 0 || column.total > 1000)) throw new Error('Invalid chart total.');
  for (const p of column.parties) {
    if (p.value !== null && (!Number.isFinite(p.value) || p.value < 0 || (column.total !== null && p.value > column.total))) throw new Error('Party values must be within the total.');
    if (column.unit === 'seats' && p.value !== null && !Number.isSafeInteger(p.value)) throw new Error('Seats must be whole numbers.');
  }
  const sum = column.parties.reduce((n, p) => n + (p.value ?? 0), 0);
  if (column.total !== null && sum > column.total + 1e-7) throw new Error('Party values exceed the total.');
  if (column.unit === 'seats' && column.total !== null && !Number.isSafeInteger(column.total)) throw new Error('Council size must be a whole number.');
  if (council && (column.unit !== 'seats' || column.total === null || column.parties.some(p => p.value === null) || sum !== column.total)) {
    throw new Error('A council diagram needs a complete seat allocation whose parties sum to the council size.');
  }
}

export function composeVisual(input: unknown, datasets: ReadonlyMap<string, VisualDataset>): VisualArtifact {
  const spec = parseVisualSpec(input);
  const charts: Record<string, ResolvedChart> = Object.create(null);
  const resolve = (source: VisualInput): VisualColumn => {
    if (source.kind === 'dataset') {
      const column = datasets.get(source.dataset_id)?.columns.find(c => c.id === source.column_id);
      if (!column) throw new Error(`Unknown column ${source.dataset_id}/${source.column_id}. Call get_visualisation_data first in this turn.`);
      return structuredClone(column);
    }
    return { id: 'hypothetical', label: source.label, scope: source.scope, scopeId: source.scope, year: source.year,
      unit: source.unit, total: source.total, status: 'hypothetical', provisional: false, basis: 'User/model-supplied scenario',
      parties: source.parties.map(p => visualParty(p.id, p.name, p.value)), notes: [source.assumptions], sources: [], provenance: null };
  };
  for (const [key, node] of Object.entries(spec.elements)) {
    if (node.type === 'RankedBars' || node.type === 'DataTable' || node.type === 'ResultsMap') {
      const table = resolveTable(node.props.data, datasets);
      if (node.type === 'DataTable') {
        if (new Set(node.props.column_ids).size !== node.props.column_ids.length || node.props.column_ids.some(id => !table.columns.some(c => c.id === id))) throw new Error('Choose unique known table columns.');
      } else {
        numericColumn(table, node.props.value_column);
        if (node.type === 'RankedBars' && node.props.highlight_ids.some(id => !table.rows.some(r => r.id === id))) throw new Error('Unknown highlighted row.');
        if (node.type === 'ResultsMap') validateMap(table);
      }
      const shown = node.type === 'DataTable' ? node.props.column_ids : [node.props.value_column];
      if (table.status === 'estimated' && !table.columns.some(c => shown.includes(c.id) && c.unit === 'seats')) table.status = 'reported';
      charts[key] = { columns: [], partyIds: [], table }; continue;
    }
    if (node.type === 'GovernmentTimeline') {
      charts[key] = { columns: [], partyIds: [], timeline: resolveTimeline(node.props.data, datasets) }; continue;
    }
    if (node.type === 'Metric') {
      const input = node.props.data;
      if (input.kind === 'cell') {
        const table = resolveTable(input.table, datasets), column = numericColumn(table, input.column_id);
        if (table.status === 'estimated' && column.unit !== 'seats') table.status = 'reported';
        const row = table.rows.find(r => r.id === input.row_id);
        if (!row) throw new Error('Unknown metric row.');
        charts[key] = { columns: [], partyIds: [], table: { ...table, columns: [column], rows: [row] }, metric: { value: row.values[column.id] as number | null, unit: column.unit, detail: `${row.label} · ${column.label}` } };
      } else {
        const c = resolve(input.column); validateColumn(c, true);
        if (new Set(input.party_ids).size !== input.party_ids.length || input.party_ids.some(id => !c.parties.some(p => p.id === id && p.selectable))) throw new Error('Choose unique, selectable council parties.');
        if (['selected', 'surplus'].includes(input.calculation) && !input.party_ids.length) throw new Error('Select parties for this metric.');
        const selected = c.parties.filter(p => input.party_ids.includes(p.id)).reduce((sum, p) => sum + p.value!, 0), majority = Math.floor(c.total! / 2) + 1;
        const values = { total: c.total, majority, selected, surplus: selected - majority };
        const members = c.parties.filter(p => input.party_ids.includes(p.id)).map(p => p.short).join(' + ');
        const detail = input.calculation === 'surplus' ? `${members} · ${selected} seats · ${majority} needed`
          : input.calculation === 'selected' ? `${members} · hypothetical coalition` : `${c.label} council`;
        charts[key] = { columns: [c], partyIds: input.party_ids, metric: { value: values[input.calculation], unit: 'seats', detail } };
      }
      continue;
    }
    if (node.type !== 'CouncilScenario' && node.type !== 'PartySupport' && node.type !== 'Comparison') continue;
    const council = node.type === 'CouncilScenario';
    const columns = (node.type === 'CouncilScenario' ? [node.props.data] : node.type === 'Comparison' ? [node.props.before, node.props.after] : node.props.columns).map(resolve);
    columns.forEach(c => validateColumn(c, council));
    const unit = columns[0]!.unit;
    if (columns.some(c => c.unit !== unit)) throw new Error('Do not mix seats and percentages in one chart.');
    const factual = columns.filter(c => c.status !== 'hypothetical');
    if (new Set(factual.map(c => `${c.scopeId}:${c.basis}`)).size > 1) throw new Error('Party support columns must use the same area and ballot basis.');
    // Factual history may retain renamed areas; scopeId, not the display name,
    // establishes its identity. A hypothetical column must use a known label.
    const scopes = new Set((factual.length ? factual : columns.slice(0, 1)).map(c => c.scope.trim().toLowerCase()));
    if (!council && columns.some(c => c.status === 'hypothetical' && !scopes.has(c.scope.trim().toLowerCase()))) throw new Error('Use the same scope for every support column, copying the dataset scope into hypothetical columns.');
    const ids = node.type === 'CouncilScenario' ? node.props.selected_party_ids : node.props.party_ids;
    if (new Set(ids).size !== ids.length) throw new Error('Party selections must be unique.');
    for (const id of ids) {
      if (!columns.some(c => c.parties.some(p => p.id === id && (!council || p.selectable)))) throw new Error(`Unknown or grouped party: ${id}`);
    }
    // Use the canonical identity/colour from a saved dataset in hypothetical columns too.
    const identities = new Map(factual.flatMap(c => c.parties.map(p => [p.id, p] as const)));
    for (const column of columns) for (const p of column.parties) {
      const known = identities.get(p.id);
      if (known) { p.name = known.name; p.short = known.short; p.color = known.color; }
    }
    charts[key] = { columns, partyIds: ids };
  }
  const artifact: VisualArtifact = { kind: 'visual', version: 1, spec, charts };
  if (JSON.stringify(artifact).length > 150_000) throw new Error('Use fewer charts or columns in this answer.');
  return artifact;
}
