export const POLL_INTERVAL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 15_000;

/** One request at a time, with no polling while hidden or offline. */
export function pollWhileVisible(
  refresh: (signal: AbortSignal) => Promise<void>,
  onError: (error: unknown) => void = () => {},
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let request: AbortController | undefined;
  let stopped = false;
  let suspended = false;
  let resumeAfterRequest = false;
  let lastStarted = -Infinity;
  const visible = () => !stopped && !suspended && !document.hidden && navigator.onLine !== false;
  const clear = () => { clearTimeout(timer); timer = undefined; };
  const schedule = () => {
    clear();
    if (visible()) timer = setTimeout(() => void run(), POLL_INTERVAL_MS);
  };
  async function run() {
    if (!visible() || request) return;
    // Switching tabs can emit both visibilitychange and focus.
    if (Date.now() - lastStarted < 1_000) { if (!timer) schedule(); return; }
    clear();
    lastStarted = Date.now();
    const controller = new AbortController();
    request = controller;
    const timeout = setTimeout(() => controller.abort(new Error('Refresh timed out')), REQUEST_TIMEOUT_MS);
    try { await refresh(controller.signal); }
    catch (error) { if (!stopped && !suspended) onError(error); }
    finally {
      clearTimeout(timeout); request = undefined;
      if (resumeAfterRequest && visible()) { resumeAfterRequest = false; void run(); }
      else schedule();
    }
  }
  const wake = () => { if (visible()) void run(); else clear(); };
  const hide = () => { suspended = true; clear(); request?.abort(); };
  const show = (event: PageTransitionEvent) => {
    suspended = false;
    if (!event.persisted) return;
    lastStarted = -Infinity;
    // An aborted fetch may not settle until a frozen page is restored.
    if (request) resumeAfterRequest = true;
    else wake();
  };
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('focus', wake);
  window.addEventListener('online', wake);
  window.addEventListener('offline', wake);
  window.addEventListener('pagehide', hide);
  window.addEventListener('pageshow', show);
  schedule();
  return () => {
    stopped = true; clear(); request?.abort();
    document.removeEventListener('visibilitychange', wake);
    window.removeEventListener('focus', wake);
    window.removeEventListener('online', wake);
    window.removeEventListener('offline', wake);
    window.removeEventListener('pagehide', hide);
    window.removeEventListener('pageshow', show);
  };
}
