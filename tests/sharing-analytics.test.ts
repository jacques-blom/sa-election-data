import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { trackShare, type ShareContext } from '../src/lib/sharing/analytics.ts';
import type { ShareCard } from '../src/lib/sharing/model.ts';

type Captured = { event: string; params: Record<string, string> };
function stub(t: TestContext, name: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  t.after(() => original ? Object.defineProperty(globalThis, name, original) : Reflect.deleteProperty(globalThis, name));
}
const context: ShareContext = {
  url: 'https://counted.co.za/2026/places/cape-town/coalition?parties=1,2&q=private#private',
  kind: 'coalition', source: 'coalition', format: 'portrait',
};

test('analytics sends only action metadata and strips private URL values after navigation', t => {
  const events: Captured[] = [];
  const location = new URL('https://counted.co.za/map?view=18.42,-33.92,10&address=private#private');
  stub(t, 'window', { location, gtag: (_: string, event: string, params: Record<string, string>) => events.push({ event, params }) });
  stub(t, 'document', { referrer: 'https://example.com/find?q=private#private' });
  trackShare('share_open', context);
  assert.deepEqual(events, [{ event: 'share_open', params: {
    content_type: 'coalition', item_id: '/2026/places/cape-town/coalition', share_source: 'coalition', share_format: 'portrait',
    page_location: 'https://counted.co.za/map', page_referrer: 'https://example.com/find',
  } }] as Captured[]);
  location.href = 'https://counted.co.za/map?google-place=secret&view=1,2,3#secret';
  trackShare('share', context, 'native_image');
  assert.doesNotMatch(JSON.stringify(events), /private|secret|parties=|view=|google-place/);
  assert.equal(events[1]?.params.method, 'native_image');
});

test('missing, blocked or broken analytics never prevents sharing; preview hosts emit nothing', t => {
  stub(t, 'document', { referrer: '' });
  let calls = 0;
  for (const host of ['localhost', 'preview.example', 'sa-election-data.workers.dev']) {
    stub(t, 'window', { location: new URL(`https://${host}/`), gtag: () => { calls++; } });
    trackShare('share_open', context);
  }
  assert.equal(calls, 0);
  stub(t, 'window', { location: new URL('https://counted.co.za/') });
  assert.doesNotThrow(() => trackShare('share_open', context));
  Object.assign(window, { gtag: () => { throw new Error('Blocked'); } });
  assert.doesNotThrow(() => trackShare('share_open', context));
});

class ElementStub extends EventTarget {
  attributes = new Map<string, string>();
  queries = new Map<string, ElementStub>();
  dataset: Record<string, string> = {};
  classList = { toggle() {} };
  hidden = false; disabled = false; open = false; value = ''; textContent = ''; content = '';
  inDialog = false; isConnected = true; selected = false; focused = false;
  width = 0; height = 0; href = ''; download = ''; clicked = false;
  querySelector(selector: string) { return this.queries.get(selector); }
  querySelectorAll(selector: string) { return selector.split(', ').map(key => this.queries.get(key)).filter(Boolean); }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  getAttribute(name: string) { return this.attributes.get(name); }
  hasAttribute(name: string) { return this.attributes.has(name); }
  closest(selector: string) { return selector === 'button' ? this : this.inDialog ? this : null; }
  matches(selector: string) { return selector === '[name="share-format"]' && this.hasAttribute('name'); }
  focus() { this.focused = true; }
  select() { this.selected = true; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatchEvent(new Event('close')); }
  click() { this.clicked = true; }
  getContext() { return new Proxy({}, { get: (_, name) => name === 'measureText' ? (value: string) => ({ width: value.length * 5 }) : () => {} }); }
  toBlob(callback: (blob: Blob) => void) { callback(new Blob(['png'], { type: 'image/png' })); }
}
const settle = async () => { for (let i = 0; i < 4; i++) await setImmediate(); };
let version = 0;
async function mount(t: TestContext) {
  const events: Captured[] = [], downloads: ElementStub[] = [], copied: string[] = [];
  const sheet = new ElementStub(), radio = new ElementStub(), caption = new ElementStub(), feedback = new ElementStub();
  radio.value = 'portrait'; radio.setAttribute('name', 'share-format');
  const controls = new Map<string, ElementStub>();
  for (const name of ['native', 'save', 'copy', 'copy-link', 'close']) {
    const control = new ElementStub(); control.setAttribute(`data-share-${name}`, ''); control.inDialog = true;
    sheet.queries.set(`[data-share-${name}]`, control); controls.set(name, control);
  }
  sheet.queries.set('[name="share-format"]:checked', radio);
  sheet.queries.set('[data-share-caption]', caption);
  sheet.queries.set('[data-share-feedback]', feedback);
  for (const key of ['h2', 'canvas', '[data-share-loading]', '[data-share-help]', '.share-preview', '.share-formats']) sheet.queries.set(key, new ElementStub());
  const listeners = new Map<string, (event: { target: ElementStub }) => unknown>();
  const location = new URL('https://counted.co.za/map?q=private&view=18,-33,10');
  const navigator = { clipboard: { writeText: async (text: string) => { copied.push(text); } } } as {
    clipboard: { writeText: (text: string) => Promise<void> }; share?: (data: ShareData) => Promise<void>; canShare?: (data: ShareData) => boolean;
  };
  const meta = new ElementStub(); meta.content = 'Explore the map';
  const document = {
    title: 'Map · Counted', referrer: '', activeElement: new ElementStub(), fonts: { load: async () => [] },
    querySelector: (selector: string) => selector === '[data-share-dialog]' ? sheet : selector === 'meta[name="description"]' ? meta : undefined,
    addEventListener: (name: string, callback: (event: { target: ElementStub }) => unknown) => listeners.set(name, callback),
    createElement: (tag: string) => { const node = new ElementStub(); if (tag === 'a') downloads.push(node); return node; },
  };
  stub(t, 'window', { location, gtag: (_: string, event: string, params: Record<string, string>) => events.push({ event, params }) });
  stub(t, 'location', location); stub(t, 'document', document); stub(t, 'navigator', navigator);
  stub(t, 'Element', ElementStub); stub(t, 'HTMLElement', ElementStub);
  stub(t, 'Image', class { onload = () => {}; set src(_value: string) { queueMicrotask(() => this.onload()); } });
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const client = await import(`../src/lib/sharing/client.ts?test=${++version}`);
  const click = async (node: ElementStub) => { await listeners.get('click')!({ target: node }); await settle(); };
  const page = new ElementStub(); page.setAttribute('data-share-page', 'page');
  const openPage = () => click(page);
  const action = (name: string) => click(controls.get(name)!);
  const format = async (value: string) => { radio.value = value; await listeners.get('change')!({ target: radio }); await settle(); };
  return { events, downloads, copied, sheet, caption, feedback, controls, location, navigator, client, click, page, openPage, action, format };
}
const card: ShareCard = {
  kind: 'result', year: 2026, area: 'Cape Town', headline: 'The count so far.', metric: '60%', metricLabel: 'Leading share', ballot: 'PR votes',
  parties: [], total: 100, progress: null, reportedAt: '2026-11-06T10:00:00Z', note: 'Provisional', caption: 'Private caption content',
};

test('page controls count opens and successful copies, with a distinct clipboard fallback', async t => {
  const ui = await mount(t);
  await ui.openPage();
  await ui.action('copy-link'); await ui.action('copy'); await ui.action('native');
  assert.deepEqual(ui.events.map(e => e.event), ['share_open', 'share_copy_link', 'share_copy_caption', 'share_attempt', 'share_copy_link']);
  assert.equal(ui.events.at(-1)?.params.method, 'fallback_clipboard');
  assert.equal(ui.events[0]?.params.share_format, 'link');
  assert.equal(ui.events[0]?.params.share_source, 'page');
  assert.match(ui.copied[0]!, /view=18%2C-33%2C10/);
  assert.doesNotMatch(JSON.stringify(ui.events), /view=|private|Explore the map/);
});

test('native success, cancellation and failure are separate; failed clipboard writes never count as copies', async t => {
  const ui = await mount(t);
  await ui.openPage();
  ui.navigator.share = async () => {};
  await ui.action('native');
  assert.equal(ui.events.at(-1)?.event, 'share');
  ui.navigator.share = async () => { throw new DOMException('Private cancellation details', 'AbortError'); };
  await ui.action('native');
  assert.equal(ui.events.at(-1)?.event, 'share_cancel');
  ui.navigator.share = async () => { throw new Error('Private failure details'); };
  await ui.action('native');
  assert.equal(ui.events.at(-1)?.event, 'share_error');
  ui.navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); };
  await ui.action('copy'); await ui.action('copy-link');
  assert.deepEqual(ui.events.slice(-2).map(e => [e.event, e.params.method]), [['share_error', 'copy_caption'], ['share_error', 'copy_link']]);
  assert.equal(ui.caption.selected, true);
  assert.equal(ui.events.filter(e => e.event === 'share').length, 1);
  assert.doesNotMatch(JSON.stringify(ui.events), /Private|Permission denied/);
});

test('result formats, direct saves, native images and download fallbacks each emit once', async t => {
  const ui = await mount(t);
  ui.client.openShare(card, 'https://counted.co.za/2026/places/cape-town?ballot=pr'); await settle();
  assert.equal(ui.controls.get('native')?.disabled, false);
  await ui.format('square'); await ui.action('save');
  assert.deepEqual(ui.events.map(e => e.event), ['share_open', 'share_format_change', 'share_save_image']);
  assert.equal(ui.events.at(-1)?.params.share_format, 'square');
  assert.equal(ui.downloads.length, 1);
  ui.navigator.canShare = () => true; ui.navigator.share = async () => {};
  await ui.action('native');
  assert.equal(ui.events.at(-1)?.params.method, 'native_image');
  assert.equal(ui.downloads.length, 1);
  ui.navigator.canShare = () => false;
  await ui.action('native');
  assert.deepEqual(ui.events.slice(-2).map(e => [e.event, e.params.method]), [['share', 'native_text'], ['share_save_image', 'fallback_download']]);
  delete ui.navigator.share;
  await ui.action('native');
  assert.deepEqual(ui.events.slice(-2).map(e => e.event), ['share_attempt', 'share_save_image']);
  assert.equal(ui.downloads.length, 3);
  assert.doesNotMatch(JSON.stringify(ui.events), /Private caption|ballot=|counted-cape-town/);
});

test('cancelled image shares do not download or report success', async t => {
  const ui = await mount(t);
  ui.client.openShare({ ...card, kind: 'coalition' }, context.url, 'coalition'); await settle();
  ui.navigator.canShare = () => true;
  ui.navigator.share = async () => { throw new DOMException('Cancelled', 'AbortError'); };
  await ui.action('native');
  assert.deepEqual(ui.events.map(e => e.event), ['share_open', 'share_attempt', 'share_cancel']);
  assert.equal(ui.events[0]?.params.content_type, 'coalition');
  assert.equal(ui.events[0]?.params.share_source, 'coalition');
  assert.equal(ui.downloads.length, 0);
});

test('individual updates share their announcement, and delayed success retains its original context', async t => {
  const ui = await mount(t);
  ui.page.dataset = { shareUrl: '/updates?event=42&q=private', shareType: 'update', shareTitle: 'Correction · Counted', shareText: 'A corrected announcement.' };
  await ui.openPage();
  assert.equal(ui.caption.value, 'A corrected announcement.\n\nhttps://counted.co.za/updates?event=42');
  let complete = () => {};
  ui.navigator.clipboard.writeText = () => new Promise<void>(resolve => { complete = resolve; });
  const pending = ui.action('copy-link');
  await ui.action('close');
  ui.page.dataset = {}; await ui.openPage();
  complete(); await pending;
  assert.equal(ui.events.at(-1)?.params.content_type, 'update');
  assert.equal(ui.events.at(-1)?.params.item_id, '/updates');
  assert.equal(ui.events.at(-1)?.params.share_source, 'update');
  assert.equal(ui.feedback.textContent, '');
});

test('render failures report the operation and keep image actions disabled', async t => {
  const ui = await mount(t);
  const createElement = document.createElement;
  Object.assign(document, { createElement: (tag: string) => {
    const node = createElement(tag);
    if (tag === 'canvas') Object.assign(node, { toBlob: () => { throw new Error('Private image failure'); } });
    return node;
  } });
  ui.client.openShare(card, context.url); await settle();
  assert.equal(ui.events.at(-1)?.event, 'share_error');
  assert.equal(ui.events.at(-1)?.params.method, 'render');
  assert.equal(ui.controls.get('native')?.disabled, true);
  const count = ui.events.length; await ui.action('native');
  assert.equal(ui.events.length, count);
});
