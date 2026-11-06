import { syncSearchState } from '../address/search-state.ts';
import { HistoryCache } from './cache.ts';
import { updateResults } from '../live/results.ts';

const key = (url: string) => { const parsed = new URL(url, location.href); parsed.hash = ''; return parsed.href; };
const cache = new HistoryCache(async url => {
  const response = await fetch(url, { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok || !response.headers.get('Content-Type')?.includes('text/html')) throw new Error('Results unavailable');
  const html = await response.text();
  const page = new DOMParser().parseFromString(html, 'text/html');
  if (!page.querySelector('#main election-history')) throw new Error('Missing election view');
  return { html, live: !!page.querySelector('#main[data-live-results]') };
});
let renderedUrl = key(location.href);
let request = 0;

function setStatus(message = '', failed = false) {
  const control = document.querySelector<ElectionHistory>('election-history');
  if (!control) return;
  control.toggleAttribute('aria-busy', !!message && !failed);
  const status = control.querySelector<HTMLElement>('[data-history-status]')!;
  status.hidden = !message; status.textContent = message;
}

async function selectYear(url: string) {
  const target = key(url), version = ++request;
  const control = document.querySelector<ElectionHistory>('election-history');
  if (!control) return;
  // Reflect the reader's selection immediately, without moving the native thumb
  // back to a previously rendered year while its results are still loading.
  control.showYear(target);
  if (target === renderedUrl) { setStatus(); document.dispatchEvent(new Event('results:year-changed')); return; }
  document.dispatchEvent(new Event('results:year-loading'));
  setStatus(`Loading ${control.yearFor(target)}…`);
  try {
    const cached = cache.peek(target);
    const page = new DOMParser().parseFromString((cached ?? await cache.get(target)).html, 'text/html');
    if (version !== request) return;
    await Promise.all([import('../address/autocomplete.ts'), import('../address/client.ts'), import('../maps/fixed-loader.ts')]);
    if (version !== request) return;
    const next = page.querySelector<HTMLElement>('#main')!;
    const current = document.querySelector<HTMLElement>('#main')!;
    const nextControl = next.querySelector<ElectionHistory>('election-history')!;
    if (nextControl.dataset.scope !== control.dataset.scope) throw new Error('Different election area');
    // Keep the native range and its surrounding card mounted throughout a drag.
    const top = control.getBoundingClientRect().top;
    const focused = document.activeElement === control.querySelector('input');
    document.dispatchEvent(new Event('results:before-year-change'));
    current.toggleAttribute('data-live-results', next.hasAttribute('data-live-results'));
    current.dataset.resultsUrl = target;
    updateResults(current, next, true);
    syncSearchState(page);
    // Scrubbing is a local view change. Canonical links still open standalone
    // election pages, but the loaded route, metadata and history stay intact.
    renderedUrl = target;
    control.showYear(target);
    setStatus();
    if (focused) control.querySelector<HTMLInputElement>('input')!.focus({ preventScroll: true });
    window.scrollBy({ top: control.getBoundingClientRect().top - top, behavior: 'instant' });
    document.dispatchEvent(new Event('results:year-changed'));
    document.dispatchEvent(new Event('results:updated'));
  } catch {
    if (version !== request) return;
    const failedYear = control.yearFor(target);
    control.showYear(renderedUrl);
    setStatus(`Couldn’t load ${failedYear}. Showing ${control.yearFor(renderedUrl)}. Select the year to retry.`, true);
    document.dispatchEvent(new Event('results:year-changed'));
  }
}

class ElectionHistory extends HTMLElement {
  private initialized = false;
  private warming = false;
  private syncLinks() {
    const current = new URL(location.href);
    for (const link of this.links()) {
      const url = new URL(link.href);
      for (const name of ['ballot', 'q']) {
        if (current.searchParams.has(name)) url.searchParams.set(name, current.searchParams.get(name)!);
        else url.searchParams.delete(name);
      }
      link.href = url.href;
    }
  }
  private links() { return [...this.querySelectorAll<HTMLAnchorElement>('[data-year]')]; }
  yearFor(url: string) { return this.links().find(link => new URL(link.href).pathname === new URL(url).pathname)?.dataset.year ?? ''; }
  showYear(url: string) {
    const links = this.links(), index = links.findIndex(link => new URL(link.href).pathname === new URL(url).pathname);
    if (index < 0) return;
    const year = links[index]!.dataset.year!;
    const input = this.querySelector<HTMLInputElement>('input')!;
    input.value = String(index); input.setAttribute('aria-valuetext', year);
    this.querySelector('output')!.textContent = year;
    this.dataset.current = String(index);
    for (const link of links) {
      if (new URL(link.href).pathname === new URL(url).pathname) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    }
  }
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    const input = this.querySelector<HTMLInputElement>('input')!;
    input.addEventListener('input', () => {
      this.syncLinks();
      const link = this.links()[Number(input.value)];
      if (!link) return;
      input.setAttribute('aria-valuetext', link.dataset.year!);
      void selectYear(link.href);
    });
    this.addEventListener('click', event => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-year]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); this.syncLinks(); void selectYear(link.href);
    });
    const warm = () => {
      if (this.warming || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
      this.syncLinks();
      this.warming = true;
      // Start with the selected year and its closest neighbours, with two reads at a time.
      const links = this.links(), current = Number(this.dataset.current);
      const urls = links.map((link, index) => ({ url: key(link.href), distance: Math.abs(index - current) }))
        .sort((a, b) => a.distance - b.distance).map(link => link.url);
      void cache.warm(urls).finally(() => { this.warming = false; });
    };
    this.addEventListener('pointerenter', warm);
    this.addEventListener('focusin', warm);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); warm(); }
    });
    observer.observe(this);
  }
}
if (!customElements.get('election-history')) customElements.define('election-history', ElectionHistory);
