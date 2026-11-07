import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { CfWorkerJsonSchemaValidator } from '@modelcontextprotocol/client/validators/cf-worker';
import { dynamicTool, jsonSchema, tool, type ToolSet } from 'ai';
import { z } from 'zod';
import { createCountedServer } from '../mcp/server.ts';
import { createDataReader, type McpBindings } from '../mcp/data.ts';
import { createImageService, type PngRenderer } from '../mcp/images/service.ts';
import { chartSchema, userSummary, type ChatEvent, type SourceLink, type WebResearch } from './contracts.ts';
import { researchMarkdown } from './citations.ts';
import { visualSpecSchema } from './visuals/catalog.ts';
import { composeVisual, type VisualDataset } from './visuals/model.ts';
import { readVisualData, visualDataRequest } from './visuals/data.ts';

type Dataset = { value: unknown; sources: SourceLink[] };
type AnalysisRunner = (code: string, data: Record<string, unknown>, signal?: AbortSignal) => unknown;

export async function createChatTools(options: {
  bindings: McpBindings; origin: string; documentation: string; renderImage: PngRenderer;
  runAnalysis: AnalysisRunner; emit: (event: ChatEvent) => void; signal: AbortSignal;
  researchNews?: (query: string, signal: AbortSignal) => Promise<WebResearch>; cache?: Cache;
}) {
  const reader = createDataReader(options.bindings, options.origin, options.cache);
  const server = createCountedServer(reader, options.documentation,
    createImageService(reader, options.bindings.RAW_RESULTS, options.renderImage));
  const client = new Client({ name: 'counted-website', version: '1' }, { jsonSchemaValidator: new CfWorkerJsonSchemaValidator() });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const close = async () => { await Promise.allSettled([client.close(), server.close()]); };
  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    const discovered = await client.listTools();
    const datasets = new Map<string, Dataset>();
    const visualDatasets = new Map<string, VisualDataset>();
    let calls = 0, searches = 0, analyses = 0, visuals = 0, storedSize = 0;
    const tools: ToolSet = {};
    function spend() {
      options.signal.throwIfAborted();
      if (++calls > 18) throw new Error('This answer has reached its tool limit. Summarise the evidence already retrieved.');
    }
    function save(value: unknown, sources: SourceLink[]) {
      const size = JSON.stringify(value).length;
      if (storedSize + size > 500_000) throw new Error('Analysis dataset limit reached. Narrow the question.');
      storedSize += size;
      const id = `data_${datasets.size + 1}`;
      datasets.set(id, { value, sources });
      return id;
    }
    // These are the actual MCP schemas and handlers, connected in memory. No
    // public HTTP hop, copied result logic, arbitrary SQL or user-selected server.
    for (const definition of discovered.tools) {
      if (['get_analysis_guide', 'get_api_docs', 'render_council_image'].includes(definition.name)) continue;
      tools[definition.name] = dynamicTool({
        description: `${definition.description} The website displays rendered images automatically. Data responses include a dataset_id for analyse_data.`,
        inputSchema: jsonSchema({ ...definition.inputSchema,
          properties: { summary_for_user: z.toJSONSchema(userSummary), ...definition.inputSchema.properties },
          required: [...(definition.inputSchema.required ?? []), 'summary_for_user'],
        }),
        execute: async input => {
          spend();
          const { summary_for_user, ...arguments_ } = input as Record<string, unknown>;
          const summary = userSummary.parse(summary_for_user);
          options.emit({ type: 'status', phase: 'tool', text: summary, summary_for_user: summary });
          // This field belongs to the website harness, not the underlying MCP.
          const response = await client.callTool({ name: definition.name, arguments: arguments_ },
            { signal: options.signal });
          if (response.isError) return { error: response.content.filter(part => part.type === 'text').map(part => part.text).join('\n').slice(0, 1500) };
          const result = response.structuredContent as { data: Record<string, unknown>; data_url: string; retrieved_at: string } | undefined;
          if (!result) throw new Error('No structured election data returned.');
          const sources = [{ title: definition.title ?? definition.name, url: result.data_url }];
          if (typeof result.data.image_url === 'string') {
            options.emit({ type: 'artifact', artifact: { kind: 'image', url: result.data.image_url,
              dataUrl: result.data_url, alt: String(result.data.alt_text ?? 'Election chart') } });
            // Do not send base64 images or a duplicate full chart to the model.
            const chart = result.data.chart as Record<string, unknown>;
            return { displayed: true, image_url: result.data.image_url, data_url: result.data_url,
              title: chart.title, subtitle: chart.subtitle, status: chart.status, metric: chart.metric,
              metric_label: chart.metric_label, rows: chart.rows, notes: chart.notes };
          }
          const serialized = JSON.stringify(result);
          if (serialized.length > 50_000) return { error: 'This response is too large. Request fewer rows.' };
          return { dataset_id: save(result.data, sources), ...result };
        },
      });
    }
    tools.get_visualisation_data = tool({
      description: 'Fetch complete chart-ready Counted data, saved as a dataset_id for render_visualisation and analyse_data. view=council: one municipality council, metric=seats (reported or estimated). view=party_support: all available election-history columns THROUGH year, preserving gaps. For broad vote-history/trend questions use metric=percent and render PartySupport with every returned column (100% stacked history). Comparison is for an explicitly requested two-election breakdown. view=parties: table of one area’s parties (share, votes, seats). view=summary: one summary row (ballots, seats, majority, reporting). view=areas: province or municipality table (party, share, votes, reporting); use area_id=all or a province ID when level=municipality. Optional party_id selects that party across areas, otherwise highest shown. Maps require 2026 area data. view=government: dated municipality timeline, with source cutoff. Resolve area IDs first. Reuse the same dataset in multiple scenarios; do not copy official figures into hypothetical inputs.',
      inputSchema: visualDataRequest.extend({ summary_for_user: userSummary }),
      execute: async ({ summary_for_user, ...request }) => {
        spend();
        options.emit({ type: 'status', phase: 'tool', text: summary_for_user, summary_for_user });
        const data = await readVisualData(options.bindings, options.origin, request);
        options.signal.throwIfAborted();
        const id = save(data, [...data.columns.flatMap(c => c.sources), ...(data.table?.sources ?? []), ...(data.timeline?.sources ?? [])]);
        visualDatasets.set(id, data);
        return { dataset_id: id, ...(request.view === 'party_support' ? { presentation_hint:
          `This history contains ${data.columns.length} election columns: ${data.columns.map(c => c.id).join(', ')}. For a broad vote-history or trend question, render PartySupport using every returned column in chronological order with metric=percent (100% stacked). Keep unavailable years as gaps. Use only two columns for an explicitly requested pair of elections.` } : {}), ...(data.table ? { table: { ...data.table, provenance: undefined, sources: data.table.sources.slice(0, 2), source_count: data.table.sources.length } } : {}), ...(data.timeline ? { timeline: { ...data.timeline, provenance: undefined } } : {}), columns: data.columns.map(c => ({ column_id: c.id, label: c.label, scope: c.scope, year: c.year,
          unit: c.unit, total: c.total, status: c.status, provisional: c.provisional, basis: c.basis,
          parties: c.parties.map(p => ({ id: p.id, name: p.name, value: p.value, selectable: p.selectable })), notes: c.notes, sources: c.sources })) };
      },
    });
    tools.render_visualisation = tool({
      description: 'Display a composed interactive visual using the json-render catalogue. Nest Grid (1–3 columns), Stack, Card and Text with CouncilScenario, PartySupport, RankedBars, Comparison, DataTable, ResultsMap, GovernmentTimeline and Metric. Data inputs reference get_visualisation_data dataset_id/column_id, or inline hypothetical values with assumptions. Use one Grid for several council scenarios, reusing the dataset and selecting party IDs. For broad vote-history/trend questions, use PartySupport with every returned history column in chronological order; percent columns form a 100% stacked chart. Comparison is for an explicitly requested pair of elections. Render once after gathering data. Returns calculated coalition totals; do not recalculate or duplicate charts as images.',
      inputSchema: z.strictObject({ summary_for_user: userSummary, spec: visualSpecSchema }),
      execute: async ({ summary_for_user, spec }) => {
        spend();
        if (++visuals > 2) throw new Error('Maximum two composed visuals per answer.');
        options.emit({ type: 'status', phase: 'tool', text: summary_for_user, summary_for_user });
        const artifact = composeVisual(spec, visualDatasets);
        options.emit({ type: 'artifact', artifact });
        return { displayed: true, charts: Object.entries(artifact.charts).map(([id, chart]) => {
          if (artifact.spec.elements[id]!.type !== 'CouncilScenario') return { id, columns: chart.columns.map(c => c.label), ...(chart.metric ? { metric: chart.metric } : {}), ...(chart.table ? { rows: chart.table.rows.length } : {}), ...(chart.timeline ? { events: chart.timeline.events.length } : {}) };
          const c = chart.columns[0]!, majority = Math.floor(c.total! / 2) + 1;
          const selectedSeats = c.parties.filter(p => chart.partyIds.includes(p.id)).reduce((sum, p) => sum + p.value!, 0);
          return { id, total: c.total, majority, selectedSeats, surplus: selectedSeats - majority, status: c.status, hypothetical_coalition: !!chart.partyIds.length };
        }), note: 'The visual includes sources, status and assumptions. Give a short conclusion; do not repeat all chart values or provenance.' };
      },
    });
    tools.analyse_data = tool({
      description: 'Run TypeScript calculations on data already fetched this turn. datasets maps dataset_id to its data object. Select IDs from tool responses. Code must RETURN JSON (optionally {chart:{title,description,unit,rows:[{label,value,color?}],note}, ...calculations}). No imports, async, fetch, filesystem, libraries or console. Use array operations and Math. 16 MB memory; bounded instructions. Cite limits of incomplete pages; never treat missing as zero. For council/party-support visuals use render_visualisation.',
      inputSchema: z.strictObject({ summary_for_user: userSummary, dataset_ids: z.array(z.string()).min(1).max(12), code: z.string().min(1).max(12000) }),
      execute: async ({ dataset_ids, code, summary_for_user }) => {
        spend();
        if (++analyses > 3) throw new Error('Maximum three calculations per answer.');
        const input: Record<string, unknown> = Object.create(null);
        const sources: SourceLink[] = [];
        for (const id of new Set(dataset_ids)) {
          const dataset = datasets.get(id);
          if (!dataset) throw new Error('Fetch the dataset in this turn before analysing it.');
          input[id] = dataset.value;
          sources.push(...dataset.sources);
        }
        options.emit({ type: 'status', phase: 'tool', text: summary_for_user, summary_for_user });
        const value = options.runAnalysis(code, input, options.signal);
        const id = save(value, sources);
        options.emit({ type: 'artifact', artifact: { kind: 'analysis', code, result: value } });
        if (value && typeof value === 'object' && 'chart' in value) {
          const chart = chartSchema.parse(value.chart);
          options.emit({ type: 'artifact', artifact: { kind: 'chart', chart,
            sources: Array.from(new Map(sources.map(source => [source.url, source])).values()) } });
        }
        return { dataset_id: id, result: value, chart_displayed: !!(value && typeof value === 'object' && 'chart' in value) };
      },
    });
    tools.search_news = tool({
      description: 'Research South African election and coalition reporting, party negotiating positions and journalist/political analyst assessments with native OpenAI web search. Use for open-ended coalition possibilities and political feasibility even when news is not explicitly requested; skip purely arithmetic requests. Include the municipality, relevant parties and period in the query. Returns cited research for your answer; the intermediate summary is not displayed. One request per answer, at most two native search actions; combine related questions. Cite sources near claims. Reporting is not official election totals, and commentary is not a confirmed agreement.',
      inputSchema: z.strictObject({ summary_for_user: userSummary, query: z.string().trim().min(3).max(180) }),
      execute: async ({ query, summary_for_user }) => {
        spend();
        if (++searches > 1) throw new Error('News research limit reached. Use the sources already retrieved.');
        if (!options.researchNews) return { error: 'News research is unavailable. Do not invent news or citations.' };
        options.emit({ type: 'status', phase: 'tool', text: summary_for_user, summary_for_user });
        const research = await options.researchNews(query, options.signal);
        options.emit({ type: 'artifact', artifact: { kind: 'research', ...research } });
        return { ...research, text: researchMarkdown(research), scope: 'Web research, not official election data. Cite only the returned source URLs. The research summary is not displayed. Include the relevant findings and clickable citations in your own answer; it must stand on its own.' };
      },
    });
    return { tools, close };
  } catch (error) { await close(); throw error; }
}
