import { PersistentChatThread } from '../../src/lib/chat/thread.ts';
import type { ChatEvent, ChatMessage, ThreadRequest } from '../../src/lib/chat/contracts.ts';
import { visualFixture } from './chat-visual.ts';

export class TestChatThread extends PersistentChatThread {
  private resumeGeneration?: () => void;
  private batchStage = '';
  private terminalInspection?: { before: ReturnType<TestChatThread['inspect']>; after: ReturnType<TestChatThread['inspect']> };
  protected async reserve() {
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS reservations (n INTEGER)');
    this.ctx.storage.sql.exec('INSERT INTO reservations VALUES (1)');
    return true;
  }
  protected async generate(messages: ChatMessage[], signal: AbortSignal, emit: (event: ChatEvent) => void) {
    const question = messages.at(-1)?.content;
    if (question?.startsWith('batch:')) {
      emit({ type: 'text', text: 'first → ' });
      for (let i = 0; i < 500; i++) emit({ type: 'text', text: 'x' });
      if (question === 'batch:stop' || question === 'batch:alarm') {
        const before = this.inspect();
        if (question === 'batch:alarm') await this.alarm();
        else {
          const key = this.ctx.storage.sql.exec<{ key_hash: string }>('SELECT key_hash FROM owner').one().key_hash;
          await this.stop(key, before.turns.at(-1)!.id as string);
        }
        this.terminalInspection = { before, after: this.inspect() };
        emit({ type: 'text', text: 'LATE OUTPUT' });
        return;
      }
      if (question === 'batch:boundaries') {
        emit({ type: 'status', phase: 'tool', text: 'Checking', summary_for_user: 'Checking seats' });
        emit({ type: 'text', text: 'before chart' });
        emit({ type: 'artifact', artifact: { kind: 'analysis', code: 'return 22;', result: 22 } });
        emit({ type: 'text', text: 'last' }); emit({ type: 'done' }); return;
      }
      if (question === 'batch:throws') throw new Error('simulated generation failure');
      if (question === 'batch:limit') {
        for (let i = 0; i < 200 && !signal.aborted; i++) emit({ type: 'text', text: 'z'.repeat(4096) });
        return;
      }
      this.batchStage = 'waiting';
      await new Promise<void>(resolve => {
        this.resumeGeneration = resolve;
        signal.addEventListener('abort', () => resolve(), { once: true });
      });
      this.batchStage = 'finished'; this.resumeGeneration = undefined;
      if (!signal.aborted) { emit({ type: 'text', text: 'last' }); emit({ type: 'done' }); }
      // Deliberately uncooperative late output must not affect a later turn.
      else emit({ type: 'text', text: 'LATE OUTPUT' });
      return;
    }
    emit({ type: 'status', phase: 'tool', text: 'Checking council seats', summary_for_user: 'Checking council seats' });
    emit({ type: 'text', text: `Saved context: ${messages.length}. Partial → ` });
    const wait = messages.at(-1)?.content === 'slow' ? 5000 : 150;
    await new Promise<void>(resolve => {
      const timer = setTimeout(resolve, wait);
      signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
    });
    if (signal.aborted) return;
    emit({ type: 'artifact', artifact: messages.at(-1)?.content === 'visual' ? visualFixture() : { kind: 'analysis', code: 'return 22;', result: 22 } });
    emit({ type: 'text', text: 'completed.' });
    emit({ type: 'done' });
  }
  count() { return this.ctx.storage.sql.exec<{ n: number }>('SELECT COUNT(*) AS n FROM reservations').one().n; }
  resume() { this.resumeGeneration?.(); }
  inspect() {
    return { stage: this.batchStage,
      turns: this.ctx.storage.sql.exec('SELECT id,answer,status,bytes FROM turns ORDER BY rowid').toArray(),
      events: this.ctx.storage.sql.exec('SELECT seq,turn_id,data FROM events ORDER BY seq').toArray() };
  }
  inspectTerminal() { return this.terminalInspection; }
  seedInterruption(id: string) {
    this.ctx.storage.sql.exec("INSERT INTO turns (id,question,answer,status,created) VALUES (?,'interrupted question','Partial persisted','running',?)", id, Date.now());
    this.ctx.storage.sql.exec('INSERT INTO events (turn_id,data) VALUES (?,?)', id, JSON.stringify({ type: 'question', text: 'interrupted question' }));
    this.ctx.storage.sql.exec('INSERT INTO events (turn_id,data) VALUES (?,?)', id, JSON.stringify({ type: 'text', text: 'Partial persisted' }));
  }
  seedHistory(id: string, count: number) {
    const text = 'A saved answer → '.repeat(count);
    this.ctx.storage.sql.exec("INSERT INTO turns (id,question,answer,status,created) VALUES (?,'Saved question',?,'done',?)", id, text, Date.now());
    const add = (event: ChatEvent | { type: 'question'; text: string }) => this.ctx.storage.sql.exec(
      'INSERT INTO events (turn_id,data) VALUES (?,?)', id, JSON.stringify(event));
    add({ type: 'question', text: 'Saved question' });
    add({ type: 'status', phase: 'tool', text: 'Checking old seats', summary_for_user: 'Checking old seats' });
    for (let i = 0; i < count; i++) add({ type: 'text', text: 'A saved answer → ' });
    add({ type: 'artifact', artifact: { kind: 'analysis', code: 'return 22;', result: 22 } });
    add({ type: 'status', phase: 'answering', text: 'Writing the answer' });
    add({ type: 'done' });
  }
}
export default {
  async fetch(request: Request, env: { THREADS: DurableObjectNamespace<TestChatThread> }) {
    const url = new URL(request.url), id = url.searchParams.get('id')!;
    const stub = env.THREADS.getByName(id);
    if (url.pathname === '/inspect') return Response.json(await stub.inspect());
    if (url.pathname === '/resume') { await stub.resume(); return new Response('resumed'); }
    if (url.pathname === '/terminal-inspection') return Response.json(await stub.inspectTerminal());
    if (url.pathname === '/snapshot') return stub.readSnapshot();
    if (url.pathname === '/count') return Response.json(await stub.count());
    if (url.pathname === '/seed') { await stub.seedInterruption(url.searchParams.get('turn')!); return new Response('seeded'); }
    if (url.pathname === '/history') { await stub.seedHistory(url.searchParams.get('turn')!, 600); return new Response('seeded'); }
    if (url.pathname === '/stop') return Response.json(await stub.stop(request.headers.get('key') ?? '', url.searchParams.get('turn')!));
    if (request.method === 'POST') return Response.json(await stub.submit(await request.json<ThreadRequest>(), request.headers.get('key') ?? '', 'test'));
    return stub.watch(Number(url.searchParams.get('after') ?? 0), url.searchParams.get('view') === 'snapshot');
  },
};
