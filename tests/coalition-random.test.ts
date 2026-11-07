import test from 'node:test';
import assert from 'node:assert/strict';
import { randomPlayableCouncil } from '../src/lib/seats/random.ts';

const council = (id: string, status = 'reported') => ({ id, status, href: `/2026/places/${id}/coalition` });
test('random councils exclude the current and pending councils and verify the destination', async () => {
  const councils = [council('current'), council('pending', 'pending'), council('stale'), council('failed'), council('ready', 'estimated')];
  const checked: string[] = [];
  const chosen = await randomPlayableCouncil(councils, 'current', async candidate => {
    checked.push(candidate.id);
    if (candidate.id === 'failed') throw new Error('Unavailable result store');
    return candidate.id === 'ready';
  }, () => .999);
  assert.equal(chosen?.id, 'ready');
  assert.deepEqual(checked, ['stale', 'failed', 'ready']);
  assert.deepEqual(councils.map(c => c.id), ['current', 'pending', 'stale', 'failed', 'ready']);
});
test('every eligible council can be chosen, including an estimate', async () => {
  const councils = [council('a'), council('b'), council('c', 'estimated')];
  const destinations = new Set<string>();
  for (const sequence of [[0, 0], [.5, 0], [.999, .999]]) {
    const chosen = await randomPlayableCouncil(councils, null, async () => true, () => sequence.shift()!);
    destinations.add(chosen!.id);
  }
  assert.deepEqual([...destinations].sort(), ['a', 'b', 'c']);
});
test('empty or unavailable destinations return no match with bounded data reads', async () => {
  assert.equal(await randomPlayableCouncil([council('current')], 'current', async () => true), null);
  let reads = 0;
  const chosen = await randomPlayableCouncil(Array.from({ length: 30 }, (_, i) => council(String(i))), null, async () => { reads++; return false; });
  assert.equal(chosen, null);
  assert.equal(reads, 8);
});
