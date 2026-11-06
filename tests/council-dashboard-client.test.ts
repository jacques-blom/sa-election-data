import test from 'node:test';
import assert from 'node:assert/strict';
import { Window, type HTMLElement, type HTMLInputElement, type HTMLDetailsElement } from 'happy-dom';

test('party outcomes, province counts, private search and live updates share one compact results view', async () => {
  const window = new Window({ url: 'https://counted.co.za/' });
  const { document } = window;
  let intersect = () => {}, observers = 0;
  const observed: unknown[] = [];
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: class {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) { observers++; intersect = () => callback([{ isIntersecting: true }]); }
    observe(element: unknown) { observed.push(element); }
    disconnect() {}
  } });
  for (const name of ['window', 'document', 'location', 'history', 'HTMLElement', 'Element', 'MouseEvent', 'Node', 'Event'] as const)
    Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' ? window : window[name] });
  document.body.innerHTML = `<main id="main">
    <div data-place-search><input id="dashboard-place-search"></div>
    <a href="#councils" data-search-councils><span data-search-councils-label></span></a>
    <section id="councils">
    <p data-dashboard-available="true"><span data-reported-count></span> of <span data-scope-count></span> seat allocations reported</p>
    <form id="council-filters">
      ${['q', 'province', 'status', 'party', 'changed'].map(name => `<input type="hidden" name="${name}">`).join('')}
      <details data-province-picker><summary><span data-province-label>All provinces</span></summary>
        <div>${[['', 'All provinces'], ['9', 'Western Cape'], ['1', 'Eastern Cape']].map(([id, name]) => `<a href="/?province=${id}" data-council-province="${id}"><span>${name}</span></a>`).join('')}</div>
      </details>
      <details><summary>More filters <span data-more-filter-active hidden>1</span></summary>
        <a href="/?changed=1" data-council-changed role="switch" aria-checked="false">Majority changed since 2021</a>
      </details>
    </form>
    <nav>
      ${['', 'no-majority', 'pending'].map(s => `<a href="/?status=${s}" data-council-outcome="${s}">${s || 'All councils'}<span data-status-count="${s || 'all'}"></span></a>`).join('')}
      <a data-party-filter="1" href="/?status=majority&party=1"><abbr>ANC</abbr> majority <strong data-party-count></strong></a>
      <a data-party-filter="2" href="/?status=majority&party=2"><abbr>DA</abbr> majority <strong data-party-count></strong></a>
    </nav>
    <div class="dashboard-list-meta"><p data-council-count></p><a href="/" data-council-clear>Clear filters</a></div>
    <div data-party-change hidden><span data-party-change-name></span><span data-party-change-scope></span><span data-party-change-gained></span><span data-party-change-lost></span><span data-party-change-empty hidden>No comparable results</span></div>
    <div data-council-empty hidden></div>
    ${Array.from({ length: 30 }, (_, i) => `<article data-council-row data-search="${i === 0 ? 'cape town cpt' : 'example ' + i}" data-province="${i < 10 ? '9' : '1'}" data-status="${i === 0 ? 'majority' : i === 1 ? 'no-majority' : i === 2 ? 'unavailable' : 'pending'}" data-party="${i === 0 ? '1' : ''}" data-changed="${i === 0}" data-comparable="${i < 2}" data-previous-party="${i === 0 ? '2' : '1'}"></article>${i === 7 ? '<section data-dashboard-highlights>Highlights</section>' : ''}`).join('')}
    <div id="council-scroll-sentinel" data-council-sentinel></div>
    </section></main>`;
  try {
    await import('../src/lib/overview/dashboard-client.ts');
    const visible = () => document.querySelectorAll('[data-council-row]:not([hidden])');
    const click = (selector: string) => document.querySelector(selector)!.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    const q = document.querySelector<HTMLInputElement>('#dashboard-place-search')!;
    const search = (text: string) => { q.value = text; q.parentElement!.dispatchEvent(new window.Event('place-search:input')); };
    const text = (selector: string) => document.querySelector(selector)!.textContent;
    const partyCount = (id: string) => text(`[data-party-filter="${id}"] [data-party-count]`);
    const changed = document.querySelector<HTMLElement>('[data-council-changed]')!;
    const highlights = document.querySelector<HTMLElement>('[data-dashboard-highlights]')!;
    const partyChange = document.querySelector<HTMLElement>('[data-party-change]')!;
    const changeText = (key: string) => text(`[data-party-change-${key}]`);
    assert(partyChange.hidden);
    assert(!highlights.hidden);
    assert(document.querySelector<HTMLElement>('.dashboard-list-meta')!.hidden);
    assert.equal(visible().length, 24); intersect(); assert.equal(visible().length, 30);
    assert.equal(partyCount('1'), '1'); assert.equal(partyCount('2'), '0');
    assert.equal(text('[data-status-count="pending"]'), '27', 'unavailable data is not pending');
    assert.equal(text('[data-reported-count]'), '2'); assert.equal(text('[data-scope-count]'), '30');

    const picker = document.querySelector<HTMLDetailsElement>('[data-province-picker]')!, trigger = picker.querySelector('summary')!;
    const key = (target: HTMLElement, key: string) => target.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    trigger.focus(); key(trigger, 'ArrowDown'); assert(picker.open);
    key(document.activeElement as HTMLElement, 'ArrowDown'); assert.equal(document.activeElement?.getAttribute('data-council-province'), '9');
    click('[data-council-province="9"]'); assert.equal(visible().length, 10); assert(!picker.open); assert.equal(document.activeElement, trigger);
    key(trigger, 'ArrowDown'); key(document.activeElement as HTMLElement, 'End'); assert.equal(document.activeElement?.getAttribute('data-council-province'), '1');
    key(document.activeElement as HTMLElement, 'Escape'); assert(!picker.open);
    assert(highlights.hidden);
    assert.equal(text('[data-status-count="all"]'), '10'); assert.equal(text('[data-status-count="pending"]'), '7');
    assert.equal(text('[data-scope-count]'), '10'); assert.equal(text('[data-reported-count]'), '2');
    click('[data-party-filter="1"]'); assert.equal(visible().length, 1); assert.equal(window.location.search, '?province=9&status=majority&party=1');
    assert.equal(document.querySelector('[data-council-outcome=""]')!.getAttribute('aria-current'), null);
    assert.equal(document.querySelector('[data-party-filter="1"]')!.getAttribute('aria-current'), 'true');
    click('[data-party-filter="1"]'); assert.equal(visible().length, 1, 'clicking an active party retains that outcome');
    assert(!partyChange.hidden); assert.equal(changeText('name'), 'ANC');
    assert.equal(changeText('gained'), '1'); assert.equal(changeText('lost'), '1', 'losses include councils outside the visible party results');

    search('CPT'); assert.equal(visible().length, 1);
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}#councils`);
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    assert.equal(q.value, 'CPT'); assert.equal(visible().length, 1, 'in-page links retain private search');
    assert(!new URLSearchParams(window.location.search).has('q'));
    const row = document.querySelector<HTMLElement>('[data-council-row]')!;
    row.dataset.status = 'no-majority'; row.dataset.party = '';
    const sentinel = document.querySelector('[data-council-sentinel]')!; sentinel.replaceWith(sentinel.cloneNode());
    document.dispatchEvent(new window.Event('results:updated'));
    assert.equal(observers, 1); assert.equal(observed.length, 2); assert.equal(q.value, 'CPT'); assert.equal(visible().length, 0);
    assert.equal(partyCount('1'), '0'); assert.equal(text('[data-status-count="no-majority"]'), '2');
    click('[data-council-outcome="no-majority"]'); assert.equal(visible().length, 1); assert(partyChange.hidden);
    assert(!new URLSearchParams(window.location.search).has('party'));
    click('[data-council-clear]'); assert.equal(visible().length, 24); assert.equal(q.value, ''); assert(!highlights.hidden);
    row.dataset.status = 'majority'; row.dataset.party = '1';

    // Every category uses the province; search, selected outcome and pagination do not shrink its counts.
    for (const i of [20, 29]) {
      const council = document.querySelectorAll<HTMLElement>('[data-council-row]')[i]!;
      council.dataset.status = 'majority'; council.dataset.party = '2';
    }
    document.dispatchEvent(new window.Event('results:updated'));
    assert.equal(partyCount('2'), '2'); assert.equal(text('[data-reported-count]'), '4');
    click('[data-council-province="1"]'); assert.equal(partyCount('1'), '0'); assert.equal(partyCount('2'), '2');
    assert.equal(text('[data-reported-count]'), '2'); assert.equal(text('[data-scope-count]'), '20');
    click('[data-party-filter="2"]'); search('does not match');
    assert.equal(visible().length, 0); assert.equal(partyCount('2'), '2');
    assert.equal(text('[data-status-count="pending"]'), '18');
    click('[data-council-clear]');

    // More filters remains visible as active when closed, and the switch supports the Space key.
    click('[data-council-province="9"]'); click('[data-party-filter="1"]'); click('[data-council-changed]');
    assert.equal(window.location.search, '?province=9&status=majority&party=1&changed=1');
    assert.equal(changed.getAttribute('aria-checked'), 'true'); assert.equal(visible().length, 1);
    assert(!document.querySelector<HTMLElement>('[data-more-filter-active]')!.hidden);
    document.dispatchEvent(new window.Event('results:updated')); assert.equal(visible().length, 1);
    changed.focus(); key(changed, ' ');
    assert.equal(changed.getAttribute('aria-checked'), 'false'); assert.equal(document.activeElement, changed);
    assert(document.querySelector<HTMLElement>('[data-more-filter-active]')!.hidden);
    assert.equal(changeText('lost'), '1');
    click('[data-council-province="1"]'); assert.equal(changeText('scope'), 'Eastern Cape');
    assert.equal(changeText('gained'), '—'); assert.equal(changeText('lost'), '—');
    assert(!partyChange.querySelector<HTMLElement>('[data-party-change-empty]')!.hidden);
    const newReport = document.querySelectorAll<HTMLElement>('[data-council-row]')[20]!;
    newReport.dataset.comparable = 'true'; newReport.dataset.previousParty = '1';
    document.dispatchEvent(new window.Event('results:updated')); assert.equal(changeText('lost'), '1');
    click('[data-party-filter="2"]'); assert.equal(changeText('name'), 'DA'); assert.equal(changeText('gained'), '1');

    // New party options inserted by a live response work without reinitializing the form.
    document.querySelector('nav')!.insertAdjacentHTML('beforeend', '<a data-party-filter="3"><abbr>IFP</abbr> majority <strong data-party-count></strong></a>');
    newReport.dataset.party = '3';
    document.dispatchEvent(new window.Event('results:updated'));
    click('[data-party-filter="3"]'); assert.equal(partyCount('3'), '1'); assert.equal(visible().length, 1);
    assert.equal(changeText('name'), 'IFP');
    click('[data-council-outcome=""]'); assert.equal(visible().length, 20); assert(partyChange.hidden);
    assert.equal(document.querySelector('[data-council-outcome=""]')!.getAttribute('aria-current'), 'true');

    search('12 Private Street'); assert.equal(visible().length, 0);
    assert(!window.location.href.includes('Private'));
    assert(![...document.querySelectorAll('[data-council-province], [data-party-filter], [data-council-outcome]')].some(a => a.getAttribute('href')!.includes('Private')));
    q.parentElement!.dispatchEvent(new window.Event('place-search:select')); assert.equal(visible().length, 20); assert.equal(q.value, '12 Private Street');
    window.history.pushState(null, '', '/?province=9&changed=1'); window.dispatchEvent(new window.PopStateEvent('popstate'));
    assert.equal(changed.getAttribute('aria-checked'), 'true'); assert.equal(visible().length, 1); assert.equal(q.value, '');
    click('[data-council-clear]'); assert(!highlights.hidden);
    document.querySelector<HTMLElement>('[data-dashboard-available]')!.dataset.dashboardAvailable = 'false';
    document.dispatchEvent(new window.Event('results:updated'));
    assert.equal(text('[data-reported-count]'), '—'); assert.equal(text('[data-status-count="pending"]'), '—'); assert.equal(partyCount('1'), '—');
  } finally { await window.happyDOM.close(); }
});
