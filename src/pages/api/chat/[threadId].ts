import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { threadIdSchema } from '../../../lib/chat/contracts.ts';
import { readBoundedJson } from '../../../lib/chat/limits.ts';
import { chatError, chatHeaders, ownerHash } from '../../../lib/chat/http.ts';

export const GET: APIRoute = async ({ params, url }) => {
  const id = threadIdSchema.safeParse(params.threadId);
  const after = url.searchParams.get('after') ?? '0';
  if (!id.success || !/^\d{1,12}$/.test(after)) return chatError('Invalid conversation link.', 400);
  try {
    const response = await env.CHAT_THREADS.getByName(id.data).watch(Number(after), url.searchParams.get('view') === 'snapshot');
    for (const [key, value] of Object.entries(chatHeaders)) response.headers.set(key, value);
    return response;
  } catch { return chatError('This conversation is temporarily unavailable. Please reconnect.', 503); }
};
export const POST: APIRoute = async ({ request, url, params }) => {
  if (request.headers.get('Origin') !== url.origin) return chatError('Use the Counted chat page.', 403);
  const id = threadIdSchema.safeParse(params.threadId);
  const keyHash = await ownerHash(request);
  if (!id.success || !keyHash) return chatError('You cannot stop this conversation.', 403);
  try {
    const body = await readBoundedJson(request, 1024) as { turnId?: unknown };
    const turn = threadIdSchema.safeParse(body?.turnId);
    if (!turn.success) return chatError('Invalid answer ID.', 400);
    const result = await env.CHAT_THREADS.getByName(id.data).stop(keyHash, turn.data);
    return Response.json(result.error ? { error: result.error } : { stopped: true }, { status: result.status, headers: chatHeaders });
  } catch { return chatError('Could not stop the answer. Reconnect to check its progress.', 503); }
};
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { ...chatHeaders, Allow: 'GET, POST' } });
