import { coalitionSelection, type CoalitionData } from './coalition.ts';
import { coalitionShareCard } from './share-image.ts';
import { openShare } from '../sharing/client.ts';
import { publicShareUrl } from '../sharing/model.ts';

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
  if (!data || !screen) return;
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
  const win = screen.querySelector<HTMLElement>('[data-majority-win]');
  if (win) win.hidden = selection.total < data.majority;
  screen.dataset.majorityReached = String(selection.total >= data.majority);
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
  if (!selection.parties.length) key.textContent = '';
  screen.querySelectorAll<HTMLButtonElement>('[data-coalition-reset], [data-coalition-share]').forEach(b => { b.disabled = !selection.parties.length; });
  const snapshotChanged = previousSnapshot !== undefined && previousSnapshot !== data.source.snapshotId;
  if (announce || snapshotChanged) screen.querySelector('[data-coalition-announcement]')!.textContent = `${snapshotChanged ? 'Seat figures updated. ' : ''}${description}`;
  previousSnapshot = data.source.snapshotId;
  history.replaceState(null, '', shareUrl(data));
}
// Delegation survives the live results DOM patch; only party IDs persist, never stale seat totals.
document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button') : null;
  if (!target) return;
  if (target.hasAttribute('data-coalition-party')) {
    const id = target.dataset.coalitionParty!;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    update(true);
  } else if (target.hasAttribute('data-coalition-reset')) { selected.clear(); update(true); }
  else if (target.hasAttribute('data-coalition-share')) {
    const data = model();
    if (data) openShare(coalitionShareCard(data, selected), publicShareUrl(shareUrl(data)));
  }
});
document.addEventListener('results:updated', () => update());
window.addEventListener('popstate', () => { selected = new Set((new URL(location.href).searchParams.get('parties') ?? '').split(',')); update(); });
update();
