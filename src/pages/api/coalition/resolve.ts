import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { findDirectoryPlace, searchDirectory } from '../../../lib/places/directory.ts';
import { searchPlaces } from '../../../lib/places/catalogue.ts';
import { pointInGeometry, readGeometry, type GeometryRow } from '../../../lib/maps/geometry.ts';
import { resolveCoalitionSelection, validCoalitionSelection } from '../../../lib/seats/selection.ts';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) return Response.json({ error: 'Invalid origin' }, { status: 403, headers });
  try {
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4000) { await reader.cancel(); return Response.json({ error: 'Selection is too long' }, { status: 413, headers }); }
      chunks.push(value);
    }
    const selection: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!validCoalitionSelection(selection)) return Response.json({ error: 'Invalid council selection' }, { status: 400, headers });
    const db = env.GEOGRAPHY_DB ?? env.RESULTS_DB;
    const destination = await resolveCoalitionSelection(selection, {
      findPlace: slug => findDirectoryPlace(db, slug),
      searchPlaces: async query => [...searchPlaces(query), ...(await searchDirectory(db, query, 60)).places],
      locate: async ({ lat, lng }) => {
        const rows = await db.prepare("SELECT * FROM map_geometries WHERE level='municipality' AND minx<=? AND maxx>=? AND miny<=? AND maxy>=? LIMIT 101")
          .bind(lng, lng, lat, lat).all<GeometryRow>();
        if (rows.results.length > 100) throw new Error('Candidate limit exceeded');
        const ids: string[] = [];
        for (const row of rows.results) {
          const feature = await readGeometry(env.MAP_TILES, row);
          if (pointInGeometry([lng, lat], feature.geometry)) ids.push(row.id);
        }
        return ids;
      },
    });
    return Response.json(destination, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? 'Invalid selection' : 'Council lookup is temporarily unavailable' }, { status: error instanceof SyntaxError ? 400 : 503, headers });
  }
};
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'POST', ...headers } });
