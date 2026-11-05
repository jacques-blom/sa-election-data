import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { BASEMAP_KEY, WARDS_KEY, ADMIN_KEY, VD_KEY } from '../../../lib/maps/config.ts';
import { byteRange } from '../../../lib/maps/ranges.ts';
export const GET: APIRoute = async ({ params, request }) => {
    const key = params.file;
    if (key !== BASEMAP_KEY && key !== WARDS_KEY && key !== ADMIN_KEY && key !== VD_KEY)
        return new Response('Map not found', { status: 404 });
    try {
        const object = await env.MAP_TILES.head(key);
        if (!object)
            return new Response('Map data is not available yet.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
        const headers = new Headers({ 'Content-Type': 'application/octet-stream', 'Accept-Ranges': 'bytes', 'ETag': object.httpEtag, 'Cache-Control': 'public, max-age=31536000, immutable' });
        if (request.headers.get('If-None-Match')?.split(',').some(t => t.trim().replace(/^W\//, '') === object.httpEtag || t.trim() === '*'))
            return new Response(null, { status: 304, headers });
        const rangeHeader = request.method === 'HEAD' ? null : request.headers.get('Range');
        const ifRange = request.headers.get('If-Range');
        const range = rangeHeader && (!ifRange || ifRange === object.httpEtag) ? byteRange(rangeHeader, object.size) : undefined;
        if (range === null)
            return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${object.size}`, 'Cache-Control': 'no-store' } });
        headers.set('Content-Length', String(range?.length ?? object.size));
        if (range)
            headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`);
        if (request.method === 'HEAD')
            return new Response(null, { headers });
        const body = await env.MAP_TILES.get(key, range ? { range } : undefined);
        if (!body)
            return new Response('Map unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
        return new Response(body.body, { status: range ? 206 : 200, headers });
    }
    catch (e) {
        console.error('Basemap read failed', e);
        return new Response('Map temporarily unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
};
export const HEAD = GET;
