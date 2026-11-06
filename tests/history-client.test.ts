import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { Window, type HTMLElement as DOMElement, type HTMLInputElement as DOMInput } from 'happy-dom';

// These integrations own Google/WebGL setup, not election switching. Exercise
// the real history controller, HTML parser, search-state sync and DOM patcher.
registerHooks({ resolve(specifier, context, next) {
  if (context.parentURL?.includes('/history/client.ts')
    && ['../address/autocomplete.ts', '../address/client.ts', '../maps/fixed-loader.ts'].includes(specifier)) {
    return { shortCircuit: true, url: 'data:text/javascript,export {}' };
  }
  return next(specifier, context);
} });

const years = [2000, 2006, 2011, 2016, 2021, 2026];
const path = (year: number) => year === 2026 ? '/national-results' : `/${year}`;
const page = (year: number, regional = false) => `<!doctype html><html><head>
  <title>${year} election results</title><link rel="canonical" href="https://counted.co.za${path(year)}">
  </head><body><main id="main" ${year === 2026 ? 'data-live-results' : ''}>
  <section><h1>${year} election results</h1><div id="home-count" data-history-current-only ${year === 2026 ? '' : 'hidden'}>50% reporting</div></section>
  <section id="home-search" data-history-current-only data-address-lookup ${year === 2026 ? '' : 'hidden'}>
    <div id="overview-search" data-place-search data-search-disabled="${year !== 2026}" data-configured="true">
      <form><input type="search" ${year === 2026 ? '' : 'disabled'}><button ${year === 2026 ? '' : 'disabled'}>Search</button></form>
      <p class="place-search-hint" hidden><span data-search-enabled-hint>Search places</span><span data-search-disabled-hint hidden>2026 only</span></p>
    </div>
  </section>
  <div id="home-councils" data-history-current-only ${year === 2026 ? '' : 'hidden'}>${year === 2026 ? '<section><h2>Council majorities</h2><a href="/majority-builder">Explore councils</a></section>' : ''}</div>
  <div id="home-results">${regional ? `<figure id="region-map-province-9" data-map-historical="${year !== 2026}" ${year === 2026 ? 'data-region-map' : ''} data-options='{"level":"province","id":"9","colors":[{"id":"9006","color":"${year === 2026 ? '#111111' : '#222222'}"}]}'>
    <div class="region-map-view">${year === 2026 ? '<div class="region-map-canvas"><canvas></canvas></div><p class="region-map-status" hidden></p>' : '<p>Historical boundaries are unavailable for this election.</p>'}</div>
    <figcaption ${year === 2026 ? '' : 'hidden'}><span data-map-caption>Municipal PR leaders</span><a href="/map">Explore map ↗</a></figcaption>`
    : `<figure id="province-results-map"><svg><a href="/${year}/provinces/western-cape">Results map</a></svg>`}
    <election-history id="election-history" data-scope="national:ZA" data-current="${years.indexOf(year)}">
      <div><output>${year}</output></div>
      <input type="range" min="0" max="5" value="${years.indexOf(year)}" aria-valuetext="${year}">
      <nav>${years.map(y => `<a data-year="${y}" href="${path(y)}" ${year === y ? 'aria-current="page"' : ''}>${y}</a>`).join('')}</nav>
      <p data-history-status role="status" hidden></p>
    </election-history>
  </figure><section id="votes">Votes for ${year}</section></div>
  </main></body></html>`;

let instance = 0;
async function setup(year = 2026, regional = false) {
  const window = new Window({ url: `https://counted.co.za${path(year)}?ballot=ward&q=Cape#results` });
  window.document.write(page(year, regional));
  for (const name of ['window', 'document', 'location', 'history', 'navigator', 'HTMLElement', 'Element',
    'HTMLFormElement', 'HTMLDetailsElement', 'DOMParser', 'Event', 'customElements', 'IntersectionObserver'] as const) {
    Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' ? window : window[name] });
  }
  const pending = new Map<number, (response: Response) => void>();
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    const target = Number(url.pathname.slice(1)) || 2026;
    assert.equal(url.searchParams.get('ballot'), 'ward');
    assert.equal(url.searchParams.get('q'), 'Cape');
    return new Promise(resolve => pending.set(target, resolve));
  };
  await import(`../src/lib/history/client.ts?test=${++instance}`);
  const document = window.document;
  const control = document.querySelector('election-history')!;
  const input = control.querySelector('input')!;
  const disconnected: string[] = [];
  const observer = new window.MutationObserver(records => {
    for (const record of records) for (const node of record.removedNodes) {
      if (node === control || node.contains(control)) disconnected.push(node.nodeName);
    }
  });
  observer.observe(document.querySelector('#main')!, { childList: true, subtree: true });
  return { window, document, control, input, pending, disconnected,
    select(target: number) {
      input.value = String(years.indexOf(target));
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    },
    async respond(target: number, success = true) {
      assert(pending.has(target), `Expected a request for ${target}`);
      pending.get(target)!(new Response(success ? page(target, regional) : 'Unavailable', {
        status: success ? 200 : 503, headers: { 'Content-Type': 'text/html' },
      }));
      pending.delete(target);
      // Allow the fetch, parsing, dynamic imports and MutationObserver to settle.
      for (let n = 0; n < 10; n++) await new Promise(resolve => setImmediate(resolve));
    },
    async close() {
      document.dispatchEvent(new window.Event('results:year-loading'));
      observer.disconnect();
      await window.happyDOM.close();
    },
  };
}

test('scrubbing away from 2026 and back keeps the thumb, layout, search text and canonical route', async () => {
  const view = await setup();
  try {
    const { document, window, control, input } = view;
    const search = document.querySelector<DOMInput>('#home-search input')!;
    search.value = 'Witzenberg';
    const originalUrl = window.location.href;
    const originalHistory = window.history.length;
    const panels = ['home-count', 'home-search', 'home-councils'].map(id => document.getElementById(id)! as DOMElement);
    view.select(2021);
    assert.equal(control.querySelector('output')!.textContent, '2021', 'selection updates before the response');
    await view.respond(2021);
    assert.equal(document.querySelector('h1')!.textContent, '2021 election results');
    assert.equal(input.value, '4');
    assert.equal(control.querySelector('[aria-current]')!.textContent, '2021');
    assert.equal(search.disabled, true);
    assert.equal(search.value, 'Witzenberg');
    assert(panels.every(panel => !panel.hidden && panel.inert && panel.getAttribute('aria-disabled') === 'true'));
    assert.equal(window.location.href, originalUrl);
    assert.equal(window.history.length, originalHistory);
    assert.equal(document.title, '2026 election results');
    assert.equal(document.querySelector('link[rel=canonical]')!.getAttribute('href'), 'https://counted.co.za/national-results');
    const { resultsUrl } = await import('../src/lib/history/view.ts');
    assert.equal(resultsUrl().href, 'https://counted.co.za/2021?ballot=ward&q=Cape#results', 'sharing uses the displayed election');
    view.select(2026);
    await view.respond(2026);
    assert.equal(document.querySelector('h1')!.textContent, '2026 election results');
    assert.equal(input.value, '5');
    assert.equal(search.disabled, false);
    assert.equal(search.value, 'Witzenberg');
    assert(panels.every(panel => !panel.hidden && !panel.inert && !panel.hasAttribute('aria-disabled')));
    assert.equal(document.querySelector('election-history input'), input);
    assert.equal(document.querySelector('#home-search input'), search);
    assert.deepEqual(view.disconnected, [], 'the slider never leaves the document during a drag');
  } finally { await view.close(); }
});

test('scrubbing retains the detailed map canvas and slider, labels current boundaries, and restores its caption', async () => {
  const view = await setup(2026, true);
  try {
    const figure = view.document.querySelector('[data-region-map]')!;
    const canvas = figure.querySelector('canvas')!;
    let updates = 0;
    figure.addEventListener('results:map-update', () => updates++);
    view.select(2021); await view.respond(2021);
    assert.equal(figure.querySelector('canvas'), canvas);
    assert.equal(figure.getAttribute('data-map-historical'), 'true');
    assert.equal(figure.querySelector('[data-map-caption]')!.textContent, '2026 boundaries · historical boundaries unavailable.');
    assert.equal(figure.querySelector('figcaption')!.hidden, false);
    assert.equal(figure.querySelector('figcaption a')!.textContent, 'Explore 2026 map ↗');
    view.select(2016); await view.respond(2016);
    view.select(2026); await view.respond(2026);
    assert.equal(figure.querySelector('canvas'), canvas);
    assert.equal(figure.getAttribute('data-map-historical'), 'false');
    assert.equal(figure.querySelector('[data-map-caption]')!.textContent, 'Municipal PR leaders');
    assert.equal(view.document.querySelector('election-history input'), view.input);
    assert.equal(updates, 2, 'only actual map state changes request a repaint');
    assert.deepEqual(view.disconnected, []);
  } finally { await view.close(); }
});

test('a direct historical page omits the map, then retains it once a current-year scrub loads it', async () => {
  const view = await setup(2021, true);
  try {
    assert.equal(view.document.querySelector('.region-map-canvas'), null);
    view.select(2026); await view.respond(2026);
    const canvas = view.document.querySelector('.region-map-canvas');
    assert(canvas);
    view.select(2021); await view.respond(2021);
    assert.equal(view.document.querySelector('.region-map-canvas'), canvas);
    assert.equal(view.document.querySelector('[data-region-map]')!.getAttribute('data-map-historical'), 'true');
    assert.equal(view.document.querySelector('election-history input'), view.input);
    assert.deepEqual(view.disconnected, []);
  } finally { await view.close(); }
});

test('rapid scrubbing ignores stale responses and returning to the rendered year cancels pending selection', async () => {
  const view = await setup();
  try {
    view.select(2021); view.select(2016);
    await view.respond(2016);
    await view.respond(2021);
    assert.equal(view.document.querySelector('#votes')!.textContent, 'Votes for 2016');
    assert.equal(view.input.value, '3');
    view.select(2006); view.select(2016);
    await view.respond(2006);
    assert.equal(view.document.querySelector('#votes')!.textContent, 'Votes for 2016');
    assert.equal(view.input.value, '3');
    assert.equal(view.control.hasAttribute('aria-busy'), false);
    assert.deepEqual(view.disconnected, []);
  } finally { await view.close(); }
});

test('a failed year restores the last displayed selection and remains retryable', async () => {
  const view = await setup();
  try {
    view.select(2021); await view.respond(2021);
    view.select(2011); await view.respond(2011, false);
    assert.equal(view.input.value, '4');
    assert.equal(view.document.querySelector('#votes')!.textContent, 'Votes for 2021');
    assert.match(view.control.querySelector('[data-history-status]')!.textContent, /Couldn’t load 2011. Showing 2021/);
    view.select(2011); await view.respond(2011);
    assert.equal(view.input.value, '2');
    assert.equal(view.control.querySelector('[data-history-status]')!.hasAttribute('hidden'), true);
  } finally { await view.close(); }
});

test('a historical entry keeps search and council panels hidden through scrubbing and live refresh', async () => {
  const view = await setup(2021);
  try {
    view.select(2026); await view.respond(2026);
    assert.equal(view.document.querySelector('h1')!.textContent, '2026 election results');
    const { resultsUrl } = await import('../src/lib/history/view.ts');
    assert.equal(resultsUrl().pathname, '/national-results', 'live polling fetches the displayed current election');
    const { updateResults } = await import('../src/lib/live/results.ts');
    const next = new view.window.DOMParser().parseFromString(page(2026), 'text/html');
    updateResults(view.document.querySelector('#main')! as unknown as HTMLElement, next.querySelector('#main')! as unknown as HTMLElement);
    for (const id of ['home-count', 'home-search', 'home-councils']) assert(view.document.getElementById(id)!.hasAttribute('hidden'), id);
    assert.equal(view.window.location.pathname, '/2021');
    assert.equal(view.document.title, '2021 election results');
    assert.equal(view.document.querySelector('election-history input'), view.input);
    assert.deepEqual(view.disconnected, []);
    const link = view.control.querySelector('a[data-year="2016"]')!;
    const click = new view.window.MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    link.dispatchEvent(click);
    assert.equal(click.defaultPrevented, false, 'modified clicks still open the canonical historical page');
  } finally { await view.close(); }
});
