import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { searchDirectory } from '../../lib/places/directory.ts';
import { placeUrl, searchPlaces } from '../../lib/places/catalogue.ts';
import { rankPlaceSuggestions } from '../../lib/places/suggestions.ts';
import { provinces, provinceUrl } from '../../lib/overview/results.ts';
import type { AreaSuggestion } from '../../lib/address/selection.ts';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
// A unified field can contain an address. Keep its raw text out of URLs and caches.
export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) {
    return Response.json({ error: 'Invalid origin' }, { status: 403, headers });
  }
  try {
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2000) { await reader.cancel(); return Response.json({ error: 'Search is too long' }, { status: 413, headers }); }
      chunks.push(value);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (typeof body?.query !== 'string' || body.query.length > 200) {
      return Response.json({ error: 'Invalid search' }, { status: 400, headers });
    }
    const query = body.query.trim();
    if (query.length < 2) return Response.json({ suggestions: [] }, { headers });
    const provinceMatches: AreaSuggestion[] = provinces.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase() === query.toLowerCase())
      .map(p => ({ name: p.name, description: 'Province · election results', url: provinceUrl(p) }));
    let places: Awaited<ReturnType<typeof searchDirectory>>['places'];
    try { places = (await searchDirectory(env.GEOGRAPHY_DB ?? env.RESULTS_DB, query, 6)).places; }
    catch { places = []; }
    places = rankPlaceSuggestions(query, [...places, ...searchPlaces(query)]).slice(0, 6);
    return Response.json({ suggestions: [...provinceMatches, ...places.map(p => ({ name: p.name,
      description: `${p.kind === 'metro' ? 'Metro' : p.kind === 'municipality' ? 'Municipality' : p.kind === 'suburb' ? 'Suburb' : 'Town'} · ${p.province}`, url: placeUrl(p) }))].slice(0, 6) }, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? 'Invalid search' : 'Search is temporarily unavailable' }, { status: error instanceof SyntaxError ? 400 : 503, headers });
  }
};
