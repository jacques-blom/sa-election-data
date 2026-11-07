import { defineCatalog, defineSchema } from '@json-render/core';
import { z } from 'zod';
import { tableInput, timelineInput } from './extra-schema.ts';

const label = z.string().trim().min(1).max(120);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
export const visualInput = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('dataset'), dataset_id: id, column_id: id }),
  z.strictObject({ kind: z.literal('hypothetical'), label, scope: label, year: z.number().int().min(1900).max(2200),
    unit: z.enum(['seats', 'percent']), total: z.number().positive().max(1000),
    parties: z.array(z.strictObject({ id, name: label, value: z.number().min(0).max(1000).nullable() })).min(1).max(60),
    assumptions: z.string().trim().min(10).max(700),
  }),
]);
const size = z.enum(['compact', 'standard']);
export const components = {
  Grid: { props: z.strictObject({ columns: z.number().int().min(1).max(3) }), slots: ['default'],
    description: 'Responsive equal-width columns. Put three CouncilScenario children here for a side-by-side comparison; automatically stacks on small screens.' },
  Stack: { props: z.strictObject({}), slots: ['default'], description: 'Vertical layout of charts, text and grids.' },
  Card: { props: z.strictObject({ title: label }), slots: ['default'], description: 'Group related text and charts under one heading.' },
  Text: { props: z.strictObject({ text: z.string().min(1).max(500) }), description: 'A brief plain-text explanation. No Markdown or HTML.' },
  CouncilScenario: { props: z.strictObject({ title: label, data: visualInput, selected_party_ids: z.array(id).max(60), size }),
    description: 'Interactive council semicircle and majority arithmetic. data must have seats. Select named parties using their exact IDs; empty selection shows the whole council. The reader can adjust the selection locally. Grouped independents cannot be selected.' },
  PartySupport: { props: z.strictObject({ title: label, columns: z.array(visualInput).min(1).max(8),
    party_ids: z.array(id).max(8), size }),
    description: 'Default for broad vote-history/trend questions (e.g. how has a place’s vote changed?). Use percent data for a 100% stacked chart across ALL returned election columns in chronological order, with connecting bands, election/scenario selection and party highlighting. Retain missing-data gaps. Columns must share unit, area and ballot basis. Use dataset columns and/or hypothetical columns (e.g. past seats versus proposed future seats). Empty party_ids chooses the largest parties; remaining values stay in Other. Connections are not voter transfers.' },
  RankedBars: { props: z.strictObject({ title: label, data: tableInput, value_column: id, top_n: z.number().int().min(3).max(20), highlight_ids: z.array(id).max(8), size }),
    description: 'Rank parties or areas using a numeric table column. Reader can sort, show more and highlight a row; missing values stay unavailable. Default top_n=5 or 8. Area rows link to results.' },
  Comparison: { props: z.strictObject({ title: label, before: visualInput, after: visualInput, party_ids: z.array(id).min(1).max(12), size }),
    description: 'Two-election before/after breakdown for an explicitly requested pair of elections, with calculated changes (percentage points for shares). For broad vote-history/trend questions use PartySupport across all available elections instead. Same area, unit and ballot basis; missing parties stay unknown. Compare factual elections or clearly hypothetical scenarios.' },
  DataTable: { props: z.strictObject({ title: label, data: tableInput, column_ids: z.array(id).min(1).max(6), size }),
    description: 'Searchable, sortable exact data, five compact or ten standard rows at a time, with CSV download. Pick only columns relevant to the question. Row labels are always shown.' },
  ResultsMap: { props: z.strictObject({ title: label, data: tableInput, value_column: id, size }),
    description: 'Interactive choropleth of province or municipality numeric values. Tap an area or choose it from the accessible list to inspect and open results. Uses 2026 boundaries only: factual maps must be 2026; hypothetical geographic rows must use exact Counted IDs. Selects among numeric columns locally.' },
  GovernmentTimeline: { props: z.strictObject({ title: label, data: timelineInput, size }),
    description: 'Dated administrations, membership, outside supporters and cited evidence. Expands older records/details. Dataset records are not automatically current. Hypothetical events are visibly separate from history.' },
  Metric: { props: z.strictObject({ title: label, size, data: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('council'), column: visualInput, calculation: z.enum(['total', 'majority', 'selected', 'surplus']), party_ids: z.array(id).max(60) }),
    z.strictObject({ kind: z.literal('cell'), table: tableInput, row_id: id, column_id: id }),
  ]) }), description: 'Compact numeric fact. Derive total, majority, selected seats or surplus from a complete council, or reference one numeric table cell (e.g. reporting). Arithmetic is computed by the tool. Avoid more than three metrics in a row.' },
} as const;

// json-render's flat tree, with only the features our renderer implements.
const schema = defineSchema(s => ({
  spec: s.object({ root: s.string(), elements: s.record(s.object({
    type: s.ref('catalog.components'), props: s.propsOf('type'), children: s.array(s.string()),
  })) }),
  catalog: s.object({ components: s.record(s.object({ props: s.zod(), description: s.string() })) }),
}), { promptTemplate: ({ formatZodType }) => [
  'Compose a complete json-render spec using render_visualisation: {root:"root-id",elements:{"root-id":{type,props,children:["child-id"]},...}}. Leaf children are []. Put the spec in the tool call, never in answer text. No HTML, scripts, state expressions or arbitrary actions.',
  ...Object.entries(components).map(([name, definition]) => `${name}: ${definition.description}\nProps: ${formatZodType(definition.props)}`),
].join('\n') });
export const visualCatalog = defineCatalog(schema, { components });
// The core catalogue validates the vocabulary; the tool also exposes each exact
// component's props to the model (core's generic propsOf JSON schema is opaque).
const element = <K extends keyof typeof components>(name: K) => z.strictObject({ type: z.literal(name), props: components[name].props, children: z.array(id).max(8) });
export const visualSpecSchema = z.strictObject({ root: id, elements: z.record(id, z.discriminatedUnion('type', [
  element('Grid'), element('Stack'), element('Card'), element('Text'), element('CouncilScenario'), element('PartySupport'),
  element('RankedBars'), element('Comparison'), element('DataTable'), element('ResultsMap'), element('GovernmentTimeline'), element('Metric'),
])) });
type Element = { [K in keyof typeof components]: { type: K; props: z.infer<typeof components[K]['props']>; children: string[] } }[keyof typeof components];
export type VisualSpec = { root: string; elements: Record<string, Element> };
export type VisualInput = z.infer<typeof visualInput>;

/** Validate both the json-render vocabulary and a small, acyclic, reachable tree. */
export function parseVisualSpec(input: unknown): VisualSpec {
  if (JSON.stringify(input).length > 50_000) throw new Error('Visual specification is too large.');
  const result = visualCatalog.validate(visualSpecSchema.parse(input));
  if (!result.success) throw new Error(`Invalid visual specification: ${result.error?.message.slice(0, 600)}`);
  const spec = result.data as VisualSpec;
  const entries = Object.entries(spec.elements);
  if (!entries.length || entries.length > 24) throw new Error('Use at most 24 visual elements.');
  for (const [key, node] of entries) {
    id.parse(key);
    if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Invalid element ID.');
    const definition = components[node.type];
    node.props = definition.props.parse(node.props);
    if (node.children.length > 8) throw new Error('Use at most eight children per layout.');
    if (!('slots' in definition) && node.children.length) throw new Error(`${node.type} cannot contain children.`);
  }
  const seen = new Set<string>(); let charts = 0;
  function visit(key: string, depth: number) {
    if (seen.has(key) || depth > 5) throw new Error('Visual layouts must be a tree no deeper than five levels.');
    if (!Object.hasOwn(spec.elements, key)) throw new Error(`Missing visual element: ${key}`);
    seen.add(key);
    const node = spec.elements[key]!;
    if (!('slots' in components[node.type]) && node.type !== 'Text') charts++;
    node.children.forEach(child => visit(child, depth + 1));
  }
  visit(spec.root, 1);
  if (seen.size !== entries.length || charts < 1 || charts > 8) throw new Error('Include one to eight charts and no disconnected elements.');
  return spec;
}
