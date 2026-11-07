import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { simulateReadableStream } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { migrateD1 } from '../scripts/lib/migrations.ts';
import { createChatTools } from '../src/lib/chat/tools.ts';
import { streamChat } from '../src/lib/chat/agent.ts';
import { reserveTurn, turnLimits } from '../src/lib/chat/limits.ts';
import type { ChatEvent } from '../src/lib/chat/contracts.ts';
import type { McpBindings } from '../src/lib/mcp/data.ts';

const documentation = readFileSync(new URL('../docs/api.md', import.meta.url), 'utf8');
const base = { origin: 'https://counted.co.za', documentation, renderImage: () => new Uint8Array([137, 80, 78, 71]),
  runAnalysis: () => 42, signal: new AbortController().signal };

test('chat discovers the real MCP tools, validates calls and blocks nonexistent analysis inputs', async () => {
  const events: ChatEvent[] = [];
  const session = await createChatTools({ ...base, bindings: { RESULTS_DB: null!, RAW_RESULTS: null! }, emit: event => events.push(event) });
  const options = { toolCallId: 'test', messages: [], context: undefined };
  try {
    assert.ok(session.tools.render_visualisation);
    assert.ok(session.tools.get_visualisation_data);
    assert.equal(session.tools.render_council_image, undefined);
    assert.ok(session.tools.list_area_summaries);
    assert.ok(session.tools.search_news);
    for (const definition of Object.values(session.tools)) {
      const { asSchema } = await import('ai');
      const schema = await asSchema(definition.inputSchema).jsonSchema;
      assert.ok((schema.required as string[]).includes('summary_for_user'));
    }
    const result = await session.tools.get_government_history!.execute!({ municipality: 'EC101', summary_for_user: 'Checking the government history' }, options) as { dataset_id: string; data: { currentStatus: string } };
    assert.equal(result.data.currentStatus, 'unverified');
    assert.equal(result.dataset_id, 'data_1');
    assert.ok(events.some(event => event.type === 'status' && event.summary_for_user === 'Checking the government history'));
    await assert.rejects(async () => session.tools.get_government_history!.execute!({ municipality: 'EC101' }, options));
    const invalid = await session.tools.get_results!.execute!({ year: 2024, level: 'ward', area_id: '../private', summary_for_user: 'Checking election results' }, options) as { error: string };
    assert.ok(invalid.error);
    await assert.rejects(async () => session.tools.analyse_data!.execute!({ summary_for_user: 'Calculating the election totals', dataset_ids: ['missing'], code: 'return 1;' }, options), /Fetch the dataset/);
    const calculated = await session.tools.analyse_data!.execute!({ summary_for_user: 'Calculating the election totals', dataset_ids: ['data_1'], code: 'return 42;' }, options) as { result: number };
    assert.equal(calculated.result, 42);
    assert.ok(events.some(event => event.type === 'artifact' && event.artifact.kind === 'analysis'));
  } finally { await session.close(); }
});

test('the agent streams a tool-backed answer and redacts provider failures', async () => {
  const usage = { inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
    outputTokens: { total: 10, text: 10, reasoning: undefined } };
  const model = new MockLanguageModelV4({ doStream: [
    { stream: simulateReadableStream({ chunks: [
      { type: 'tool-call', toolCallId: 'a', toolName: 'get_government_history', input: '{"municipality":"EC101","summary_for_user":"Checking the government history"}' },
      { type: 'finish', finishReason: { unified: 'tool-calls', raw: undefined }, usage },
    ] }) },
    { stream: simulateReadableStream({ chunks: [
      { type: 'text-start', id: 'answer' }, { type: 'text-delta', id: 'answer', delta: 'Government is unverified.' },
      { type: 'text-end', id: 'answer' }, { type: 'finish', finishReason: { unified: 'stop', raw: undefined }, usage },
    ] }) },
  ] });
  const options = { ...base, bindings: { RESULTS_DB: null!, RAW_RESULTS: null! } as McpBindings,
    messages: [{ role: 'user' as const, content: 'What is the government in EC101?' }], model };
  const response = streamChat(options);
  const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line) as ChatEvent);
  assert.ok(events.some(event => event.type === 'text' && event.text.includes('unverified')));
  assert.equal(events.at(-1)!.type, 'done');
  assert.equal(model.doStreamCalls.length, 2);
  assert.ok(JSON.stringify(model.doStreamCalls[1]!.prompt).includes('unverified'));
  const failed = await streamChat({ ...options, model: new MockLanguageModelV4({ doStream: async () => { throw new Error('private-api-key-and-prompt'); } }) }).text();
  assert.match(failed, /could not finish/);
  assert.doesNotMatch(failed, /private-api-key/);
  const exhausted = await streamChat({ ...options, model: new MockLanguageModelV4({ doStream: {
    stream: simulateReadableStream({ chunks: [
      { type: 'finish', finishReason: { unified: 'length', raw: 'length' }, usage },
    ] }),
  } }) }).text();
  assert.match(exhausted, /generation limit/);
  assert.doesNotMatch(exhausted, /"type":"done"/);
});

test('D1 usage caps stay bounded under concurrency without storing raw IP addresses', async () => {
  assert.deepEqual(turnLimits('25'), { daily: 25, visitor: 10 });
  assert.deepEqual(turnLimits('25', 100), { daily: 100, visitor: 100 });
  assert.deepEqual(turnLimits('25', 1000), { daily: 25, visitor: 10 });
  const directory = mkdtempSync(join(tmpdir(), 'counted-chat-'));
  const proxy = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc', persist: { path: directory }, remoteBindings: false });
  try {
    await migrateD1(proxy.env.RESULTS_DB);
    const now = Date.parse('2026-11-07T12:00:00Z');
    const results = await Promise.all(Array.from({ length: 12 }, (_, i) => reserveTurn(proxy.env.RESULTS_DB, `192.0.2.${i}`, 'test-key', 5, now)));
    assert.equal(results.filter(Boolean).length, 5);
    const rows = await proxy.env.RESULTS_DB.prepare('SELECT * FROM chat_usage').all();
    assert.doesNotMatch(JSON.stringify(rows.results), /192\.0\.2/);
    assert.equal(rows.results.find(row => row.bucket === 'global')!.turns, 5);
    assert.equal(await reserveTurn(proxy.env.RESULTS_DB, '192.0.2.1', 'test-key', 5, now + 86400_000), true);
    const localDay = now + 2 * 86400_000;
    for (let i = 0; i < 10; i++) assert.equal(await reserveTurn(proxy.env.RESULTS_DB, 'local-test', 'test-key', 100, localDay + i * 60_000), true);
    assert.equal(await reserveTurn(proxy.env.RESULTS_DB, 'local-test', 'test-key', 100, localDay + 11 * 60_000), false, 'production visitor limit remains ten');
    assert.equal(await reserveTurn(proxy.env.RESULTS_DB, 'local-test', 'test-key', 100, localDay + 12 * 60_000, 100), true, 'the authorised local allowance retains existing counters');
  } finally { await proxy.dispose(); rmSync(directory, { recursive: true, force: true }); }
});

test('news research cannot exceed one request even when tool calls run concurrently', async () => {
  let searches = 0;
  const events: ChatEvent[] = [];
  const session = await createChatTools({ ...base, bindings: { RESULTS_DB: null!, RAW_RESULTS: null! },
    emit: event => events.push(event), researchNews: async () => {
      searches++;
      return { text: 'Reporting.', citations: [{ title: 'News', url: 'https://news.example', start: 0, end: 10 }], fetchedAt: '2026-11-07' };
    } });
  try {
    const result = await Promise.allSettled(Array.from({ length: 3 }, () => session.tools.search_news!.execute!(
      { query: 'Coalition news', summary_for_user: 'Finding recent coalition reporting' }, { toolCallId: 'news', messages: [], context: undefined })));
    assert.equal(searches, 1);
    assert.equal(result.filter(value => value.status === 'fulfilled').length, 1);
    assert.equal(events.filter(event => event.type === 'artifact' && event.artifact.kind === 'research').length, 1);
  } finally { await session.close(); }
});

test('the main model receives only the remaining total output budget', async () => {
  const step = (id: string, outputTokens: number) => ({ stream: simulateReadableStream({ chunks: [
    { type: 'tool-call' as const, toolCallId: id, toolName: 'get_government_history', input: '{"municipality":"EC101","summary_for_user":"Checking the government history"}' },
    { type: 'finish' as const, finishReason: { unified: 'tool-calls' as const, raw: undefined },
      usage: { inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: outputTokens, text: 0, reasoning: outputTokens } } },
  ] }) });
  const model = new MockLanguageModelV4({ doStream: [step('one', 8192), step('two', 4096)] });
  const response = await streamChat({ ...base, bindings: { RESULTS_DB: null!, RAW_RESULTS: null! },
    messages: [{ role: 'user', content: 'Compare the government history.' }], model }).text();
  assert.equal(model.doStreamCalls.length, 2);
  assert.equal(model.doStreamCalls[0]!.maxOutputTokens, 8192);
  assert.equal(model.doStreamCalls[1]!.maxOutputTokens, 4096);
  assert.match(response, /could not finish/);
  assert.doesNotMatch(response, /"type":"done"/);
});
