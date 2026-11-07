import { append, enhanceSavedVisuals, renderArtifact, renderMarkdown } from './render.ts';
import { MAX_THREAD_SNAPSHOT_CHARS, threadIdSchema, type ThreadEvent, type ThreadFrame, type ThreadRequest, type ThreadSnapshot } from './contracts.ts';

type RememberedThread = { id: string; key: string; title: string; updated: number; pending?: ThreadRequest };
const storageKey = 'counted.chat.threads.v1';
const TEXT_RENDER_MS = 50;
const remembered = (): RememberedThread[] => {
  try { const value = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
};

export function mountChat(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-chat-form]')!;
  const input = root.querySelector<HTMLTextAreaElement>('textarea')!;
  const send = root.querySelector<HTMLButtonElement>('[data-send]')!;
  const stop = root.querySelector<HTMLButtonElement>('[data-stop]')!;
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]')!;
  const share = root.querySelector<HTMLButtonElement>('[data-share]')!;
  const reconnect = root.querySelector<HTMLButtonElement>('[data-reconnect]')!;
  const log = root.querySelector<HTMLElement>('[data-messages]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const progress = root.querySelector<HTMLElement>('[data-progress]')!;
  const summary = root.querySelector<HTMLElement>('[data-tool-summary]')!;
  const elapsed = root.querySelector<HTMLElement>('[data-elapsed]')!;
  const welcome = root.querySelector<HTMLElement>('[data-welcome]')!;
  const readonly = root.querySelector<HTMLElement>('[data-readonly]')!;
  const recent = root.querySelector<HTMLElement>('[data-recent]')!;
  const heading = root.querySelector<HTMLElement>('[data-chat-heading]');
  const history = root.querySelector<HTMLElement>('[data-chat-history]');
  const available = root.dataset.available === 'true';
  let threadId = root.dataset.threadId ?? '';
  let owner = remembered().find(thread => thread.id === threadId);
  let cursor = 0, activeId = '', connecting = false, disposed = false, started = 0;
  let subscription: AbortController | undefined;
  const answers = new Map<string, { section: HTMLElement; content: HTMLElement; artifacts: HTMLElement; text: string }>();
  const dirtyAnswers = new Set<string>();
  let renderTimer: ReturnType<typeof setTimeout> | undefined, paintedAt = -Infinity;
  function cancelTextRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = undefined; dirtyAnswers.clear();
  }
  function flushTextRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = undefined;
    if (!dirtyAnswers.size) return;
    for (const id of dirtyAnswers) {
      const answer = answers.get(id)!;
      renderMarkdown(answer.content, answer.text);
    }
    dirtyAnswers.clear(); paintedAt = Date.now();
  }
  function queueTextRender(id: string) {
    dirtyAnswers.add(id);
    const delay = TEXT_RENDER_MS - (Date.now() - paintedAt);
    if (delay <= 0) flushTextRender();
    else if (!renderTimer) renderTimer = setTimeout(flushTextRender, delay);
  }
  // Adopt the server HTML in place. Only an unfinished answer needs its raw
  // Markdown; completed history need not be duplicated in a JSON bootstrap.
  if (root.dataset.chatCursor !== undefined) {
    cursor = Number(root.dataset.chatCursor);
    activeId = root.dataset.activeTurn ?? '';
    started = Number(root.dataset.startedAt ?? 0);
    for (const section of log.querySelectorAll<HTMLElement>('[data-turn-id]')) {
      answers.set(section.dataset.turnId!, { section,
        content: section.querySelector<HTMLElement>('.chat-message-text')!,
        artifacts: section.querySelector<HTMLElement>('[data-artifacts]')!, text: section.dataset.answer ?? '' });
      delete section.dataset.answer;
    }
    enhanceSavedVisuals(log);
  }

  function resizeInput() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 192)}px`;
  }

  function remember(thread: RememberedThread) {
    // Save the write capability and idempotency key before making a paid request.
    window.localStorage.setItem(storageKey, JSON.stringify([thread, ...remembered().filter(item => item.id !== thread.id)]));
    owner = thread;
    showRecent();
  }
  function showRecent() {
    recent.replaceChildren();
    const threads = remembered().filter(thread => threadIdSchema.safeParse(thread.id).success).slice(0, 8);
    if (history) history.hidden = !threads.length;
    if (!threads.length) return;
    for (const thread of threads) {
      const link = document.createElement('a'); link.href = `/chat/${thread.id}`; link.textContent = thread.title;
      if (thread.id === threadId) link.setAttribute('aria-current', 'page');
      append(recent, link);
    }
  }
  function controls() {
    root.dataset.chatState = threadId ? 'conversation' : 'home';
    if (heading) heading.hidden = !threadId;
    const working = !!activeId || connecting;
    const canWrite = !threadId || !!owner;
    send.hidden = !!activeId; send.disabled = working || !available || !canWrite;
    stop.hidden = !activeId || !canWrite; stop.disabled = !activeId;
    input.disabled = working || !available || !canWrite;
    form.hidden = !canWrite; form.setAttribute('aria-busy', String(working));
    readonly.hidden = canWrite;
    share.hidden = !threadId;
    progress.hidden = !status.textContent;
    progress.dataset.busy = String(!!activeId || (connecting && !cursor));
    root.querySelectorAll<HTMLButtonElement>('[data-question]').forEach(button => { button.disabled = working || !available; });
  }
  function message(role: 'user' | 'assistant') {
    const section = document.createElement('article'); section.className = `chat-message chat-message-${role}`;
    const label = document.createElement('p'); label.className = 'chat-message-label'; label.textContent = role === 'user' ? 'You' : 'Counted';
    const content = document.createElement('div'); content.className = 'chat-message-text';
    append(section, label, content); append(log, section); return { section, content };
  }
  function restore(snapshot: ThreadSnapshot) {
    if (snapshot.seq <= cursor) return;
    if (snapshot.after !== cursor) throw new Error('Conversation updates arrived out of order. Reconnecting.');
    flushTextRender();
    for (const turn of snapshot.turns) {
      let answer = answers.get(turn.id);
      if (!answer) {
        message('user').content.textContent = turn.question;
        const created = message('assistant'), artifacts = document.createElement('div'); append(created.section, artifacts);
        answer = { ...created, artifacts, text: '' };
        answers.set(turn.id, answer);
      }
      answer.text = turn.answer;
      renderMarkdown(answer.content, turn.answer);
      answer.artifacts.replaceChildren(...turn.artifacts.map(renderArtifact));
      answer.section.querySelector('.chat-error')?.remove();
      if (turn.status === 'error') {
        const error = document.createElement('p'); error.className = 'chat-error';
        error.textContent = turn.error ?? 'This answer was interrupted.';
        append(answer.section, error);
      }
    }
    const latest = snapshot.turns.at(-1);
    if (latest) {
      welcome.hidden = true;
      activeId = latest.status === 'running' ? latest.id : '';
      started = latest.startedAt;
      elapsed.textContent = '';
      const phase = latest.progress?.phase ?? 'thinking';
      progress.dataset.phase = phase;
      summary.textContent = activeId ? latest.progress?.summary_for_user ?? '' : '';
      status.textContent = activeId
        ? phase === 'tool' ? 'Using election tools' : latest.progress?.text ?? 'Thinking'
        : latest.status === 'error' ? latest.error ?? 'This answer was interrupted.'
          : owner ? 'Answer saved. Ready for your next question.' : 'Answer saved.';
    }
    cursor = snapshot.seq;
    controls();
  }
  function apply(record: ThreadEvent) {
    if (record.seq <= cursor) return;
    if (record.seq !== cursor + 1) throw new Error('Conversation updates arrived out of order. Reconnecting.');
    const { event, turnId } = record;
    if (event.type === 'text') {
      const answer = answers.get(turnId);
      if (!answer) throw new Error('The saved conversation is missing a question.');
      answer.text += event.text;
      queueTextRender(turnId);
      cursor = record.seq;
      return; // Text changes do not need to re-render all composer controls.
    }
    flushTextRender();
    if (event.type === 'question') {
      welcome.hidden = true;
      message('user').content.textContent = event.text;
      const answer = message('assistant'), artifacts = document.createElement('div'); append(answer.section, artifacts);
      answers.set(turnId, { ...answer, artifacts, text: '' });
      activeId = turnId; started = event.startedAt ?? Date.now(); summary.textContent = ''; status.textContent = 'Thinking';
    } else {
      const answer = answers.get(turnId);
      if (!answer) throw new Error('The saved conversation is missing a question.');
      if (event.type === 'artifact') append(answer.artifacts, renderArtifact(event.artifact));
      else if (event.type === 'status') {
        status.textContent = event.phase === 'tool' ? 'Using election tools' : event.text;
        progress.dataset.phase = event.phase ?? 'thinking';
        if (event.summary_for_user) summary.textContent = event.summary_for_user;
      } else if (event.type === 'done' || event.type === 'error') {
        if (activeId === turnId) activeId = '';
        summary.textContent = ''; elapsed.textContent = '';
        status.textContent = event.type === 'done' ? (owner ? 'Answer saved. Ready for your next question.' : 'Answer saved.') : event.message;
        if (event.type === 'error') {
          const error = document.createElement('p'); error.className = 'chat-error'; error.textContent = event.message;
          append(answer.section, error);
        }
      }
    }
    cursor = record.seq;
    controls();
  }
  async function postPending() {
    if (!owner?.pending) return;
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Chat-Key': owner.key },
      body: JSON.stringify(owner.pending) });
    if (!response.ok) {
      const body = await response.json() as { error?: string };
      if (response.status < 500) {
        input.value = owner.pending.question;
        resizeInput();
        remember({ ...owner, pending: undefined });
      }
      throw new Error(body.error ?? 'Could not send the question. Reconnect to check whether it was saved.');
    }
    remember({ ...owner, pending: undefined });
  }
  async function sync() {
    subscription?.abort();
    const controller = new AbortController(); subscription = controller;
    connecting = true; reconnect.hidden = true; controls();
    let failures = 0;
    while (!controller.signal.aborted && !disposed) {
      try {
        await postPending();
        const response = await fetch(`/api/chat/${threadId}?after=${cursor}&view=snapshot`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) {
          const body = await response.json() as { error?: string };
          if (response.status < 500) failures = 5;
          throw new Error(body.error ?? 'Could not load this conversation.');
        }
        if (!response.body) throw new Error('No conversation stream arrived.');
        const reader = response.body.getReader(), decoder = new TextDecoder();
        let buffer = '';
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (controller.signal.aborted || disposed) break;
            buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
            let newline: number;
            while ((newline = buffer.indexOf('\n')) >= 0) {
              const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
              if (line.length > MAX_THREAD_SNAPSHOT_CHARS) throw new Error('This conversation update is too large.');
              if (line) {
                const frame = JSON.parse(line) as ThreadFrame;
                if ('type' in frame && frame.type === 'snapshot') restore(frame);
                else {
                  if (line.length > 1_000_000) throw new Error('This conversation update is too large.');
                  apply(frame as ThreadEvent);
                }
                if (connecting) { connecting = false; controls(); }
              }
            }
            // A network chunk can contain many valid records. Bound a single
            // unfinished record, not the size of a batch being replayed.
            if (buffer.length > MAX_THREAD_SNAPSHOT_CHARS) throw new Error('This conversation update is too large.');
            if (done) break;
          }
        } finally {
          if (!disposed) flushTextRender();
          await reader.cancel().catch(() => {}); reader.releaseLock();
        }
        if (buffer.trim() || activeId) throw new Error('Connection interrupted. Reconnecting to the saved answer…');
        break;
      } catch (reason) {
        if (controller.signal.aborted || disposed) break;
        const retry = ++failures <= 5;
        status.textContent = retry ? 'Reconnecting to the saved answer…' : reason instanceof Error ? reason.message : 'Connection unavailable. Your conversation link is saved.';
        connecting = retry; reconnect.hidden = retry; controls();
        if (!retry) break;
        await new Promise<void>(resolve => {
          const timer = setTimeout(resolve, Math.min(1000 * 2 ** (failures - 1), 8000));
          controller.signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
        });
      }
    }
    if (subscription === controller) { subscription = undefined; connecting = false; controls(); }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || activeId || connecting || !available || (threadId && !owner)) return;
    try {
      if (owner?.pending) { await sync(); return; }
      const id = threadId || crypto.randomUUID();
      remember({ id, key: owner?.key ?? crypto.randomUUID(), title: owner?.title ?? question.slice(0, 70), updated: Date.now(),
        pending: { threadId: id, requestId: crypto.randomUUID(), question } });
      threadId = id;
      window.history.replaceState(null, '', `/chat/${threadId}`);
      showRecent(); input.value = ''; welcome.hidden = true; status.textContent = 'Saving your question…';
      resizeInput();
      await sync();
    } catch {
      status.textContent = 'Your browser could not save this conversation. Allow site storage and try again.';
      controls();
    }
  });
  stop.addEventListener('click', async () => {
    if (!owner || !activeId) return;
    stop.disabled = true;
    try {
      const response = await fetch(`/api/chat/${threadId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Chat-Key': owner.key },
        body: JSON.stringify({ turnId: activeId }) });
      if (!response.ok) throw new Error();
      if (!subscription) void sync();
    } catch { status.textContent = 'Could not confirm the stop. Reconnect to check the answer.'; reconnect.hidden = false; }
    finally { controls(); }
  });
  reset.addEventListener('click', () => { window.location.assign('/chat'); });
  reconnect.addEventListener('click', () => { void sync(); });
  share.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/chat/${threadId}`);
      (share.querySelector('span') ?? share).textContent = 'Link copied';
      share.setAttribute('aria-label', 'Share link copied');
      status.textContent = 'Share link copied.'; controls();
    }
    catch { status.textContent = 'Copy this page’s address to share the conversation.'; controls(); }
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
  });
  input.addEventListener('input', resizeInput);
  window.addEventListener('resize', resizeInput);
  root.querySelectorAll<HTMLButtonElement>('[data-question]').forEach(button => button.addEventListener('click', () => {
    input.value = button.dataset.question!; resizeInput(); input.focus(); form.requestSubmit();
  }));
  const ticker = setInterval(() => { elapsed.textContent = activeId ? `${Math.floor((Date.now() - started) / 1000)}s` : ''; }, 1000);
  const dispose = () => { disposed = true; cancelTextRender(); clearInterval(ticker); subscription?.abort(); window.removeEventListener('resize', resizeInput); };
  // Restoring a page from the back/forward cache must restore its subscription too.
  window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
  window.addEventListener('pagehide', dispose, { once: true });
  summary.setAttribute('aria-live', 'polite');
  showRecent(); controls(); resizeInput();
  if (threadId) {
    welcome.hidden = true;
    if (!cursor) status.textContent = 'Restoring conversation…';
    void sync();
  }
  return dispose;
}

const root = document.querySelector<HTMLElement>('[data-election-chat]');
if (root) mountChat(root);
