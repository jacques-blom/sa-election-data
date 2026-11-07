import test from 'node:test';
import assert from 'node:assert/strict';
import { Window, type HTMLElement, type HTMLButtonElement, type DOMRect } from 'happy-dom';
import { setupVoteHistory } from '../src/lib/history/trend-client.ts';

function fixture() {
  const window = new Window({ url: 'https://counted.co.za/?metric=votes' });
  const document = window.document;
  const years = [2011, 2016, 2021, 2026];
  document.body.innerHTML = `<section data-vote-history data-default-year="2026" data-default-metric="votes">
    <div data-trend-scrub>${years.map(y=>`<button data-trend-year="${y}">${y}</button>`).join('')}</div>
    ${years.map(y=>`<div data-trend-panel="votes:${y}"></div>`).join('')}
  </section>`;
  const chart = document.querySelector<HTMLElement>('[data-vote-history]')!;
  const plot = document.querySelector<HTMLElement>('[data-trend-scrub]')!;
  plot.getBoundingClientRect = () => ({ left: 20, width: 320 }) as DOMRect;
  setupVoteHistory(document as unknown as Document);
  const pointer = (type: string, x: number, y = 50, overrides = {}) => plot.dispatchEvent(new window.PointerEvent(type, {
    bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'touch', button: 0, clientX: x, clientY: y, ...overrides,
  }));
  return { window, document, chart, plot, pointer };
}

test('touch dragging follows the year under the finger, clamps at edges, and shares the final selection', () => {
  const { window, document, chart, pointer } = fixture();
  try {
    pointer('pointerdown', 330);
    pointer('pointermove', 140);
    assert.equal(chart.dataset.selectedYear, '2016');
    assert.equal(document.querySelector<HTMLElement>('[data-trend-panel="votes:2016"]')!.hidden, false);
    pointer('pointermove', -30);
    assert.equal(chart.dataset.selectedYear, '2011');
    pointer('pointermove', 140);
    pointer('pointerup', 220);
    assert.equal(chart.dataset.selectedYear, '2021', 'Release uses the final finger position even if moves were coalesced');
    assert.equal(new URL(window.location.href).searchParams.get('history-year'), '2021');
    document.querySelector('[data-trend-year="2026"]')!.dispatchEvent(new window.MouseEvent('click', { bubbles: true, detail: 1 }));
    assert.equal(chart.dataset.selectedYear, '2021', 'The release click cannot select the original year again');
    setupVoteHistory(document as unknown as Document);
    assert.equal(chart.dataset.selectedYear, '2021', 'Live refresh keeps the inspected year');
    document.querySelector<HTMLButtonElement>('[data-trend-year="2011"]')!.click();
    assert.equal(chart.dataset.selectedYear, '2011', 'Keyboard activation still works immediately after a drag');
  } finally { window.close(); }
});

test('vertical scrolling cancels inspection and secondary pointers do not take over', () => {
  const { window, chart, pointer } = fixture();
  try {
    pointer('pointerdown', 40, 50, { isPrimary: false });
    assert.equal(chart.dataset.selectedYear, '2026');
    pointer('pointerdown', 140);
    assert.equal(chart.dataset.selectedYear, '2016');
    pointer('pointermove', 230, 160);
    assert.equal(chart.dataset.selectedYear, '2016', 'Vertical intent does not scrub sideways');
    pointer('pointercancel', 230, 160);
    assert.equal(chart.dataset.selectedYear, '2026');
    assert.equal(new URL(window.location.href).searchParams.get('history-year'), null);
    pointer('pointerdown', 230);
    pointer('pointerup', 230);
    assert.equal(chart.dataset.selectedYear, '2021', 'A tap still selects a year');
  } finally { window.close(); }
});
