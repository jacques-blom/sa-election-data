/// <reference types="google.maps" />
import { boundaryLevel, type BoundaryLevel } from './detail.ts';
import { PROVINCES_URL } from './config.ts';
import { administrative } from './administrative.ts';
import type { AreaPick } from './viewport.ts';
import type { WardInfo } from './ward-types.ts';
import type { Feature, FeatureCollection } from 'geojson';

const intersects = (bbox: number[], view: google.maps.LatLngBoundsLiteral) => bbox[0]! <= view.east && bbox[2]! >= view.west && bbox[1]! <= view.north && bbox[3]! >= view.south;
export type BoundaryView = { level: BoundaryLevel; areas: AreaPick[]; limited: boolean };

/** Google renders our electoral GeoJSON; only boundaries in the viewport are fetched. */
export function googleBoundaries(map: google.maps.Map, changed: (view: BoundaryView) => void, failed: () => void) {
  const cache = new Map<string, Feature>();
  let controller: AbortController | undefined;
  let version = 0;
  let key = '';
  let level: BoundaryLevel = 'province';
  async function update() {
    const bounds = map.getBounds()?.toJSON();
    if (!bounds) return;
    const current = ++version;
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    level = boundaryLevel(map.getZoom() ?? 4);
    try {
      let areas: AreaPick[];
      let limited = false;
      if (level === 'province') {
        const response = await fetch(PROVINCES_URL, { signal });
        if (!response.ok) throw new Error('Province boundaries unavailable');
        const collection = await response.json() as FeatureCollection;
        for (const feature of collection.features) cache.set(`province:${feature.properties?.id}`, feature);
        areas = Object.values(administrative.provinces).filter(p => intersects(p.bbox, bounds)).map(p => ({ ...p, detail: '' }));
      } else if (level === 'municipality') {
        areas = Object.values(administrative.municipalities).filter(p => intersects(p.bbox, bounds)).map(p => ({ ...p, detail: '' }));
      } else {
        const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].map(n => n.toFixed(5)).join(',');
        const response = await fetch(`/api/v1/map/areas?bbox=${bbox}`, { signal });
        if (!response.ok) throw new Error('Ward boundaries unavailable');
        const data = await response.json() as { wards: WardInfo[]; limited: boolean };
        limited = data.limited;
        if (limited) {
          level = 'municipality';
          areas = Object.values(administrative.municipalities).filter(p => intersects(p.bbox, bounds)).map(p => ({ ...p, detail: '' }));
        } else areas = data.wards.map(ward => ({ id: ward.id, name: `Ward ${ward.number}`, detail: ward.municipality, url: `/2026/wards/${ward.id}`, bbox: ward.bbox, ward }));
      }
      if (current !== version) return;
      areas.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
      const nextKey = `${level}:${areas.map(a => a.id).join(',')}`;
      const view = { level, areas, limited };
      if (nextKey === key) { changed(view); return; }
      const targetLevel = level;
      const queue = [...areas];
      // Keep six geometry reads in flight; stale camera requests are aborted.
      await Promise.all(Array.from({ length: Math.min(6, queue.length) }, async () => {
        while (queue.length && !signal.aborted) {
          const area = queue.shift()!;
          const id = `${targetLevel}:${area.id}`;
          if (cache.has(id)) continue;
          const response = await fetch(`/api/v1/geometry/${targetLevel}/${area.id}`, { signal });
          if (!response.ok) throw new Error('Boundary unavailable');
          cache.set(id, await response.json() as Feature);
        }
      }));
      if (current !== version) return;
      const features = areas.map(area => ({ ...cache.get(`${targetLevel}:${area.id}`)!, id: area.id,
        properties: { id: area.id, name: area.name, level: targetLevel } }));
      map.data.forEach(feature => map.data.remove(feature));
      map.data.addGeoJson({ type: 'FeatureCollection', features }, { idPropertyName: 'id' });
      key = nextKey;
      while (cache.size > 400) cache.delete(cache.keys().next().value!);
      changed(view);
    } catch {
      if (!signal.aborted && current === version) { key = ''; failed(); }
    }
  }
  return { update, cancel() { ++version; controller?.abort(); } };
}
