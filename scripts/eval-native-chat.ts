/** Paid manual probe of the SAME native runner used by the website. No Astro server is started.
 * node --env-file=.env scripts/eval-native-chat.ts /tmp/native-chat.json [question]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import variant from '@jitl/quickjs-wasmfile-release-sync';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import { runNativeChat, type NativeStep } from '../src/lib/chat/native-agent.ts';
import { analyse } from '../src/lib/chat/sandbox.ts';
import { SEARCH_MODEL } from '../src/lib/chat/search.ts';
import type { ChatEvent } from '../src/lib/chat/contracts.ts';

const [output, question = 'Which parties could form a majority in Johannesburg in 2026? Show me the council seats.'] = process.argv.slice(2);
if (!output) throw new Error('Pass a report path; this manual probe incurs OpenRouter charges.');
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');
const started = Date.now(), steps: NativeStep[] = [], events: ChatEvent[] = [];
const proxy = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc', persist: { path: resolve('.wrangler/state/v3') }, remoteBindings: false });
try {
  const quickjs = await newQuickJSWASMModuleFromVariant(variant);
  await runNativeChat({ apiKey, modelId: SEARCH_MODEL, messages: [{ role: 'user', content: question }],
    bindings: proxy.env, origin: 'https://counted.co.za', documentation: readFileSync('docs/api.md', 'utf8'), signal: new AbortController().signal,
    runAnalysis: (code, data, signal) => analyse(quickjs, code, data, signal),
    renderImage: () => { throw new Error('This probe uses interactive charts.'); },
    request: async (url, init) => {
      const response = await fetch(url, init);
      if (!response.ok) console.log(JSON.stringify({ providerStatus: response.status }));
      return response;
    },
    emit: event => {
      events.push(event);
      if (event.type === 'status' || event.type === 'error') console.log(JSON.stringify({ elapsedMs: Date.now() - started, ...event }));
    },
    onStep: step => { steps.push(step); console.log(JSON.stringify({ step: step.step, tools: step.toolCalls, searches: step.searchCalls, cost: step.usage.cost, replayedItems: step.replayedItems })); },
  });
} finally {
  await proxy.dispose();
  const report = { question, model: SEARCH_MODEL, at: new Date(started).toISOString(), elapsedMs: Date.now() - started,
    costUsd: steps.length && steps.every(step => typeof step.usage.cost === 'number') ? steps.reduce((sum, step) => sum + step.usage.cost!, 0) : null,
    searches: steps.reduce((sum, step) => sum + step.searchCalls, 0),
    answer: events.filter(event => event.type === 'text').map(event => event.text).join(''), steps, events };
  writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, elapsedMs: report.elapsedMs, costUsd: report.costUsd, searches: report.searches, result: events.at(-1)?.type }));
}
