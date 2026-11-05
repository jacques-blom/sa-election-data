import type { Map as LibreMap } from 'maplibre-gl';

export function collapseAttribution(map: LibreMap) {
  const control = map.getContainer().querySelector<HTMLDetailsElement>('.maplibregl-ctrl-attrib');
  if (!control) return;
  // Keep asynchronously loaded source attribution from opening the control again.
  control.classList.add('maplibregl-compact');
  control.classList.remove('maplibregl-compact-show');
  control.open = false;
}
