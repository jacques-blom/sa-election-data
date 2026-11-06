import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { findDirectoryPlace } from '../../lib/places/directory.ts';
import { nationalOgPage, ogPageForPath } from '../../lib/og/model.ts';
import { renderOgImage } from '../../lib/og/render.ts';
import { loadOgMap, type Boundaries } from '../../lib/og/maps.ts';
import { readGeometry, type GeometryRow } from '../../lib/maps/geometry.ts';

export const GET: APIRoute = async ({ params, url }) => {
  // Keep legacy image URLs working; new metadata gets a fresh CDN/social cache key.
  const imagePage = params.page?.replace(/^v\d+\//, '');
  const path = imagePage === 'index' ? '/' : `/${imagePage ?? ''}`;
  try {
    const page = await ogPageForPath(path, slug => findDirectoryPlace(env.GEOGRAPHY_DB ?? env.RESULTS_DB, slug));
    if (!page) return new Response('Page not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    const map = await loadOgMap(page.map, {
      asset: async path => {
        const response = await env.ASSETS.fetch(new URL(path, url.origin));
        if (!response.ok) throw new Error(`Boundary asset unavailable: ${response.status}`);
        return response.json<Boundaries>();
      },
      geometry: async target => {
        const row = await (env.GEOGRAPHY_DB ?? env.RESULTS_DB).prepare('SELECT * FROM map_geometries WHERE level=? AND id=?')
          .bind(target.level, target.id).first<GeometryRow>();
        return row ? readGeometry(env.MAP_TILES, row) : null;
      },
    });
    return new Response(renderOgImage(page, map), { headers: {
      'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) {
    console.error('OG image unavailable', error);
    // A missing directory/database must not break an otherwise useful preview.
    return new Response(renderOgImage(nationalOgPage()), { headers: {
      'Content-Type': 'image/png', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    } });
  }
};
