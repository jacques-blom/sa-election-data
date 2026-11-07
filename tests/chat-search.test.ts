import test from 'node:test';
import assert from 'node:assert/strict';
import { searchNews } from '../src/lib/chat/search.ts';
import { researchMarkdown } from '../src/lib/chat/citations.ts';

const url = 'https://news.example/report';
const text = 'Talks are continuing. citeturn0search0';
const evidence = () => ({ status: 'completed', max_tool_calls: 2,
  usage: { server_tool_use_details: { web_search_requests: 1 } },
  output: [{ type: 'web_search_call', status: 'completed' },
    { type: 'message', content: [{ type: 'output_text', text,
      annotations: [{ type: 'url_citation', url, title: 'Coalition reporting', start_index: 21, end_index: text.length }] }] }],
});

test('news uses only native OpenAI through OpenRouter and preserves citation evidence', async () => {
  const research = await searchNews('private-key', 'South African coalitions', new AbortController().signal, async (input, options) => {
    assert.equal(input, 'https://openrouter.ai/api/v1/responses');
    const body = JSON.parse(String(options!.body));
    assert.deepEqual(body.provider.only, ['openai']);
    assert.equal(body.provider.allow_fallbacks, false);
    assert.deepEqual(body.tools, [{ type: 'openrouter:web_search', parameters: { engine: 'native' } }]);
    assert.equal(body.max_tool_calls, 2);
    assert.equal(body.max_output_tokens, 4096);
    assert.equal(body.store, false);
    assert.equal(body.plugins, undefined);
    return Response.json(evidence());
  });
  assert.equal(research.citations[0]!.url, url);
  assert.match(researchMarkdown(research), /\[1\]\(https:\/\/news.example\/report\)/);
  assert.doesNotMatch(researchMarkdown(research), /cite/);
});

test('search rejects uncited, truncated, oversized and over-budget results without leaking provider errors', async () => {
  for (const change of [
    { status: 'incomplete' }, { max_tool_calls: undefined },
    { usage: { server_tool_use_details: { web_search_requests: 3 } } },
    { output: [{ type: 'message', content: [{ type: 'output_text', text: 'An unsupported claim.' }] }] },
  ]) {
    await assert.rejects(searchNews('private-key', 'query', new AbortController().signal,
      async () => Response.json({ ...evidence(), ...change })), /unavailable or incomplete/);
  }
  await assert.rejects(searchNews('private-key', 'query', new AbortController().signal,
    async () => new Response('x'.repeat(256001))), /unavailable or incomplete/);
  let attempts = 0;
  await assert.rejects(searchNews('private-key', 'query', new AbortController().signal, async () => {
    attempts++;
    return Response.json({ error: 'private-key and private prompt' }, { status: 429 });
  }), error => error instanceof Error && !error.message.includes('private-key'));
  assert.equal(attempts, 1);
});

test('search never treats unsafe citation URLs as evidence', async () => {
  const data = evidence();
  data.output[1]!.content![0]!.annotations[0]!.url = 'javascript:alert(1)';
  await assert.rejects(searchNews('private-key', 'query', new AbortController().signal,
    async () => Response.json(data)), /unavailable or incomplete/);
});
