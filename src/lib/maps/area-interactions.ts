import { Popup, type Map as LibreMap, type MapMouseEvent } from 'maplibre-gl';
import '../../styles/area-tooltip.css';

export type AreaSource = 'administrative' | 'wards' | 'districts';
type Area = { id: string; name: string; href: string };

function areaFor(properties: Record<string, unknown>, source: AreaSource): Area | undefined {
  const id = String(properties.id ?? '');
  if (!id) return;
  if (source === 'wards' && /^\d{8}$/.test(id)) {
    const name = `Ward ${Number(id.slice(-3))}${typeof properties.municipality === 'string' ? `, ${properties.municipality}` : ''}`;
    return { id, name, href: `/2026/wards/${id}` };
  }
  if (source === 'districts' && /^\d+$/.test(id)) {
    const name = typeof properties.name === 'string' && properties.name.trim() ? properties.name : `Voting district ${id}`;
    return { id, name, href: `/2026/voting-districts/${id}` };
  }
  if (source === 'administrative' && typeof properties.name === 'string' && typeof properties.url === 'string' && properties.url.startsWith('/2026/')) {
    return { id, name: properties.name, href: properties.url };
  }
}

/** Share mouse previews and deliberate touch navigation across the electoral maps. */
export function bindAreaInteractions(map: LibreMap, options: {
  layer: string;
  source: AreaSource;
  sourceLayer?: string;
  navigateOnClick?: boolean;
  enabled?: () => boolean;
  selectOnClick?: boolean;
  onSelect?: (properties: Record<string, unknown>) => void;
}) {
  const canvas = map.getCanvas();
  const container = map.getContainer();
  const popup = new Popup({ closeButton: false, closeOnClick: false, focusAfterOpen: false, offset: 12, maxWidth: '260px', className: 'area-tooltip' });
  let activeId: string | undefined;
  let pinned = false;
  let pointerType = '';

  function highlight(id?: string) {
    if (id === activeId) return;
    if (activeId && map.getSource(options.source)) map.setFeatureState({ source: options.source, sourceLayer: options.sourceLayer, id: activeId }, { hover: false });
    activeId = id;
    if (id && map.getSource(options.source)) map.setFeatureState({ source: options.source, sourceLayer: options.sourceLayer, id }, { hover: true });
  }
  function clear() {
    popup.remove();
    highlight();
    pinned = false;
    canvas.style.cursor = '';
  }
  function usesTouch(event: MouseEvent) {
    const type = ('pointerType' in event && String(event.pointerType)) || pointerType;
    return type ? type !== 'mouse' : window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }
  function show(area: Area, event: MapMouseEvent, pin: boolean) {
    if (activeId !== area.id || pinned !== pin || !popup.isOpen()) {
      const content = document.createElement('div');
      content.setAttribute('role', pin ? 'group' : 'tooltip');
      content.setAttribute('aria-label', 'Area details');
      const name = document.createElement('strong');
      name.className = 'area-tooltip-name';
      name.textContent = area.name;
      content.appendChild(name);
      if (pin) {
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'area-tooltip-close';
        close.setAttribute('aria-label', 'Close area tooltip');
        close.textContent = '×';
        close.addEventListener('click', clear);
        const link = document.createElement('a');
        link.className = 'button primary area-tooltip-link';
        link.href = area.href;
        link.textContent = 'View results →';
        link.setAttribute('aria-label', `View results for ${area.name}`);
        content.appendChild(close);
        content.appendChild(link);
      }
      popup.setDOMContent(content);
    }
    pinned = pin;
    highlight(area.id);
    popup.setLngLat(event.lngLat);
    if (!popup.isOpen()) popup.addTo(map);
    popup.getElement().classList.toggle('is-pinned', pin);
  }
  function rememberPointer(event: PointerEvent) { pointerType = event.pointerType; }
  function rememberTouch() { pointerType = 'touch'; }
  function hover(event: MapMouseEvent) {
    if (options.enabled?.() === false) { clear(); return; }
    if (pinned || usesTouch(event.originalEvent) || map.isMoving() || !map.getLayer(options.layer)) return;
    const properties = map.queryRenderedFeatures(event.point, { layers: [options.layer] })[0]?.properties;
    const area = properties && areaFor(properties, options.source);
    if (!area) { clear(); return; }
    canvas.style.cursor = 'pointer';
    show(area, event, false);
  }
  function leave() { if (!pinned) clear(); }
  function select(event: MapMouseEvent) {
    if (options.enabled?.() === false) { clear(); return; }
    if (!map.getLayer(options.layer)) return;
    const properties = map.queryRenderedFeatures(event.point, { layers: [options.layer] })[0]?.properties;
    const area = properties && areaFor(properties, options.source);
    if (!area) { clear(); return; }
    if (options.selectOnClick) {
      clear();
      options.onSelect?.(properties!);
      return;
    }
    if (options.navigateOnClick && !usesTouch(event.originalEvent)) {
      location.assign(area.href);
      return;
    }
    show(area, event, true);
    options.onSelect?.(properties!);
  }
  function dismissOutside(event: PointerEvent) {
    if (popup.isOpen() && event.target instanceof Node && !container.contains(event.target)) clear();
  }
  function dismissOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') clear(); }

  canvas.addEventListener('pointerdown', rememberPointer);
  canvas.addEventListener('pointermove', rememberPointer);
  canvas.addEventListener('mouseleave', leave);
  document.addEventListener('pointerdown', dismissOutside);
  document.addEventListener('keydown', dismissOnEscape);
  map.on('touchstart', rememberTouch);
  map.on('mousemove', hover);
  map.on('click', select);
  map.on('movestart', clear);
  function destroy() {
    clear();
    canvas.removeEventListener('pointerdown', rememberPointer);
    canvas.removeEventListener('pointermove', rememberPointer);
    canvas.removeEventListener('mouseleave', leave);
    document.removeEventListener('pointerdown', dismissOutside);
    document.removeEventListener('keydown', dismissOnEscape);
    map.off('touchstart', rememberTouch);
    map.off('mousemove', hover);
    map.off('click', select);
    map.off('movestart', clear);
    map.off('remove', destroy);
  }
  map.on('remove', destroy);
  return { clear, destroy };
}
