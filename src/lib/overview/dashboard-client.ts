import { councilFilters, councilFilterUrl, matchesCouncil, partyMajorityChanges, type CouncilFilters } from './dashboard-filter.ts';

const initialized = new WeakMap<HTMLFormElement, () => void>();
function setupDashboard() {
  const element = document.querySelector<HTMLFormElement>('#council-filters');
  if (!element) return;
  const refresh = initialized.get(element);
  if (refresh) { refresh(); return; }
  const form = element;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const search = document.querySelector<HTMLInputElement>('#dashboard-place-search')!;
  const searchRoot = search.closest<HTMLElement>('[data-place-search]')!;
  const provincePicker = form.querySelector<HTMLDetailsElement>('[data-province-picker]')!;
  const provinceTrigger = provincePicker.querySelector('summary')!;
  const provinceOptions = [...provincePicker.querySelectorAll<HTMLAnchorElement>('[data-council-province]')];
  const automatic = typeof window.IntersectionObserver === 'function';
  let limit = automatic ? 24 : Infinity, matched = 0, observed: Element | null = null;
  let urlSearch = location.search;
  const observer = automatic ? new window.IntersectionObserver(entries => {
    if (!form.isConnected) { observer?.disconnect(); return; }
    if (entries.some(entry => entry.isIntersecting) && matched > limit) {
      limit += 24;
      apply();
    }
  }, { rootMargin: '500px 0px' }) : null;
  const read = () => {
    const params = new URLSearchParams();
    for (const name of ['q', 'province', 'status', 'party', 'changed']) params.set(name, field(name).value);
    return councilFilters(params);
  };
  // The shared input also accepts private addresses. Keep its text out of URLs.
  const link = (filters: CouncilFilters, anchor = 'councils') => councilFilterUrl({ ...filters, q: '' }, anchor);
  function apply(save = false) {
    const filters = read();
    const rows = [...document.querySelectorAll<HTMLElement>('[data-council-row]')];
    const partyCounts = new Map<string, number>();
    const statusCounts = new Map<string, number>();
    let scopeCount = 0;
    matched = 0;
    for (const row of rows) {
      // All outcome counts use the province, independently of search, the active
      // outcome, changes, and how many rows have been revealed.
      if (!filters.province || row.dataset.province === filters.province) {
        scopeCount++;
        const status = row.dataset.status!;
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
        if (status === 'majority' && row.dataset.party) {
          partyCounts.set(row.dataset.party, (partyCounts.get(row.dataset.party) ?? 0) + 1);
        }
      }
      const matches = matchesCouncil({ search: row.dataset.search!, provinceId: row.dataset.province!, status: row.dataset.status!,
        winnerId: row.dataset.party!, changed: row.dataset.changed === 'true' }, filters);
      if (matches) matched++;
      row.hidden = !matches || matched > limit;
    }
    const available = document.querySelector<HTMLElement>('[data-dashboard-available]')!.dataset.dashboardAvailable === 'true';
    document.querySelector('[data-scope-count]')!.textContent = String(scopeCount);
    document.querySelector('[data-reported-count]')!.textContent = available ? String((statusCounts.get('majority') ?? 0) + (statusCounts.get('no-majority') ?? 0)) : '—';
    for (const count of document.querySelectorAll<HTMLElement>('[data-status-count]')) {
      count.textContent = count.dataset.statusCount === 'all' ? String(scopeCount)
        : available ? String(statusCounts.get(count.dataset.statusCount!) ?? 0) : '—';
    }
    for (const option of document.querySelectorAll<HTMLAnchorElement>('[data-council-outcome]')) {
      const status = option.dataset.councilOutcome!;
      const selected = filters.status === status && !filters.party;
      option.href = link({ ...filters, status, party: '' });
      option.classList.toggle('is-active', selected);
      if (selected) option.setAttribute('aria-current', 'true'); else option.removeAttribute('aria-current');
    }
    for (const option of provinceOptions) {
      option.href = link({ ...filters, province: option.dataset.councilProvince! });
      if (filters.province === option.dataset.councilProvince) option.setAttribute('aria-current', 'true');
      else option.removeAttribute('aria-current');
    }
    const provinceName = provinceOptions.find(option => option.dataset.councilProvince === filters.province)!.querySelector('span')!.textContent!;
    form.querySelector('[data-province-label]')!.textContent = provinceName;
    provinceTrigger.setAttribute('aria-label', `Province: ${provinceName}`);
    const filtered = Object.values(filters).some(Boolean);
    document.querySelector<HTMLElement>('.dashboard-list-meta')!.hidden = !filtered;
    document.querySelector<HTMLElement>('.dashboard-list-meta [data-council-clear]')!.hidden = !filtered;
    document.querySelector<HTMLElement>('[data-dashboard-highlights]')?.toggleAttribute('hidden', filtered);
    const changeToggle = form.querySelector<HTMLAnchorElement>('[data-council-changed]')!;
    changeToggle.setAttribute('aria-checked', String(filters.changed));
    changeToggle.href = link({ ...filters, changed: !filters.changed });
    form.querySelector<HTMLElement>('[data-more-filter-active]')!.hidden = !filters.changed;
    for (const option of document.querySelectorAll<HTMLAnchorElement>('[data-party-filter]')) {
      const party = option.dataset.partyFilter!;
      const count = option.querySelector('[data-party-count]');
      if (count) count.textContent = available ? String(partyCounts.get(party) ?? 0) : '—';
      const selected = filters.party === party;
      option.href = link({ ...filters, party, status: 'majority' });
      option.classList.toggle('is-active', selected);
      if (selected) option.setAttribute('aria-current', 'true'); else option.removeAttribute('aria-current');
    }
    const partyChange = document.querySelector<HTMLElement>('[data-party-change]')!;
    partyChange.hidden = !filters.party;
    if (filters.party) {
      const changes = partyMajorityChanges(rows.map(row => ({ provinceId: row.dataset.province!, winnerId: row.dataset.party!,
        previousWinnerId: row.dataset.previousParty ?? '', comparable: row.dataset.comparable === 'true' })), filters.party, filters.province);
      const selectedParty = document.querySelector(`[data-party-filter="${filters.party}"] abbr`);
      for (const [key, value] of Object.entries({ name: selectedParty?.textContent ?? `Party ${filters.party}`,
        scope: filters.province ? provinceName : 'Nationwide',
        gained: changes.comparable ? String(changes.gained) : '—', lost: changes.comparable ? String(changes.lost) : '—' })) {
        const output = partyChange.querySelector(`[data-party-change-${key}]`)!;
        // Scrolling also reapplies filters; announce only changes to the summary.
        if (output.textContent !== value) output.textContent = value;
      }
      partyChange.querySelector<HTMLElement>('[data-party-change-empty]')!.hidden = changes.comparable > 0;
    }
    document.querySelector('[data-council-count]')!.textContent = `${matched} ${matched === 1 ? 'council' : 'councils'}${filters.status === 'majority' && !filters.party ? ' with a majority' : ''}`;
    document.querySelector<HTMLElement>('[data-council-empty]')!.hidden = matched > 0;
    const searchMatches = document.querySelector<HTMLElement>('[data-search-councils]')!;
    searchMatches.hidden = !filters.q || matched === 0;
    searchMatches.querySelector('[data-search-councils-label]')!.textContent = `${matched} matching ${matched === 1 ? 'council' : 'councils'}`;
    const sentinel = document.querySelector<HTMLElement>('[data-council-sentinel]')!;
    sentinel.hidden = matched <= limit;
    if (observer && observed !== sentinel) {
      observer.disconnect();
      observer.observe(sentinel);
      observed = sentinel;
    }
    if (save) { history.replaceState(null, '', link(filters, location.hash.slice(1))); urlSearch = location.search; }
  }
  function set(filters: CouncilFilters) {
    for (const name of ['q', 'province', 'status', 'party'] as const) field(name).value = filters[name];
    field('changed').value = filters.changed ? '1' : '';
    if (search.value !== filters.q) {
      search.value = filters.q;
      searchRoot.dispatchEvent(new Event('place-search:sync-query'));
    }
  }
  const resetLimit = () => { limit = automatic ? 24 : Infinity; };
  initialized.set(form, () => apply());
  apply();
  searchRoot.addEventListener('place-search:input', () => {
    field('q').value = search.value;
    resetLimit(); apply(true);
  });
  // An address selection opens its ward result; it is not a council-name filter.
  searchRoot.addEventListener('place-search:select', () => { field('q').value = ''; resetLimit(); apply(true); });
  form.addEventListener('submit', event => { event.preventDefault(); resetLimit(); apply(true); });
  form.querySelector<HTMLAnchorElement>('[data-council-changed]')!.addEventListener('keydown', event => {
    if (event.key === ' ') { event.preventDefault(); if (!event.repeat) (event.currentTarget as HTMLAnchorElement).click(); }
  });
  provincePicker.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (provincePicker.open) { event.preventDefault(); provincePicker.open = false; provinceTrigger.focus(); }
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    provincePicker.open = true;
    const focused = provinceOptions.findIndex(option => option === document.activeElement);
    const selected = provinceOptions.findIndex(option => option.dataset.councilProvince === field('province').value);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? provinceOptions.length - 1
      : focused < 0 ? selected : (focused + (event.key === 'ArrowDown' ? 1 : -1) + provinceOptions.length) % provinceOptions.length;
    provinceOptions[next]!.focus();
  });
  provincePicker.addEventListener('focusout', event => {
    if (event.relatedTarget instanceof Node && !provincePicker.contains(event.relatedTarget)) provincePicker.open = false;
  });
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (!provincePicker.contains(event.target)) provincePicker.open = false;
    const target = event.target.closest<HTMLElement>('[data-council-outcome], [data-council-province], [data-party-filter], [data-council-clear], [data-council-changed]');
    if (!target || event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return;
    event.preventDefault();
    const filters = read();
    resetLimit();
    if (target.hasAttribute('data-council-clear')) set(councilFilters(new URLSearchParams()));
    else if (target.hasAttribute('data-council-province')) {
      field('province').value = target.dataset.councilProvince!;
      provincePicker.open = false; provinceTrigger.focus();
    }
    else if (target.hasAttribute('data-council-outcome')) {
      field('status').value = target.dataset.councilOutcome!;
      field('party').value = '';
    }
    else if (target.hasAttribute('data-council-changed')) field('changed').value = filters.changed ? '' : '1';
    else if (target.hasAttribute('data-party-filter')) {
      field('party').value = target.dataset.partyFilter!;
      field('status').value = 'majority';
    }
    apply(true);
  });
  window.addEventListener('popstate', () => {
    // In-page links also emit popstate. They must not erase a private search query.
    if (location.search === urlSearch) return;
    urlSearch = location.search;
    resetLimit(); set(councilFilters(new URLSearchParams(location.search))); apply();
  });
}
setupDashboard();
document.addEventListener('results:updated', setupDashboard);
