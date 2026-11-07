/// <reference types="google.maps" />
import type { ResolvedArea } from '../address/selection.ts';
import type { CoalitionDestination, CoalitionSelection } from './selection.ts';

const initialized = new WeakMap<HTMLDialogElement, (view: string, trigger: HTMLElement) => void>();
function setup() {
  document.querySelectorAll<HTMLDialogElement>('[data-coalition-picker]').forEach(dialog => {
    if (!initialized.has(dialog)) initialized.set(dialog, initialize(dialog));
  });
}
setup();
document.addEventListener('results:updated', setup);
document.addEventListener('click', event => {
  const trigger = (event.target as Element).closest<HTMLElement>('[data-coalition-picker-open]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-coalition-picker]');
  if (!trigger || !dialog) return;
  event.preventDefault();
  initialized.get(dialog)?.(trigger.dataset.coalitionPickerOpen ?? 'councils', trigger);
});

function initialize(dialog: HTMLDialogElement) {
  const search = dialog.querySelector<HTMLElement>('[data-place-search]')!;
  const input = search.querySelector<HTMLInputElement>('input[type=search]')!;
  const title = dialog.querySelector<HTMLElement>('#coalition-picker-title')!;
  const status = dialog.querySelector<HTMLElement>('[data-picker-status]')!;
  const browse = dialog.querySelector<HTMLElement>('[data-picker-browse]')!;
  const provinceList = dialog.querySelector<HTMLElement>('[data-picker-province-list]')!;
  const councilList = dialog.querySelector<HTMLElement>('[data-picker-councils]')!;
  const provinceLabel = dialog.querySelector<HTMLElement>('[data-picker-province-label]')!;
  const count = dialog.querySelector<HTMLElement>('[data-picker-count]')!;
  const links = [...councilList.querySelectorAll<HTMLAnchorElement>('[data-picker-council]')];
  let trigger: HTMLElement | undefined;
  let province = dialog.dataset.currentProvince ?? '';
  let controller: AbortController | undefined;
  let version = 0;

  function cancel() {
    ++version;
    controller?.abort();
    status.hidden = true;
    status.textContent = '';
    search.removeAttribute('aria-busy');
  }
  function resetSearch() {
    input.value = '';
    search.dispatchEvent(new Event('place-search:sync-query'));
    cancel();
  }
  function showCouncils(ids?: string[], label?: string) {
    browse.hidden = false;
    provinceList.hidden = true;
    councilList.hidden = false;
    title.textContent = 'Choose your council';
    provinceLabel.textContent = label ?? dialog.querySelector<HTMLElement>(`[data-picker-province="${province}"]`)?.dataset.provinceName ?? 'All provinces';
    let visible = 0;
    for (const link of links) {
      link.hidden = ids ? !ids.includes(link.dataset.pickerCouncil!) : !!province && link.dataset.province !== province;
      if (!link.hidden) visible++;
    }
    count.textContent = `${visible} ${visible === 1 ? 'council' : 'councils'}`;
  }
  function showProvinces() {
    resetSearch();
    browse.hidden = false;
    provinceList.hidden = false;
    councilList.hidden = true;
    title.textContent = 'Choose your province';
    provinceLabel.textContent = 'All provinces';
    count.textContent = '9 provinces';
    dialog.querySelectorAll<HTMLElement>('[data-picker-province]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pickerProvince === province)));
  }
  function close() {
    resetSearch();
    dialog.close();
    trigger?.focus({ preventScroll: true });
  }

  async function resolve(selection: CoalitionSelection) {
    cancel();
    const current = version;
    controller = new AbortController();
    status.hidden = false;
    status.textContent = 'Finding your council…';
    browse.hidden = true;
    search.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/coalition/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selection), signal: controller.signal });
      if (!response.ok) throw new Error('Council lookup unavailable');
      const result = await response.json() as CoalitionDestination;
      if (current !== version || !dialog.open) return;
      if (!result.browse && result.councils.length === 1) {
        // Only follow a council route already present in this game's directory.
        const link = links.find(link => link.dataset.pickerCouncil === result.councils[0]!.id);
        if (link) { window.location.assign(link.href); return; }
      }
      if (result.councils.length) {
        showCouncils(result.councils.map(c => c.id), result.browse ?? 'Matching councils');
        status.textContent = result.browse ? 'Choose a council to start playing.' : 'This place matches more than one council. Choose where to play.';
      } else {
        showCouncils();
        status.textContent = 'We couldn’t find a council for this place. Try another town or address, or choose below.';
      }
    } catch {
      if (current !== version) return;
      showCouncils();
      status.textContent = 'Council lookup couldn’t load. Try again, or choose a council below.';
    } finally {
      if (current === version) search.removeAttribute('aria-busy');
    }
  }

  search.addEventListener('place-search:area', event => {
    event.preventDefault();
    void resolve({ url: (event as CustomEvent<ResolvedArea>).detail.url });
  });
  search.addEventListener('place-search:google', event => {
    event.preventDefault();
    const { place, name, types } = (event as CustomEvent<{ place: google.maps.places.Place; name: string; types: string[] }>).detail;
    void resolve({ names: [...new Set([name, place.displayName].filter((n): n is string => !!n))], types,
      province: place.addressComponents?.find(c => c.types.includes('administrative_area_level_1'))?.longText ?? undefined,
      location: place.location?.toJSON() });
  });
  search.addEventListener('place-search:input', () => { cancel(); showCouncils(); browse.hidden = !!input.value.trim(); });
  search.addEventListener('place-search:pending', cancel);
  search.addEventListener('place-search:cancel', () => { cancel(); showCouncils(); });
  dialog.querySelector('[data-picker-close]')!.addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
    }
    const target = (event.target as Element).closest<HTMLElement>('[data-picker-province], [data-picker-provinces], .place-search-fallback, .place-search-directory');
    if (!target) return;
    event.preventDefault();
    if (target.hasAttribute('data-picker-provinces')) showProvinces();
    else {
      if (target.hasAttribute('data-picker-province')) province = target.dataset.pickerProvince!;
      resetSearch();
      showCouncils();
    }
  });
  return (view: string, opener: HTMLElement) => {
    trigger = opener;
    province = dialog.dataset.currentProvince ?? '';
    resetSearch();
    if (view === 'provinces') showProvinces(); else showCouncils();
    dialog.showModal();
    dialog.scrollTop = 0;
    title.focus({ preventScroll: true });
  };
}
