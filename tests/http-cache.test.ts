import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesIfNoneMatch } from '../src/lib/data/http-cache.ts';

test('conditional GET matches Cloudflare-weakened tags, lists and wildcards without matching changed data', () => {
  assert.equal(matchesIfNoneMatch('W/"same"', '"same"'), true);
  assert.equal(matchesIfNoneMatch('"same"', 'W/"same"'), true);
  assert.equal(matchesIfNoneMatch('"old", W/"same"', '"same"'), true);
  assert.equal(matchesIfNoneMatch('*', '"same"'), true);
  assert.equal(matchesIfNoneMatch('W/"changed"', '"same"'), false);
  assert.equal(matchesIfNoneMatch(null, '"same"'), false);
});
