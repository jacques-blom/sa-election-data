import { defineMiddleware } from 'astro:middleware';
import { matchesIfNoneMatch } from './lib/data/http-cache.ts';

// Cache public GET results before doing D1/R2 reads. HTTP freshness headers by
// themselves do not make Worker responses use Cloudflare's Cache API.
export const onRequest = defineMiddleware(async (context, next) => {
  const request = context.request;
  // Development simulations never share the public results cache.
  if (context.url.searchParams.has('demo') && ['/updates', '/api/v1/updates'].includes(context.url.pathname)) return next();
  const publicPage = ['/', '/councils', '/updates', '/majority-builder'].includes(context.url.pathname) || /^\/(2000|2006|2011|2016|2021|2026)(\/|$)/.test(context.url.pathname);
  const builderSeats = context.url.pathname === '/api/majority-builder';
  const ogImage = context.url.pathname.startsWith('/og/') && context.url.pathname.endsWith('.png');
  if (request.method !== 'GET' || (!context.url.pathname.startsWith('/api/v1/') && !publicPage && !ogImage && !builderSeats)
    || request.headers.has('Authorization') || request.headers.has('Cookie')) return next();
  // OG images ignore all queries, including private search or address context.
  const key = new Request(ogImage ? new URL(context.url.pathname, context.url.origin).href : context.url.href, { method: 'GET' });
  const cache = await caches.open('public-results-v1');
  const hit = await cache.match(key);
  if (hit) {
    if (hit.headers.get('ETag') && matchesIfNoneMatch(request.headers.get('If-None-Match'), hit.headers.get('ETag')!)) {
      return new Response(null, { status: 304, headers: hit.headers });
    }
    return hit;
  }
  const response = await next();
  if (publicPage && response.status === 200 && !response.headers.has('Cache-Control') && !response.headers.has('Set-Cookie')) {
    response.headers.set('Cache-Control', 'public, max-age=15, s-maxage=15');
  }
  if (response.status === 200 && response.headers.get('Cache-Control')?.includes('public')
    && !response.headers.has('Set-Cookie')) {
    context.locals.cfContext.waitUntil(cache.put(key, response.clone()).catch(error => console.error('Result cache write failed', error)));
  }
  return response;
});
