import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import type { ThreadEvent, ThreadFrame, ThreadRequest, ThreadSnapshot } from '../src/lib/chat/contracts.ts';

const markup = (id = '') => `<div data-election-chat data-available="true" data-thread-id="${id}">
  <div data-welcome></div><button data-reset></button><button data-share hidden></button><button data-reconnect hidden></button>
  <div data-recent></div><p data-readonly hidden></p><button data-question="Coalition?"></button><div data-messages></div>
  <div data-progress hidden><p data-status></p><p data-tool-summary></p><span data-elapsed></span></div>
  <form data-chat-form><textarea></textarea><button data-send></button><button data-stop hidden></button></form></div>`;
const waitFor = async (condition: () => boolean) => {
  for (let i = 0; i < 500 && !condition(); i++) await new Promise(resolve => setTimeout(resolve, 5));
  assert.ok(condition(), 'expected UI state');
};
const stream = (events: ThreadFrame[]) => {
  const data = new TextEncoder().encode(events.map(event => JSON.stringify(event) + '\n').join(''));
  return new Response(new ReadableStream({ start(controller) {
    for (let i = 0; i < data.length; i += 7) controller.enqueue(data.slice(i, i + 7));
    controller.close();
  } }));
};

test('chat saves a UUID before sending, uses server history, restores on reload and shares read-only', async () => {
  const window = new Window({ url: 'https://counted.co.za/chat' });
  Object.assign(globalThis, { window, document: window.document });
  const { mountChat } = await import('../src/lib/chat/client.ts');
  const previousFetch = globalThis.fetch;
  const requests: ThreadRequest[] = [];
  const events: ThreadEvent[] = [];
  const requestedCursors: number[] = [];
  let dispose = () => {};
  globalThis.fetch = async (url, options) => {
    if (options?.method === 'POST') {
      const body = JSON.parse(options.body as string) as ThreadRequest;
      const remembered = JSON.parse(window.localStorage.getItem('counted.chat.threads.v1')!)[0];
      assert.equal(remembered.pending.requestId, body.requestId);
      assert.match(window.location.pathname, new RegExp(body.threadId));
      assert.equal((options.headers as Record<string, string>)['X-Chat-Key'], remembered.key);
      requests.push(body);
      const push = (event: ThreadEvent['event']) => events.push({ seq: events.length + 1, turnId: body.requestId, event });
      push({ type: 'question', text: body.question });
      push({ type: 'status', phase: 'tool', text: 'Checking seats', summary_for_user: 'Checking council seats' });
      push({ type: 'text', text: 'A coalition → 22 seats.' });
      push({ type: 'artifact', artifact: { kind: 'analysis', code: 'return 22;', result: 22 } });
      push({ type: 'done' });
      return Response.json({ threadId: body.threadId }, { status: 202 });
    }
    const after = Number(new URL(String(url), window.location.origin).searchParams.get('after'));
    requestedCursors.push(after);
    assert.match(String(url), /view=snapshot/);
    return stream([{ type: 'snapshot', after, seq: events.length, turns: requests
      .filter(body => events.some(record => record.turnId === body.requestId && record.seq > after))
      .map(body => ({ id: body.requestId, question: body.question, answer: 'A coalition → 22 seats.',
        status: 'done', startedAt: 1, artifacts: [{ kind: 'analysis', code: 'return 22;', result: 22 }] })) }]);
  };
  try {
    window.document.body.innerHTML = markup();
    let root = window.document.querySelector('[data-election-chat]')!;
    dispose = mountChat(root as unknown as HTMLElement);
    let input = root.querySelector('textarea')!;
    input.value = 'Who has a majority?'; root.querySelector('form')!.dispatchEvent(new window.Event('submit', { cancelable: true }));
    await waitFor(() => requests.length === 1 && root.querySelector('form')!.getAttribute('aria-busy') === 'false');
    assert.match(root.textContent!, /A coalition → 22 seats/);
    assert.equal(root.querySelector('[data-share]')!.hasAttribute('hidden'), false);
    input.value = 'And in 2021?'; root.querySelector('form')!.dispatchEvent(new window.Event('submit', { cancelable: true }));
    await waitFor(() => requests.length === 2 && root.querySelector('form')!.getAttribute('aria-busy') === 'false');
    assert.equal(requests[0]!.threadId, requests[1]!.threadId);
    assert.notEqual(requests[0]!.requestId, requests[1]!.requestId);
    assert.ok(!('messages' in requests[1]!));
    assert.deepEqual(requestedCursors, [0, 5]);
    dispose();
    window.document.body.innerHTML = markup(requests[0]!.threadId);
    root = window.document.querySelector('[data-election-chat]')!;
    dispose = mountChat(root as unknown as HTMLElement);
    await waitFor(() => root.querySelectorAll('.chat-message').length === 4 && root.querySelector('form')!.getAttribute('aria-busy') === 'false');
    assert.equal(requests.length, 2, 'reload must not regenerate the answer');
    assert.equal(root.querySelectorAll('.chat-artifact-analysis').length, 2);
    dispose();
    window.localStorage.clear(); // A person opening the public share link.
    window.document.body.innerHTML = markup(requests[0]!.threadId);
    root = window.document.querySelector('[data-election-chat]')!;
    dispose = mountChat(root as unknown as HTMLElement);
    await waitFor(() => root.querySelectorAll('.chat-message').length === 4);
    assert.equal(root.querySelector('form')!.hidden, true);
    assert.equal(root.querySelector('[data-readonly]')!.hasAttribute('hidden'), false);
  } finally { dispose(); globalThis.fetch = previousFetch; await window.happyDOM.close(); }
});

test('active threads reconnect from their cursor without duplicate text and display the latest tool summary', async () => {
  const id = crypto.randomUUID(), turnId = crypto.randomUUID();
  const window = new Window({ url: `https://counted.co.za/chat/${id}` });
  Object.assign(globalThis, { window, document: window.document });
  const { mountChat } = await import('../src/lib/chat/client.ts');
  window.localStorage.setItem('counted.chat.threads.v1', JSON.stringify([{ id, key: crypto.randomUUID(), title: 'Seats', updated: 1 }]));
  window.document.body.innerHTML = markup(id);
  const root = window.document.querySelector('[data-election-chat]')!;
  const previousFetch = globalThis.fetch;
  let reads = 0, tail: ReadableStreamDefaultController<Uint8Array> | undefined;
  globalThis.fetch = async (url, options) => {
    assert.notEqual(options?.method, 'POST', 'reconnection cannot submit a new model request');
    if (++reads === 1) return stream([{ type: 'snapshot', after: 0, seq: 3, turns: [{
      id: turnId, question: 'Seats?', answer: 'Partial → ', status: 'running', startedAt: Date.now(),
      progress: { type: 'status', phase: 'thinking', text: 'Thinking' },
      artifacts: [{ kind: 'analysis', code: 'return 22;', result: 22 }],
    }] }]);
    assert.match(String(url), /after=3/);
    return new Response(new ReadableStream({ start(controller) { tail = controller; } }));
  };
  const dispose = mountChat(root as unknown as HTMLElement);
  try {
    await waitFor(() => !!tail);
    tail!.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'snapshot', after: 3, seq: 6, turns: [{
      id: turnId, question: 'Seats?', answer: 'Partial → caught up. ', status: 'running', startedAt: Date.now(),
      progress: { type: 'status', phase: 'thinking', text: 'Thinking' },
      artifacts: [{ kind: 'analysis', code: 'return 22;', result: 22 }],
    }] } satisfies ThreadSnapshot) + '\n'));
    const emit = (seq: number, event: ThreadEvent['event']) => tail!.enqueue(new TextEncoder().encode(JSON.stringify({ seq, turnId, event }) + '\n'));
    emit(7, { type: 'status', phase: 'tool', text: 'First lookup', summary_for_user: 'Checking council seats' });
    await waitFor(() => root.querySelector('[data-tool-summary]')!.textContent === 'Checking council seats');
    emit(8, { type: 'status', phase: 'tool', text: 'Second lookup', summary_for_user: 'Comparing the proposed coalition' });
    emit(9, { type: 'status', phase: 'thinking', text: 'Thinking' });
    await waitFor(() => root.querySelector('[data-status]')!.textContent === 'Thinking');
    assert.equal(root.querySelector('[data-tool-summary]')!.textContent, 'Comparing the proposed coalition');
    assert.equal(root.querySelector('[data-progress]')!.getAttribute('data-busy'), 'true');
    emit(10, { type: 'text', text: 'finished.' }); emit(11, { type: 'done' }); tail!.close();
    await waitFor(() => root.querySelector('form')!.getAttribute('aria-busy') === 'false');
    assert.equal(root.querySelector('.chat-message-assistant .chat-message-text')!.textContent, 'Partial → caught up. finished.');
    assert.equal(root.querySelectorAll('.chat-message-assistant').length, 1);
    assert.equal(root.querySelectorAll('.chat-artifact-analysis').length, 1, 'catch-up replaces existing artifacts instead of duplicating them');
  } finally { dispose(); globalThis.fetch = previousFetch; await window.happyDOM.close(); }
});

test('large completed history appears as whole messages without replaying typing or stale thinking states', async () => {
  const id = crypto.randomUUID();
  const window = new Window({ url: `https://counted.co.za/chat/${id}` });
  Object.assign(globalThis, { window, document: window.document });
  const { mountChat } = await import('../src/lib/chat/client.ts');
  window.document.body.innerHTML = markup(id);
  const root = window.document.querySelector('[data-election-chat]')!;
  const previousFetch = globalThis.fetch;
  let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
  const answer = 'Saved answer. '.repeat(25_000);
  const snapshot: ThreadSnapshot = { type: 'snapshot', after: 0, seq: 10_000, turns: Array.from({ length: 4 }, (_, index) => ({
    id: crypto.randomUUID(), question: `Saved question ${index}`, answer, startedAt: 1, status: 'done', artifacts: [],
    progress: { type: 'status', phase: 'tool', text: 'Stale lookup', summary_for_user: 'Old progress that should not replay' },
  })) };
  const bytes = new TextEncoder().encode(JSON.stringify(snapshot) + '\n');
  assert.ok(bytes.length > 1_000_000);
  globalThis.fetch = async () => new Response(new ReadableStream({ start(value) { controller = value; } }));
  const dispose = mountChat(root as unknown as HTMLElement);
  const shownStatuses: string[] = [];
  const observer = new window.MutationObserver(() => { shownStatuses.push(root.querySelector('[data-status]')!.textContent!); });
  observer.observe(root.querySelector('[data-status]')!, { childList: true, subtree: true });
  try {
    await waitFor(() => !!controller);
    controller!.enqueue(bytes.slice(0, 600_000));
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(root.querySelectorAll('.chat-message').length, 0, 'do not paint fragments of a saved answer');
    assert.equal(root.querySelector('form')!.getAttribute('aria-busy'), 'true', 'keep loading state until the snapshot is received');
    controller!.enqueue(bytes.slice(600_000)); controller!.close();
    await waitFor(() => root.querySelectorAll('.chat-message-assistant').length === 4 && root.querySelector('form')!.getAttribute('aria-busy') === 'false');
    for (const content of root.querySelectorAll('.chat-message-assistant .chat-message-text')) assert.equal(content.textContent, answer);
    assert.equal(root.querySelector('[data-status]')!.textContent, 'Answer saved.');
    assert.equal(root.querySelector('[data-tool-summary]')!.textContent, '');
    assert.ok(shownStatuses.every(value => !/Thinking|Stale lookup|Using election tools/.test(value)));
  } finally { observer.disconnect(); dispose(); globalThis.fetch = previousFetch; await window.happyDOM.close(); }
});

test('SSR history is adopted in place and resumes at its cursor, including completion before connection', async () => {
  const { turnMarkup } = await import('../src/lib/chat/markup.server.ts');
  const id = crypto.randomUUID(), turnId = crypto.randomUUID();
  const window = new Window({ url: `https://counted.co.za/chat/${id}` });
  Object.assign(globalThis, { window, document: window.document });
  const { mountChat } = await import('../src/lib/chat/client.ts');
  const previousFetch = globalThis.fetch;
  let dispose = () => {};
  try {
    for (const mode of ['done', 'running', 'finished-before-connection'] as const) {
      window.document.body.innerHTML = markup(id);
      const root = window.document.querySelector<import('happy-dom').HTMLElement>('[data-election-chat]')!;
      root.dataset.chatCursor = '5';
      if (mode !== 'done') { root.dataset.activeTurn = turnId; root.dataset.startedAt = String(Date.now()); }
      const question = 'Who wins? <script>bad()</script>';
      const prefix = '**Coalition** → [Source](https://counted.co.za). ';
      root.querySelector('[data-messages]')!.innerHTML = turnMarkup({ id: turnId, question, answer: prefix,
        status: mode === 'done' ? 'done' : 'running', startedAt: 1,
        artifacts: [{ kind: 'analysis', code: 'return 22;', result: 22 }] });
      root.querySelector('[data-status]')!.textContent = mode === 'done' ? 'Answer saved.' : 'Thinking';
      const originalAnswer = root.querySelector('.chat-message-assistant')!;
      const originalParagraph = originalAnswer.querySelector('.chat-message-text p');
      const originalArtifact = originalAnswer.querySelector('.chat-artifact');
      let tail: ReadableStreamDefaultController<Uint8Array> | undefined;
      globalThis.fetch = async (url, options) => {
        assert.notEqual(options?.method, 'POST', 'SSR hydration must not regenerate an answer');
        assert.match(String(url), /after=5&view=snapshot/);
        return new Response(new ReadableStream({ start(controller) { tail = controller; } }));
      };
      dispose = mountChat(root as unknown as HTMLElement);
      await waitFor(() => !!tail);
      assert.equal(root.querySelector('.chat-message-assistant'), originalAnswer);
      assert.equal(originalAnswer.querySelector('.chat-message-text p'), originalParagraph, 'no initial Markdown re-render');
      assert.equal(originalAnswer.querySelector('.chat-artifact'), originalArtifact);
      assert.equal(root.querySelector('script'), null);
      assert.equal(root.querySelector('.chat-message-user .chat-message-text')!.textContent, question);
      assert.equal(root.querySelector('[data-progress]')!.getAttribute('data-busy'), String(mode !== 'done'));
      const write = (frame: ThreadFrame) => tail!.enqueue(new TextEncoder().encode(JSON.stringify(frame) + '\n'));
      if (mode === 'finished-before-connection') {
        write({ type: 'snapshot', after: 5, seq: 7, turns: [{ id: turnId, question, answer: prefix + 'Finished.',
          status: 'done', startedAt: 1, artifacts: [{ kind: 'analysis', code: 'return 22;', result: 22 }] }] });
      } else {
        write({ type: 'snapshot', after: 5, seq: 5, turns: [] });
        if (mode === 'running') {
          write({ seq: 6, turnId, event: { type: 'text', text: 'Finished.' } });
          write({ seq: 7, turnId, event: { type: 'done' } });
        }
      }
      tail!.close();
      await waitFor(() => root.querySelector('form')!.getAttribute('aria-busy') === 'false');
      assert.equal(root.querySelectorAll('.chat-message-assistant').length, 1);
      assert.equal(root.querySelectorAll('.chat-artifact-analysis').length, 1);
      assert.equal(originalAnswer.querySelector('.chat-message-text')!.textContent,
        'Coalition → Source. ' + (mode === 'done' ? '' : 'Finished.'));
      assert.equal(root.querySelector('form')!.hidden, true, 'SSR never grants a viewer write access');
      if (mode === 'done') assert.equal(originalAnswer.querySelector('.chat-message-text p'), originalParagraph);
      dispose();
    }
  } finally { dispose(); globalThis.fetch = previousFetch; await window.happyDOM.close(); }
});

test('live text renders at 50ms intervals while status, artifacts and completion flush immediately', async t => {
  const id = crypto.randomUUID(), turnId = crypto.randomUUID();
  const window = new Window({ url: `https://counted.co.za/chat/${id}` });
  Object.assign(globalThis, { window, document: window.document });
  const { mountChat } = await import('../src/lib/chat/client.ts');
  window.document.body.innerHTML = markup(id);
  const root = window.document.querySelector('[data-election-chat]')!;
  const previousFetch = globalThis.fetch;
  let tail: ReadableStreamDefaultController<Uint8Array> | undefined, seq = 0;
  globalThis.fetch = async () => new Response(new ReadableStream({ start(controller) { tail = controller; } }));
  const dispose = mountChat(root as unknown as HTMLElement);
  const settle = () => new Promise<void>(resolve => setImmediate(resolve));
  const emit = (...events: ThreadEvent['event'][]) => tail!.enqueue(new TextEncoder().encode(
    events.map(event => JSON.stringify({ seq: ++seq, turnId, event }) + '\n').join('')));
  try {
    await waitFor(() => !!tail);
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 1000 });
    emit({ type: 'question', text: 'Seats?' }, { type: 'text', text: 'First ' },
      ...Array.from({ length: 100 }, () => ({ type: 'text' as const, text: 'x' })));
    await settle();
    const content = root.querySelector('.chat-message-assistant .chat-message-text')!;
    assert.equal(content.textContent, 'First ', 'first text renders immediately; a burst is coalesced');
    const firstParagraph = content.firstElementChild;
    t.mock.timers.tick(49);
    emit({ type: 'text', text: 'late' }); await settle();
    assert.equal(content.firstElementChild, firstParagraph);
    t.mock.timers.tick(1);
    let expected = 'First ' + 'x'.repeat(100) + 'late';
    assert.equal(content.textContent, expected, 'late text does not extend the 50ms deadline');
    emit({ type: 'text', text: 'before tool' }, { type: 'status', phase: 'tool', text: 'Checking', summary_for_user: 'Checking seats' });
    await settle(); expected += 'before tool';
    assert.equal(content.textContent, expected);
    assert.equal(root.querySelector('[data-tool-summary]')!.textContent, 'Checking seats');
    emit({ type: 'text', text: 'before chart' }, { type: 'artifact', artifact: { kind: 'analysis', code: 'return 22;', result: 22 } });
    await settle(); expected += 'before chart';
    assert.equal(content.textContent, expected);
    assert.equal(root.querySelectorAll('.chat-artifact-analysis').length, 1);
    emit({ type: 'text', text: 'last' }); await settle();
    assert.equal(content.textContent, expected, 'ordinary fragments wait for the next paint');
    emit({ type: 'done' }); tail!.close(); await settle();
    assert.equal(content.textContent, expected + 'last', 'all text is visible before marking the answer done');
    assert.equal(root.querySelector('[data-progress]')!.getAttribute('data-busy'), 'false');
    const lastParagraph = content.firstElementChild;
    t.mock.timers.tick(1000);
    assert.equal(content.firstElementChild, lastParagraph, 'no stale render timer after completion');
  } finally { dispose(); t.mock.timers.reset(); globalThis.fetch = previousFetch; await window.happyDOM.close(); }
});

test('disconnect flushes accepted text before cursor reconnection and disposal cancels queued paints', async t => {
  const id = crypto.randomUUID(), turnId = crypto.randomUUID();
  const window = new Window({ url: `https://counted.co.za/chat/${id}` });
  Object.assign(globalThis, { window, document: window.document });
  const { mountChat } = await import('../src/lib/chat/client.ts');
  window.document.body.innerHTML = markup(id);
  const root = window.document.querySelector('[data-election-chat]')!;
  const previousFetch = globalThis.fetch;
  let tail: ReadableStreamDefaultController<Uint8Array> | undefined, reads = 0;
  globalThis.fetch = async url => {
    if (++reads === 2) assert.match(String(url), /after=3&view=snapshot/);
    return new Response(new ReadableStream({ start(controller) { tail = controller; } }));
  };
  const dispose = mountChat(root as unknown as HTMLElement);
  const settle = () => new Promise<void>(resolve => setImmediate(resolve));
  const emit = (frames: ThreadFrame[]) => tail!.enqueue(new TextEncoder().encode(frames.map(frame => JSON.stringify(frame) + '\n').join('')));
  try {
    await waitFor(() => !!tail);
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 1000 });
    emit([{ seq: 1, turnId, event: { type: 'question', text: 'Seats?' } },
      { seq: 2, turnId, event: { type: 'text', text: 'First ' } }, { seq: 3, turnId, event: { type: 'text', text: 'saved' } }]);
    await settle();
    const content = root.querySelector('.chat-message-assistant .chat-message-text')!;
    assert.equal(content.textContent, 'First ');
    tail!.close(); await settle();
    assert.equal(content.textContent, 'First saved', 'a disconnect does not hide already-accepted text behind a timer');
    t.mock.timers.tick(1000); await settle();
    assert.equal(reads, 2);
    emit([{ type: 'snapshot', after: 3, seq: 3, turns: [] },
      { seq: 4, turnId, event: { type: 'text', text: ' plus' } }, { seq: 5, turnId, event: { type: 'text', text: ' pending' } }]);
    await settle();
    assert.equal(content.textContent, 'First saved plus');
    const lastParagraph = content.firstElementChild;
    dispose(); t.mock.timers.tick(1000); tail!.close(); await settle();
    assert.equal(content.firstElementChild, lastParagraph, 'disposed pages cannot receive a queued paint');
  } finally { dispose(); t.mock.timers.reset(); globalThis.fetch = previousFetch; await window.happyDOM.close(); }
});
