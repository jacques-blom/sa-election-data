import municipalities from '../../places/municipalities.json' with { type: 'json' };
import { tableInput, timelineInput, type TableInput, type TimelineInput } from './extra-schema.ts';
import type { VisualDataset, VisualTable, VisualTimeline } from './model.ts';

const areaLinks = new Map(municipalities.flatMap(p => p.relationships.filter(r => r.election === 2026 && r.level === 'municipality' && r.relation === 'equals').map(r => [r.areaId, p.slug] as const)));
const provinces: Record<string, string> = { '1': 'eastern-cape', '2': 'free-state', '3': 'gauteng', '4': 'kwazulu-natal', '5': 'mpumalanga', '6': 'northern-cape', '7': 'limpopo', '8': 'north-west', '9': 'western-cape' };
export function areaHref(level: string, id: string, year: number) {
  const slug = level === 'province' ? provinces[id] : areaLinks.get(id);
  return slug ? `/${year}/${level === 'province' ? 'provinces' : 'places'}/${slug}` : undefined;
}
function unique(ids: string[], label: string) {
  if (new Set(ids).size !== ids.length || ids.some(id => ['__proto__', 'prototype', 'constructor'].includes(id))) throw new Error(`${label} must have unique safe IDs.`);
}
export function numericColumn(table: VisualTable, id: string) {
  const column = table.columns.find(c => c.id === id);
  if (!column || column.unit === 'text') throw new Error(`Choose a numeric column, not ${id}.`);
  return column;
}
export function resolveTable(input: TableInput, datasets: ReadonlyMap<string, VisualDataset>): VisualTable {
  const source = tableInput.parse(input);
  let table: VisualTable;
  if (source.kind === 'dataset') {
    const saved = datasets.get(source.dataset_id)?.table;
    if (!saved) throw new Error('Unknown table dataset. Use get_visualisation_data with view=parties, areas or summary.');
    table = structuredClone(saved);
  } else {
    table = { ...source, status: 'hypothetical', provisional: false, basis: 'User/model-supplied scenario',
      notes: [source.assumptions], sources: [], provenance: null };
  }
  unique(table.columns.map(c => c.id), 'Columns'); unique(table.rows.map(r => r.id), 'Rows');
  for (const row of table.rows) {
    if (Object.keys(row.values).some(id => !table.columns.some(c => c.id === id))) throw new Error('Row contains an unknown column.');
    for (const column of table.columns) {
      const v = row.values[column.id] ?? null; row.values[column.id] = v;
      if (v === null) continue;
      if (column.unit === 'text' ? typeof v !== 'string' : typeof v !== 'number' || !Number.isFinite(v)) throw new Error('Values must match column types.');
      if (typeof v === 'number' && ((column.unit === 'percent' && (v < 0 || v > 100)) || (column.unit === 'seats' && (v < 0 || !Number.isSafeInteger(v))))) throw new Error('Percentages must be 0–100 and seats non-negative integers.');
    }
  }
  return table;
}
export function validateMap(table: VisualTable) {
  if (table.geography === 'none') throw new Error('Maps need province or municipality rows.');
  if (table.status !== 'hypothetical' && table.year !== 2026) throw new Error('Historical boundaries are unavailable. Use a ranking or table for past results.');
  for (const row of table.rows) {
    const href = areaHref(table.geography, row.id, 2026);
    if (!href) throw new Error(`Unknown ${table.geography} ID: ${row.id}. Resolve real area IDs before mapping.`);
    row.href = href;
  }
  table.notes.push('Map boundaries: MDB 2026. Areas without values are unavailable, not zero.');
}
export function resolveTimeline(input: TimelineInput, datasets: ReadonlyMap<string, VisualDataset>): VisualTimeline {
  const source = timelineInput.parse(input);
  const saved = source.kind === 'dataset' ? datasets.get(source.dataset_id)?.timeline : undefined;
  if (source.kind === 'dataset' && !saved) throw new Error('Unknown timeline dataset. Use get_visualisation_data with view=government.');
  const timeline: VisualTimeline = saved ? structuredClone(saved) : {
    label: 'Hypothetical timeline', scope: (source as Extract<TimelineInput, { kind: 'hypothetical' }>).scope,
    status: 'hypothetical', provisional: false, basis: 'Hypothetical administrations', cutoff: null,
    events: (source as Extract<TimelineInput, { kind: 'hypothetical' }>).events,
    notes: [(source as Extract<TimelineInput, { kind: 'hypothetical' }>).assumptions], sources: [], provenance: null,
  };
  unique(timeline.events.map(e => e.id), 'Events');
  for (const e of timeline.events) if (e.end && e.end < e.start) throw new Error('An administration cannot end before it starts.');
  timeline.events.sort((a, b) => a.start.localeCompare(b.start));
  return timeline;
}

