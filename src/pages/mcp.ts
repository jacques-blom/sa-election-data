import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleMcp } from '../lib/mcp/http.ts';
import apiDocumentation from '../../docs/api.md?raw';
import { renderSvgImage } from '../lib/og/render.ts';

export const ALL: APIRoute = async ({ request }) => {
  const allowedHosts = env.MCP_ALLOWED_HOSTS.split(',').map(host => host.trim()).filter(Boolean);
  if (import.meta.env.DEV) allowedHosts.push(...(env.DEV_ALLOWED_HOSTS ?? '').split(',').map(host => host.trim()).filter(Boolean));
  return handleMcp(request, env, { allowedHosts, apiDocumentation, renderImage: renderSvgImage, cache: await caches.open('public-results-v1') });
};
