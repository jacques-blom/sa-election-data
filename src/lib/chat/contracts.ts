import { z } from 'zod';
import type { VisualArtifact } from './visuals/model.ts';

export const chatRequest = z.strictObject({
  messages: z.array(z.strictObject({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(6000) }))
    .min(1).max(12).refine(messages => messages.at(-1)?.role === 'user', 'End with a question.'),
});
export type ChatMessage = z.infer<typeof chatRequest>['messages'][number];

export const threadIdSchema = z.uuidv4();
export const threadRequest = z.strictObject({
  threadId: threadIdSchema, requestId: threadIdSchema,
  question: z.string().trim().min(1).max(6000),
});
export type ThreadRequest = z.infer<typeof threadRequest>;
export const userSummary = z.string().trim().min(3).max(180)
  .describe('A brief, plain-English progress update for the person chatting, explaining what this call will check or calculate. No technical tool names, hidden reasoning or claims about results not yet retrieved.');

export const chartSchema = z.strictObject({
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(500),
  unit: z.enum(['votes', 'seats', 'percent', 'percentage points']),
  rows: z.array(z.strictObject({ label: z.string().min(1).max(100), value: z.number(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() })).min(1).max(30),
  note: z.string().min(1).max(500),
});
export type AnalysisChart = z.infer<typeof chartSchema>;
export type SourceLink = { title: string; url: string };
export type WebCitation = SourceLink & { start: number; end: number };
export type WebResearch = { text: string; citations: WebCitation[]; fetchedAt: string;
  evidence?: { sourceId: string; url: string; quote: string; claim: string }[] };
export type ChatArtifact =
  | VisualArtifact
  | { kind: 'image'; url: string; dataUrl: string; alt: string }
  | { kind: 'chart'; chart: AnalysisChart; sources: SourceLink[] }
  | ({ kind: 'research' } & WebResearch)
  | { kind: 'analysis'; code: string; result: unknown };
export type ChatEvent =
  | { type: 'text'; text: string }
  | { type: 'status'; text: string; phase?: 'thinking' | 'tool' | 'answering'; summary_for_user?: string }
  | { type: 'artifact'; artifact: ChatArtifact }
  | { type: 'error'; message: string }
  | { type: 'done' };

export type ThreadEvent = { seq: number; turnId: string; event: ChatEvent | { type: 'question'; text: string; startedAt?: number } };
export type SavedThreadTurn = {
  id: string; question: string; answer: string; startedAt: number;
  status: 'running' | 'done' | 'error'; artifacts: ChatArtifact[];
  progress?: Extract<ChatEvent, { type: 'status' }>; error?: string;
};
export type ThreadSnapshot = { type: 'snapshot'; after: number; seq: number; turns: SavedThreadTurn[] };
export type ThreadFrame = ThreadEvent | ThreadSnapshot;
// A saved thread has at most 20 turns, each with a 512 KB journal budget.
export const MAX_THREAD_SNAPSHOT_CHARS = 12_000_000;

export function safeLink(value: string): string | null {
  try {
    const url = new URL(value, 'https://counted.co.za');
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
