import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { renderMarkdown, renderArtifact } from '../src/lib/chat/render.ts';

test('assistant prose and visualizations do not execute HTML or unsafe URLs', () => {
  const window = new Window();
  Object.assign(globalThis, { document: window.document });
  const target = window.document.createElement('div');
  renderMarkdown(target as unknown as HTMLElement, '<img src=x onerror=alert(1)>\n\n[Bad](javascript:alert(1)) [Source](https://counted.co.za/api) **bold**');
  assert.equal(target.querySelectorAll('img,script').length, 0);
  assert.equal(target.querySelectorAll('a').length, 1);
  assert.equal(target.querySelector('a')!.rel, 'noopener noreferrer');
  const chart = renderArtifact({ kind: 'chart', sources: [{ title: 'Source', url: 'javascript:alert(1)' }], chart: {
    title: '<svg onload=alert(1)>', description: '2026 PR shares', note: 'Provisional', unit: 'percentage points',
    rows: [{ label: 'A', value: -3 }, { label: 'B', value: 6 }],
  } });
  assert.equal(chart.querySelector('svg'), null);
  assert.equal(chart.querySelector('a[href]'), null);
  assert.equal(chart.querySelectorAll('.chat-chart-row').length, 2);
  assert.match(chart.textContent!, /-3 pp/);
  const image = renderArtifact({ kind: 'image', url: 'https://attacker.example/track.png', dataUrl: 'https://attacker.example', alt: '' });
  assert.equal(image.querySelector('img'), null);
  const research = renderArtifact({ kind: 'research', text: 'Reporting. citesource', fetchedAt: '2026-11-07T12:00:00Z',
    citations: [{ title: '<img src=x onerror=alert(1)>', url: 'https://news.example/article', start: 11, end: 25 },
      { title: 'Unsafe', url: 'javascript:alert(1)', start: 0, end: 2 }] });
  assert.equal(research.childNodes.length, 0, 'intermediate research never becomes visible DOM');
});

test('citations identify the destination publisher and request only hostname favicons', async () => {
  const { markdownMarkup } = await import('../src/lib/chat/markup.server.ts');
  const { sourceSite } = await import('../src/lib/chat/source-sites.ts');
  const window = new Window(), root = window.document.createElement('div');
  const url = 'https://www.businessday.co.za/politics/article?private=not-for-icons';
  root.innerHTML = markdownMarkup(`[Reporting](${url}) [Data](https://counted.co.za/api/example)`);
  const citation = root.querySelector('a')!;
  assert.equal(citation.textContent, 'Business Day');
  assert.equal(citation.href, url);
  assert.equal(citation.title, 'Reporting');
  assert.equal(root.querySelectorAll('img').length, 1, 'internal data links keep their descriptive labels');
  const icon = citation.querySelector('img')!;
  assert.equal(new URL(icon.src).searchParams.get('domain'), 'businessday.co.za');
  assert.doesNotMatch(icon.src, /politics|private|not-for-icons/);
  assert.equal(icon.getAttribute('referrerpolicy'), 'no-referrer');
  assert.equal(icon.alt, '');
  assert.equal(sourceSite('https://businessday.co.za.attacker.example/article')!.name, 'businessday.co.za.attacker.example');
  for (const unsafe of ['https://127.0.0.1/a', 'https://localhost/a', 'https://host.local/a', 'https://user:password@businessday.co.za', 'javascript:alert(1)']) {
    assert.equal(sourceSite(unsafe), null);
  }
  await window.happyDOM.close();
});

test('saved and streamed research stays hidden while answer citations remain visible', async () => {
  const { artifactMarkup, turnMarkup } = await import('../src/lib/chat/markup.server.ts');
  const research = { kind: 'research' as const, text: 'INTERMEDIATE RESEARCH SUMMARY', fetchedAt: '2026-11-07T12:00:00Z',
    citations: [{ title: 'Article', url: 'https://www.businessday.co.za/article', start: 0, end: 29 }] };
  assert.equal(artifactMarkup(research), '', 'SSR cannot flash a research card before hydration');
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const root = window.document.createElement('div');
  root.innerHTML = turnMarkup({ id: 'turn', question: 'Coalition news?', answer: 'Talks continue. [Reporting](https://www.businessday.co.za/article)',
    status: 'done', startedAt: 1, artifacts: [research] });
  root.append(renderArtifact(research) as any);
  assert.doesNotMatch(root.textContent, /INTERMEDIATE|FROM THE WEB/);
  assert.equal(root.querySelector('.chat-artifact-research'), null);
  assert.equal(root.querySelector('a')!.textContent, 'Business Day');
  assert.ok(root.querySelector('a img.chat-source-icon'));
  await window.happyDOM.close();
});

test('server markup is DOM-independent, readable without JS and safe to hydrate', async () => {
  const { markdownMarkup, artifactMarkup, turnMarkup } = await import('../src/lib/chat/markup.server.ts');
  const previousDocument = globalThis.document;
  // Rendering on a Worker must not need a browser document.
  Reflect.deleteProperty(globalThis, 'document');
  const attack = '</div><script>alert(1)</script><img src=x onerror="alert(1)"> & "';
  const turn = { id: crypto.randomUUID(), question: attack, answer: `${attack}\n\n**Seats** [Source](https://counted.co.za/api)`,
    status: 'running' as const, startedAt: 1, error: attack,
    artifacts: [{ kind: 'analysis' as const, code: attack, result: { attack } }] };
  let html: string;
  try { html = turnMarkup(turn); }
  finally { Object.assign(globalThis, { document: previousDocument }); }
  const window = new Window();
  const container = window.document.createElement('div'); container.innerHTML = html;
  assert.equal(container.querySelectorAll('script,img').length, 0);
  assert.equal(container.querySelector('[data-turn-id]')!.getAttribute('data-answer'), turn.answer);
  assert.equal(container.querySelector('.chat-message-user .chat-message-text')!.textContent, attack);
  assert.equal(container.querySelector('strong')!.textContent, 'Seats');
  assert.equal(container.querySelector('a')!.href, 'https://counted.co.za/api');
  assert.equal(container.querySelectorAll('pre').length, 2);
  assert.doesNotMatch(turnMarkup({ ...turn, status: 'done' }), /data-answer=/, 'completed answers are not duplicated in bootstrap data');
  container.innerHTML = turnMarkup({ ...turn, status: 'error' });
  assert.equal(container.querySelector('.chat-error')!.textContent, attack);
  container.innerHTML = markdownMarkup('[bad](//attacker.example/"onmouseover="bad) [bad](https://user:password@example.com)');
  assert.equal(container.querySelector('[onmouseover],a[href*="password"]'), null);
  const image = { kind: 'image' as const, url: `https://counted.co.za/images/results/${'a'.repeat(64)}.png`, dataUrl: 'javascript:bad()', alt: attack };
  container.innerHTML = artifactMarkup(image);
  assert.equal(container.querySelector('img')!.alt, attack);
  assert.equal(container.querySelector('[onerror]'), null);
  assert.equal(container.querySelectorAll('a[href]').length, 1);
  await window.happyDOM.close();
});

test('saved interactive visuals have readable server values and regain controls on hydration', async () => {
  const { visualFixture } = await import('./fixtures/chat-visual.ts');
  const { artifactMarkup } = await import('../src/lib/chat/markup.server.ts');
  const { enhanceSavedVisuals } = await import('../src/lib/chat/render.ts');
  const artifact = visualFixture();
  const attack = '&quot; &lt;literal&gt; </section><script>bad()</script>"';
  artifact.charts.ab!.columns[0]!.parties[0]!.name = attack;
  const html = artifactMarkup(artifact);
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const root = window.document.createElement('div'); root.innerHTML = html;
  assert.equal(root.querySelectorAll('.cv-grid').length, 1, 'the model layout is rendered on the server');
  assert.equal(root.querySelectorAll('.cv-council circle').length, 60, 'all council diagrams exist before hydration');
  assert.ok(root.querySelector('.cv-support-svg'), 'the support chart is server-rendered too');
  assert.ok(root.querySelector('a[href="https://counted.co.za/api/example"]'));
  assert.equal(root.querySelector('script'), null);
  assert.match(root.textContent, /Hypothetical|hypothetical/);
  assert.ok(root.textContent.includes(attack));
  const council = root.querySelector('[data-component="CouncilScenario"]')!;
  const visual = root.querySelector('.chat-visual')!, svg = council.querySelector('svg'), button = council.querySelector('button');
  const details = root.querySelector('.cv-evidence') as unknown as HTMLDetailsElement; details.open = true;
  enhanceSavedVisuals(root as unknown as HTMLElement);
  assert.equal(root.querySelector('.chat-visual'), visual, 'hydrate in place instead of replacing the visual');
  assert.equal(council.querySelector('svg'), svg); assert.equal(council.querySelector('button'), button);
  assert.equal(details.open, true, 'native details opened before hydration stay open');
  assert.equal(council.getAttribute('data-selected-seats'), '15');
  council.querySelector('button')!.click();
  assert.equal(council.getAttribute('data-selected-seats'), '7', 'enhancement attaches actual interactive controls');
  assert.equal(root.querySelector('[data-saved-visual]'), null);
  assert.equal(root.querySelector('[data-cv-node]'), null);
  assert.equal(root.querySelector('script'), null);
  await window.happyDOM.close();
});
