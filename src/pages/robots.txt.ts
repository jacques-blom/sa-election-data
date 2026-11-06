import type { APIRoute } from 'astro';
import { publicUrl } from '../lib/site.ts';
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\nSitemap: ${publicUrl('/sitemap.xml')}\n`,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=300'}});
