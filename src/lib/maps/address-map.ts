import { loadSelectedAddress } from '../address/selected-address.ts';
import type { FixedMapOptions } from './fixed-types.ts';

/** A selected Google address uses a Google map in the ward's existing map slot. */
export function mountRegionMap(figure: HTMLElement) {
  const options = JSON.parse(figure.dataset.options!) as FixedMapOptions;
  const container = figure.querySelector<HTMLElement>('.region-map-canvas')!;
  const status = figure.querySelector<HTMLElement>('.region-map-status')!;
  const caption = figure.querySelector<HTMLElement>('[data-map-caption]')!;
  const controller = new AbortController();
  let disposed = false;
  let map: google.maps.Map | undefined;
  let pin: google.maps.OverlayView | undefined;
  const update = () => {
    const historical = figure.dataset.mapHistorical === 'true';
    pin?.setMap(historical ? null : map!);
    if (!historical) caption.textContent = 'Selected address · Ward boundary: MDB, 2026';
  };
  figure.addEventListener('results:map-update', update);
  void (async () => {
    try {
      const place = await loadSelectedAddress(options.id!);
      if (!place?.location || disposed) return;
      await google.maps.importLibrary('maps');
      if (disposed) return;
      container.setAttribute('aria-label', 'Selected address and ward boundary');
      map = new google.maps.Map(container, { center: place.location, zoom: 14, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, gestureHandling: 'cooperative', clickableIcons: false });
      figure.dataset.addressMap = 'true';
      // Fit both the complete ward and the address, including a pin at its edge.
      const bounds = new google.maps.LatLngBounds({ west: options.bbox[0], south: options.bbox[1], east: options.bbox[2], north: options.bbox[3] });
      bounds.extend(place.location);
      map.fitBounds(bounds, 45);
      const position = place.location;
      const label = place.formattedAddress || place.displayName || 'Selected address';
      pin = new class extends google.maps.OverlayView {
        element = document.createElement('div');
        onAdd() {
          this.element.className = 'ward-address-pin';
          this.element.setAttribute('role', 'img');
          this.element.setAttribute('aria-label', label);
          this.element.innerHTML = '<svg viewBox="0 0 32 42" aria-hidden="true"><path d="M16 40C12 34 2 25 2 16a14 14 0 0 1 28 0c0 9-10 18-14 24Z" fill="#175b99" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="white"/></svg>';
          this.getPanes()!.floatPane.appendChild(this.element);
        }
        draw() {
          const pixel = this.getProjection().fromLatLngToDivPixel(position);
          if (pixel) { this.element.style.left = `${pixel.x}px`; this.element.style.top = `${pixel.y}px`; }
        }
        onRemove() { this.element.remove(); }
      }();
      update();
      status.hidden = true;
      const response = await fetch(`/api/v1/geometry/ward/${options.id}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Boundary unavailable');
      const geometry = await response.json() as object;
      if (disposed) return;
      map.data.addGeoJson(geometry);
      map.data.setStyle({ fillColor: '#277dae', fillOpacity: .10, strokeColor: '#163a30', strokeWeight: 2.5, clickable: false });
    } catch {
      if (disposed) return;
      status.hidden = false;
      status.textContent = map ? 'The ward boundary could not load. Your address pin is still shown.' : 'Your address map could not load. Ward results remain available above.';
    }
  })();
  return () => {
    disposed = true;
    controller.abort();
    pin?.setMap(null);
    if (map) google.maps.event.clearInstanceListeners(map);
    figure.removeEventListener('results:map-update', update);
    delete figure.dataset.addressMap;
  };
}
