import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { findMapWard } from '../../../../lib/maps/ward-catalogue.ts';
import { addressSearchBounds } from '../../../../lib/address/scope.ts';

export const GET: APIRoute = async ({ url }) => {
  const raw = url.searchParams.get('bbox')?.split(',');
  const bbox = raw?.every(value => value.trim()) ? addressSearchBounds(raw.map(Number)) : undefined;
  if (!bbox) return Response.json({ error: 'Invalid viewport' }, { status: 400 });
  try {
    const rows = await (env.GEOGRAPHY_DB ?? env.RESULTS_DB).prepare("SELECT id FROM map_geometries WHERE level='ward' AND minx<=? AND maxx>=? AND miny<=? AND maxy>=? ORDER BY id LIMIT 251")
      .bind(bbox.east, bbox.west, bbox.north, bbox.south).all<{ id: string }>();
    const limited = rows.results.length > 250;
    return Response.json({ limited, wards: limited ? [] : rows.results.flatMap(row => { const ward = findMapWard(row.id); return ward ? [ward] : []; }) },
      { headers: { 'Cache-Control': 'public, max-age=86400' } });
  } catch {
    return Response.json({ error: 'Boundaries are temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
