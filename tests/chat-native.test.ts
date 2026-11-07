import test from 'node:test';
import assert from 'node:assert/strict';
import { NewsEvidence, articleText, newsUrl, readNewsArticle } from '../src/lib/chat/news-evidence.ts';
import { readNativeResponse, runNativeChat, type NativeStep } from '../src/lib/chat/native-agent.ts';
import type { ChatEvent } from '../src/lib/chat/contracts.ts';

const url = 'https://www.timeslive.co.za/politics/zille-interview/';
const quote = 'Zille said her preferred partners were ActionSA or the ANC';
const body = `${quote}. This was her own negotiating preference, not agreement by either party. The article does not describe Mashaba’s conditions. Negotiations remained undecided at the time of publication, and the council figures were still provisional. Further discussion would be needed before any government was agreed.`;
const article: typeof fetch = async () => new Response(`<article><p>${body}</p></article>`, { headers: { 'Content-Type': 'text/html' } });
const signal = () => new AbortController().signal;
const call = (name: string, args: unknown, id = name) => ({ type: 'function_call', id: `fc_${id}`, call_id: id, name, arguments: JSON.stringify(args) });
const response = (output: unknown[], searches = 0, tokens = 100) => Response.json({ status: 'completed', output,
  max_tool_calls: 2, usage: { output_tokens: tokens, cost: 0.001, server_tool_use_details: { web_search_requests: searches } } });
const answer = { summary_for_user: 'Explaining the coalition evidence', paragraphs: [
  { kind: 'news', text: 'Zille favoured ActionSA or the ANC; that was her preference, not a deal.', sources: [{ source_id: 'news_1', quote }] },
] };

test('article reads reject unsafe/disallowed destinations, redirects, oversized bodies and HTTP errors', async () => {
  for (const value of ['http://timeslive.co.za/', 'https://127.0.0.1/', 'https://timeslive.co.za.evil.test/', 'https://a:b@timeslive.co.za/', 'https://timeslive.co.za:8080/']) assert.equal(newsUrl(value), null);
  assert.equal(newsUrl(`${url}?utm_source=openai&keep=1#frag`), `${url}?keep=1`);
  let requests = 0;
  await assert.rejects(readNewsArticle(url, signal(), async () => {
    requests++; return new Response(null, { status: 302, headers: { location: 'https://127.0.0.1/private' } });
  }), /host or redirect/);
  assert.equal(requests, 1);
  await assert.rejects(readNewsArticle(url, signal(), async () => new Response('x'.repeat(1_500_001), { headers: { 'content-type': 'text/html' } })), /read limit/);
  await assert.rejects(readNewsArticle(url, signal(), async () => new Response('private provider message', { status: 403 })), /could not be read/);
});

test('source extraction prefers article content and citation registry rejects invented quotes, URLs and IDs', async () => {
  assert.equal(articleText('<nav>unrelated headline</nav><article>Actual &amp; supported “text”.</article><script>evil()</script>'), 'Actual & supported “text”.');
  assert.equal(articleText('<script type="application/ld+json">{"articleBody":"The actual article."}</script><main>Teaser</main>'), 'The actual article.');
  const evidence = new NewsEvidence();
  await assert.rejects(evidence.read(url, signal(), article), /returned by this turn/);
  evidence.discover(url, 'Zille interview');
  const source = await evidence.read(url, signal(), article);
  assert.equal(source.id, 'news_1');
  const grounded = evidence.answer(answer as Parameters<NewsEvidence['answer']>[0]);
  assert.match(grounded.text, /\[TimesLIVE\]\(https:\/\/www.timeslive.co.za\/politics\/zille-interview\/\)/);
  assert.equal(grounded.evidence![0]!.quote, quote);
  const wrong = structuredClone(answer);
  wrong.paragraphs[0]!.sources[0]!.quote = 'Mashaba will only work with the DA without Zille';
  assert.throws(() => evidence.answer(wrong as Parameters<NewsEvidence['answer']>[0]), /absent/);
  wrong.paragraphs[0]!.sources[0]!.source_id = 'news_99';
  assert.throws(() => evidence.answer(wrong as Parameters<NewsEvidence['answer']>[0]), /Read the article/);
  assert.throws(() => evidence.answer({ ...answer, paragraphs: [{ kind: 'news', text: 'A new coalition was agreed.', sources: [] }] }), /Every news claim/);
  assert.throws(() => evidence.answer({ ...answer, paragraphs: [{ kind: 'analysis', text: '[Invented](https://evil.example)', sources: [] }] }), /source IDs/);
});

test('article read cap is atomic across parallel calls and repeat URLs reuse the original evidence', async () => {
  const evidence = new NewsEvidence();
  const urls = Array.from({ length: 4 }, (_, i) => `${url}${i}`);
  urls.forEach(url => evidence.discover(url));
  let fetched = 0;
  const fetcher: typeof fetch = async (...args) => { fetched++; return article(...args); };
  const results = await Promise.allSettled(urls.map(url => evidence.read(url, signal(), fetcher)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 3);
  assert.equal(fetched, 3);
  await evidence.read(urls[0]!, signal(), fetcher);
  assert.equal(fetched, 3);
});

test('native replay retains search, annotations and encrypted reasoning across application tool calls', async () => {
  const events: ChatEvent[] = [], metrics: NativeStep[] = [], requests: Record<string, unknown>[] = [];
  const state = [
    { type: 'reasoning', id: 'rs_one', encrypted_content: 'opaque-private-state', summary: [] },
    { type: 'web_search_call', id: 'ws_one', status: 'completed', action: { type: 'search', query: 'Johannesburg coalition', sources: [{ url, title: 'Zille interview' }] } },
    { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Unpublished draft', annotations: [{ type: 'url_citation', url, start_index: 0, end_index: 5 }] }] },
  ];
  await runNativeChat({ apiKey: 'secret', modelId: 'openai/gpt-6.1-terra', signal: signal(),
    bindings: { RESULTS_DB: null!, RAW_RESULTS: null! }, origin: 'https://counted.co.za', documentation: 'Docs',
    renderImage: () => new Uint8Array(), runAnalysis: () => 42,
    messages: [{ role: 'user', content: 'Which coalitions are possible?' }], emit: event => events.push(event), articleRequest: article,
    onStep: step => metrics.push(step),
    request: async (_url, init) => {
      const request = JSON.parse(String(init!.body)); requests.push(request);
      assert.equal(request.store, false);
      assert.equal(request.previous_response_id, undefined);
      assert.deepEqual(request.provider.only, ['openai']);
      if (requests.length === 1) return response([...state,
        call('read_news_sources', { summary_for_user: 'Reading the coalition report', urls: [url] }),
        call('get_government_history', { summary_for_user: 'Checking the recorded government', municipality: 'EC101' }),
      ], 2);
      assert.deepEqual(request.input.slice(1, 4), state);
      assert.match(JSON.stringify(request.input), /Zille said her preferred partners/);
      assert.equal(request.tools.some((tool: { type: string }) => tool.type === 'openrouter:web_search'), false, 'search budget stays exhausted after handoff');
      assert.equal(request.input.filter((item: { type: string }) => item.type === 'function_call_output').length, 2);
      return response([call('answer_question', answer)]);
    },
  });
  assert.equal(requests.length, 2);
  assert.equal(metrics[0]!.searchCalls, 2);
  assert.equal(events.at(-1)!.type, 'done');
  assert.doesNotMatch(JSON.stringify(events), /opaque-private-state|Unpublished draft|secret/);
  assert.equal(events.filter(event => event.type === 'text').length, 1);
  assert.ok(events.some(event => event.type === 'artifact' && event.artifact.kind === 'research' && event.artifact.evidence?.length === 1));
});

test('native response parser handles fragmented SSE and refuses incomplete streams', async () => {
  const frames = `event: response.web_search_call.searching\r\ndata: {"type":"response.web_search_call.searching"}\r\n\r\ndata: ${JSON.stringify({ type: 'response.completed', response: { status: 'completed', output: [], usage: { output_tokens: 1 } } })}\r\n\r\n`;
  const progress: string[] = [];
  const bytes = new TextEncoder().encode(frames);
  const stream = new ReadableStream<Uint8Array>({ start(controller) { for (let i = 0; i < bytes.length; i++) controller.enqueue(bytes.slice(i, i + 1)); controller.close(); } });
  assert.equal((await readNativeResponse(new Response(stream), phase => progress.push(phase))).status, 'completed');
  assert.ok(progress.includes('search'));
  await assert.rejects(readNativeResponse(new Response('data: [DONE]\n\n'), () => {}), /without a completed/);
});

test('rejected citation cannot publish draft text and can be repaired in the next step', async () => {
  const events: ChatEvent[] = [];
  let step = 0;
  const wrong = structuredClone(answer);
  wrong.paragraphs[0]!.sources[0]!.quote = 'Mashaba announced that he accepts Zille as mayor';
  await runNativeChat({ apiKey: 'secret', modelId: 'openai/gpt-6.1-terra', signal: signal(),
    bindings: { RESULTS_DB: null!, RAW_RESULTS: null! }, origin: 'https://counted.co.za', documentation: 'Docs',
    renderImage: () => new Uint8Array(), runAnalysis: () => 42, articleRequest: article,
    messages: [{ role: 'user', content: 'Check coalition positions.' }], emit: event => events.push(event),
    request: async (_url, init) => {
      step++;
      if (step === 1) return response([{ type: 'web_search_call', status: 'completed' }, call('read_news_sources', { summary_for_user: 'Reading the report', urls: [url] })], 1);
      if (step === 2) return response([call('answer_question', wrong)]);
      const input = JSON.parse(String(init!.body)).input;
      assert.match(input.at(-1).output, /supporting quote is absent/);
      assert.equal(events.filter(event => event.type === 'text').length, 0);
      return response([call('answer_question', answer)]);
    },
  });
  assert.equal(step, 3);
  assert.equal(events.at(-1)!.type, 'done');
  assert.doesNotMatch(JSON.stringify(events), /Mashaba announced/);
});

test('native runner fails closed on excessive search usage, incomplete output and provider errors', async () => {
  for (const providerResponse of [
    () => response([{ type: 'web_search_call' }], 3),
    () => Response.json({ status: 'incomplete', output: [], usage: { output_tokens: 10 } }),
    () => Response.json({ error: 'secret credentials and prompt' }, { status: 429 }),
  ]) {
    const events: ChatEvent[] = [];
    let requests = 0;
    await runNativeChat({ apiKey: 'secret', modelId: 'openai/gpt-6.1-terra', signal: signal(),
      bindings: { RESULTS_DB: null!, RAW_RESULTS: null! }, origin: 'https://counted.co.za', documentation: 'Docs',
      renderImage: () => new Uint8Array(), runAnalysis: () => 42,
      messages: [{ role: 'user', content: 'Check coalition positions.' }], emit: event => events.push(event),
      request: async () => { requests++; return providerResponse(); },
    });
    assert.equal(requests, 1);
    assert.equal(events.at(-1)!.type, 'error');
    assert.equal(events.some(event => event.type === 'text' || event.type === 'done'), false);
    assert.doesNotMatch(JSON.stringify(events), /secret credentials/);
  }
});
