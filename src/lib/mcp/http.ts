import { createMcpHandler, hostHeaderValidationResponse, originValidationResponse } from '@modelcontextprotocol/server';
import { createDataReader, type McpBindings, type ReadCache } from './data.ts';
import { createCountedServer } from './server.ts';

export type McpHttpOptions = { allowedHosts: string[]; cache?: ReadCache };

export async function handleMcp(request: Request, bindings: McpBindings, options: McpHttpOptions): Promise<Response> {
  const rejected = hostHeaderValidationResponse(request, options.allowedHosts)
    ?? originValidationResponse(request, options.allowedHosts);
  if (rejected) {
    const headers = new Headers(rejected.headers);
    headers.set('Cache-Control', 'no-store');
    return new Response(rejected.body, { status: rejected.status, headers });
  }

  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, MCP-Protocol-Version, MCP-Session-Id',
    'Access-Control-Expose-Headers': 'MCP-Protocol-Version',
    'Vary': 'Origin',
  });
  const origin = request.headers.get('Origin');
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') {
    headers.set('Allow', 'POST, OPTIONS');
    return new Response('Use an MCP client to POST to this endpoint.', { status: 405, headers });
  }

  const reader = createDataReader(bindings, new URL(request.url).origin, options.cache);
  const handler = createMcpHandler(() => createCountedServer(reader), {
    legacy: 'stateless', maxRequestBodySize: 32 * 1024, maxSubscriptions: 0,
  });
  // The SDK owns the per-request server/transport lifetime, including legacy SSE
  // response bodies. Do not close the handler before a streamed response is read.
  const response = await handler.fetch(request);
  const merged = new Headers(response.headers);
  headers.forEach((value, key) => merged.set(key, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: merged });
}
