import test from 'node:test';
import assert from 'node:assert/strict';
import { frameAt, portraitMood, walkoutDuration, walkoutPose } from '../src/lib/seats/animation-timing.ts';

test('frame holds, boundaries, loops and one-shot endings follow elapsed time', () => {
  const frames = [0, 1, 2, 3], durations = [140, 140, 380, 240];
  assert.equal(frameAt(139, frames, durations), 0);
  assert.equal(frameAt(140, frames, durations), 1);
  assert.equal(frameAt(279, frames, durations), 1);
  assert.equal(frameAt(280, frames, durations), 2);
  assert.equal(frameAt(9000, frames, durations), 3);
  assert.equal(frameAt(1040, frames, durations, true), 1);
});
test('walkout is a registered eight-frame gait, finishes once and never changes game maths', () => {
  assert.deepEqual(walkoutPose(0), { x: 116, frame: 1, visible: true, done: false });
  const samples = Array.from({ length: 8 }, (_, i) => walkoutPose(241 + i * 90));
  assert.deepEqual(samples.map(p => p.frame), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.ok(samples.every((p, i) => Number.isInteger(p.x) && (i === 0 || p.x > samples[i - 1]!.x)));
  const end = walkoutPose(walkoutDuration);
  assert.equal(end.visible, false);
  assert.equal(end.done, true);
  assert.deepEqual(walkoutPose(100000), end);
});
test('reduced motion is a readable static doorway pose at every elapsed time', () => {
  for (const elapsed of [0, 500, 2600, 8000]) {
    assert.deepEqual(walkoutPose(elapsed, true), { x: 205, frame: 1, visible: true, done: true });
  }
});
test('every party uses the same neutral, invited and excluded expression rules', () => {
  assert.equal(portraitMood(false, false), 'neutral');
  assert.equal(portraitMood(true, true), 'happy');
  assert.equal(portraitMood(false, true), 'sad');
});
