import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { Window, type HTMLElement as DOMElement } from 'happy-dom';

test('map loading survives year changes, including lazy mounts, and disposes only removed maps', async () => {
  const window = new Window();
  window.document.body.innerHTML = '<figure id="first" data-region-map></figure><figure id="lazy" data-region-map></figure>';
  const document = window.document;
  const mounted: { figure: DOMElement; historical: boolean }[] = [];
  const disposed: DOMElement[] = [];
  let intersect: (entries: { target: DOMElement; isIntersecting: boolean }[]) => void;
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  Object.defineProperty(globalThis, 'IntersectionObserver', { configurable: true, value: class {
    constructor(callback: typeof intersect) { intersect = callback; }
    observe() {} unobserve() {} disconnect() {}
  } });
  Object.defineProperty(globalThis, '__mountMapTest', { configurable: true, value: (figure: DOMElement) => {
    mounted.push({ figure, historical: figure.dataset.mapHistorical === 'true' });
    return () => disposed.push(figure);
  } });
  const hooks = registerHooks({ resolve(specifier, context, next) {
    if (context.parentURL?.includes('/maps/fixed-loader.ts') && specifier === './fixed-client.ts') {
      return { shortCircuit: true, url: 'data:text/javascript,export const mountRegionMap = figure => globalThis.__mountMapTest(figure)' };
    }
    return next(specifier, context);
  } });
  const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };
  try {
    await import('../src/lib/maps/fixed-loader.ts');
    const first = document.getElementById('first')! as DOMElement;
    const lazy = document.getElementById('lazy')! as DOMElement;
    intersect!([{ target: first, isIntersecting: true }]); await settle();
    assert.equal(mounted.length, 1);
    document.dispatchEvent(new window.Event('results:before-year-change'));
    first.dataset.mapHistorical = 'true';
    document.dispatchEvent(new window.Event('results:updated'));
    assert.equal(disposed.length, 0, 'scrubbing must not remove an existing WebGL canvas');
    intersect!([{ target: lazy, isIntersecting: true }]);
    lazy.dataset.mapHistorical = 'true';
    document.dispatchEvent(new window.Event('results:before-year-change'));
    document.dispatchEvent(new window.Event('results:updated'));
    await settle();
    assert.deepEqual(mounted.map(map => [map.figure.id, map.historical]), [['first', false], ['lazy', true]]);
    first.remove();
    document.dispatchEvent(new window.Event('results:updated'));
    assert.deepEqual(disposed, [first]);
    const removed = document.createElement('figure');
    removed.setAttribute('data-region-map', ''); document.body.appendChild(removed);
    document.dispatchEvent(new window.Event('results:updated'));
    intersect!([{ target: removed, isIntersecting: true }]); removed.remove();
    await settle();
    assert.equal(mounted.length, 2, 'a pending mount cannot resurrect a removed map');
    lazy.remove(); document.dispatchEvent(new window.Event('results:updated'));
    assert.deepEqual(disposed, [first, lazy]);
  } finally {
    hooks.deregister();
    delete (globalThis as Record<string, unknown>).__mountMapTest;
    await window.happyDOM.close();
  }
});
