/// <reference types="google.maps" />
import { loadGoogleMaps } from './google.ts';
import { isWholeArea, type ResolvedArea, type AreaResolution } from './selection.ts';
import { addressSearchBounds } from './scope.ts';

document.querySelectorAll<HTMLElement>('[data-place-search]').forEach(initialize);

function initialize(root: HTMLElement) {
  const configured = root.dataset.configured === 'true';
  const bounds = addressSearchBounds(JSON.parse(root.dataset.searchBbox ?? 'null'));
  const scopeToggle = root.querySelector<HTMLButtonElement>('[data-search-scope-toggle]');
  let localScope = !!bounds;
  if (scopeToggle && configured && localScope) root.querySelector<HTMLElement>('[data-search-scope]')!.hidden = false;
  const form = root.querySelector<HTMLFormElement>('form')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const panel = form.querySelector<HTMLElement>('[data-search-panel]')!;
  const message = form.querySelector<HTMLElement>('[data-search-message]')!;
  const announcement = form.querySelector<HTMLElement>('[data-search-announcement]')!;
  const options = form.querySelector<HTMLUListElement>('[role=listbox]')!;
  const clear = form.querySelector<HTMLButtonElement>('[data-search-clear]')!;
  const home = root.querySelector<HTMLElement>('[data-search-home]')!;
  const mobile = root.querySelector<HTMLElement>('[data-search-mobile]')!;
  const dialog = root.querySelector<HTMLDialogElement>('dialog')!;
  const attribution = root.querySelector<HTMLElement>('[data-search-attribution]')!;
  const narrow = window.matchMedia('(max-width: 600px)');
  if (narrow.matches) input.placeholder = 'Place or address';
  let predictions: google.maps.places.PlacePrediction[] = [];
  let areas: ResolvedArea[] = [];
  let resolverController: AbortController | undefined;
  let pendingSubmit: number | undefined;
  let token: google.maps.places.AutocompleteSessionToken | undefined;
  let request = 0, selection = 0, active = -1;
  let timer: number | undefined;
  let suppressFocus = false;
  let previousOverflow = '';

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', options.id);
  input.setAttribute('aria-expanded', 'false');
  clear.hidden = !input.value;

  function setActive(index: number) {
    active = index;
    Array.from(options.children).forEach((option, i) => option.setAttribute('aria-selected', String(i === index)));
    const option = options.children[index];
    if (option) {
      input.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  function hidePanel() {
    ++request;
    pendingSubmit = undefined;
    window.clearTimeout(timer);
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    options.removeAttribute('aria-busy');
    predictions = [];
    areas = [];
    attribution.hidden = true;
    options.replaceChildren();
    setActive(-1);
  }

  function showMessage(text: string) {
    panel.hidden = false;
    message.textContent = text;
    message.hidden = !text;
    announcement.textContent = text;
    input.setAttribute('aria-expanded', 'true');
  }

  function fitViewport() {
    dialog.style.setProperty('--search-viewport-height', `${window.visualViewport?.height ?? window.innerHeight}px`);
    dialog.style.setProperty('--search-viewport-top', `${window.visualViewport?.offsetTop ?? 0}px`);
  }

  function openMobile() {
    if (!narrow.matches || dialog.open || suppressFocus) return;
    home.style.minHeight = `${home.getBoundingClientRect().height}px`;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobile.appendChild(form);
    fitViewport();
    dialog.showModal();
    input.focus({ preventScroll: true });
    window.visualViewport?.addEventListener('resize', fitViewport);
    window.visualViewport?.addEventListener('scroll', fitViewport);
  }

  function closeMobile() {
    if (!dialog.open) return;
    suppressFocus = true;
    dialog.close();
    home.appendChild(form);
    home.style.minHeight = '';
    document.body.style.overflow = previousOverflow;
    window.visualViewport?.removeEventListener('resize', fitViewport);
    window.visualViewport?.removeEventListener('scroll', fitViewport);
    input.focus({ preventScroll: true });
    suppressFocus = false;
  }

  function renderSuggestions() {
    const selectedKey = options.children[active]?.getAttribute('data-key');
    const items = [...areas.map(area => ({ name: area.name, detail: area.description, key: area.url })),
      ...predictions.map(prediction => ({ name: prediction.mainText?.toString() ?? prediction.text.toString(),
        detail: prediction.secondaryText?.toString() ?? '', key: prediction.placeId }))];
    options.replaceChildren();
    items.forEach((item, index) => {
        const option = document.createElement('li');
        option.id = `${input.id}-option-${index}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.dataset.index = String(index);
        option.dataset.key = item.key;
        const icon = document.createElement('span');
        icon.className = 'place-search-pin';
        icon.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        const name = document.createElement('strong');
        name.textContent = item.name;
        const detail = document.createElement('span');
        detail.className = 'place-search-secondary';
        detail.textContent = item.detail;
        text.appendChild(name);
        text.appendChild(detail);
        option.appendChild(icon);
        option.appendChild(text);
        options.appendChild(option);
    });
    setActive(selectedKey ? items.findIndex(item => item.key === selectedKey) : -1);
    attribution.hidden = predictions.length === 0;
    if (items.length) {
      showMessage('');
      announcement.textContent = `${items.length} suggestions available. Use the up and down arrow keys to choose.`;
    }
  }

  async function suggest(version: number) {
    const query = input.value.trim();
    if (query.length < 2) {
      if (dialog.open || pendingSubmit === version) showMessage('Enter a place, street address or landmark in South Africa.');
      return;
    }
    if (!configured) {
      showMessage('Google suggestions are unavailable. Browse the area directory below.');
      return;
    }
    showMessage('Looking for places…');
    options.setAttribute('aria-busy', 'true');
    try {
      await loadGoogleMaps();
      const { AutocompleteSuggestion, AutocompleteSessionToken } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
      if (version !== request) return;
      token ??= new AutocompleteSessionToken();
      const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query, includedRegionCodes: ['za'], language: 'en', region: 'za', sessionToken: token,
        ...(localScope ? { locationRestriction: bounds } : {}),
      });
      if (version !== request) return;
      predictions = response.suggestions.flatMap(suggestion => suggestion.placePrediction ? [suggestion.placePrediction] : []);
      renderSuggestions();
      if (!predictions.length) showMessage(localScope
        ? 'No suggestions nearby. Try another street or choose Search all South Africa.'
        : 'No suggestions found. Try a place name, a nearby street or a landmark.');
      if (pendingSubmit === version && predictions.length) void select(0);
    } catch {
      if (version === request) showMessage('Google suggestions couldn’t load. Try again or browse the area directory.');
    } finally {
      if (version === request) { options.removeAttribute('aria-busy'); pendingSubmit = undefined; }
    }
  }

  function queueSuggestions() {
    hidePanel();
    const version = request;
    timer = window.setTimeout(() => void suggest(version), 220);
  }

  function chooseArea(area: ResolvedArea) {
    hidePanel();
    closeMobile();
    input.value = area.name;
    const event = new CustomEvent('place-search:area', { bubbles: true, cancelable: true, detail: area });
    if (root.dispatchEvent(event)) window.location.assign(area.url);
  }

  async function select(index: number) {
    const area = areas[index];
    if (area) { chooseArea(area); return; }
    const prediction = predictions[index - areas.length];
    if (!prediction) return;
    const version = ++selection;
    resolverController?.abort();
    const controller = new AbortController();
    resolverController = controller;
    const place = prediction.toPlace();
    const name = prediction.mainText?.toString() ?? prediction.text.toString();
    token = undefined;
    input.value = name;
    clear.hidden = false;
    hidePanel();
    closeMobile();
    showMessage('Finding this place…');
    try {
      // Details complete the Google session; the same classification applies on every page.
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'viewport', 'types', 'addressComponents'] });
      if (version !== selection) return;
      const types = [...new Set([...prediction.types, ...(place.types ?? [])])];
      if (!isWholeArea(types)) {
        hidePanel();
        root.dispatchEvent(new CustomEvent('place-search:select', { bubbles: true, detail: place }));
        return;
      }
      const province = place.addressComponents?.find(component => component.types.includes('administrative_area_level_1'))?.longText;
      const names = [...new Set([name, place.displayName].filter((value): value is string => !!value))];
      const response = await fetch('/api/resolve-area', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names, types, province, location: place.location?.toJSON() }), signal: controller.signal });
      if (!response.ok) throw new Error('Area lookup unavailable');
      const result = await response.json() as AreaResolution;
      if (version !== selection) return;
      if (result.area) { chooseArea(result.area); return; }
      areas = result.alternatives;
      renderSuggestions();
      showMessage(areas.length ? 'Choose the area you mean.' : 'We don’t have a matching results area for this place yet. Try another area or browse the directory.');
    } catch {
      if (version === selection) showMessage('This place couldn’t be looked up. Try again or browse the area directory.');
    }
  }

  input.addEventListener('focus', () => {
    if (suppressFocus) return;
    openMobile();
    queueSuggestions();
  });
  input.addEventListener('pointerdown', event => {
    if (narrow.matches && !dialog.open) {
      // Keep the initiating tap from moving focus to the input's old position.
      event.preventDefault();
      openMobile();
    }
  });
  input.addEventListener('input', event => {
    ++selection;
    resolverController?.abort();
    clear.hidden = !input.value;
    if (!input.value) token = undefined;
    root.dispatchEvent(new Event('place-search:input', { bubbles: true }));
    openMobile();
    if (event instanceof InputEvent && event.isComposing) hidePanel();
    else queueSuggestions();
  });
  input.addEventListener('compositionend', queueSuggestions);
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMobile();
      const count = areas.length + predictions.length;
      if (count) setActive((active + (event.key === 'ArrowDown' ? 1 : active < 0 ? 0 : -1) + count) % count);
      else queueSuggestions();
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      void select(active);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      ++selection;
      resolverController?.abort();
      hidePanel();
      closeMobile();
    }
  });
  options.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') event.preventDefault(); });
  options.addEventListener('click', event => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (option) void select(Number(option.dataset.index));
  });
  clear.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
  });
  scopeToggle?.addEventListener('click', () => {
    localScope = !localScope;
    scopeToggle.setAttribute('aria-pressed', String(!localScope));
    scopeToggle.textContent = localScope ? 'Search all South Africa' : `Search around ${root.dataset.searchArea}`;
    root.querySelector<HTMLElement>('[data-search-scope-label]')!.textContent = localScope ? `Around ${root.dataset.searchArea}` : 'All South Africa';
    form.querySelector('label')!.textContent = localScope ? `Find a place or address around ${root.dataset.searchArea}` : 'Find a place or address in South Africa';
    ++selection;
    input.focus();
    queueSuggestions();
  });
  form.addEventListener('submit', event => {
    ++selection;
    // Addresses must be selected, never sent as raw text in a public search URL.
    event.preventDefault();
    if (areas.length + predictions.length) void select(active >= 0 ? active : 0);
    else { openMobile(); hidePanel(); pendingSubmit = request; void suggest(request); }
  });
  form.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!dialog.open && !form.contains(document.activeElement)) hidePanel();
  }));
  document.addEventListener('pointerdown', event => {
    if (!dialog.open && !form.contains(event.target as Node)) hidePanel();
  });
  function dismiss() { ++selection; resolverController?.abort(); hidePanel(); closeMobile(); }
  root.querySelector('[data-search-close]')!.addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  narrow.addEventListener('change', () => {
    input.placeholder = narrow.matches ? 'Place or address' : 'Search a place or street address';
    if (!narrow.matches) { hidePanel(); closeMobile(); }
  });
}
