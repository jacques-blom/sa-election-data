import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { builderSeatIds, getBuilderSeatSummaries } from '../../lib/seats/directory.ts';

export const GET: APIRoute = async ({ url }) => {
  let ids: string[];
  try { ids = builderSeatIds(url.searchParams.get('councils')); }
  catch { return Response.json({ error: 'Choose between 1 and 8 council IDs' }, { status: 400, headers: { 'Cache-Control': 'no-store' } }); }
  try {
    const data = await getBuilderSeatSummaries(env.RESULTS_DB, ids, env.RAW_RESULTS);
    return Response.json(data, { headers: { 'Cache-Control': data.failed.length ? 'no-store' : 'public, max-age=15, s-maxage=15' } });
  } catch (error) {
    console.error('Builder seat summaries unavailable', error);
    return Response.json({ error: 'Seats unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' } });
  }
};
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } });
