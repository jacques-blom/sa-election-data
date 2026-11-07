import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { chatEnabled } from '../../lib/chat/availability.ts';
import { threadRequest } from '../../lib/chat/contracts.ts';
import { readBoundedJson } from '../../lib/chat/limits.ts';
import { chatError, chatHeaders, ownerHash } from '../../lib/chat/http.ts';

export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('Origin') !== url.origin) return chatError('Send your question from the Counted chat page.', 403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return chatError('Expected a JSON question.', 415);
  if (!chatEnabled || !env.OPENROUTER_API_KEY) return chatError('Election chat is not available yet. Please use the results explorer while we get it ready.', 503);
  const keyHash = await ownerHash(request);
  if (!keyHash) return chatError('Your browser could not restore permission to write to this conversation. Start a new conversation.', 403);
  let body: unknown;
  try { body = await readBoundedJson(request); }
  catch (reason) { return chatError('The question is invalid or too long.', reason instanceof Error && reason.message === 'too_large' ? 413 : 400); }
  const parsed = threadRequest.safeParse(body);
  if (!parsed.success) return chatError('Use a valid conversation ID and keep your question under 6,000 characters.', 400);
  try {
    const result = await env.CHAT_THREADS.getByName(parsed.data.threadId).submit(parsed.data, keyHash, request.headers.get('CF-Connecting-IP') ?? 'local');
    return Response.json(result.error ? { error: result.error } : { threadId: parsed.data.threadId, requestId: parsed.data.requestId },
      { status: result.status, headers: chatHeaders });
  } catch { return chatError('Chat is temporarily unavailable. Reconnect to this conversation before sending again.', 503); }
};
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { ...chatHeaders, Allow: 'POST' } });
