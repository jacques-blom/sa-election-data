import test from 'node:test';
import assert from 'node:assert/strict';
import { newsContext } from '../src/lib/news/context.ts';
import { fetchNewsFeed, parseNewsFeed, type NewsData } from '../src/lib/news/feed.ts';
import { newsResponse, NEWS_FRESH_MS } from '../src/lib/news/service.ts';
import type { NewsStore, StoredNews } from '../src/lib/news/store.ts';

const article = (title = 'Coalition & council', link = 'https://example.com/politics') => ({
  title, link, source: { name: 'Local News' }, iso_date: '2026-11-06T10:00:00Z',
});
const feed = { search_metadata: { status: 'Success' }, news_results: [article()] };
const context = newsContext('coalition', 'swellendam')!;
const now = Date.parse('2026-11-06T12:00:00Z');
const apiKey = 'test-only-secret';
class MemoryCache {
  entries = new Map<string, Response>();
  async match(key: Request) { return this.entries.get(key.url)?.clone(); }
  async put(key: Request, value: Response) { this.entries.set(key.url, value.clone()); }
}
class MemoryStore implements NewsStore {
  entries = new Map<string, { entry: StoredNews; version: string }>();
  nextVersion = 0;
  async read(key: string) { return structuredClone(this.entries.get(key) ?? null); }
  async write(key: string, entry: StoredNews, version: string | null) {
    if ((this.entries.get(key)?.version ?? null) !== version) return null;
    const next = String(++this.nextVersion);
    this.entries.set(key, { entry: structuredClone(entry), version: next });
    return next;
  }
}

test('only known page contexts create South African Google searches', () => {
  assert.equal(context.query, '"Swellendam" coalition after:2026-11-04');
  const url = new URL(context.searchUrl);
  assert.equal(url.hostname, 'news.google.com');
  assert.equal(url.searchParams.get('ceid'), 'ZA:en');
  assert.match(newsContext('municipality', 'cape-town')!.query, /Cape Town.*local elections/);
  assert.match(newsContext('province', 'western-cape')!.query, /Western Cape/);
  assert.ok(newsContext('national'));
  for (const [scope, area] of [['national', 'arbitrary'], ['province', 'unknown'], ['municipality', 'calvinia'], ['coalition', 'https://example.com'], ['invalid', '']]) {
    assert.equal(newsContext(scope!, area), null);
  }
});

test('SerpAPI articles, highlights and stories retain order without leaking provider metadata', () => {
  const articles = parseNewsFeed({ ...feed, search_parameters: { api_key: apiKey }, news_results: [
    article('<b>First</b>'),
    { title: 'Cluster', highlight: article('Highlight', 'https://example.com/highlight'), stories: [
      article('Duplicate', 'https://example.com/highlight'),
      { ...article('Old story', 'https://example.com/old'), iso_date: '2023-01-01T10:00:00Z' },
      { ...article('Undated', 'https://example.com/undated'), iso_date: 'invalid' },
    ] },
    article('Unsafe', 'javascript:alert(1)'), article('Credentials', 'https://user:pass@example.com'), null,
  ] });
  assert.deepEqual(articles.map(a => a.title), ['<b>First</b>', 'Highlight', 'Old story', 'Undated']);
  assert.equal(articles[0]!.source, 'Local News');
  assert.equal(articles[2]!.publishedAt, '2023-01-01T10:00:00.000Z');
  assert.equal(articles[3]!.publishedAt, null);
  assert.ok(!JSON.stringify(articles).includes(apiKey));
});

test('empty successful searches are valid; provider errors and malformed payloads fail', () => {
  assert.deepEqual(parseNewsFeed({ ...feed, news_results: [] }), []);
  assert.deepEqual(parseNewsFeed({ search_metadata: { status: 'Success' }, error: "Google News hasn't returned any results for this query." }), []);
  for (const payload of [null, [], {}, { news_results: {} }, { ...feed, error: 'Invalid API key' }, { ...feed, search_metadata: { status: 'Processing' } }]) {
    assert.throws(() => parseNewsFeed(payload));
  }
});

test('authenticated server requests preserve locale, query and provider cache', async () => {
  const articles = await fetchNewsFeed(context.query, apiKey, async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin + url.pathname, 'https://serpapi.com/search.json');
    assert.equal(url.searchParams.get('api_key'), apiKey);
    assert.equal(url.searchParams.get('engine'), 'google_news');
    assert.equal(url.searchParams.get('q'), context.query);
    assert.equal(url.searchParams.get('gl'), 'za');
    assert.equal(url.searchParams.get('hl'), 'en');
    assert.equal(url.searchParams.has('no_cache'), false);
    assert.equal(init?.redirect, 'manual');
    return Response.json(feed);
  });
  assert.equal(articles.length, 1);
  await assert.rejects(fetchNewsFeed(context.query, '', async () => { assert.fail('Missing keys must not issue requests'); }), /not configured/);
});

test('response limits, HTTP errors and transport errors cannot leak the key', async () => {
  await assert.rejects(fetchNewsFeed(context.query, apiKey, async () => new Response(null, { status: 302 })), /HTTP 302/);
  await assert.rejects(fetchNewsFeed(context.query, apiKey, async () => new Response(null, { status: 429 })), error => {
    assert.equal((error as { retryMs: number }).retryMs, 3_600_000); return true;
  });
  await assert.rejects(fetchNewsFeed(context.query, apiKey, async () => { throw new Error(`Failed URL ?api_key=${apiKey}`); }), error => {
    assert.ok(!String(error).includes(apiKey)); return true;
  });
  await assert.rejects(fetchNewsFeed(context.query, apiKey, async () => new Response(apiKey)), /request failed/);
  let cancelled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(600_000)); }, cancel() { cancelled = true; } });
  await assert.rejects(fetchNewsFeed(context.query, apiKey, async () => new Response(stream)), /too large/);
  assert.equal(cancelled, true);
});

test('edge and shared caches reuse a search across regions for one hour', async () => {
  const cache = new MemoryCache(), store = new MemoryStore(); let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return Response.json(feed); };
  const options = { apiKey, cache, store, fetcher, now };
  await newsResponse(context, 'https://counted.co.za', options);
  const cached = await newsResponse(context, 'https://counted.co.za', { ...options, now: now + 60_000 });
  assert.equal(cached.headers.get('Cache-Control'), 'public, max-age=3540');
  const otherRegion = await newsResponse(context, 'https://counted.co.za', { ...options, cache: new MemoryCache(), now: now + 120_000 });
  assert.equal((await otherRegion.json() as NewsData).articles.length, 1);
  assert.equal(calls, 1);
  await newsResponse(context, 'https://counted.co.za', { ...options, now: now + NEWS_FRESH_MS });
  assert.equal(calls, 2);
});

test('one visitor owns a cold refresh and interrupted refreshes recover after the lease', async () => {
  const store = new MemoryStore(); let calls = 0;
  let finish!: (response: Response) => void;
  const started = Promise.withResolvers<void>();
  const fetcher: typeof fetch = async () => { calls++; started.resolve(); return new Promise(resolve => { finish = resolve; }); };
  const first = newsResponse(context, 'https://counted.co.za', { apiKey, store, fetcher, now });
  await started.promise;
  const waiting = await newsResponse(context, 'https://counted.co.za', { apiKey, store, fetcher, now });
  assert.equal(waiting.status, 503); assert.equal(waiting.headers.get('Retry-After'), '2'); assert.equal(calls, 1);
  const recovered = await newsResponse(context, 'https://counted.co.za', { apiKey, store, now: now + 21_000,
    fetcher: async () => Response.json({ ...feed, news_results: [article('Recovered')] }) });
  assert.equal(recovered.status, 200);
  finish(Response.json(feed)); await first;
  assert.equal((await store.read(context.key))!.entry.data!.articles[0]!.title, 'Recovered', 'The old lease cannot overwrite its successor');
});

test('failures retain labelled saved headlines and share backoff without extending their age', async () => {
  const store = new MemoryStore(); let calls = 0;
  await newsResponse(context, 'https://counted.co.za', { apiKey, store, now, fetcher: async () => Response.json(feed) });
  const fetcher: typeof fetch = async () => { calls++; return new Response(null, { status: 429 }); };
  const stale = await newsResponse(context, 'https://counted.co.za', { apiKey, store, fetcher, now: now + NEWS_FRESH_MS });
  const data = await stale.json() as NewsData;
  assert.equal(data.stale, true); assert.equal(data.fetchedAt, new Date(now).toISOString());
  await newsResponse(context, 'https://counted.co.za', { apiKey, store, fetcher, now: now + NEWS_FRESH_MS + 120_000 });
  assert.equal(calls, 1);
  const expired = await newsResponse(context, 'https://counted.co.za', { apiKey, store, fetcher, now: now + 24 * 60 * 60_000 });
  assert.equal(expired.status, 503);
});

test('shared storage outages never issue uncached paid requests', async () => {
  const store: NewsStore = { read: async () => { throw new Error('storage unavailable'); }, write: async () => { assert.fail(); } };
  const response = await newsResponse(context, 'https://counted.co.za', { apiKey, store, now, fetcher: async () => { assert.fail('Must not spend credits'); } });
  assert.equal(response.status, 503);
});
