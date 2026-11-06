import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

const markup = '<related-news id="related-news" data-endpoint="/api/news?scope=national"><p data-news-status role="status">Loading headlines…</p><ol data-news-list></ol><button data-news-more hidden>Show more headlines</button></related-news>';
const settle = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };

test('headlines render safely, expand in Google order, survive live patches and disappear for history', async () => {
  const window = new Window({ url: 'https://counted.co.za/' });
  for (const name of ['window', 'document', 'HTMLElement', 'Element', 'HTMLFormElement', 'HTMLDetailsElement', 'Event', 'customElements'] as const) {
    Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' ? window : window[name] });
  }
  const { document } = window;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ fetchedAt: '2026-11-06T10:00:00Z', stale: false, articles: Array.from({ length: 4 }, (_, i) => ({
      title: i === 0 ? '<img src=x onerror=alert(1)>' : `Headline ${i}`, url: `https://example.com/${i}`, source: 'Local News', publishedAt: '2026-11-06T10:00:00Z',
    })) });
  };
  await import('../src/lib/news/client.ts');
  const { updateResults } = await import('../src/lib/live/results.ts');
  try {
    document.body.innerHTML = `<main id="main">${markup}</main>`;
    await settle();
    const root = document.querySelector('related-news')!;
    assert.equal(calls, 1);
    assert.equal(root.querySelectorAll('li:not([hidden])').length, 3);
    assert.equal(root.querySelector('a')!.textContent, '<img src=x onerror=alert(1)>');
    assert.equal(root.querySelector('img'), null);
    assert.match(root.querySelector('time')!.textContent, /12:00 SAST/);
    root.querySelector('button')!.click();
    assert.equal(root.querySelectorAll('li:not([hidden])').length, 4);
    const main = document.querySelector('main')!;
    const next = document.createElement('main'); next.innerHTML = markup;
    updateResults(main as unknown as HTMLElement, next as unknown as HTMLElement);
    await settle();
    assert.equal(main.querySelector('related-news'), root);
    assert.equal(root.querySelectorAll('li:not([hidden])').length, 4);
    assert.equal(calls, 1);
    const historical = document.createElement('main'); historical.innerHTML = '<h1>2021 results</h1>';
    updateResults(main as unknown as HTMLElement, historical as unknown as HTMLElement, true);
    assert.equal(main.querySelector('related-news'), null);
    const current = document.createElement('main'); current.innerHTML = markup;
    updateResults(main as unknown as HTMLElement, current as unknown as HTMLElement, true);
    await settle();
    assert.equal(main.querySelectorAll('li').length, 4);
    assert.equal(calls, 2);

    main.innerHTML = '';
    globalThis.fetch = async () => Response.json({ articles: [], stale: false, fetchedAt: '2026-11-06T10:00:00Z' });
    main.innerHTML = markup;
    await settle();
    assert.match(main.querySelector('[data-news-status]')!.textContent, /No headlines found/);
    main.innerHTML = '';
    globalThis.fetch = async () => new Response(null, { status: 503 });
    main.innerHTML = markup;
    await settle();
    assert.match(main.querySelector('[data-news-status]')!.textContent, /temporarily unavailable/);
    assert.equal(main.querySelector('related-news')!.hasAttribute('aria-busy'), false);
  } finally { await window.happyDOM.close(); }
});
