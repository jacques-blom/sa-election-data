import morphdom from 'morphdom';
import { pollWhileVisible } from './poll.ts';

/** Patch server-rendered results while retaining the reader's local UI state. */
export function updateResults(current: HTMLElement, next: HTMLElement, yearChange = false) {
  // Keep the keyed results containers and map content slots mounted: refocusing
  // a detached range input cannot restore its active pointer drag.
  morphdom(current, next, {
    childrenOnly: true,
    skipFromChildren: element => element.matches('form, election-history, [data-place-search], [data-address-lookup]')
      || (!yearChange && element.hasAttribute('data-region-map')),
    onBeforeElUpdated(from, to) {
      // Search/autocomplete owns its form, input values, and event listeners.
      if (from.matches('form, election-history, [data-place-search], [data-address-lookup]')) {
        if (yearChange && from instanceof HTMLFormElement && to instanceof HTMLFormElement) from.action = to.action;
        return false;
      }
      if (from instanceof HTMLDetailsElement && to instanceof HTMLDetailsElement) to.open = from.open;
      if (!yearChange && from.hasAttribute('data-region-map')) {
        if (from.getAttribute('data-options') !== to.getAttribute('data-options')) {
          from.setAttribute('data-options', to.getAttribute('data-options')!);
          from.dispatchEvent(new Event('results:map-update'));
        }
        return false;
      }
      return !from.isEqualNode(to);
    },
    // Module scripts are already loaded; only the rendered content is updated.
    onBeforeNodeAdded(node) { return node.nodeName === 'SCRIPT' ? false : node; },
  });
  if (!yearChange) document.dispatchEvent(new Event('results:updated'));
}

let stopPolling: (() => void) | undefined;
function startLiveResults() {
  stopPolling?.();
  stopPolling = undefined;
  const statusNode = document.querySelector<HTMLElement>('#live-results-status');
  if (statusNode) { statusNode.hidden = true; statusNode.textContent = ''; }
  const main = document.querySelector<HTMLElement>('#main[data-live-results]');
  const status = document.querySelector<HTMLElement>('#live-results-status');
  if (main && status) {
    function clearStatus() {
      status!.hidden = true;
      status!.textContent = '';
    }
    let version: string | undefined;
    let confirmPublication = false;
    let lastPageRefresh = 0;
    stopPolling = pollWhileVisible(async signal => {
      const url = new URL(location.href);
      url.hash = '';
      // Poll the small publication/health indicator, not the full results page.
      const healthResponse = await fetch('/api/v1/sync', { signal, cache: 'no-cache' });
      if (!healthResponse.ok) throw new Error('Update status unavailable');
      const health = await healthResponse.json() as Record<string, unknown> | null;
      if (!health || health.year !== 2026 || !('latest_result_publication' in health)) throw new Error('Invalid update status');
      const latest = JSON.stringify([health.latest_result_publication, health.status, health.failed_sources, health.overdue_sources]);
      // Refresh age-based source warnings and check timestamps at least every three minutes.
      if (latest === version && !confirmPublication && Date.now() - lastPageRefresh < 180_000) {
        clearStatus();
        return;
      }
      // Keep the normal shared edge cache; bypass only the browser's cached page.
      const response = await fetch(url, { signal, cache: 'no-cache', headers: { Accept: 'text/html' } });
      if (!response.ok || !response.headers.get('Content-Type')?.includes('text/html')) throw new Error('Results unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const next = page.querySelector<HTMLElement>('#main[data-live-results]');
      if (!next) throw new Error('Missing results');
      // A filter/ballot navigation may have changed while the request was pending.
      if (signal.aborted || url.pathname !== location.pathname || url.search !== location.search) return;
      updateResults(main, next);
      // The publication indicator and HTML have independent 15-second edge caches.
      // Confirm once on the next poll so a cached page cannot hide the last update.
      confirmPublication = latest !== version;
      version = latest;
      lastPageRefresh = Date.now();
      clearStatus();
    }, () => {
      status.hidden = false;
      status.textContent = 'Updates unavailable. Showing the last results and retrying automatically.';
    });
  }
}
startLiveResults();
document.addEventListener('results:year-loading', () => { stopPolling?.(); stopPolling = undefined; });
document.addEventListener('results:year-changed', startLiveResults);
