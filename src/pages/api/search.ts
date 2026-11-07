import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { searchLocalAreas } from '../../lib/address/local-search.ts';
import { addressSearchBounds } from '../../lib/address/scope.ts';

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
    if (body.bbox !== undefined && !addressSearchBounds(body.bbox)) return Response.json({ error: 'Invalid search scope' }, { status: 400, headers });
    return Response.json({ suggestions: await searchLocalAreas(env.GEOGRAPHY_DB ?? env.RESULTS_DB, query, body.bbox) }, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? 'Invalid search' : 'Search is temporarily unavailable' }, { status: error instanceof SyntaxError ? 400 : 503, headers });
  }
};
