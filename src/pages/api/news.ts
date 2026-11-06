import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { newsContext } from '../../lib/news/context.ts';
import { newsResponse } from '../../lib/news/service.ts';
import { newsStore } from '../../lib/news/store.ts';

export const GET: APIRoute = async ({ url, locals }) => {
  const context = newsContext(url.searchParams.get('scope'), url.searchParams.get('area') ?? '');
  if (!context) return Response.json({ error: 'Unknown news area.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  let cache: Cache | undefined;
  try { cache = await caches.open('serpapi-news-v1'); } catch { /* Use the shared R2 cache. */ }
  return newsResponse(context, url.origin, { apiKey: env.SERPAPI_API_KEY, cache, store: newsStore(env.RAW_RESULTS),
    waitUntil: promise => locals.cfContext.waitUntil(promise) });
};
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } });
