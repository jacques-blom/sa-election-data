import { McpServer, type CallToolResult } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { ELECTIONS } from '../data/catalogue.ts';
import type { AreaRecord } from '../data/normalize.ts';
import { DataError, pageInfo, type DataReader } from './data.ts';
import { methodology, serverInstructions } from './guidance.ts';
import { publicUrl } from '../site.ts';
import { analysisGuide } from './analysis-guide.ts';
import type { ImageService } from './images/service.ts';
import { imageWidgetHtml, imageWidgetMeta, imageWidgetUri } from './images/widget.ts';

const year = z.literal(ELECTIONS.map(e => e.year)).describe('Municipal election year; required for results.');
const level = z.enum(['national', 'province', 'municipality', 'ward', 'voting-district']);
const ballot = z.enum(['auto', 'pr', 'ward', 'source_total']).default('auto');
const numericId = z.string().regex(/^\d{1,20}$/).describe('IEC ID within the requested election, obtained from list_areas.');
const pagination = { limit: z.int().min(1).max(50).default(20), offset: z.int().min(0).max(Number.MAX_SAFE_INTEGER - 50).default(0) };
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const outputSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  data_url: z.url(), documentation_url: z.url(), retrieved_at: z.iso.datetime(),
});

function queryPath(path: string, values: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined) query.set(key, String(value));
  return path + (query.size ? `?${query}` : '');
}

export function createCountedServer(reader: DataReader, apiDocumentation?: string, images?: ImageService) {
  const server = new McpServer({ name: 'counted', version: '1.2.0', title: 'Counted election results' },
    { instructions: serverInstructions });

  async function reply(path: string, read: () => Promise<Record<string, unknown>>): Promise<CallToolResult> {
    try {
      const structuredContent = { data: await read(), data_url: publicUrl(path),
        documentation_url: publicUrl('/api'), retrieved_at: new Date().toISOString() };
      return { structuredContent, content: [{ type: 'text', text: JSON.stringify(structuredContent) }] };
    } catch (error) {
      const status = error instanceof DataError ? error.status : 503;
      // Never send storage errors, SQL or stack traces to clients.
      if (!(error instanceof DataError)) console.error('MCP data read failed', error);
      return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: {
        code: status === 404 ? 'not_found' : status >= 500 ? 'temporarily_unavailable' : 'invalid_request',
        status, message: error instanceof DataError ? error.message : 'Data is temporarily unavailable. Retry later.',
        retryable: status >= 500,
      } }) }] };
    }
  }

  server.registerTool('render_results_image', {
    title: 'Draw an election results image', annotations, outputSchema, _meta: imageWidgetMeta,
    description: 'Render a branded PNG of one area’s published vote shares with reporting progress, ballot basis and source evidence. The attached MCP Apps viewer displays the exact image; summarize it briefly and provide the returned PNG/data download links. Use image_markdown only as fallback in clients without the viewer. Do not substitute an image search result or recreate the chart. Source data is read-only; generated public images are cached. Does not declare winners or council control.',
    inputSchema: z.strictObject({ year, level, area_id: z.string().regex(/^(ZA|\d{1,20})$/), ballot,
      top: z.int().min(3).max(15).default(8), party_id: z.string().regex(/^-?\d{1,20}$/).optional() }),
  }, async args => {
    try {
      if (!images) throw new DataError(503, 'Image rendering is temporarily unavailable.');
      return await images.results(args);
    } catch (error) {
      return reply('/api', async () => { throw error; });
    }
  });

  server.registerResource('result-image-viewer', imageWidgetUri, {
    title: 'Counted chart viewer', mimeType: 'text/html;profile=mcp-app',
    description: 'Displays the exact generated PNG with source and download links.',
  }, async () => ({ contents: [{ uri: imageWidgetUri, mimeType: 'text/html;profile=mcp-app', text: imageWidgetHtml,
    _meta: { ui: { prefersBorder: false, csp: { connectDomains: [], resourceDomains: ['https://counted.co.za'] } },
      'openai/widgetDescription': 'The generated Counted election chart with its provisional status and source. Summarize briefly without repeating the whole chart.',
      'openai/widgetCSP': { connect_domains: [], resource_domains: ['https://counted.co.za'] },
    } }] }));

  server.registerTool('render_comparison_image', {
    title: 'Draw election or area comparisons', annotations, outputSchema, _meta: imageWidgetMeta,
    description: 'Render a PNG comparison with an inline image viewer and immutable download URLs. previous_election compares named-party percentage-point changes for exactly one area against the preceding imported election; it is exploratory, not boundary-adjusted, and omits unknown baselines and parties absent from the current list. areas compares one named party’s vote share in 2–12 selected areas at one level in one year; it is not a nationwide ranking. Includes source snapshots and caveats. No caller code runs.',
    inputSchema: z.strictObject({ year, level, area_ids: z.array(z.string().regex(/^(ZA|\d{1,20})$/)).min(1).max(12), ballot,
      mode: z.enum(['previous_election', 'areas']).default('previous_election'),
      top: z.int().min(3).max(15).default(10), party_id: z.string().regex(/^\d{1,20}$/).optional() }),
  }, async args => {
    try { if (!images) throw new DataError(503, 'Image rendering is temporarily unavailable.'); return await images.comparison(args); }
    catch (error) { return reply('/api', async () => { throw error; }); }
  });

  server.registerTool('render_council_image', {
    title: 'Draw council seats or a hypothetical coalition', annotations, outputSchema, _meta: imageWidgetMeta,
    description: 'Render a whole municipality’s council-seat diagram with a majority threshold, exact allocations and reported/estimated status. Optionally select named party IDs to highlight a hypothetical coalition and its majority surplus or shortfall; no agreement or governing coalition is implied. Grouped independents cannot be selected as one party. Returns image content, inline viewer and immutable PNG/data URLs. Estimates and provisional results remain visibly labelled. No caller code runs.',
    inputSchema: z.strictObject({ year, municipality_id: numericId,
      selected_party_ids: z.array(z.string().regex(/^[1-9]\d{0,19}$/)).max(20).default([]) }),
  }, async args => {
    try { if (!images) throw new DataError(503, 'Image rendering is temporarily unavailable.'); return await images.council(args); }
    catch (error) { return reply('/api', async () => { throw error; }); }
  });

  server.registerTool('get_api_docs', {
    title: 'Read the complete API documentation', annotations, outputSchema,
    description: 'Load the authoritative API documentation as Markdown: endpoints, query parameters, response schemas, data coverage, freshness, source provenance, maps, places and MCP workflows. Read before using REST endpoints or building a Python download. No database access is required.',
    inputSchema: z.strictObject({}),
  }, async () => reply('/api.md', async () => {
    if (!apiDocumentation) throw new DataError(503, 'API documentation is temporarily unavailable.');
    return { mime_type: 'text/markdown', markdown: apiDocumentation };
  }));

  server.registerTool('get_overview', {
    title: 'Read national or provincial page aggregates', annotations, outputSchema,
    description: 'Read the data behind the national or province results page: source summary vote shares and progress, provincial/metro cards or municipality cards, reported council-majority counts where available, history, quality and provenance. Municipality lists are paginated. National/provincial source totals are not summed from the visible cards. Estimates never enter reported council counts.',
    inputSchema: z.strictObject({ year, province_id: z.string().regex(/^[1-9]$/).optional(), ...pagination }),
  }, async ({ year, province_id, limit, offset }) => reply(`/api/v1/elections/${year}`,
    () => reader.overview(year, province_id, limit, offset)));

  server.registerTool('get_area_summary', {
    title: 'Read calculated shares, history and council seats', annotations, outputSchema,
    description: 'Read calculations behind an electoral area page: full-source vote-share denominators, provisional leader/ties, progress, previous-election percentage-point movements, available years, and reported or estimated council-seat allocations. Estimates are explicitly labelled. Parties are paginated after calculations. National/provincial summaries always use combined ballots; historical detail may fall back to combined counts. Same-ID history is exploratory, not boundary-adjusted. Use get_results for the complete raw source fields.',
    inputSchema: z.strictObject({ year, level, area_id: z.string().regex(/^(ZA|\d{1,20})$/), ballot,
      party_limit: z.int().min(1).max(50).default(20), party_offset: z.int().min(0).max(20000).default(0) }),
  }, async ({ year, level, area_id, ballot, party_limit, party_offset }) => reply(`/api/v1/elections/${year}/areas/${level}/${area_id}`, async () => {
    if ((level === 'national') !== (area_id === 'ZA')) throw new DataError(400, 'Use ZA only for national results.');
    return reader.summary(year, level, area_id, ballot, party_limit, party_offset);
  }));

  server.registerTool('list_area_summaries', {
    title: 'Compare area cards across an imported scope', annotations, outputSchema,
    description: 'Page through compact result-page calculations at one geographic level, filtered by province, municipality, ward or name. Includes leaders, denominators, progress, council status, source evidence and quality. Optionally select one party_id to get its votes/share/history in each area for Python comparisons; absent parties remain unavailable, not zero. Does not sum mixed geographic levels or infer boundary equivalence. Maximum 25 areas per call.',
    inputSchema: z.strictObject({ year, level: level.default('municipality'), ballot,
      province_id: numericId.optional(), municipality_id: numericId.optional(), ward_id: numericId.optional(),
      query: z.string().trim().max(80).optional(), party_id: z.string().regex(/^-?\d{1,20}$/).optional(),
      limit: z.int().min(1).max(25).default(10), offset: z.int().min(0).max(Number.MAX_SAFE_INTEGER - 25).default(0) }),
  }, async (filters) => reply(queryPath(`/api/v1/elections/${filters.year}/areas`, {
    level: filters.level, province_id: filters.province_id, municipality_id: filters.municipality_id,
    ward_id: filters.ward_id, q: filters.query, limit: filters.limit, offset: filters.offset,
  }), () => reader.summaries(filters)));

  server.registerTool('get_analysis_guide', {
    title: 'Load the Python analysis workflow', annotations, outputSchema,
    description: 'Load skill-like instructions for open-ended election analysis in a Python environment: complete dataset downloads, CSV/JSONL schemas, source snapshot checks, joins, vote shares, historical comparisons, rankings and charts. Includes a downloadable standard-library Python client. Call before multi-area analysis or questions such as biggest winners and losers. No plugin installation or data read is required.',
    inputSchema: z.strictObject({}),
  }, async () => reply('/api', async () => analysisGuide));

  server.registerTool('list_elections', {
    title: 'Discover elections and coverage', annotations, outputSchema,
    description: 'List imported municipal elections and source health. Supply year to inspect coverage, expected area counts and caveats for one election. Start here to discover available data.',
    inputSchema: z.strictObject({ year: year.optional() }),
  }, async ({ year }) => {
    const path = `/api/v1/elections${year === undefined ? '' : `/${year}`}`;
    return reply(path, () => reader.api(path));
  });

  server.registerTool('search_places', {
    title: 'Find named places', annotations, outputSchema,
    description: 'Search current South African municipalities, towns and suburbs by name or alias, optionally including a province in the query. Empty query lists metros. Returns slugs for get_place; mappings apply to 2026 only. For historical IDs use list_areas. Do not send street addresses.',
    inputSchema: z.strictObject({ query: z.string().trim().max(100).default(''), ...pagination,
      offset: z.int().min(0).max(20000).default(0) }),
  }, async ({ query, limit, offset }) => reply(queryPath('/search', { q: query }), () => reader.search(query, limit, offset)));

  server.registerTool('get_place', {
    title: 'Resolve a place to electoral areas', annotations, outputSchema,
    description: 'Resolve a slug from search_places into paginated 2026 municipality/ward relationships and boundary evidence. Read scope before fetching each area with get_results. Towns cover whole overlapping wards; no town-only totals are computed.',
    inputSchema: z.strictObject({ slug: z.string().min(1).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), ...pagination }),
  }, async ({ slug, limit, offset }) => reply(`/2026/places/${slug}`, () => reader.place(slug, limit, offset)));

  server.registerTool('list_areas', {
    title: 'Find election-specific electoral areas', annotations, outputSchema,
    description: 'Browse or search imported areas within one election. Filter by parent IEC IDs and/or a literal name fragment. Use the returned IDs with get_results. Matching IDs across elections do not establish matching boundaries.',
    inputSchema: z.strictObject({ year, level: level.default('municipality'), query: z.string().trim().max(80).optional(),
      province_id: numericId.optional(), municipality_id: numericId.optional(), ward_id: numericId.optional(), ...pagination }),
  }, async ({ year, query, ...filters }) => {
    const path = queryPath(`/api/v1/elections/${year}/areas`, { ...filters, q: query });
    return reply(path, async () => {
      const data = await reader.api(path);
      return { ...data, ...pageInfo(Number(data.total), filters.limit, filters.offset) };
    });
  });

  server.registerTool('get_results', {
    title: 'Read results with source evidence', annotations, outputSchema,
    description: 'Get one area’s published ballot counts, reported seats, reporting progress, source timestamps, freshness and quality caveats. Use ZA for national or an IEC ID from list_areas. Party rows are paginated in source order; never calculate shares from a page sum. Null is unavailable, not zero. Reported seats are not estimates; provisional leaders are not declared winners.',
    inputSchema: z.strictObject({ year, level, area_id: z.string().regex(/^(ZA|\d{1,20})$/),
      party_limit: z.int().min(1).max(50).default(20), party_offset: z.int().min(0).max(20000).default(0) }),
  }, async ({ year, level, area_id, party_limit, party_offset }) => {
    const path = `/api/v1/elections/${year}/areas/${level}/${area_id}`;
    return reply(path, async () => {
      if ((level === 'national') !== (area_id === 'ZA')) throw new DataError(400, 'Use ZA only for national results; other levels require numeric IEC IDs.');
      const data = await reader.api(path);
      const results = data.results as AreaRecord['payload'];
      return { ...data, results: { ...results, parties: results.parties.slice(party_offset, party_offset + party_limit) },
        party_page: { ...pageInfo(results.parties.length, party_limit, party_offset),
          note: 'Only parties are paginated. Source totals, party_list_scope and quality describe the complete source, not this page.' } };
    });
  });

  server.registerTool('list_sources', {
    title: 'Inspect source coverage and failures', annotations, outputSchema,
    description: 'List IEC source documents for an election, including their active snapshot, successful checks and refresh errors. Paginated; get_results includes area-specific provenance.',
    inputSchema: z.strictObject({ year, ...pagination }),
  }, async ({ year, limit, offset }) => {
    const path = queryPath(`/api/v1/elections/${year}/sources`, { limit, offset });
    return reply(path, async () => {
      const data = await reader.api(path);
      return { ...data, ...pageInfo(Number(data.total), limit, offset) };
    });
  });

  server.registerTool('get_sync_status', {
    title: 'Check live result freshness', annotations, outputSchema,
    description: 'Check stored live-ingestion health, scheduler heartbeat, source freshness, backlog, failures and budget pauses. This does not trigger a refresh. HTTP/tool success does not mean upstream data is fresh.',
    inputSchema: z.strictObject({}),
  }, async () => reply('/api/v1/sync', () => reader.api('/api/v1/sync')));

  server.registerTool('get_updates', {
    title: 'Read reported milestones and corrections', annotations, outputSchema,
    description: 'Read recorded 2026 ward wins, council outcomes, count completions and corrections. Outcomes remain provisional. Check superseded_by and previous_event_id. Use one cursor: before for older, after for newer, or event for one saved announcement. The feed does not reconstruct events before tracking began.',
    inputSchema: z.strictObject({ type: z.enum(['all', 'wins', 'councils', 'complete', 'corrections']).default('all'),
      province: z.string().regex(/^[1-9]$/).optional(), query: z.string().trim().max(80).default(''),
      before: z.int().positive().optional(), after: z.int().positive().optional(), event: z.int().positive().optional(),
      limit: z.int().min(1).max(50).default(20) }),
  }, async ({ type, province, query, before, after, event, limit }) => {
    const path = queryPath('/api/v1/updates', { type, province, q: query, before, after, event, limit });
    return reply(path, async () => {
      if ([before, after, event].filter(v => v !== undefined).length > 1) throw new DataError(400, 'Use only one of before, after or event.');
      return reader.updates({ type, province: province ?? '', q: query,
        before: before ?? null, after: after ?? null, event: event ?? null, limit });
    });
  });

  server.registerResource('methodology', 'counted://methodology', {
    title: 'Counted methodology and interpretation', mimeType: 'text/markdown',
    description: 'Ballot semantics, provenance, provisional status, geographic scope and historical comparison limits.',
  }, async uri => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: methodology }] }));

  server.registerResource('api-documentation', 'counted://api-documentation', {
    title: 'Counted API documentation', mimeType: 'text/markdown',
    description: 'The complete authoritative REST and MCP API documentation, identical to /api.md.',
  }, async uri => {
    if (!apiDocumentation) throw new Error('API documentation is temporarily unavailable.');
    return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: apiDocumentation }] };
  });

  return server;
}
