import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { newsStore } from '../src/lib/news/store.ts';

test('R2 news entries share data and conditionally protect refresh ownership', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'counted-news-store-'));
  const proxy = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc', persist: { path: directory }, remoteBindings: false });
  try {
    const first = newsStore(proxy.env.RAW_RESULTS), second = newsStore(proxy.env.RAW_RESULTS);
    const key = 'coalition/swellendam/2026-11-04';
    assert.equal(await first.read(key), null);
    const lease = await first.write(key, { data: null, refreshUntil: 20_000 }, null);
    assert.ok(lease);
    assert.equal(await second.write(key, { data: null }, null), null, 'Only one cold request may create a lease');
    assert.equal((await second.read(key))!.version, lease);
    const data = { articles: [], fetchedAt: '2026-11-06T12:00:00Z', stale: false };
    const published = await first.write(key, { data }, lease);
    assert.ok(published);
    assert.notEqual(published, lease);
    assert.equal(await second.write(key, { data: null }, lease), null, 'An old writer cannot erase published headlines');
    assert.deepEqual((await second.read(key))!.entry, { data });
    const objects = await proxy.env.RAW_RESULTS.list();
    assert.deepEqual(objects.objects.map(object => object.key), ['news/serpapi-v1/coalition/swellendam/2026-11-04.json']);
  } finally { await proxy.dispose(); rmSync(directory, { recursive: true, force: true }); }
});
