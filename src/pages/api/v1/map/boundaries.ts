import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { parseBoundaryIds, wardBoundaryBatch } from '../../../../lib/maps/boundary-batch.ts';
import { BOUNDARY_BATCH_SIZE } from '../../../../lib/maps/config.ts';

export const GET: APIRoute = async ({ url }) => {
  const ids = parseBoundaryIds(url.searchParams);
  if (!ids) return Response.json({ error: `Provide up to ${BOUNDARY_BATCH_SIZE} valid ward IDs.` }, { status: 400 });
  try {
    const data = await wardBoundaryBatch(env.GEOGRAPHY_DB ?? env.RESULTS_DB, env.MAP_TILES, ids);
    if (!data) return Response.json({ error: 'Unknown ward boundary' }, { status: 404 });
    return Response.json(data, { headers: { 'Content-Type': 'application/geo+json', 'Cache-Control': 'public, max-age=86400' } });
  } catch (error) {
    console.error('Boundary batch unavailable', error);
    return Response.json({ error: 'Boundaries are temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
