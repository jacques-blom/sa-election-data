import test from 'node:test';
import assert from 'node:assert/strict';
import { TextBatcher, TEXT_BATCH_BYTES, TEXT_BATCH_MS } from '../src/lib/chat/text-batcher.ts';
import type { ChatEvent } from '../src/lib/chat/contracts.ts';

const unexpectedError = (error: unknown) => assert.fail(String(error));
const text = (text: string): ChatEvent => ({ type: 'text', text });

test('text batches preserve order, send the first fragment immediately and use a fixed 100ms deadline', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const saved: ChatEvent[] = [];
  const batch = new TextBatcher(event => saved.push(event), unexpectedError);
  batch.emit(text('First → '));
  assert.deepEqual(saved, [text('First → ')]);
  for (let i = 0; i < 500; i++) batch.emit(text('x'));
  t.mock.timers.tick(TEXT_BATCH_MS - 1);
  assert.equal(saved.length, 1);
  batch.emit(text('y')); // A late fragment must not move the deadline.
  t.mock.timers.tick(1);
  assert.deepEqual(saved, [text('First → '), text('x'.repeat(500) + 'y')]);
  t.mock.timers.tick(1000);
  assert.equal(saved.length, 2, 'idle timers must not create writes');
  batch.dispose();
});

test('UTF-8 size and tool/artifact boundaries flush immediately without losing or duplicating text', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const saved: ChatEvent[] = [];
  const batch = new TextBatcher(event => saved.push(event), unexpectedError);
  batch.emit(text('first'));
  batch.emit(text('🙂'.repeat(TEXT_BATCH_BYTES / 4 - 1)));
  assert.equal(saved.length, 1);
  batch.emit(text('🙂'));
  assert.equal(saved.length, 2, '4KiB UTF-8 flushes without waiting for the timer');
  const status: ChatEvent = { type: 'status', phase: 'tool', text: 'Checking', summary_for_user: 'Checking seats' };
  const artifact: ChatEvent = { type: 'artifact', artifact: { kind: 'analysis', code: 'return 22', result: 22 } };
  batch.emit(text('before tool')); batch.emit(status);
  batch.emit(text('before chart')); batch.emit(artifact);
  assert.deepEqual(saved.slice(2), [text('before tool'), status, text('before chart'), artifact]);
  t.mock.timers.tick(1000);
  assert.equal(saved.length, 6);
  batch.dispose();
});

test('completion, errors and disposal cancel timers and isolate generations', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  for (const terminal of [{ type: 'done' }, { type: 'error', message: 'Stopped' }] as ChatEvent[]) {
    const saved: ChatEvent[] = [];
    const batch = new TextBatcher(event => saved.push(event), unexpectedError);
    batch.emit(text('first')); batch.emit(text('last')); batch.emit(terminal);
    batch.emit(text('late callback')); t.mock.timers.tick(1000);
    assert.deepEqual(saved, [text('first'), text('last'), terminal]);
  }
  const saved: ChatEvent[] = [];
  const old = new TextBatcher(event => saved.push(event), unexpectedError);
  old.emit(text('first')); old.emit(text('pending')); old.flush(); old.dispose();
  const next = new TextBatcher(event => saved.push(event), unexpectedError);
  next.emit(text('new answer')); old.emit(text('stale')); t.mock.timers.tick(1000);
  assert.deepEqual(saved, [text('first'), text('pending'), text('new answer')]);
  next.dispose();
});

test('timer storage failures are reported once and cannot keep scheduling writes', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const failure = new Error('storage failure'), errors: unknown[] = [];
  let writes = 0;
  const batch = new TextBatcher(() => { if (++writes > 1) throw failure; }, error => errors.push(error));
  batch.emit(text('first')); batch.emit(text('pending')); t.mock.timers.tick(TEXT_BATCH_MS);
  batch.emit(text('late')); t.mock.timers.tick(1000);
  assert.deepEqual(errors, [failure]); assert.equal(writes, 2);
});
