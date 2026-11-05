import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { searchDirectory } from '../../lib/places/directory.ts';
import { searchPlaces } from '../../lib/places/catalogue.ts';
import { resolveArea, normalizeAreaName } from '../../lib/address/resolve-area.ts';
import { isWholeArea, type AreaSelection } from '../../lib/address/selection.ts';

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
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!Array.isArray(body?.names) || !body.names.length || body.names.length > 5 || body.names.some((n: unknown) => typeof n !== 'string' || !n.trim() || n.length > 200)
      || !Array.isArray(body.types) || body.types.length > 20 || body.types.some((t: unknown) => typeof t !== 'string' || t.length > 100)
      || !isWholeArea(body.types) || (body.province !== undefined && (typeof body.province !== 'string' || body.province.length > 100))
      || (body.location !== undefined && (!Number.isFinite(body.location?.lat) || !Number.isFinite(body.location?.lng)))) {
      return Response.json({ error: 'Invalid area selection' }, { status: 400, headers });
    }
    const selection: AreaSelection = body;
    const queries = [...new Set(selection.names.map(normalizeAreaName))].filter(Boolean);
    const candidates = queries.flatMap(searchPlaces);
    // Provinces and the country do not depend on the town directory.
    if (!selection.types.includes('country') && !selection.types.includes('administrative_area_level_1')) {
      const results = await Promise.all(queries.map(query => searchDirectory(env.GEOGRAPHY_DB ?? env.RESULTS_DB, query, 60)));
      candidates.unshift(...results.flatMap(result => result.places));
    }
    return Response.json(resolveArea(selection, candidates), { headers });
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? 'Invalid selection' : 'Area lookup is temporarily unavailable' }, { status: error instanceof SyntaxError ? 400 : 503, headers });
  }
};
