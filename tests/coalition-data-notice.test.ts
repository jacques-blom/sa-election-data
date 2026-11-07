import test from 'node:test';
import assert from 'node:assert/strict';
import { coalitionDataNotice } from '../src/lib/seats/data-notice.ts';
import type { Result } from '../src/lib/places/results.ts';
const now = Date.parse('2026-11-07T10:00:00Z');
const result = { year: 2026, level: 'municipality', source: {
  successfulAt: '2026-11-05T14:13:09.233Z', error: null,
} } as Result;
test('local snapshots have no freshness banner, including failed saved imports', () => {
  assert.equal(coalitionDataNotice(result, true, now), null);
  assert.equal(coalitionDataNotice({ ...result, source: { ...result.source, error: 'failed' } }, true, now), null);
});
test('live bindings retain genuine stale and failed refresh warnings', () => {
  assert.match(coalitionDataNotice(result, false, now)!, /Updates are delayed/);
  assert.equal(coalitionDataNotice({ ...result, source: { ...result.source, successfulAt: new Date(now).toISOString() } }, false, now), null);
  assert.match(coalitionDataNotice({ ...result, source: { ...result.source, error: 'failed' } }, false, now)!, /latest refresh failed/);

});
test('missing local timestamps do not show a warning', () => {
  assert.equal(coalitionDataNotice({ ...result, source: { ...result.source, successfulAt: null } }, true, now), null);
});
