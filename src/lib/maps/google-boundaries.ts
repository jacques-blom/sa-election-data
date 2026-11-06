/// <reference types="google.maps" />
import { boundaryLevel, type BoundaryLevel } from './detail.ts';
import { BOUNDARY_BATCH_SIZE, MUNICIPALITIES_URL, PROVINCES_URL } from './config.ts';
import { administrative } from './administrative.ts';
import type { AreaPick } from './viewport.ts';
import type { WardInfo } from './ward-types.ts';
import type { Feature, FeatureCollection } from 'geojson';

const intersects = (bbox: number[], view: google.maps.LatLngBoundsLiteral) => bbox[0]! <= view.east && bbox[2]! >= view.west && bbox[1]! <= view.north && bbox[3]! >= view.south;
export type BoundaryView = { level: BoundaryLevel; areas: AreaPick[]; limited: boolean };
type OverviewLevel = 'province' | 'municipality';
type WardView = { wards: WardInfo[]; limited: boolean };

/** Reuse overviews and visible polygons; stream bounded ward batches into the map. */
export function googleBoundaries(map: google.maps.Map, changed: (view: BoundaryView) => void, failed: () => void, loaded: () => void = () => {}) {
  const wards = new Map<string, Feature>();
  const wardViews = new Map<string, WardView>();
  const overviews = new Map<OverviewLevel, Map<string, Feature>>();
  const overviewRequests = new Map<OverviewLevel, Promise<void>>();
  let controller: AbortController | undefined;
  let version = 0;

  function overview(level: OverviewLevel) {
    if (overviews.has(level)) return Promise.resolve();
    const existing = overviewRequests.get(level);
    if (existing) return existing;
    // A small immutable overview remains useful after a pan or zoom, so let it
    // finish and reuse it instead of restarting it on every camera change.
    const request = (async () => {
      const response = await fetch(level === 'province' ? PROVINCES_URL : MUNICIPALITIES_URL);
      if (!response.ok) throw new Error('Overview unavailable');
      const collection = await response.json() as FeatureCollection;
      overviews.set(level, new Map(collection.features.map(feature => [String(feature.properties?.id), feature])));
    })().finally(() => overviewRequests.delete(level));
    overviewRequests.set(level, request);
    return request;
  }

  function render(level: BoundaryLevel, areas: AreaPick[]) {
    const wanted = new Set(areas.map(area => area.id));
    const existing = new Set<string>();
    map.data.forEach(feature => {
      const id = String(feature.getId());
      if (feature.getProperty('level') !== level || !wanted.has(id)) map.data.remove(feature);
      else existing.add(id);
    });
    const source = level === 'ward' ? wards : overviews.get(level);
    const features = areas.flatMap(area => {
      if (existing.has(area.id)) return [];
      const feature = source?.get(area.id);
      return feature ? [{ ...feature, id: area.id, properties: { id: area.id, name: area.name, level } }] : [];
    });
    if (features.length) map.data.addGeoJson({ type: 'FeatureCollection', features }, { idPropertyName: 'id' });
  }

  async function update() {
    const bounds = map.getBounds()?.toJSON();
    if (!bounds) return;
    const current = ++version;
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    let level = boundaryLevel(map.getZoom() ?? 4);
    try {
      let areas: AreaPick[];
      let limited = false;
      if (level === 'ward') {
        const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].map(n => n.toFixed(5)).join(',');
        let data = wardViews.get(bbox);
        if (!data) {
          const response = await fetch(`/api/v1/map/areas?bbox=${bbox}`, { signal });
          if (!response.ok) throw new Error('Ward boundaries unavailable');
          data = await response.json() as WardView;
          if (current !== version) return;
          wardViews.set(bbox, data);
          while (wardViews.size > 24) wardViews.delete(wardViews.keys().next().value!);
        }
        limited = data.limited;
        if (limited) level = 'municipality';
        areas = data.wards.filter(ward => intersects(ward.bbox, bounds)).map(ward => ({ id: ward.id, name: `Ward ${ward.number}`, detail: ward.municipality, url: `/2026/wards/${ward.id}`, bbox: ward.bbox, ward }));
      } else areas = [];
      if (level !== 'ward') {
        const catalogue = level === 'province' ? administrative.provinces : administrative.municipalities;
        areas = Object.values(catalogue).filter(area => intersects(area.bbox, bounds)).map(area => ({ ...area, detail: '' }));
      }
      if (current !== version) return;
      areas.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
      render(level, areas);
      // Sidebar and result colours can load while geometry is still downloading.
      changed({ level, areas, limited });
      if (level !== 'ward') {
        await overview(level);
        if (current !== version) return;
        render(level, areas);
      } else {
        const visible = new Set(areas.map(area => area.id));
        const missing = areas.filter(area => !wards.has(area.id)).map(area => area.id).sort();
        const batches: string[][] = [];
        for (let i = 0; i < missing.length; i += BOUNDARY_BATCH_SIZE) batches.push(missing.slice(i, i + BOUNDARY_BATCH_SIZE));
        const results = await Promise.allSettled(Array.from({ length: Math.min(3, batches.length) }, async () => {
          while (batches.length && !signal.aborted) {
            const ids = batches.shift()!;
            const response = await fetch(`/api/v1/map/boundaries?ids=${ids.join(',')}`, { signal });
            if (!response.ok) throw new Error('Ward boundaries unavailable');
            const collection = await response.json() as FeatureCollection;
            if (current !== version) return;
            const features = new Map(collection.features.map(feature => [String(feature.properties?.id), feature]));
            if (ids.some(id => !features.has(id))) throw new Error('Incomplete ward boundaries');
            for (const id of ids) wards.set(id, features.get(id)!);
            render('ward', areas);
            // Bound the cache even when a later batch fails or a pan cancels it.
            for (const id of wards.keys()) {
              if (wards.size <= 400) break;
              if (!visible.has(id)) wards.delete(id);
            }
          }
        }));
        if (current !== version) return;
        const failure = results.find(result => result.status === 'rejected');
        if (failure?.status === 'rejected') throw failure.reason;
      }
      loaded();
    } catch {
      if (!signal.aborted && current === version) failed();
    }
  }
  return { update, cancel() { ++version; controller?.abort(); } };
}
