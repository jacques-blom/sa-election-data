import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { feedOptions, getUpdates } from '../../../lib/updates/feed.ts';
import { createHash } from 'node:crypto';
import { matchesIfNoneMatch } from '../../../lib/data/http-cache.ts';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'ETag', 'Cache-Control': 'public, max-age=15, s-maxage=15' };
export const GET: APIRoute = async ({ url, request }) => {
  const demo = url.searchParams.has('demo');
  if (demo && !import.meta.env.DEV) return Response.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  let options;
  try { options = feedOptions(url.searchParams); }
  catch (error) { return Response.json({ error: String((error as Error).message) }, { status: 400, headers: { ...headers, 'Cache-Control': 'no-store' } }); }
  try {
    let feed;
    if (import.meta.env.DEV && demo) {
      const { simulatedFeed, simulationStep } = await import('../../../lib/updates/simulation.ts');
      try { feed = simulatedFeed(options, simulationStep(url.searchParams).step); }
      catch (error) { return Response.json({ error: (error as Error).message }, { status: 400, headers: { 'Cache-Control': 'no-store' } }); }
    } else feed = await getUpdates(env.RESULTS_DB, options);
    const body = JSON.stringify({ year: 2026, result_status: demo ? 'simulation' : 'provisional', ...feed,
      ...(demo ? { simulation: true } : {}),
      note: demo ? 'Local simulation. Places, candidates, outcomes and timestamps are fictional. These are not IEC results.'
        : 'IEC-reported milestones, provisional until official declaration. Times describe when we observed and published a change, not when the last vote was counted.' });
    const status = options.event && !feed.updates.length ? 404 : 200;
    const etag = `"${createHash('sha256').update(body).digest('hex')}"`;
    const responseHeaders = { ...headers, 'Content-Type': 'application/json; charset=utf-8', ETag: etag,
      ...(status !== 200 || demo ? { 'Cache-Control': 'no-store' } : {}),
      ...(demo ? { 'X-Robots-Tag': 'noindex, noarchive' } : {}) };
    if (status === 200 && matchesIfNoneMatch(request.headers.get('If-None-Match'), etag)) return new Response(null, { status: 304, headers: responseHeaders });
    return new Response(body, { status, headers: responseHeaders });
  } catch (error) {
    console.error('Result updates unavailable', error);
    return Response.json({ error: 'Updates are temporarily unavailable' }, { status: 503, headers: { ...headers, 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  }
};
export const HEAD: APIRoute = async context => {
  const response = await GET(context);
  return new Response(null, { status: response.status, headers: response.headers });
};
export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS' } });
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'GET, HEAD, OPTIONS', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
