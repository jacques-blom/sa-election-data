import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unstable_dev } from 'wrangler';
import type { ThreadEvent, ThreadFrame, ThreadSnapshot } from '../src/lib/chat/contracts.ts';

const parse = (text: string): ThreadEvent[] => text.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));

test('durable threads replay after disconnect and restart, deduplicate sends, authorize writes and retain artifacts', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'counted-thread-'));
  const config = join(directory, 'wrangler.json');
  writeFileSync(config, JSON.stringify({ name: 'counted-thread-test', compatibility_date: '2026-11-05', compatibility_flags: ['nodejs_compat'],
    durable_objects: { bindings: [{ name: 'THREADS', class_name: 'TestChatThread' }] },
    migrations: [{ tag: 'v1', new_sqlite_classes: ['TestChatThread'] }] }));
  const start = () => unstable_dev('tests/fixtures/chat-thread.ts', { config, local: true, port: 0, inspectorPort: 0, logLevel: 'error',
    persist: true, persistTo: join(directory, 'state'), experimental: { disableExperimentalWarning: true, disableDevRegistry: true, watch: false } });
  let worker = await start();
  const id = crypto.randomUUID(), requestId = crypto.randomUUID(), key = 'test-owner-hash';
  const body = { threadId: id, requestId, question: 'How many seats?' };
  const submit = (value = body, owner = key) => worker.fetch(`/?id=${value.threadId}`, { method: 'POST', headers: { key: owner }, body: JSON.stringify(value) }).then(r => r.json() as Promise<{ status: number }>);
  try {
    const attempts = await Promise.all([submit(), submit(), submit()]);
    assert.ok(attempts.every(result => result.status === 202));
    const stream = await worker.fetch(`/?id=${id}`), reader = stream.body!.getReader();
    const first = await reader.read();
    const prefix = parse(new TextDecoder().decode(first.value));
    assert.ok(prefix.some(record => record.event.type === 'question'));
    const cursor = prefix.at(-1)!.seq;
    await reader.cancel(); // Disconnect must NOT cancel the generation.
    const tail = parse(await (await worker.fetch(`/?id=${id}&after=${cursor}`)).text());
    assert.equal(tail.at(-1)?.event.type, 'done');
    assert.ok(tail.every(record => record.seq > cursor));
    assert.equal(await (await worker.fetch(`/count?id=${id}`)).json(), 1);
    assert.equal((await submit()).status, 202); // Even after completion, resend is free.
    assert.equal((await submit({ ...body, question: 'Changed payload' })).status, 409);
    assert.equal((await submit({ ...body, requestId: crypto.randomUUID() }, 'shared-viewer')).status, 403);
    assert.equal((await worker.fetch(`/?id=${crypto.randomUUID()}`)).status, 404);
    assert.equal((await worker.fetch(`/snapshot?id=${crypto.randomUUID()}`)).status, 404);
    assert.equal((await worker.fetch(`/?id=${id}&after=999999`)).status, 400);
    const full = parse(await (await worker.fetch(`/?id=${id}`)).text());
    assert.ok(full.some(record => record.event.type === 'artifact'));
    assert.ok(full.some(record => record.event.type === 'status' && record.event.summary_for_user === 'Checking council seats'));
    const slow = { ...body, requestId: crypto.randomUUID(), question: 'slow' };
    assert.equal((await submit(slow)).status, 202);
    assert.equal((await submit({ ...body, requestId: crypto.randomUUID() })).status, 409);
    assert.equal((await (await worker.fetch(`/stop?id=${id}&turn=${slow.requestId}`, { headers: { key: 'viewer' } })).json() as { status: number }).status, 403);
    // Stale stop requests must not cancel the newer turn.
    await worker.fetch(`/stop?id=${id}&turn=${requestId}`, { headers: { key } });
    await worker.fetch(`/stop?id=${id}&turn=${slow.requestId}`, { headers: { key } });
    assert.match(await (await worker.fetch(`/?id=${id}`)).text(), /Answer stopped/);
    const interruptedId = crypto.randomUUID();
    await worker.fetch(`/seed?id=${id}&turn=${interruptedId}`);
    const visualId = crypto.randomUUID();
    await submit({ threadId: visualId, requestId: crypto.randomUUID(), question: 'visual' });
    const visualBefore = await (await worker.fetch(`/?id=${visualId}&view=snapshot`)).text();
    assert.match(visualBefore, /"kind":"visual"/);
    await worker.stop();
    worker = await start();
    const restored = await (await worker.fetch(`/?id=${id}`)).text();
    assert.match(restored, /completed/);
    assert.match(restored, /Partial persisted/);
    assert.match(restored, /server restarted/);
    assert.equal(parse(restored).at(-1)?.event.type, 'error');
    assert.equal(await (await worker.fetch(`/count?id=${id}`)).json(), 2, 'restart must not reserve/re-bill an interrupted turn');
    const visualReplay = JSON.parse((await (await worker.fetch(`/?id=${visualId}&view=snapshot`)).text()).trim()) as ThreadSnapshot;
    const savedVisual = visualReplay.turns[0]!.artifacts[0]!;
    assert.equal(savedVisual.kind, 'visual');
    if (savedVisual.kind === 'visual') {
      assert.equal(savedVisual.charts.support!.columns[1]!.status, 'hypothetical');
      assert.equal(savedVisual.charts.ab!.columns[0]!.parties[0]!.value, 8);
    }
    const followup = { ...body, requestId: crypto.randomUUID(), question: 'Follow up' };
    assert.equal((await submit(followup)).status, 202);
    const followed = await (await worker.fetch(`/?id=${id}`)).text();
    assert.match(followed, /Saved context: 7/);

    await worker.fetch(`/history?id=${id}&turn=${crypto.randomUUID()}`);
    const rawHistory = await (await worker.fetch(`/?id=${id}`)).text();
    const compactHistory = await (await worker.fetch(`/?id=${id}&view=snapshot`)).text();
    const frames = compactHistory.trim().split('\n').map(line => JSON.parse(line) as ThreadFrame);
    assert.equal(frames.length, 1, 'completed history is one snapshot, not hundreds of typing/progress events');
    const snapshot = frames[0] as ThreadSnapshot;
    assert.equal(snapshot.type, 'snapshot');
    assert.equal(snapshot.after, 0);
    assert.equal(snapshot.seq, parse(rawHistory).at(-1)!.seq);
    assert.equal(snapshot.turns.at(-1)!.answer, 'A saved answer → '.repeat(600));
    assert.equal(snapshot.turns.at(-1)!.status, 'done');
    assert.equal(snapshot.turns.at(-1)!.artifacts.length, 1);
    assert.equal(snapshot.turns.at(-1)!.progress?.summary_for_user, 'Checking old seats');
    assert.match(snapshot.turns.find(turn => turn.id === interruptedId)!.error!, /server restarted/);
    assert.ok(compactHistory.length < rawHistory.length / 3, 'coalescing substantially reduces the saved-history payload');
    assert.deepEqual(await (await worker.fetch(`/snapshot?id=${id}`)).json(), snapshot, 'SSR reads the same saved state without opening a live stream');

    // Read the next answer mid-generation, then reconnect from the snapshot's
    // cursor. Its assembled prefix must not appear a second time in the tail.
    const running = { ...body, requestId: crypto.randomUUID(), question: 'slow' };
    await submit(running);
    const live = await worker.fetch(`/?id=${id}&after=${snapshot.seq}&view=snapshot`);
    const liveReader = live.body!.getReader();
    let initial = '';
    while (!initial.includes('\n')) initial += new TextDecoder().decode((await liveReader.read()).value);
    const opening = JSON.parse(initial.split('\n')[0]!) as ThreadSnapshot;
    assert.equal(opening.type, 'snapshot');
    assert.equal(opening.turns.length, 1, 'reconnect snapshots contain only changed turns');
    assert.equal(opening.turns[0]!.status, 'running');
    await liveReader.cancel();
    const rendered = await (await worker.fetch(`/snapshot?id=${id}`)).json() as ThreadSnapshot;
    assert.equal(rendered.turns.at(-1)!.status, 'running', 'SSR returns immediately with the current partial answer');
    const remaining = parse(await (await worker.fetch(`/?id=${id}&after=${rendered.seq}`)).text());
    const suffix = remaining.flatMap(record => record.event.type === 'text' ? [record.event.text] : []).join('');
    assert.equal(rendered.turns.at(-1)!.answer + suffix, 'Saved context: 11. Partial → completed.');
    assert.equal(remaining.at(-1)!.event.type, 'done');

    // Exercise real SQLite persistence, beyond the batcher's fake-clock tests.
    type Inspection = { stage: string; turns: { id: string; answer: string; status: string; bytes: number }[];
      events: { seq: number; turn_id: string; data: string }[] };
    const inspect = (thread: string) => worker.fetch(`/inspect?id=${thread}`).then(r => r.json() as Promise<Inspection>);
    const textOf = (events: ThreadEvent[]) => events.flatMap(row => row.event.type === 'text' ? [row.event.text] : []).join('');
    const batchRun = async (question: string, threadId = crypto.randomUUID()) => {
      await submit({ threadId, requestId: crypto.randomUUID(), question });
      const events = parse(await (await worker.fetch(`/?id=${threadId}`)).text());
      return { threadId, events };
    };
    const burst = await batchRun('batch:boundaries');
    const burstText = burst.events.filter(row => row.event.type === 'text');
    assert.equal(burstText.length, 4, '503 provider text fragments become four saved text batches');
    assert.deepEqual(burst.events.slice(2).map(row => row.event.type), ['text', 'text', 'status', 'text', 'artifact', 'text', 'done']);
    assert.equal(textOf(burst.events), 'first → ' + 'x'.repeat(500) + 'before chartlast');
    const storedBurst = await inspect(burst.threadId);
    assert.equal(storedBurst.turns[0]!.answer, textOf(burst.events));
    assert.equal(storedBurst.turns[0]!.bytes, storedBurst.events.reduce((sum, row) => sum + new TextEncoder().encode(row.data).byteLength, 0));

    for (const mode of ['stop', 'alarm', 'throws']) {
      const ended = await batchRun(`batch:${mode}`);
      assert.equal(ended.events.at(-1)!.event.type, 'error');
      assert.equal(textOf(ended.events), 'first → ' + 'x'.repeat(500), `${mode} flushes buffered text before the terminal error`);
      if (mode !== 'throws') {
        const timing = await (await worker.fetch(`/terminal-inspection?id=${ended.threadId}`)).json() as { before: Inspection; after: Inspection };
        assert.equal(timing.before.turns[0]!.answer, 'first → ', 'the buffer was not already saved by a timer');
        assert.equal(timing.after.turns[0]!.answer, textOf(ended.events));
        assert.equal(timing.after.turns[0]!.status, 'error');
      }
      await batchRun('batch:boundaries', ended.threadId);
      assert.equal((await inspect(ended.threadId)).turns[0]!.answer, textOf(ended.events), 'late output cannot contaminate a new turn');
    }

    const waitingId = crypto.randomUUID();
    await submit({ threadId: waitingId, requestId: crypto.randomUUID(), question: 'batch:wait' });
    let waiting = await inspect(waitingId);
    for (let attempt = 0; attempt < 100 && waiting.turns[0]!.answer.length < 500; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      waiting = await inspect(waitingId);
    }
    assert.equal(waiting.stage, 'waiting');
    assert.equal(waiting.turns[0]!.answer, 'first → ' + 'x'.repeat(500), 'the deadline saves text while the provider is idle');
    assert.equal(waiting.turns[0]!.status, 'running');
    const checkpoint = await (await worker.fetch(`/snapshot?id=${waitingId}`)).json() as ThreadSnapshot;
    await worker.fetch(`/resume?id=${waitingId}`);
    const resumed = parse(await (await worker.fetch(`/?id=${waitingId}&after=${checkpoint.seq}`)).text());
    assert.equal(checkpoint.turns[0]!.answer + textOf(resumed), 'first → ' + 'x'.repeat(500) + 'last');
    assert.equal(resumed.at(-1)!.event.type, 'done');

    const limited = await batchRun('batch:limit');
    assert.match(JSON.stringify(limited.events.at(-1)!.event), /saved-output limit/);
    const storedLimit = await inspect(limited.threadId);
    assert.equal(storedLimit.turns[0]!.bytes, storedLimit.events.reduce((sum, row) => sum + new TextEncoder().encode(row.data).byteLength, 0));
    assert.ok(storedLimit.turns[0]!.answer.length < 512_000);
    assert.equal(storedLimit.turns[0]!.status, 'error');
  } finally { await worker.stop(); rmSync(directory, { recursive: true, force: true }); }
});
