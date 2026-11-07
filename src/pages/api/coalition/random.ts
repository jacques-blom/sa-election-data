import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getBuilderCouncils, getBuilderResult } from '../../../lib/seats/directory.ts';
import { councilSeats, canBuildCoalition } from '../../../lib/seats/allocation.ts';
import { randomPlayableCouncil } from '../../../lib/seats/random.ts';

export const GET: APIRoute = async ({ url }) => {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const councils = await getBuilderCouncils(env.RESULTS_DB, env.RAW_RESULTS);
    const council = await randomPlayableCouncil(councils, url.searchParams.get('exclude'), async candidate => {
      const result = await getBuilderResult(env.RESULTS_DB, candidate.id, env.RAW_RESULTS);
      return !!result && canBuildCoalition(councilSeats(result.level, result.results));
    });
    if (council) return Response.json({ href: council.href }, { headers });
    return Response.json({ error: 'No other council is ready right now. Try again shortly.' }, { status: 503, headers });
  } catch {
    return Response.json({ error: 'Couldn’t pick a council. Give it another roll.' }, { status: 503, headers });
  }
};
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } });
