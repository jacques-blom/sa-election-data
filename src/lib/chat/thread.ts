import { DurableObject } from 'cloudflare:workers';
import { turnLimits, reserveTurn } from './limits.ts';
import { TextBatcher } from './text-batcher.ts';
import type { ChatEvent, ChatMessage, SavedThreadTurn, ThreadEvent, ThreadRequest, ThreadSnapshot } from './contracts.ts';

type Turn = { id: string; question: string; answer: string; status: SavedThreadTurn['status']; bytes: number; created: number };
export type SubmitResult = { status: number; error?: string };
const interrupted = 'The server restarted before this answer finished. Your messages and partial answer are saved. Ask a follow-up to continue.';

/** One SQLite-backed object per UUID. Connections only read the persisted journal. */
export abstract class PersistentChatThread extends DurableObject<Env> {
  private controller?: AbortController;
  private output?: { id: string; batch: TextBatcher };
  private wakeups = new Set<() => void>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS owner (id INTEGER PRIMARY KEY CHECK(id=1), key_hash TEXT NOT NULL)`);
      ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS turns (id TEXT PRIMARY KEY, question TEXT NOT NULL,
        answer TEXT NOT NULL DEFAULT '', status TEXT NOT NULL, bytes INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL)`);
      ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, turn_id TEXT NOT NULL, data TEXT NOT NULL)`);
      // An OpenAI stream cannot survive an isolate restart. Never silently re-bill it.
      for (const row of ctx.storage.sql.exec<{ id: string }>("SELECT id FROM turns WHERE status='running'").toArray()) {
        this.record(row.id, { type: 'error', message: interrupted });
      }
    });
  }

  protected abstract generate(messages: ChatMessage[], signal: AbortSignal, emit: (event: ChatEvent) => void): Promise<void>;
  protected reserve(ip: string) {
    // Vite replaces DEV with false in production, even if a dev-shell variable leaks.
    const limits = turnLimits(this.env.CHAT_DAILY_TURNS, import.meta.env.DEV ? import.meta.env.COUNTED_CHAT_TEST_LIMIT : 0);
    return reserveTurn(this.env.RESULTS_DB, ip, this.env.OPENROUTER_API_KEY,
      limits.daily, Date.now(), limits.visitor);
  }

  private owns(keyHash: string) {
    const owner = this.ctx.storage.sql.exec<{ key_hash: string }>('SELECT key_hash FROM owner WHERE id=1').toArray()[0];
    return !!owner && owner.key_hash === keyHash; // The supplied secret was SHA-256 hashed by the API.
  }
  private active() {
    return this.ctx.storage.sql.exec<Turn>("SELECT * FROM turns WHERE status='running' LIMIT 1").toArray()[0];
  }

  async submit(body: ThreadRequest, keyHash: string, ip: string): Promise<SubmitResult> {
    const sql = this.ctx.storage.sql;
    const owner = sql.exec('SELECT id FROM owner').toArray()[0];
    if (owner && !this.owns(keyHash)) return { status: 403, error: 'This shared conversation is read-only. Start a new conversation to ask a question.' };
    const previous = sql.exec<Turn>('SELECT * FROM turns WHERE id=?', body.requestId).toArray()[0];
    if (previous) return previous.question === body.question ? { status: 202 } : { status: 409, error: 'This request ID was already used for a different question.' };
    if (this.active()) return { status: 409, error: 'This conversation is already answering a question. Reconnect to see its progress.' };
    if (sql.exec<{ n: number }>('SELECT COUNT(*) AS n FROM turns').one().n >= 20) {
      return { status: 409, error: 'This conversation has reached 20 questions. Start a new conversation to continue.' };
    }
    this.ctx.storage.transactionSync(() => {
      if (!owner) sql.exec('INSERT INTO owner (id,key_hash) VALUES (1,?)', keyHash);
      sql.exec("INSERT INTO turns (id,question,status,created) VALUES (?,?,'running',?)", body.requestId, body.question, Date.now());
      this.record(body.requestId, { type: 'question', text: body.question, startedAt: Date.now() });
      this.record(body.requestId, { type: 'status', phase: 'thinking', text: 'Thinking' });
    });
    const controller = new AbortController();
    this.controller = controller;
    // DO waitUntil keeps the work alive after HTTP subscribers disconnect.
    this.ctx.waitUntil(this.run(body.requestId, ip, controller));
    return { status: 202 };
  }

  private async run(id: string, ip: string, controller: AbortController) {
    // A timer-side storage failure must reach the generation's normal error path.
    const failure = Promise.withResolvers<never>();
    const batch = new TextBatcher(event => this.record(id, event), failure.reject);
    const output = { id, batch };
    this.output = output;
    try {
      await this.ctx.storage.setAlarm(Date.now() + 120_000);
      if (!await this.reserve(ip)) {
        this.record(id, { type: 'error', message: 'Chat has reached a usage limit. Please try later, or explore the results directly.' });
        return;
      }
      if (controller.signal.aborted) return;
      const turns = this.ctx.storage.sql.exec<Turn>('SELECT * FROM turns ORDER BY created DESC, rowid DESC LIMIT 6').toArray().reverse();
      const messages: ChatMessage[] = turns.flatMap(turn => [
        { role: 'user' as const, content: turn.question },
        ...(turn.id === id ? [] : [{ role: 'assistant' as const, content: `${turn.answer.slice(0, 6000) || 'See saved charts and sources.'}${turn.status === 'error' ? '\n[This answer was incomplete.]' : ''}` }]),
      ]);
      await Promise.race([this.generate(messages, controller.signal, event => {
        if (!controller.signal.aborted) batch.emit(event);
      }), failure.promise]);
    } catch {
      controller.abort();
      this.record(id, { type: 'error', message: 'The assistant could not finish this answer. Your conversation is saved; please try a follow-up.' });
    } finally {
      if (this.active()?.id === id) this.record(id, { type: 'error', message: 'This answer ended before it was complete. Your partial answer is saved.' });
      batch.dispose();
      if (this.output === output) this.output = undefined;
      // A newer turn may already have started while this one cleaned up.
      if (this.controller === controller) {
        this.controller = undefined;
        if (!this.active()) await this.ctx.storage.deleteAlarm();
      }
    }
  }

  private record(id: string, event: ThreadEvent['event']) {
    // Stop, watchdog and exception paths bypass the model callback. They must
    // save buffered text before marking the turn terminal too.
    if (event.type !== 'text' && this.output?.id === id) {
      this.output.batch.flush();
      if (event.type === 'done' || event.type === 'error') this.output.batch.dispose();
    }
    const sql = this.ctx.storage.sql;
    const turn = sql.exec<Turn>('SELECT * FROM turns WHERE id=?', id).toArray()[0];
    if (!turn || turn.status !== 'running') return;
    let data = JSON.stringify(event);
    let size = new TextEncoder().encode(data).byteLength;
    let exceeded = false;
    if (turn.bytes + size > 512_000) {
      event = { type: 'error', message: 'This answer reached its saved-output limit. Please ask a narrower follow-up.' };
      data = JSON.stringify(event);
      size = new TextEncoder().encode(data).byteLength;
      exceeded = true;
    }
    this.ctx.storage.transactionSync(() => {
      sql.exec('INSERT INTO events (turn_id,data) VALUES (?,?)', id, data);
      sql.exec('UPDATE turns SET bytes=bytes+?, answer=answer || ?, status=? WHERE id=?',
        size, event.type === 'text' ? event.text : '', event.type === 'done' || event.type === 'error' ? event.type : 'running', id);
    });
    if (exceeded) {
      if (this.output?.id === id) this.output.batch.dispose();
      this.controller?.abort();
    }
    for (const wake of this.wakeups) wake();
    this.wakeups.clear();
  }

  async stop(keyHash: string, turnId: string): Promise<SubmitResult> {
    if (!this.owns(keyHash)) return { status: 403, error: 'Only the original browser can stop this answer.' };
    if (this.active()?.id === turnId) {
      this.controller?.abort();
      this.record(turnId, { type: 'error', message: 'Answer stopped. Your messages and partial answer are saved.' });
    }
    return { status: 200 };
  }

  async alarm() {
    const active = this.active();
    if (active) {
      this.controller?.abort();
      this.record(active.id, { type: 'error', message: 'This answer reached its time limit. Your partial answer is saved.' });
    }
  }

  private snapshot(after: number, through: number): ThreadSnapshot {
    const sql = this.ctx.storage.sql;
    const turns = sql.exec<Turn>(`SELECT * FROM turns WHERE id IN
      (SELECT turn_id FROM events WHERE seq>? AND seq<=?) ORDER BY created, rowid`, after, through).toArray();
    const saved = new Map<string, SavedThreadTurn>(turns.map(turn => [turn.id, {
      id: turn.id, question: turn.question, answer: turn.answer, startedAt: turn.created,
      status: turn.status, artifacts: [],
    }]));
    if (saved.size) {
      // Text is already assembled in turns.answer. Only read presentation events
      // into JS, retaining artifacts and the latest progress/error for each turn.
      const presentation = sql.exec<{ turn_id: string; data: string }>(`SELECT turn_id,data FROM events
        WHERE seq<=? AND turn_id IN (SELECT turn_id FROM events WHERE seq>? AND seq<=?)
        AND json_extract(data,'$.type') IN ('artifact','status','error') ORDER BY seq`, through, after, through);
      for (const row of presentation) {
        const turn = saved.get(row.turn_id)!;
        const event = JSON.parse(row.data) as ChatEvent;
        if (event.type === 'artifact') turn.artifacts.push(event.artifact);
        else if (event.type === 'error') turn.error = event.message;
        else if (event.type === 'status') turn.progress = { ...event,
          summary_for_user: event.summary_for_user ?? turn.progress?.summary_for_user };
      }
    }
    return { type: 'snapshot', after, seq: through, turns: [...saved.values()] };
  }

  /** Public, read-only state for SSR. A Response streams large bodies across RPC. */
  readSnapshot(): Response {
    const sql = this.ctx.storage.sql;
    if (!sql.exec('SELECT id FROM owner').toArray().length) return Response.json({ error: 'Conversation not found.' }, { status: 404 });
    const last = sql.exec<{ n: number }>('SELECT COALESCE(MAX(seq),0) AS n FROM events').one().n;
    return Response.json(this.snapshot(0, last));
  }

  /** Capture saved state synchronously, then tail strictly after its cursor. */
  watch(after: number, compact = false): Response {
    const sql = this.ctx.storage.sql;
    if (!sql.exec('SELECT id FROM owner').toArray().length) return Response.json({ error: 'Conversation not found.' }, { status: 404 });
    const last = sql.exec<{ n: number }>('SELECT COALESCE(MAX(seq),0) AS n FROM events').one().n;
    if (!Number.isSafeInteger(after) || after < 0 || after > last) return Response.json({ error: 'Invalid conversation cursor.' }, { status: 400 });
    // No await between the cursor and snapshot: new generation events cannot
    // slip into the assembled answer and then be applied again by the live tail.
    let snapshot = compact ? this.snapshot(after, last) : undefined;
    let cursor = after, closed = false, wake: (() => void) | undefined, timer: ReturnType<typeof setTimeout> | undefined;
    const encoder = new TextEncoder();
    const cleanup = () => { if (timer) clearTimeout(timer); if (wake) this.wakeups.delete(wake); };
    const stream = new ReadableStream<Uint8Array>({
      pull: async controller => {
        if (snapshot) {
          cursor = snapshot.seq;
          controller.enqueue(encoder.encode(JSON.stringify(snapshot) + '\n'));
          snapshot = undefined;
          return;
        }
        for (;;) {
          if (closed) return;
          const rows = sql.exec<{ seq: number; turn_id: string; data: string }>('SELECT * FROM events WHERE seq>? ORDER BY seq LIMIT 32', cursor).toArray();
          if (rows.length) {
            const data = rows.map(row => JSON.stringify({ seq: row.seq, turnId: row.turn_id, event: JSON.parse(row.data) })).join('\n');
            cursor = rows.at(-1)!.seq;
            controller.enqueue(encoder.encode(data + '\n'));
            return;
          }
          if (!this.active()) { closed = true; cleanup(); controller.close(); return; }
          await new Promise<void>(resolve => {
            wake = resolve;
            this.wakeups.add(resolve);
            timer = setTimeout(resolve, 15_000);
          });
          cleanup();
          if (!closed) { controller.enqueue(encoder.encode('\n')); return; }
        }
      },
      cancel: () => { closed = true; cleanup(); wake?.(); },
    });
    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer' } });
  }
}
