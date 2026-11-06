import test from 'node:test';
import assert from 'node:assert/strict';
import { newsContext } from '../src/lib/news/context.ts';
import { fetchNewsFeed, parseNewsFeed, type NewsData } from '../src/lib/news/feed.ts';
import { newsResponse, NEWS_FRESH_MS } from '../src/lib/news/service.ts';

const item = (title: string, link: string, date = 'Fri, 06 Nov 2026 10:00:00 GMT') => `<item><title>${title}</title><link>${link}</link><source url="https://example.com">Local &amp; News</source><pubDate>${date}</pubDate></item>`;
const rss = (items = '') => `<?xml version="1.0"?><rss version="2.0"><channel><title>Google News</title>${items}</channel></rss>`;
const feed = rss(item('Coalition &amp; council - Local &amp; News', 'https://news.google.com/rss/articles/one'));
const context = newsContext('coalition', 'swellendam')!;
const now = Date.parse('2026-11-06T12:00:00Z');
class MemoryCache {
  entries = new Map<string, Response>();
  async match(key: Request) { return this.entries.get(key.url)?.clone(); }
  async put(key: Request, value: Response) { this.entries.set(key.url, value.clone()); }
}

test('only known page contexts create South African Google searches', () => {
  assert.equal(context.query, '"Swellendam" coalition after:2026-11-04');
  const url = new URL(context.feedUrl);
  assert.equal(url.hostname, 'news.google.com');
  assert.equal(url.searchParams.get('ceid'), 'ZA:en');
  assert.match(newsContext('municipality', 'cape-town')!.query, /Cape Town.*local elections/);
  assert.match(newsContext('province', 'western-cape')!.query, /Western Cape/);
  assert.ok(newsContext('national'));
  for (const [scope, area] of [['national', 'arbitrary'], ['province', 'unknown'], ['municipality', 'calvinia'], ['coalition', 'https://example.com'], ['invalid', '']]) {
    assert.equal(newsContext(scope!, area), null);
  }
});

test('preserves Google ordering and unrelated/old/undated articles, decodes XML and deduplicates links', () => {
  const articles = parseNewsFeed(rss(
    item('<![CDATA[Rugby <final> - Local & News]]>', 'https://example.com/rugby', 'Sun, 01 Jan 2023 10:00:00 GMT') +
    item('Coalition &amp; council - Local &amp; News', 'https://example.com/politics?a=1&amp;b=2', 'unknown') +
    item('Duplicate', 'https://example.com/rugby') + item('Unsafe', 'javascript:alert(1)')
  ));
  assert.equal(articles.length, 2);
  assert.equal(articles[0]!.title, 'Rugby <final>');
  assert.equal(articles[0]!.publishedAt, '2023-01-01T10:00:00.000Z');
  assert.equal(articles[1]!.title, 'Coalition & council');
  assert.equal(articles[1]!.url, 'https://example.com/politics?a=1&b=2');
  assert.equal(articles[1]!.publishedAt, null);
  assert.equal(articles[1]!.source, 'Local & News');
});

test('empty RSS is valid; malformed XML, HTML responses, doctypes and oversized feeds fail', () => {
  assert.deepEqual(parseNewsFeed(rss()), []);
  for (const xml of ['<rss><channel>', '<html><body>Sorry</body></html>', '<!DOCTYPE rss><rss><channel/></rss>', 'x'.repeat(1_048_577)]) {
    assert.throws(() => parseNewsFeed(xml));
  }
});

test('upstream fetch bounds response size and fails HTTP errors', async () => {
  await assert.rejects(fetchNewsFeed(context.feedUrl, async (_url, init) => {
    assert.equal(init?.redirect, 'manual', 'Workers supports manual, not error, redirect mode');
    return new Response(null, { status: 302, headers: { Location: 'https://example.com' } });
  }));
  await assert.rejects(fetchNewsFeed(context.feedUrl, async () => new Response('Unavailable', { status: 503 })));
  let cancelled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(600_000)); }, cancel() { cancelled = true; } });
  await assert.rejects(fetchNewsFeed(context.feedUrl, async () => new Response(stream)), /too large/);
  assert.equal(cancelled, true);
});

test('fresh cached feeds avoid Google and expire after thirty minutes', async () => {
  const cache = new MemoryCache(); let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return new Response(feed); };
  const first = await newsResponse(context, 'https://counted.co.za', { cache, fetcher, now });
  assert.equal((await first.json() as NewsData).articles.length, 1);
  const cached = await newsResponse(context, 'https://counted.co.za', { cache, fetcher, now: now + 60_000 });
  assert.equal(cached.headers.get('Cache-Control'), 'public, max-age=1740');
  assert.equal(calls, 1);
  await newsResponse(context, 'https://counted.co.za', { cache, fetcher, now: now + NEWS_FRESH_MS });
  assert.equal(calls, 2);
});

test('failures serve labelled saved headlines, back off, and never extend their maximum age', async () => {
  const cache = new MemoryCache(); let calls = 0;
  await newsResponse(context, 'https://counted.co.za', { cache, now, fetcher: async () => new Response(feed) });
  const fetcher: typeof fetch = async () => { calls++; throw new Error('offline'); };
  const stale = await newsResponse(context, 'https://counted.co.za', { cache, fetcher, now: now + NEWS_FRESH_MS });
  const data = await stale.json() as NewsData;
  assert.equal(data.stale, true);
  assert.equal(data.fetchedAt, new Date(now).toISOString());
  await newsResponse(context, 'https://counted.co.za', { cache, fetcher, now: now + NEWS_FRESH_MS + 1_000 });
  assert.equal(calls, 1);
  const expired = await newsResponse(context, 'https://counted.co.za', { cache, fetcher, now: now + 24 * 60 * 60_000 });
  assert.equal(expired.status, 503);
});

test('cold failures back off; empty successful feeds cache without becoming errors', async () => {
  const cache = new MemoryCache(); let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; throw new Error('offline'); };
  for (const offset of [0, 1000]) {
    const response = await newsResponse(context, 'https://counted.co.za', { cache, fetcher, now: now + offset });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Retry-After'), '60');
  }
  assert.equal(calls, 1);
  const empty = await newsResponse(context, 'https://counted.co.za', { cache, now: now + 61_000, fetcher: async () => new Response(rss()) });
  assert.deepEqual((await empty.json() as NewsData).articles, []);
});
