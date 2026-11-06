import { movementText, movementDescription } from '../history/comparison.ts';
/// <reference types="google.maps" />
import { loadGoogleMaps } from '../address/google.ts';
import type { ResolvedArea } from '../address/selection.ts';
import { addressSearchBounds } from '../address/scope.ts';
import { googleAreaView } from '../address/google-area.ts';
import { googleBoundaries } from './google-boundaries.ts';
import { regions, mapPlace } from './config.ts';
import { parseView, type AreaPick, type WardPick } from './viewport.ts';
import type { BoundaryLevel } from './detail.ts';
import { pollWhileVisible } from '../live/poll.ts';
import { formatNumber, partyStyle } from '../places/format.ts';
import { ballotLabel, LEADER_BATCH_SIZE, NEUTRAL_COLOR, type MapLeader, type MapLeadersResponse } from './leader-types.ts';
import type { MapWardResponse } from './ward-types.ts';
import type { Feature } from 'geojson';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const app = element<HTMLDivElement>('map-app');
const loading = element<HTMLParagraphElement>('map-loading');
const panel = element<HTMLDivElement>('ward-result');
const selectedPanel = element<HTMLElement>('map-selection');
const browseTitle = element<HTMLHeadingElement>('map-browse-title');
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
let boundaryFailed = false;
let boundaryLimited = false;
let overlay: { level: BoundaryLevel } = { level: 'province' };
let listKey = '';
let colorRequest: AbortController | undefined;
let colorsFailed = false;
let selectionFailed = false;
const initialPlace = mapPlace(app.dataset.place ?? null);
const initialView = parseView(new URL(location.href).searchParams.get('view'));
const initialGooglePlace = new URL(location.href).searchParams.get('google-place');
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
  if (selectedArea?.kind === 'district') url.searchParams.set('district', selectedArea.id);
  if (selectedArea?.googlePlaceId) url.searchParams.set('google-place', selectedArea.googlePlaceId);
  history.replaceState(null, '', url);
}
function highlight() {
  map.data.setStyle(feature => {
    const id = String(feature.getId());
    return { fillColor: leaders.get(`${overlay.level}:${id}`)?.data.color ?? NEUTRAL_COLOR,
      fillOpacity: .28, strokeColor: id === selected ? '#163a30' : '#536e96',
      strokeWeight: id === selected ? 1.5 : 1, strokeOpacity: .8, clickable: true,
      zIndex: id === selected ? 2 : 1 };
  });
}
function updateHeading() {
  const plural = overlay.level === 'province' ? 'Provinces' : overlay.level === 'municipality' ? 'Municipalities' : 'Wards';
  boundaryLabel.textContent = ballotLabel(overlay.level);
  scope.textContent = overlay.level === 'province' ? 'Selected parties shown' : '';
  scope.hidden = overlay.level !== 'province';
  home.hidden = overlay.level === 'province' && !selected && !selectedArea;
  reset.hidden = !selected && !selectedArea;
  selectedPanel.hidden = !selected && !selectedArea;
  browseTitle.textContent = overlay.level === 'province' ? plural : `${plural} in view`;
  if (selectedArea) {
    title.textContent = selectedArea.name;
    description.textContent = selectedArea.description;
  } else if (selected) {
    title.textContent = selection ? `Ward ${selection.number}` : 'Selected ward';
    description.textContent = selection ? `${selection.municipality}${overlay.level !== 'ward' || !inView.has(selected) ? ' · outside this view' : ''}` : 'Loading results…';
  } else {
    title.textContent = '';
    description.textContent = '';
  }
  description.hidden = !description.textContent;
  viewStatus.textContent = inView.size ? `${inView.size.toLocaleString('en-ZA')} ${plural.toLowerCase()} in view`
    : 'No areas in view. Pan towards South Africa.';
  if (boundaryLimited) viewStatus.textContent = 'Zoom in to see wards.';
}
function leaderLabel(leader?: MapLeader) {
  if (!leader) return 'Loading result…';
  if (leader.party) return `${partyStyle(leader.party)[0]} ${leader.share!.toFixed(1)}%${leader.movement?.delta !== null && leader.movement ? ` · ${movementText(leader.movement)} since ${leader.movement.previousYear}` : ''}${leader.delayed ? ' · delayed' : ''}`;
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
  const level = overlay.level === 'province' ? 'province' : 'municipality';
  void showArea({ id: area.id, name: area.name, url: area.url, bbox: area.bbox,
    kind: level, description: area.detail || (level === 'province' ? 'Province' : 'Municipality'),
    geometry: { level, id: area.id } }, false);
  if (area.bbox) fitBounds(area.bbox, level === 'province' ? 7.7 : 12);
}
function clearSelection() {
  selected = null;
  selectedArea = undefined;
  selection = null;
  generation++;
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
  if (area.kind === 'ward') {
    if (fit && area.bbox) fitBounds(area.bbox);
    void chooseWard(area.id);
    return;
  }
  selectedArea = area;
  const version = generation;
  updateHeading();
  updateUrl();
  if (area.googlePlaceId) {
    panel.replaceChildren(text('p', 'Google Maps’ view; electoral boundary unavailable.', 'map-hint'));
    if (area.bbox && fit) fitBounds(area.bbox);
    return;
  }
  const link = text('a', area.kind === 'district' ? 'View district ↗' : `View ${area.name} results ↗`, 'button primary');
  link.href = area.url;
  panel.replaceChildren(link);
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
async function restoreGoogleArea(id: string, fit: boolean) {
  const version = generation;
  try {
    const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
    const place = new Place({ id });
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'viewport', 'types', 'addressComponents'] });
    if (version !== generation) return;
    const country = place.addressComponents?.find(component => component.types.includes('country'))?.shortText;
    const area = country === 'ZA' ? googleAreaView(place) : undefined;
    if (!area) throw new Error('Area unavailable');
    await showArea(area, fit);
  } catch {
    if (version === generation) {
      const status = element<HTMLElement>('map-search-status');
      status.hidden = false;
      status.textContent = 'This place couldn’t load. Search for it again or browse the map.';
    }
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
      const identity = text('div', '', 'party-identity');
      const logo = text('span', '', `party-logo party-logo--small${party.logo ? '' : ' party-logo--fallback'}`);
      logo.setAttribute('aria-hidden', 'true');
      if (party.logo) {
        const image = document.createElement('img');
        image.src = party.logo;
        image.alt = '';
        image.width = image.height = 22;
        image.decoding = 'async';
        image.addEventListener('error', () => {
          image.remove();
          logo.classList.add('party-logo--fallback');
        }, { once: true });
        append(logo, image);
      }
      name.classList.add('party-identity-text');
      append(identity, logo, name);
      const share = text('span', party.share === null ? 'Unavailable' : `${party.share.toFixed(1)}%`, 'map-party-share');
      append(heading, identity, share);
      if (party.movement) {
        const movement = text('span', movementText(party.movement), 'party-movement');
        movement.title = movementDescription(party.movement);
        movement.setAttribute('aria-label', movementDescription(party.movement));
        append(share, movement);
      }
      const track = text('div', '', 'bar-track'), bar = text('div', '', 'bar');
      bar.style.setProperty('--share', `${party.share ?? 0}%`);
      bar.style.setProperty('--party', color!);
      track.setAttribute('aria-hidden', 'true');
      append(track, bar);
      append(row, heading, track, text('small', party.votes === null ? 'Votes unavailable' : `${formatNumber(party.votes)} votes`));
      append(card, row);
    }
    append(card, text('p', 'Change since 2021 in percentage points. Changes compare combined ballot shares; boundaries may differ.', 'comparison-note'));
    if (result.progress) append(card, text('p', `${result.progress.completed} of ${result.progress.expected} districts reported`, 'map-hint'));
    if (result.freshness) append(card, text('p', result.freshness, 'map-hint'));
  }
  const link = text('a', 'Full ward results ↗', 'button primary');
  link.href = data.url;
  append(card, link);
  panel.replaceChildren(card);
}
async function chooseWard(id: string, known?: WardPick, fit = false) {
  element<HTMLElement>('map-search-status').hidden = true;
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
      // Keep place names and faint roads for orientation beneath the electoral boundaries.
      styles: [
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f2f1e9' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dfe8e7' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#65736b' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#fffdf6' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { visibility: 'simplified' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a948b' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e4e5dd' }] },
      ],
    });
    areaOutline = new google.maps.Data({ map });
    areaOutline.setStyle({ fillOpacity: .05, strokeColor: '#163a30', strokeWeight: 1.5, clickable: false, zIndex: 4 });
    ready = true;
    const boundaries = googleBoundaries(map, view => {
      overlay = { level: view.level };
      boundaryLimited = view.limited;
      boundaryFailed = false;
      inView = new Map(view.areas.map(area => [area.id, area]));
      renderAreas();
      refreshNotice();
      void loadLeaders();
    }, () => { loading.hidden = true; boundaryFailed = true; refreshNotice(); }, () => { loading.hidden = true; });
    const hover = element<HTMLElement>('map-hover');
    map.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      hover.textContent = String(event.feature.getProperty('name'));
      hover.hidden = false;
      map.data.overrideStyle(event.feature, { fillOpacity: .48, strokeWeight: 1.5 });
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
    else if (initialGooglePlace && initialGooglePlace.length <= 256) void restoreGoogleArea(initialGooglePlace, !initialView);
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
      boundaries.cancel(); colorRequest?.abort();
    });
    window.addEventListener('pageshow', event => { if (event.persisted) void boundaries.update(); });
  } catch {
    loading.hidden = false;
    loading.textContent = 'Google Maps could not load. Search for an area or use Browse results above.';
  }
}
void start();
app.addEventListener('place-search:area', event => {
  if (!ready) return; // A working search can still open the area's results when Maps is unavailable.
  event.preventDefault();
  element<HTMLElement>('map-search-status').hidden = true;
  void showArea((event as CustomEvent<ResolvedArea>).detail);
});
app.addEventListener('place-search:input', () => {
  element<HTMLElement>('map-search-status').hidden = true;
});
