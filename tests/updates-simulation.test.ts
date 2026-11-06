import test from 'node:test';
import assert from 'node:assert/strict';
import { feedOptions, feedUrl } from '../src/lib/updates/feed.ts';
import { simulatedFeed, simulationEvents, simulationStep } from '../src/lib/updates/simulation.ts';

const options = feedOptions(new URLSearchParams());
test('simulation has a coherent sequence of wins, completion, council outcomes and corrections', () => {
  const events = simulationEvents();
  assert.equal(events.length, 8);
  assert.equal(simulatedFeed(options, 0).updates.length, 0);
  assert.deepEqual(simulatedFeed(options, 8).updates.map(e => e.id), [8, 7, 6, 5, 4, 3, 2, 1]);
  assert.ok(events.some(e => e.after?.winner?.id === '0'));
  assert.ok(events.some(e => e.kind === 'council_decided' && !e.after?.winner));
  assert.ok(events.some(e => e.kind === 'council_decided' && e.after?.winner));
  for (const event of events) {
    assert.ok(event.municipality_name.startsWith('Demo '));
    assert.equal(event.source_url, 'urn:counted:local-simulation');
    if (event.previous_event_id) assert.ok(event.previous_event_id < event.id);
    if (event.after?.seats) assert.equal(event.after.seats.reduce((sum, p) => sum + p.count, 0), event.after.totalSeats);
  }
});
test('stepping reveals corrections only when they occur and preserves earlier facts', () => {
  const saved = { ...options, event: 2 };
  assert.equal(simulatedFeed(saved, 2).updates[0]!.superseded_by, null);
  assert.equal(simulatedFeed(saved, 6).updates[0]!.superseded_by, 6);
  assert.equal(simulatedFeed(saved, 6).updates[0]!.after!.winner!.id, '52');
  assert.equal(simulatedFeed({ ...options, type: 'corrections' }, 5).updates.length, 0);
  assert.equal(simulatedFeed({ ...options, type: 'corrections' }, 8).updates.length, 3);
  assert.equal(simulatedFeed({ ...options, event: 6 }, 2).updates.length, 0);
  const changed = simulatedFeed(saved, 6);
  changed.updates[0]!.after!.winner!.name = 'Changed in another request';
  assert.equal(simulatedFeed(saved, 6).updates[0]!.after!.winner!.name, 'DEMOCRATIC ALLIANCE');
});
test('simulation filters, pagination and links remain isolated from the normal feed', () => {
  assert.equal(simulatedFeed({ ...options, province: '9', type: 'wins', q: 'bay' }, 8).updates.length, 2);
  const first = simulatedFeed({ ...options, limit: 2 }, 8);
  const second = simulatedFeed({ ...options, limit: 2, before: first.next_before }, 8);
  assert.deepEqual(first.updates.map(e => e.id), [8, 7]);
  assert.deepEqual(second.updates.map(e => e.id), [6, 5]);
  assert.equal(feedUrl({ event: 2 }, '/updates', 2), '/updates?demo=1&step=2&event=2');
  assert.equal(feedUrl({}, '/updates', 0), '/updates?demo=1&step=0');
  assert.equal(feedUrl({ event: 2 }), '/updates?event=2');
  assert.deepEqual(simulationStep(new URLSearchParams('demo=1')), { step: 8, total: 8 });
  for (const query of ['demo=0', 'demo=1&step=-1', 'demo=1&step=9', 'demo=1&step=1.5', 'demo=1&step=']) {
    assert.throws(() => simulationStep(new URLSearchParams(query)));
  }
});
