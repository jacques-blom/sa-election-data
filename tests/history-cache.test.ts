import test from 'node:test';
import assert from 'node:assert/strict';
import { HistoryCache, type HistoryPage } from '../src/lib/history/cache.ts';
const page = (html = 'results', live = false): HistoryPage => ({ html, live });

test('history cache shares pending reads and expires live counts before archives', async () => {
  let now = 0, reads = 0;
  const cache = new HistoryCache(async url => { reads++; return page(url, url === 'live'); }, () => now);
  assert.equal(cache.get('live'), cache.get('live'));
  await Promise.all([cache.get('live'), cache.get('old')]);
  assert.equal(reads, 2);
  now = 14_999; await cache.get('live'); assert.equal(reads, 2);
  now = 15_000; await cache.get('live'); await cache.get('old'); assert.equal(reads, 3);
  now = 30 * 60_000; await cache.get('old'); assert.equal(reads, 4);
});
test('history cache bounds retained pages and bytes, retaining recently used entries', async () => {
  const cache = new HistoryCache(async url => page(url), Date.now, 2, 10);
  await cache.get('a'); await cache.get('b'); cache.peek('a'); await cache.get('c');
  assert.equal(cache.peek('b'), undefined); assert.ok(cache.peek('a'));
  await cache.get('large'); assert.equal(cache.peek('a'), undefined); assert.ok(cache.peek('large'));
  await cache.get('oversized'); assert.equal(cache.peek('oversized'), undefined);
});
test('failed history reads can retry and prefetch uses at most two workers', async () => {
  let reads = 0, active = 0, maximum = 0;
  const cache = new HistoryCache(async url => {
    reads++; active++; maximum = Math.max(maximum, active);
    await new Promise(resolve => setTimeout(resolve, 1)); active--;
    if (url === 'fail') throw new Error('offline');
    return page(url);
  });
  await cache.warm(['a','b','a','fail','c']);
  assert.equal(reads, 4); assert.equal(maximum, 2);
  await assert.rejects(cache.get('fail')); assert.equal(reads, 5);
  assert.ok(cache.peek('c'));
});
