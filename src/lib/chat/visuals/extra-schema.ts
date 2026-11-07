import { z } from 'zod';
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
const label = z.string().trim().min(1).max(120);
const date = z.iso.date();
export const datasetRef = z.strictObject({ kind: z.literal('dataset'), dataset_id: id });
export const tableColumn = z.strictObject({ id, label, unit: z.enum(['text', 'number', 'seats', 'percent', 'pp']) });
export const tableInput = z.discriminatedUnion('kind', [datasetRef, z.strictObject({
  kind: z.literal('hypothetical'), label, scope: label, year: z.number().int().min(1900).max(2200),
  geography: z.enum(['none', 'province', 'municipality']),
  columns: z.array(tableColumn).min(1).max(8),
  rows: z.array(z.strictObject({ id, label, values: z.record(id, z.union([z.string().max(160), z.number().min(-1e12).max(1e12), z.null()])) })).min(1).max(300),
  assumptions: z.string().trim().min(10).max(700),
})]);
export const timelineEvent = z.strictObject({ id, start: date, end: date.nullable(), title: label,
  members: z.array(label).max(30), supporters: z.array(label).max(30), note: z.string().max(1000) });
export const timelineInput = z.discriminatedUnion('kind', [datasetRef, z.strictObject({
  kind: z.literal('hypothetical'), scope: label, events: z.array(timelineEvent).min(1).max(30),
  assumptions: z.string().trim().min(10).max(700),
})]);
export type TableInput = z.infer<typeof tableInput>;
export type TimelineInput = z.infer<typeof timelineInput>;
export type TableColumn = z.infer<typeof tableColumn>;
export type TimelineEvent = z.infer<typeof timelineEvent> & { approximate?: boolean; sources?: { title: string; url: string }[] };
