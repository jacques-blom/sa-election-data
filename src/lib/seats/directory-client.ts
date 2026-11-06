import { matchesBuilderCouncil } from './directory-filter.ts';
import { observeBuilderSeats } from './directory-seats-client.ts';

const initialized = new WeakSet<HTMLFormElement>();
let refreshFilters = () => {};
function setupDirectory() {
  const form = document.querySelector<HTMLFormElement>('#builder-search');
  if (!form) return;
  const query = form.querySelector<HTMLInputElement>('[name=q]')!;
  const province = form.querySelector('[name=province]') as unknown as HTMLSelectElement;
  const status = form.querySelector('[name=status]') as unknown as HTMLSelectElement;
  function filter(save = false) {
    const cards = [...document.querySelectorAll<HTMLElement>('[data-builder-card]')];
    let shown = 0;
    for (const card of cards) {
      const matches = matchesBuilderCouncil({ search: card.dataset.search!, provinceId: card.dataset.province!, status: card.dataset.status!, loaded: card.dataset.loaded !== 'false' }, query.value, province.value, status.value);
      card.hidden = !matches;
      if (matches) shown++;
    }
    document.querySelector('[data-builder-count]')!.textContent = `${shown} of ${cards.length} councils`;
    document.querySelector<HTMLElement>('[data-builder-empty]')!.hidden = shown > 0;
    const random = document.querySelector<HTMLButtonElement>('[data-builder-random]');
    if (random) random.hidden = !cards.some(card => !card.hidden && card.dataset.status !== 'pending');
    if (save) {
      const url = new URL(location.href);
      for (const [key, value] of [['q', query.value.trim()], ['province', province.value], ['status', status.value]]) {
        if (value) url.searchParams.set(key!, value); else url.searchParams.delete(key!);
      }
      history.replaceState(null, '', url);
    }
  }
  filter();
  refreshFilters = filter;
  observeBuilderSeats();
  if (initialized.has(form)) return;
  initialized.add(form);
  query.addEventListener('input', () => filter(true));
  province.addEventListener('change', () => filter(true));
  status.addEventListener('change', () => filter(true));
  form.addEventListener('submit', event => { event.preventDefault(); filter(true); });
}
document.addEventListener('click', event => {
  if (!(event.target instanceof Element) || !event.target.closest('[data-builder-random]')) return;
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-builder-card]:not([hidden]):not([data-status=pending]) [data-builder-play]')];
  const link = links[Math.floor(Math.random() * links.length)];
  if (link) location.assign(link.href);
});
setupDirectory();
document.addEventListener('results:updated', setupDirectory);
document.addEventListener('builder:seats-updated', () => refreshFilters());
