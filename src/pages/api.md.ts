import type { APIRoute } from 'astro';
import documentation from '../../docs/api.md?raw';

export const prerender = true;

export const GET: APIRoute = () => new Response(documentation, {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});
