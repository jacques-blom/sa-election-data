import { MUNICIPALITIES_URL, PROVINCES_URL } from '../../maps/config.ts';
import type { VisualTable } from './model.ts';
import { createDOM } from './dom.ts';
import { createMapView, type MapView } from './map-view.ts';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
type Shapes = FeatureCollection<Polygon | MultiPolygon, { id: string; name: string }>;
const requests = new Map<string, Promise<Shapes>>();
function geometry(url: string) {
  if (!requests.has(url)) requests.set(url, fetch(url).then(async response => {
    if (!response.ok) throw new Error('Geometry unavailable'); return await response.json() as Shapes;
  }).catch(error => { requests.delete(url); throw error; }));
  return requests.get(url)!;
}
export async function loadResultsMap(view: MapView, data: VisualTable) {
  try {
    const shapes = await geometry(data.geography === 'province' ? PROVINCES_URL : MUNICIPALITIES_URL);
    if (view.card.isConnected) view.draw(shapes);
  } catch { view.fail(); }
}

/** Standalone entry for callers without an already-rendered map shell. */
export async function mountResultsMap(card: HTMLElement, data: VisualTable, initial: string, status: HTMLElement) {
  status.remove();
  const dom = createDOM(card.ownerDocument);
  const view = createMapView(card, data, initial, dom); dom.finish();
  await loadResultsMap(view, data);
}
