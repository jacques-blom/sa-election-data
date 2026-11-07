import test from 'node:test';
import assert from 'node:assert/strict';
import type { CoalitionData } from '../src/lib/seats/coalition.ts';
import { coalitionTwist } from '../src/lib/seats/game.ts';
import { coalitionLesson } from '../src/lib/seats/learning.ts';

const data: CoalitionData = { name: 'Test council', total: 40, majority: 21, status: 'estimated',
  source: { snapshotId: 'one', reportedAt: '2026-11-07', url: 'https://example.com' },
  parties: [18, 10, 7, 3, 2].map((seats, i) => ({ id: String(i), name: `Party ${i}`, short: `P${i}`, seats, color: '#123456', selectable: true })),
};
const lesson = (ids: string[], card: string) => coalitionLesson(data, coalitionTwist(data, ids, card, () => 0)!);

test('explains the actual pivotal partner and exact cushion boundary without changing a draw', () => {
  const twist = coalitionTwist(data, ['0', '3'], 'small-exit')!;
  const before = structuredClone(twist);
  const explanation = coalitionLesson(data, twist);
  assert.equal(explanation.id, 'pivotal');
  assert.match(explanation.text, /P3 held 3 seats/);
  assert.match(explanation.text, /18 of the 21 needed/);
  assert.deepEqual(twist, before);
  const exact = lesson(['0', '3', '4'], 'small-exit');
  assert.equal(exact.id, 'cushion');
  assert.match(exact.text, /2 seats above/);
  assert.match(exact.text, /none to spare/);
  assert.match(lesson(['0', '1', '3'], 'small-exit').text, /with 7 to spare/);
});

test('absence, withheld support and cooperation teach different concepts', () => {
  assert.equal(lesson(['0', '3'], 'traffic').id, 'attendance');
  assert.equal(lesson(['0', '3'], 'double-booked').id, 'attendance');
  assert.match(lesson(['0', '3'], 'traffic').text, /does not remove an elected seat/);
  assert.equal(lesson(['0', '3'], 'committee-quarrel').id, 'caucus');
  assert.match(lesson(['0', '3'], 'committee-quarrel').text, /fictional game rule, not a prediction/);
  assert.equal(lesson(['0', '3'], 'rogue').id, 'support');
  assert.match(lesson(['0', '3'], 'rogue').text, /council's election result/);
  assert.equal(lesson(['0', '3'], 'budget-truce').id, 'budget');
  assert.equal(lesson(['0', '3'], 'pothole-pact').id, 'residents');
  assert.match(lesson(['0', '3'], 'speaker-recess').text, /All 21 seats/);
});

test('solo majorities and exits of a majority party do not imply a small coalition partner', () => {
  const solo: CoalitionData = { ...data, parties: [{ ...data.parties[0]!, seats: 25 }, { ...data.parties[1]!, seats: 15 }] };
  assert.equal(coalitionLesson(solo, coalitionTwist(solo, ['0'], 'caucus-split')!).id, 'caucus');
  const majorityExit = coalitionLesson(solo, coalitionTwist(solo, ['0', '1'], 'big-exit')!);
  assert.doesNotMatch(majorityExit.text, /without holding a majority/);
});

test('party identity never changes the learning rule and every generic card has an explanation', () => {
  const renamed = { ...data, parties: data.parties.map(p => ({ ...p, name: 'Renamed', short: 'NEW' })) };
  for (const card of ['rogue', 'traffic', 'double-booked', 'committee-quarrel', 'speaker-recess', 'budget-truce', 'pothole-pact', 'photo-truce', 'small-exit', 'big-exit', 'random-exit']) {
    const twist = coalitionTwist(data, ['0', '3'], card, () => 0)!;
    assert.ok(twist);
    const a = coalitionLesson(data, twist), b = coalitionLesson(renamed, twist);
    assert.equal(a.id, b.id);
    assert.ok(a.text.length > 30 && a.text.length < 360);
    assert.match(a.href, /^\/(guide|participate)#/);
  }
});
