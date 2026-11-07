/** Manual, paid A/B probe; never runs in the app or the automated test suite.
 * node --env-file=.env scripts/eval-chat-search.ts native /tmp/counted-search-native.json
 * node --env-file=.env scripts/eval-chat-search.ts separate /tmp/counted-search-separate.json
 * node --env-file=.env scripts/eval-chat-search.ts native-final /tmp/counted-search-native-final.json
 * Optional fourth argument replaces the question. Uses existing local D1, read only.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, isStepCount } from 'ai';
import variant from '@jitl/quickjs-wasmfile-release-sync';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import { chatInstructions } from '../src/lib/chat/agent.ts';
import { createChatTools } from '../src/lib/chat/tools.ts';
import { searchNews, SEARCH_MODEL } from '../src/lib/chat/search.ts';
import { analyse } from '../src/lib/chat/sandbox.ts';
import type { ChatEvent } from '../src/lib/chat/contracts.ts';

const [mode, output, question = 'Which parties could form a majority in Johannesburg in 2026? Show me the council seats.'] = process.argv.slice(2);
if (!['native', 'native-final', 'separate'].includes(mode ?? '') || !output) {
  throw new Error('Usage: node --env-file=.env scripts/eval-chat-search.ts native|native-final|separate /tmp/report.json [question]');
}
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing');
const native = mode !== 'separate';
const finalSearch = mode === 'native-final';
const started = Date.now();
const signal = AbortSignal.timeout(90_000);
const steps: Record<string, unknown>[] = [];
const requests: Record<string, unknown>[] = [];
const sources: Record<string, unknown>[] = [];
const events: ChatEvent[] = [];
const researchUsage: Record<string, unknown>[] = [];
let remainingOutput = 12_288, searches = 0, searchAccountingKnown = true;
let nativeRequests = 0, hasElectionData = false, hasVisual = false;
let answer = '', error: string | null = null, finishReason = '';
let firstTextMs: number | undefined;

// Only retain usage, public answer/citations and tool names; never credentials,
// raw provider errors, request headers or hidden reasoning.
const measuredFetch: typeof fetch = async (input, init) => {
  const body = JSON.parse(String(init?.body));
  if (native) {
    for (const tool of body.tools ?? []) {
      if (tool.type === 'openrouter:web_search') {
        // Provider 3.1.0 flattens webSearch args; use the documented parameters envelope.
        delete tool.engine;
        tool.parameters = { engine: 'native' };
      }
    }
    body.max_tool_calls = Math.max(1, 2 - searches);
    if (body.tools?.some((tool: { type: string }) => tool.type === 'openrouter:web_search')) {
      if (++nativeRequests > 1) throw new Error('Only one search-enabled model request is allowed in this probe');
    }
  }
  requests.push({ endpoint: new URL(String(input)).pathname, max_tool_calls: body.max_tool_calls,
    nativeSearchEnabled: body.tools?.some((tool: { type: string }) => tool.type === 'openrouter:web_search') ?? false,
    model: body.model, provider: body.provider });
  const response = await fetch(input, { ...init, body: JSON.stringify(body) });
  if (String(input).endsWith('/responses') && response.ok) {
    const data = await response.clone().json() as { usage?: Record<string, unknown> };
    if (data.usage) researchUsage.push(data.usage);
  }
  return response;
};

const openrouter = createOpenRouter({ apiKey, compatibility: 'strict', appName: 'Counted search evaluation',
  appUrl: 'https://counted.co.za', fetch: measuredFetch });
const model = openrouter.chat(SEARCH_MODEL, { reasoning: { effort: 'medium' }, provider: {
  only: ['openai'], allow_fallbacks: false, require_parameters: true, data_collection: 'deny',
  max_price: { prompt: 1, completion: 5 },
} });
const proxy = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc',
  persist: { path: resolve('.wrangler/state/v3') }, remoteBindings: false });
const quickjs = await newQuickJSWASMModuleFromVariant(variant);
const session = await createChatTools({ bindings: proxy.env, origin: 'https://counted.co.za',
  documentation: readFileSync('docs/api.md', 'utf8'), signal,
  renderImage: () => { throw new Error('This probe supports interactive visuals, not image rendering.'); },
  runAnalysis: (code, data, abort) => analyse(quickjs, code, data, abort),
  researchNews: (query, abort) => searchNews(apiKey, query, abort, measuredFetch),
  emit: event => {
    events.push(event);
    if (event.type === 'status') console.log(JSON.stringify({ mode, elapsedMs: Date.now() - started, status: event.text }));
  },
});

try {
  let instructions = chatInstructions();
  if (native) {
    delete session.tools.search_news;
    session.tools.web_search = openrouter.tools.webSearch({ engine: 'native' });
    instructions = instructions
      .replace('Every tool call must include summary_for_user:', 'Every Counted function tool call must include summary_for_user (the provider-native web_search tool is exempt):')
      .replaceAll('search_news', 'web_search')
      .replace('It returns a cited research summary and sources from native OpenAI web search. Combine related news questions into one request.',
        'This is native OpenAI web search inside your own request, not another research model. Search directly, read the evidence and synthesize your answer. Combine related questions within the two-search budget.')
      .replace('one news research request (up to two native search actions)', 'two native web search actions across the entire turn');
    instructions += finalSearch
      ? '\nFor this bounded experiment, first fetch the election data and render illustrative coalition scenarios using the dated background. Native web_search then becomes available in your final answer step. Use it to check current political evidence and cite that evidence in your final answer; correct or qualify the illustrative scenarios if the reporting contradicts them. You have at most two native search actions. No more Counted tools will be available in that final step.'
      : '\nFor this bounded experiment, web_search becomes available after the initial election result lookups. Use it then, before choosing coalition scenarios. You have one search-enabled model step with up to two native search actions; carry the evidence and its citation URLs forward into your final answer.';
  }
  // Match the production step, time, context and total-output budgets.
  const result = streamText({ model, instructions, messages: [{ role: 'user', content: question }],
    tools: session.tools, stopWhen: isStepCount(6), maxOutputTokens: 8192, maxRetries: 0, abortSignal: signal,
    prepareStep: ({ stepNumber, messages }) => {
      if (remainingOutput <= 0 || JSON.stringify(messages).length > 180_000) throw new Error('Probe budget reached');
      const searchWindow = nativeRequests === 0 && (finalSearch ? hasVisual || stepNumber >= 5 : hasElectionData || stepNumber >= 3);
      return { maxOutputTokens: Math.min(8192, remainingOutput),
        activeTools: Object.keys(session.tools).filter(name => name === 'web_search' ? searchWindow : !(finalSearch && searchWindow)),
        ...(stepNumber >= 5 && !searchWindow ? { toolChoice: 'none' as const } : {}) };
    },
    onStepFinish: step => {
      remainingOutput -= step.usage.outputTokens ?? 8192;
      const raw = step.usage.raw as Record<string, unknown> | undefined;
      const searchUsage = raw?.server_tool_use_details as { web_search_requests?: number } | undefined;
      const count = searchUsage?.web_search_requests;
      hasElectionData ||= step.toolCalls.some(call => ['get_visualisation_data', 'get_area_summary'].includes(call.toolName));
      hasVisual ||= step.toolCalls.some(call => call.toolName === 'render_visualisation');
      if (native) {
        // The single search-enabled request enforces the turn cap even if usage is omitted.
        if (requests.at(-1)?.nativeSearchEnabled) searchAccountingKnown = typeof count === 'number';
        searches += count ?? 0;
        if (searches > 2) throw new Error('Provider exceeded native search cap');
      }
      steps.push({ elapsedMs: Date.now() - started, finishReason: step.finishReason,
        usage: step.usage, provider: step.providerMetadata?.openrouter?.provider,
        toolCalls: step.toolCalls.map(call => call.toolName),
        toolErrors: step.toolResults.filter(result => 'isError' in result && result.isError).length });
      console.log(JSON.stringify({ mode, step: steps.length, elapsedMs: Date.now() - started,
        searchCount: count ?? 'missing', costUsd: raw?.cost, tools: step.toolCalls.map(call => call.toolName) }));
    },
    onError: () => {},
  });
  for await (const part of result.stream) {
    if (part.type === 'text-delta') { firstTextMs ??= Date.now() - started; answer += part.text; }
    else if (part.type === 'source' && part.sourceType === 'url') {
      sources.push({ url: part.url, title: part.title, annotations: part.providerMetadata?.openrouter });
    } else if (part.type === 'error') {
      error = 'Provider/SDK stream error';
    } else if (part.type === 'tool-error') {
      console.log(JSON.stringify({ mode, toolError: part.toolName }));
    }
  }
  finishReason = await result.finishReason;
  if (signal.aborted) error = '90-second deadline reached';
} catch (caught) {
  error = signal.aborted ? '90-second deadline reached' : `Probe stopped (${caught instanceof Error ? caught.name : 'unknown'})`;
} finally {
  await session.close();
  await proxy.dispose();
  const elapsedMs = Date.now() - started;
  const allUsage = [...steps.map(step => (step.usage as { raw?: Record<string, unknown> }).raw ?? {}), ...researchUsage];
  const costsKnown = allUsage.length > 0 && allUsage.every(usage => typeof usage.cost === 'number');
  const costUsd = costsKnown ? allUsage.reduce((sum, usage) => sum + Number(usage.cost), 0) : null;
  const billedSearches = allUsage.reduce((sum, usage) => sum +
    Number((usage.server_tool_use_details as { web_search_requests?: number } | undefined)?.web_search_requests ?? 0), 0);
  const report = { mode, model: SEARCH_MODEL, question, at: new Date(started).toISOString(), elapsedMs,
    firstTextMs, finishReason, error, costUsd, billedSearches, searchAccountingKnown,
    answer, sources, steps, requests, researchUsage, events };
  writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, mode, elapsedMs, finishReason, error, costUsd, billedSearches,
    sources: sources.length, visuals: events.filter(event => event.type === 'artifact' && event.artifact.kind === 'visual').length }));
}
