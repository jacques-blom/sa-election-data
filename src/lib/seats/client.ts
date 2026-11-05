import { coalitionSelection, coalitionShareText, type CoalitionData } from './coalition.ts';
import { drawCoalitionImage } from './share-image.ts';

let selected = new Set((new URL(location.href).searchParams.get('parties') ?? '').split(',').filter(Boolean));
let previousSnapshot: string | undefined;
const root = () => document.querySelector<HTMLElement>('[data-coalition]');
function model(): CoalitionData | null {
  const value = root()?.dataset.coalition;
  return value ? JSON.parse(value) as CoalitionData : null;
}
function shareUrl(data: CoalitionData) {
  const url = new URL(location.href);
  const ids = coalitionSelection(data, selected).parties.map(p => p.id);
  url.search = ''; url.hash = '';
  if (ids.length) url.searchParams.set('parties', ids.join(','));
  return url.href;
}
function update(announce = false) {
  const data = model(), screen = root();
  if (!data || !screen) { document.querySelector<HTMLDialogElement>('[data-coalition-dialog]')?.close(); return; }
  const selection = coalitionSelection(data, selected);
  selected = new Set(selection.parties.map(p => p.id));
  const counter = screen.querySelector<HTMLElement>('[data-coalition-total]')!;
  const changed = counter.textContent !== String(selection.total);
  counter.textContent = String(selection.total);
  if (changed && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counter.getAnimations().forEach(a => a.cancel());
    counter.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 180 });
  }
  screen.querySelector<HTMLElement>('[data-coalition-status]')!.textContent = selection.status;
  const state = screen.querySelector<HTMLElement>('.coalition-state')!;
  state.classList.toggle('reached', selection.total >= data.majority);
  state.classList.toggle('short', selection.total > 0 && selection.total < data.majority);
  for (const button of screen.querySelectorAll<HTMLButtonElement>('[data-coalition-party]')) {
    const active = selected.has(button.dataset.coalitionParty!);
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('.coalition-toggle-symbol')!.textContent = active ? '−' : '+';
  }
  for (const dot of screen.querySelectorAll<SVGCircleElement>('[data-seat-party]')) {
    const p = data.parties.find(p => p.id === dot.dataset.seatParty);
    dot.style.fill = p && selected.has(p.id) ? p.color : '#dce2d5';
  }
  for (const segment of screen.querySelectorAll<HTMLElement>('[data-coalition-segment]')) {
    const p = data.parties.find(p => p.id === segment.dataset.coalitionSegment)!;
    segment.style.width = `${selected.has(p.id) ? p.seats / data.total * 100 : 0}%`;
  }
  const description = `${selection.total} of ${data.total} seats selected. ${selection.status}. ${data.status === 'estimated' ? 'Estimated seats based on the current count.' : 'IEC-reported seats.'}`;
  screen.querySelector('.seat-arc')!.setAttribute('aria-label', description);
  screen.querySelector('.coalition-meter')!.setAttribute('aria-label', `${description} Marker at 50 percent; a majority needs ${data.majority} seats.`);
  const key = screen.querySelector('.coalition-key')!;
  key.replaceChildren(...selection.parties.map(p => {
    const span = document.createElement('span'), dot = document.createElement('i');
    dot.style.background = p.color; span.appendChild(dot); span.appendChild(document.createTextNode(`${p.short} ${p.seats}`)); return span;
  }));
  if (!selection.parties.length) key.textContent = 'No parties selected';
  screen.querySelectorAll<HTMLButtonElement>('[data-coalition-reset], [data-coalition-share]').forEach(b => { b.disabled = !selection.parties.length; });
  const snapshotChanged = previousSnapshot !== undefined && previousSnapshot !== data.source.snapshotId;
  if (announce || snapshotChanged) screen.querySelector('[data-coalition-announcement]')!.textContent = `${snapshotChanged ? 'Seat figures updated. ' : ''}${description}`;
  previousSnapshot = data.source.snapshotId;
  history.replaceState(null, '', shareUrl(data));
  if (document.querySelector<HTMLDialogElement>('[data-coalition-dialog]')?.open) refreshShare();
}
function refreshShare() {
  const data = model(); if (!data) return;
  const dialog = document.querySelector<HTMLDialogElement>('[data-coalition-dialog]')!;
  const text = coalitionShareText(data, selected, shareUrl(data));
  dialog.querySelector<HTMLTextAreaElement>('[data-coalition-text]')!.value = text;
  dialog.querySelector<HTMLAnchorElement>('[data-coalition-whatsapp]')!.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const canvas = dialog.querySelector<HTMLCanvasElement>('[data-coalition-canvas]')!;
  canvas.setAttribute('aria-label', text);
  drawCoalitionImage(canvas, data, selected, dialog.querySelector('select')!.value);
}
async function imageFile() {
  refreshShare();
  const canvas = document.querySelector<HTMLCanvasElement>('[data-coalition-canvas]')!;
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create the image.')), 'image/png'));
  return new File([blob], 'counted-hypothetical-coalition.png', { type: 'image/png' });
}
function download(file: File) {
  const url = URL.createObjectURL(file), a = document.createElement('a');
  a.href = url; a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
// Delegation survives the live results DOM patch; only party IDs persist, never stale seat totals.
document.addEventListener('click', async event => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button') : null;
  if (!target) return;
  const status = () => document.querySelector<HTMLElement>('[data-coalition-share-status]');
  try {
    if (target.hasAttribute('data-coalition-party')) {
      const id = target.dataset.coalitionParty!;
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      update(true);
    } else if (target.hasAttribute('data-coalition-reset')) { selected.clear(); update(true); }
    else if (target.hasAttribute('data-coalition-share')) { refreshShare(); document.querySelector<HTMLDialogElement>('[data-coalition-dialog]')!.showModal(); }
    else if (target.hasAttribute('data-coalition-close')) document.querySelector<HTMLDialogElement>('[data-coalition-dialog]')!.close();
    else if (target.hasAttribute('data-coalition-copy')) {
      const data = model(); if (!data) return;
      const text = coalitionShareText(data, selected, shareUrl(data));
      try { await navigator.clipboard.writeText(text); if (status()) status()!.textContent = 'Scenario copied.'; }
      catch { document.querySelector<HTMLTextAreaElement>('[data-coalition-text]')!.select(); if (status()) status()!.textContent = 'Text selected. Copy it using your browser.'; }
    } else if (target.hasAttribute('data-coalition-download')) download(await imageFile());
    else if (target.hasAttribute('data-coalition-image-share')) {
      const file = await imageFile();
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Hypothetical coalition' });
      else { download(file); if (status()) status()!.textContent = 'Image downloaded. You can attach it to a message.'; }
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError') && status()) status()!.textContent = 'Sharing failed. Please try again or copy the scenario text.';
  }
});
document.addEventListener('change', event => { if (event.target instanceof Element && event.target.matches('[data-coalition-image-size]')) refreshShare(); });
document.addEventListener('results:updated', () => update());
window.addEventListener('popstate', () => { selected = new Set((new URL(location.href).searchParams.get('parties') ?? '').split(',')); update(); });
update();
