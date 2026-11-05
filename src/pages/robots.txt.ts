import type { APIRoute } from 'astro';
export const GET: APIRoute = ({url}) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml',url.origin).href}\n`,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=300'}});
