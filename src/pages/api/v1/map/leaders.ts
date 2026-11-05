import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getMapLeaders, parseLeaderQuery } from '../../../../lib/maps/leaders.ts';

export const GET: APIRoute = async ({ url }) => {
  const query = parseLeaderQuery(url.searchParams);
  if (!query) return Response.json({ error: 'Provide a boundary level and up to 80 valid area IDs.' }, { status: 400 });
  try {
    const areas = await getMapLeaders(env.RESULTS_DB, env.RAW_RESULTS, query.level, query.ids);
    return Response.json({ level: query.level, areas }, { headers: { 'Cache-Control': 'public, max-age=15, s-maxage=15' } });
  } catch (error) {
    console.error('Map leaders unavailable', { level: query.level, error });
    return Response.json({ error: 'Results temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
