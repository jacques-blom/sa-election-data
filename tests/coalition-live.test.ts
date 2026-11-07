import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

test('live patches retain native modal state and close a removed game dialog', async () => {
  const view = new Window({ url: 'https://counted.co.za/2026/places/witzenberg/coalition' });
  for (const name of ['window', 'document', 'Element', 'HTMLElement', 'HTMLFormElement', 'HTMLDetailsElement', 'HTMLDialogElement', 'Event'] as const) {
    Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' ? view : view[name] });
  }
  const { updateResults } = await import('../src/lib/live/results.ts');
  try {
    const { document } = view;
    document.body.innerHTML = '<main id="main"><dialog data-chaos-dialog><h2>Original twist</h2></dialog></main>';
    const main = document.querySelector('main')!;
    const dialog = main.querySelector('dialog')!;
    dialog.showModal();
    const server = document.createElement('main');
    server.innerHTML = '<dialog data-chaos-dialog><h2>New server markup</h2></dialog>';
    let updates = 0;
    document.addEventListener('results:updated', () => { updates++; });
    updateResults(main as unknown as HTMLElement, server as unknown as HTMLElement);
    assert.equal(main.querySelector('dialog'), dialog);
    assert.equal(dialog.open, true, 'morphdom must not remove the open attribute from a modal');
    assert.equal(dialog.querySelector('h2')!.textContent, 'New server markup');
    assert.equal(updates, 1, 'the controller can recompute or explicitly close the twist');
    const close = dialog.close.bind(dialog);
    let closed = false;
    dialog.close = () => { closed = true; close(); };
    const unavailable = document.createElement('main');
    unavailable.innerHTML = '<p>Seats unavailable</p>';
    updateResults(main as unknown as HTMLElement, unavailable as unknown as HTMLElement);
    assert.equal(closed, true, 'an unavailable allocation cannot leave the old modal blocking the page');
    assert.equal(main.querySelector('dialog'), null);

    main.innerHTML = '<dialog id="coalition-picker" data-coalition-picker><h2>Choose your province</h2><input value="Calvinia"><a hidden>Other council</a></dialog>';
    const picker = main.querySelector('dialog')!;
    picker.showModal();
    const refreshed = document.createElement('main');
    refreshed.innerHTML = '<dialog id="coalition-picker" data-coalition-picker><h2>Choose your council</h2><input value=""><a>Other council</a></dialog>';
    updateResults(main as unknown as HTMLElement, refreshed as unknown as HTMLElement);
    assert.equal(main.querySelector('dialog'), picker);
    assert.equal(picker.open, true);
    assert.equal(picker.querySelector('h2')!.textContent, 'Choose your province');
    assert.equal(picker.querySelector('input')!.value, 'Calvinia');
    assert.equal(picker.querySelector('a')!.hidden, true);
    let pickerClosed = false;
    const closePicker = picker.close.bind(picker);
    picker.close = () => { pickerClosed = true; closePicker(); };
    updateResults(main as unknown as HTMLElement, unavailable as unknown as HTMLElement);
    assert.equal(pickerClosed, true);
  } finally { await view.happyDOM.close(); }
});
