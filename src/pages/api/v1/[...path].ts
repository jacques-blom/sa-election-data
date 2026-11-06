import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { resultsApi } from '../../../lib/api/results.ts';

export const ALL: APIRoute = ({ request }) => resultsApi(request, env);
