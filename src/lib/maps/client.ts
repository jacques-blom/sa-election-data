/// <reference types="google.maps" />
import { loadGoogleMaps } from '../address/google.ts';
import type { ResolvedArea } from '../address/selection.ts';
import { addressSearchBounds } from '../address/scope.ts';
import { googleBoundaries } from './google-boundaries.ts';
import { regions, mapPlace } from './config.ts';
import { parseView, type AreaPick, type WardPick } from './viewport.ts';
import type { BoundaryLevel } from './detail.ts';
import { pollWhileVisible } from '../live/poll.ts';
import { formatNumber, partyStyle } from '../places/format.ts';
import { ballotLabel, LEADER_BATCH_SIZE, NEUTRAL_COLOR, type MapLeader, type MapLeadersResponse } from './leader-types.ts';
import type { MapWardResponse, WardInfo } from './ward-types.ts';
import type { Feature } from 'geojson';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const app = element<HTMLDivElement>('map-app');
const loading = element<HTMLParagraphElement>('map-loading');
const panel = element<HTMLDivElement>('ward-result');
const browse = element<HTMLDivElement>('map-browse');
const areaList = element<HTMLUListElement>('map-area-list');
const notice = element<HTMLParagraphElement>('map-notice');
const title = element<HTMLHeadingElement>('map-area-title');
const description = element<HTMLParagraphElement>('map-area-description');
const reset = element<HTMLButtonElement>('reset-selection');
const home = element<HTMLButtonElement>('map-home');
const viewStatus = element<HTMLParagraphElement>('map-view-status');
const scope = element<HTMLParagraphElement>('map-result-scope');
const legend = element<HTMLDivElement>('map-result-legend');
const boundaryLabel = element<HTMLSpanElement>('map-boundary-label');
const cache = new Map<string, { at: number; data: MapWardResponse }>();
const leaders = new Map<string, { at: number; data: MapLeader }>();
const resultLabels = new Map<string, HTMLElement>();
let selected: string | null = null;
let selection: WardPick | null = null;
let inView = new Map<string, AreaPick>();
let generation = 0;
let ready = false;
let map: google.maps.Map;
let selectedArea: ResolvedArea | undefined;
let areaOutline: google.maps.Data;
let point: google.maps.Circle | undefined;
let boundaryFailed = false;
let boundaryLimited = false;
let overlay: { level: BoundaryLevel } = { level: 'province' };
let searchVersion = 0;
let searchRequest: AbortController | undefined;
let listKey = '';
let colorRequest: AbortController | undefined;
let colorsFailed = false;
let selectionFailed = false;
const initialPlace = mapPlace(app.dataset.place ?? null);
const initialView = parseView(new URL(location.href).searchParams.get('view'));
const views = {
  'south-africa': { center: [24.5, -29.4] as [number, number], zoom: 4.8 },
  'cape-town': regions['cape-town'], hantam: regions.hantam,
  calvinia: { center: [19.776, -31.471] as [number, number], zoom: 12.3 },
};

function text<K extends keyof HTMLElementTagNameMap>(tag: K, value: string, className = '') {
  const node = document.createElement(tag);
  node.textContent = value;
  node.className = className;
  return node;
}
function append(parent: Node, ...children: Node[]) {
  for (const child of children) parent.appendChild(child);
}
function setNotice(message = '') { notice.textContent = message; notice.hidden = !message; }
function refreshNotice() {
  setNotice(boundaryFailed ? 'Boundaries could not load. Try moving the map or search for an area.' : selectionFailed ? 'Results could not refresh. Showing the last available figures.'
    : colorsFailed ? 'Result colors could not refresh. Showing the last available figures.' : '');
}
function updateUrl() {
  if (!ready) return;
  const center = map.getCenter();
  if (!center) return;
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('view', [center.lng().toFixed(5), center.lat().toFixed(5), (map.getZoom() ?? 4).toFixed(2)].join(','));
  if (selected) url.searchParams.set('ward', selected);
  if (selectedArea?.url.startsWith('/2026/places/')) url.searchParams.set('place', selectedArea.url.split('/').at(-1)!);
  if (selectedArea?.url.startsWith('/2026/provinces/')) url.searchParams.set('province', selectedArea.url.split('/').at(-1)!);
  history.replaceState(null, '', url);
}
function highlight() {
  map.data.setStyle(feature => {
    const id = String(feature.getId());
    return { fillColor: leaders.get(`${overlay.level}:${id}`)?.data.color ?? NEUTRAL_COLOR,
      fillOpacity: .28, strokeColor: id === selected ? '#163a30' : '#536e96',
      strokeWeight: id === selected ? 3 : 1, strokeOpacity: .8, clickable: true,
      zIndex: id === selected ? 2 : 1 };
  });
}
function updateHeading() {
  const plural = overlay.level === 'province' ? 'Provinces' : overlay.level === 'municipality' ? 'Municipalities' : 'Wards';
  boundaryLabel.textContent = ballotLabel(overlay.level);
  scope.textContent = overlay.level === 'province' ? 'Selected parties shown' : '';
  scope.hidden = overlay.level !== 'province' || !!selected || !!selectedArea;
  home.hidden = overlay.level === 'province' && !selected && !selectedArea;
  reset.hidden = !selected && !selectedArea;
  browse.hidden = !!selected || !!selectedArea;
  panel.hidden = !selected && !selectedArea;
  if (selectedArea) {
    title.textContent = selectedArea.name;
    description.textContent = selectedArea.description;
  } else if (selected) {
    title.textContent = selection ? `Ward ${selection.number}` : 'Selected ward';
    description.textContent = selection ? `${selection.municipality}${overlay.level !== 'ward' || !inView.has(selected) ? ' · outside this view' : ''}` : 'Loading results…';
  } else {
    title.textContent = overlay.level === 'province' ? plural : `${plural} in view`;
    description.textContent = overlay.level === 'ward' ? 'Choose a ward to see its result.' : `Choose ${overlay.level === 'province' ? 'a province' : 'a municipality'} to zoom in.`;
  }
  viewStatus.textContent = inView.size ? `${inView.size.toLocaleString('en-ZA')} ${plural.toLowerCase()} in view`
    : 'No areas in view. Pan towards South Africa.';
  if (boundaryLimited) viewStatus.textContent = 'Zoom in to see wards. Showing municipalities for this wider view.';
}
function leaderLabel(leader?: MapLeader) {
  if (!leader) return 'Loading result…';
  if (leader.party) return `${partyStyle(leader.party)[0]} ${leader.share!.toFixed(1)}%${leader.delayed ? ' · delayed' : ''}`;
  return leader.status === 'tied' ? 'Tied' : leader.status === 'awaiting' ? 'Awaiting votes' : 'Result unavailable';
}
function paintResults() {
  const key = new Map<string, string>();
  let delayed = false;
  for (const area of inView.values()) {
    const leader = leaders.get(`${overlay.level}:${area.id}`)?.data;
    const color = leader?.color ?? NEUTRAL_COLOR;
    const label = resultLabels.get(area.id);
    if (label) {
      label.textContent = leaderLabel(leader);
      label.style.setProperty('--result-color', color);
      label.title = leader?.party ?? label.textContent;
    }
    if (leader?.party) key.set(leader.party, color);
    delayed ||= leader?.delayed ?? false;
  }
  const entries: HTMLElement[] = [];
  for (const [party, color] of [...key].sort(([a], [b]) => a.localeCompare(b))) {
    const entry = text('span', partyStyle(party)[0]!);
    entry.title = party;
    entry.style.setProperty('--result-color', color);
    entries.push(entry);
  }
  const neutral = text('span', 'No clear result');
  neutral.style.setProperty('--result-color', NEUTRAL_COLOR);
  entries.push(neutral);
  legend.replaceChildren(...entries);
  if (ready) highlight();
  legend.title = delayed ? 'Some results are delayed; showing the last available figures.' : '';
}
async function loadLeaders(force = false, signal?: AbortSignal) {
  colorRequest?.abort();
  const controller = new AbortController();
  colorRequest = controller;
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const level = overlay.level;
  const ids = [...inView.keys()].filter(id => force || Date.now() - (leaders.get(`${level}:${id}`)?.at ?? 0) > 15000).sort();
  try {
    for (let i = 0; i < ids.length; i += LEADER_BATCH_SIZE) {
      const batch = ids.slice(i, i + LEADER_BATCH_SIZE);
      const response = await fetch(`/api/v1/map/leaders?level=${level}&ids=${batch.join(',')}`, { signal: controller.signal, cache: force ? 'no-cache' : 'default' });
      if (!response.ok) throw new Error('unavailable');
      const data = await response.json() as MapLeadersResponse;
      if (controller.signal.aborted || overlay.level !== level) return;
      for (const leader of data.areas) leaders.set(`${level}:${leader.id}`, { at: Date.now(), data: leader });
      while (leaders.size > 1000) leaders.delete(leaders.keys().next().value!);
      paintResults();
    }
    if (!controller.signal.aborted) { colorsFailed = false; refreshNotice(); }
  } catch {
    if (!controller.signal.aborted) {
      for (const id of ids) {
        const label = resultLabels.get(id);
        if (label) label.textContent = leaders.has(`${level}:${id}`) ? `${leaderLabel(leaders.get(`${level}:${id}`)!.data)} · refresh failed` : 'Result unavailable';
      }
      legend.title = 'Result colors could not refresh. Showing the last available figures.';
      colorsFailed = true;
      refreshNotice();
    }
  } finally { signal?.removeEventListener('abort', abort); }
}
function renderAreas() {
  const key = `${overlay.level}:${[...inView.keys()].join(',')}`;
  if (listKey !== key) {
    listKey = key;
    resultLabels.clear();
    const rows = [...inView.values()].map(area => {
      const row = text('li', '', 'map-area-row');
      const button = text('button', '', 'map-area-button');
      button.type = 'button';
      const name = text('span', area.name, 'map-area-name');
      const result = text('span', '', 'map-area-result');
      resultLabels.set(area.id, result);
      const copy = text('span', '', 'map-area-copy');
      append(copy, name);
      if (area.detail) append(copy, text('span', area.detail, 'map-area-detail'));
      append(copy, result);
      const arrow = text('span', '→', 'map-area-arrow');
      arrow.setAttribute('aria-hidden', 'true');
      append(button, copy, arrow);
      button.addEventListener('click', () => chooseArea(area));
      append(row, button);
      if (!area.ward) {
        const link = text('a', 'Results ↗', 'map-area-link');
        link.href = area.url;
        link.setAttribute('aria-label', `${area.name} results`);
        append(row, link);
      }
      return row;
    });
    areaList.replaceChildren(...rows);
  }
  updateHeading();
  paintResults();
}
function fitBounds(bbox: [number, number, number, number], maxZoom = 14) {
  const bounds = addressSearchBounds(bbox);
  if (!bounds) return;
  google.maps.event.addListenerOnce(map, 'idle', () => {
    if ((map.getZoom() ?? 0) > maxZoom) map.setZoom(maxZoom);
  });
  map.fitBounds(bounds, 35);
}
function chooseArea(area: AreaPick) {
  if (area.ward) { void chooseWard(area.id, area.ward); return; }
  if (!area.bbox) return;
  clearSelection();
  fitBounds(area.bbox, overlay.level === 'province' ? 7.7 : 12);
}
function clearSelection() {
  selected = null;
  selectedArea = undefined;
  selection = null;
  generation++;
  ++searchVersion;
  searchRequest?.abort();
  point?.setMap(null);
  areaOutline?.forEach(feature => areaOutline.remove(feature));
  selectionFailed = false;
  refreshNotice();
  updateHeading();
  if (ready) { highlight(); updateUrl(); }
}
function goHome() {
  clearSelection();
  fitBounds([16.3, -34.9, 32.9, -22.1], 4.8);
}
async function showArea(area: ResolvedArea, fit = true) {
  clearSelection();
  selectedArea = area;
  const version = generation;
  updateHeading();
  updateUrl();
  const link = text('a', `View ${area.name} results ↗`, 'button primary');
  link.href = area.url;
  panel.replaceChildren(text('p', 'Results for this whole area.', 'map-hint'), link);
  if (area.bbox && fit) fitBounds(area.bbox);
  if (!area.geometry) return;
  try {
    const response = await fetch(`/api/v1/geometry/${area.geometry.level}/${area.geometry.id}`);
    if (!response.ok) throw new Error('Boundary unavailable');
    const feature = await response.json() as Feature;
    if (version === generation) areaOutline.addGeoJson(feature);
  } catch {
    if (version === generation) append(panel, text('p', 'The area outline couldn’t load. Its full results are still available.', 'map-hint'));
  }
}
async function dataFor(id: string, force = false, signal?: AbortSignal) {
  const cached = cache.get(id);
  if (cached && !force && Date.now() - cached.at < 15000) return cached.data;
  const response = await fetch(`/api/v1/map/wards/${id}`, { signal, cache: force ? 'no-cache' : 'default' });
  if (!response.ok) throw new Error(response.status === 404 ? 'unknown' : 'unavailable');
  const data = await response.json() as MapWardResponse;
  cache.set(id, { at: Date.now(), data });
  if (cache.size > 50) cache.delete(cache.keys().next().value!);
  return data;
}
function renderResult(data: MapWardResponse) {
  const result = data.result;
  const card = text('section', '', 'selected-result');
  append(card, text('p', 'Ward ballot · provisional', 'map-result-caption'));
  if (!result) append(card, text('p', 'No result is available for this ward yet.', 'map-hint'));
  else {
    if (result.total === 0) append(card, text('p', 'No ward votes published yet.', 'map-hint'));
    for (const party of result.total === 0 ? [] : result.parties) {
      const row = text('div', '', 'map-party');
      const heading = text('div', '', 'map-party-heading');
      const [short, color] = partyStyle(party.name);
      const name = text('strong', short!);
      name.title = party.name;
      name.setAttribute('aria-label', party.name);
      append(heading, name, text('span', party.share === null ? 'Unavailable' : `${party.share.toFixed(1)}%`, 'map-party-share'));
      const track = text('div', '', 'bar-track'), bar = text('div', '', 'bar');
      bar.style.setProperty('--share', `${party.share ?? 0}%`);
      bar.style.setProperty('--party', color!);
      track.setAttribute('aria-hidden', 'true');
      append(track, bar);
      append(row, heading, track, text('small', party.votes === null ? 'Votes unavailable' : `${formatNumber(party.votes)} votes`));
      append(card, row);
    }
    if (result.progress) append(card, text('p', `${result.progress.completed} of ${result.progress.expected} districts reported`, 'map-hint'));
    if (result.freshness) append(card, text('p', result.freshness, 'map-hint'));
  }
  const link = text('a', 'Full ward results ↗', 'button primary');
  link.href = data.url;
  append(card, link);
  panel.replaceChildren(card);
}
async function chooseWard(id: string, known?: WardPick, fit = false, keepAddress = false) {
  if (!keepAddress) {
    ++searchVersion;
    searchRequest?.abort();
    point?.setMap(null);
    element<HTMLElement>('map-search-status').hidden = true;
  }
  const current = ++generation;
  selectedArea = undefined;
  areaOutline.forEach(feature => areaOutline.remove(feature));
  selected = id;
  selection = known ?? null;
  selectionFailed = false;
  refreshNotice();
  updateHeading();
  highlight();
  updateUrl();
  panel.replaceChildren(text('p', 'Loading ward results…', 'map-hint'));
  try {
    const data = await dataFor(id);
    if (current !== generation) return;
    selection = data.ward;
    updateHeading();
    renderResult(data);
    if (fit) {
      fitBounds(data.ward.bbox);
    }
  } catch (error) {
    if (current !== generation) return;
    const link = text('a', 'Open ward result page ↗', 'map-preview-link');
    link.href = `/2026/wards/${id}`;
    panel.replaceChildren(text('p', error instanceof Error && error.message === 'unknown'
      ? 'This ward is not in the 2026 boundary dataset.' : 'Results are temporarily unavailable.', 'map-error'), link);
  }
}
async function refreshSelection(signal: AbortSignal) {
  if (!selected) return;
  const id = selected, current = generation;
  try {
    const data = await dataFor(id, true, signal);
    if (current === generation && !signal.aborted) {
      selection = data.ward;
      updateHeading();
      renderResult(data);
      selectionFailed = false;
      refreshNotice();
    }
  } catch {
    if (current === generation && !signal.aborted) { selectionFailed = true; refreshNotice(); }
  }
}
async function showAddress(place: google.maps.places.Place) {
  clearSelection();
  const current = searchVersion;
  searchRequest = new AbortController();
  const signal = searchRequest.signal;
  const status = element<HTMLElement>('map-search-status');
  status.hidden = false;
  status.textContent = 'Finding this address’s ward…';
  try {
    if (!place.location) throw new Error('No location');
    if (place.viewport) map.fitBounds(place.viewport, 35);
    else { map.setCenter(place.location); map.setZoom(15); }
    point = new google.maps.Circle({ map, center: place.location, radius: 25, fillColor: '#175b99', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3, clickable: false });
    const response = await fetch('/api/locate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(place.location.toJSON()), signal });
    if (!response.ok) throw new Error('Lookup unavailable');
    const data = await response.json() as { wards: WardInfo[] };
    if (current !== searchVersion) return;
    if (data.wards.length === 1) {
      await chooseWard(data.wards[0]!.id, data.wards[0], false, true);
      if (current === searchVersion) status.textContent = 'Showing the ward at this address. A ward match doesn’t confirm your voting station.';
    } else if (data.wards.length) {
      status.textContent = 'This address is close to a boundary. Choose a ward to view its results.';
      for (const ward of data.wards) {
        const button = text('button', `Ward ${ward.number}, ${ward.municipality}`, 'button');
        button.type = 'button';
        button.addEventListener('click', () => void chooseWard(ward.id, ward, false, true));
        append(status, button);
      }
    } else status.textContent = 'No ward matched this address. Try a nearby street or browse the map.';
  } catch {
    if (current === searchVersion) status.textContent = 'This address couldn’t be looked up. Try again or browse the map.';
  }
}
async function start() {
  try {
    await loadGoogleMaps();
    await google.maps.importLibrary('maps');
    const initial = initialView ?? views[initialPlace];
    map = new google.maps.Map(element('election-map'), {
      center: { lng: initial.center[0], lat: initial.center[1] }, zoom: initial.zoom,
      isFractionalZoomEnabled: true,
      minZoom: 3, maxZoom: 17, mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
      gestureHandling: 'greedy', clickableIcons: false,
    });
    areaOutline = new google.maps.Data({ map });
    areaOutline.setStyle({ fillOpacity: .05, strokeColor: '#163a30', strokeWeight: 3, clickable: false, zIndex: 4 });
    ready = true;
    const boundaries = googleBoundaries(map, view => {
      overlay = { level: view.level };
      boundaryLimited = view.limited;
      boundaryFailed = false;
      loading.hidden = true;
      inView = new Map(view.areas.map(area => [area.id, area]));
      renderAreas();
      refreshNotice();
      void loadLeaders();
    }, () => { loading.hidden = true; boundaryFailed = true; refreshNotice(); });
    const hover = element<HTMLElement>('map-hover');
    map.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      hover.textContent = String(event.feature.getProperty('name'));
      hover.hidden = false;
      map.data.overrideStyle(event.feature, { fillOpacity: .48, strokeWeight: 2.5 });
    });
    map.data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => { hover.hidden = true; map.data.revertStyle(event.feature); });
    map.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      hover.hidden = true;
      const area = inView.get(String(event.feature.getId()));
      if (area) chooseArea(area);
    });
    map.addListener('bounds_changed', () => { hover.hidden = true; boundaries.cancel(); colorRequest?.abort(); });
    map.addListener('idle', () => {
      updateUrl();
      loading.hidden = false;
      loading.textContent = 'Loading electoral boundaries…';
      void boundaries.update();
    });
    clearSelection();
    if (app.dataset.ward) void chooseWard(app.dataset.ward, undefined, !initialView);
    else if (app.dataset.area) void showArea(JSON.parse(app.dataset.area) as ResolvedArea, !initialView);
    else if (!initialView && app.dataset.bounds) fitBounds(JSON.parse(app.dataset.bounds));
    else if (!initialView && initialPlace === 'south-africa') goHome();
    reset.addEventListener('click', clearSelection);
    home.addEventListener('click', goHome);
    const stopPolling = pollWhileVisible(async signal => {
      if (!ready) return;
      await Promise.all([loadLeaders(true, signal), refreshSelection(signal)]);
    });
    window.addEventListener('pagehide', event => {
      if (!event.persisted) stopPolling();
      boundaries.cancel(); colorRequest?.abort(); searchRequest?.abort();
    });
    window.addEventListener('pageshow', event => { if (event.persisted) void boundaries.update(); });
  } catch {
    loading.hidden = false;
    loading.textContent = 'Google Maps could not load. Search for an area or use Browse results above.';
  }
}
const started = start();
app.addEventListener('place-search:area', event => {
  if (!ready) return; // A working search can still open the area's results when Maps is unavailable.
  event.preventDefault();
  element<HTMLElement>('map-search-status').hidden = true;
  void showArea((event as CustomEvent<ResolvedArea>).detail);
});
app.addEventListener('place-search:select', async event => {
  await started;
  if (ready) void showAddress((event as CustomEvent<google.maps.places.Place>).detail);
});
app.addEventListener('place-search:input', () => {
  ++searchVersion;
  searchRequest?.abort();
  element<HTMLElement>('map-search-status').hidden = true;
});
