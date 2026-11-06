import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { readResultImage } from '../../../lib/mcp/images/http.ts';

export const GET: APIRoute = ({ request, params }) => readResultImage(request, params.file ?? '', env.RAW_RESULTS);
export const HEAD = GET;
