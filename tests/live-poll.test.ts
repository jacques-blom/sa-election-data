import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { pollWhileVisible } from '../src/lib/live/poll.ts';

function browser(t: TestContext) {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const window = new EventTarget();
  const navigator = { onLine: true };
  const cleanup: (() => void)[] = [];
  for (const [key, value] of Object.entries({ document, window, navigator })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    cleanup.push(() => { if (original) Object.defineProperty(globalThis, key, original); else Reflect.deleteProperty(globalThis, key); });
  }
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.now() });
  let stop: (() => void) | undefined;
  t.after(() => { stop?.(); cleanup.forEach(restore => restore()); });
  return { document, window, navigator, track: (value: () => void) => { stop = value; return value; } };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('polls repeatedly after load and coalesces focus/visibility events', async t => {
  const { document, window, track } = browser(t);
  let calls = 0;
  track(pollWhileVisible(async () => { calls++; }));
  assert.equal(calls, 0);
  t.mock.timers.tick(30_000); await flush();
  t.mock.timers.tick(30_000); await flush();
  assert.equal(calls, 2);
  t.mock.timers.tick(2_000);
  window.dispatchEvent(new Event('focus'));
  document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  window.dispatchEvent(new Event('focus'));
  assert.equal(calls, 3, 'one request for a single tab return');
});

test('pauses hidden/offline tabs and refreshes immediately on returning/reconnecting', async t => {
  const { document, window, navigator, track } = browser(t);
  let calls = 0;
  track(pollWhileVisible(async () => { calls++; }));
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
  t.mock.timers.tick(120_000); await flush();
  assert.equal(calls, 0);
  document.hidden = false; document.dispatchEvent(new Event('visibilitychange')); await flush();
  assert.equal(calls, 1);
  navigator.onLine = false; window.dispatchEvent(new Event('offline'));
  t.mock.timers.tick(120_000); await flush();
  assert.equal(calls, 1);
  navigator.onLine = true; window.dispatchEvent(new Event('online')); await flush();
  assert.equal(calls, 2);
});

test('does not overlap slow requests and retries after errors and timeouts', async t => {
  const { window, track } = browser(t);
  let calls = 0; let failures = 0;
  track(pollWhileVisible(async signal => {
    calls++;
    if (calls === 1) await new Promise<void>((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
    if (calls === 2) throw new Error('Temporary server failure');
  }, () => { failures++; }));
  t.mock.timers.tick(30_000); await flush();
  t.mock.timers.tick(2_000); window.dispatchEvent(new Event('focus'));
  assert.equal(calls, 1);
  t.mock.timers.tick(13_000); await flush();
  assert.equal(failures, 1);
  t.mock.timers.tick(30_000); await flush();
  assert.equal(failures, 2);
  t.mock.timers.tick(30_000); await flush();
  assert.equal(calls, 3);
});

test('resumes from the back-forward cache and cleans up timers and listeners', async t => {
  const { window, track } = browser(t);
  let calls = 0;
  const stop = track(pollWhileVisible(async () => { calls++; }));
  window.dispatchEvent(new Event('pagehide'));
  t.mock.timers.tick(120_000); await flush();
  assert.equal(calls, 0);
  window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true })); await flush();
  assert.equal(calls, 1);
  stop();
  t.mock.timers.tick(120_000);
  window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('online')); await flush();
  assert.equal(calls, 1);
});

test('restoring a page during an aborted request immediately fetches again', async t => {
  const { window, track } = browser(t);
  let calls = 0;
  track(pollWhileVisible(async signal => {
    calls++;
    if (calls === 1) await new Promise<void>((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
  }));
  t.mock.timers.tick(30_000);
  window.dispatchEvent(new Event('pagehide'));
  window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  await flush();
  assert.equal(calls, 2);
});
