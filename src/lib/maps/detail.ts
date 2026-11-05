import type { FilterSpecification, LayerSpecification, Map as LibreMap, SourceSpecification } from 'maplibre-gl';
import { ADMIN_URL, PROVINCES_URL, WARDS_URL } from './config.ts';
import { NEUTRAL_COLOR } from './leader-types.ts';

export const MUNICIPALITY_ZOOM = 5;
export const WARD_ZOOM = 8;
export type BoundaryLevel = 'province' | 'municipality' | 'ward';
export function boundaryLevel(zoom: number): BoundaryLevel {
  return zoom < MUNICIPALITY_ZOOM ? 'province' : zoom < WARD_ZOOM ? 'municipality' : 'ward';
}

export type BoundaryOverlay = {
  level: BoundaryLevel;
  sourceId: 'administrative' | 'wards';
  sourceLayer?: string;
  source: SourceSpecification;
  fillLayer: string;
  layers: LayerSpecification[];
};

/** Each level has its own source, so the overview never requests ward tiles. */
export function boundaryOverlay(level: BoundaryLevel, origin: string): BoundaryOverlay {
  const sourceId = level === 'ward' ? 'wards' : 'administrative';
  const sourceLayer = level === 'province' ? undefined : level === 'ward' ? 'wards' : 'administrative';
  const prefix = level === 'province' ? 'provinces' : level === 'municipality' ? 'municipalities' : 'wards';
  const minzoom = level === 'province' ? 0 : level === 'municipality' ? MUNICIPALITY_ZOOM : WARD_ZOOM;
  const maxzoom = level === 'province' ? MUNICIPALITY_ZOOM : level === 'municipality' ? WARD_ZOOM : 24;
  const common = {
    source: sourceId, minzoom, maxzoom,
    ...(sourceLayer ? { 'source-layer': sourceLayer } : {}),
  };
  const source: SourceSpecification = level === 'province'
    ? { type: 'geojson', data: `${origin}${PROVINCES_URL}`, promoteId: 'id', maxzoom: MUNICIPALITY_ZOOM }
    : { type: 'vector', url: `pmtiles://${origin}${level === 'ward' ? WARDS_URL : ADMIN_URL}`, promoteId: 'id' };
  const filter = level === 'municipality' ? { filter: ['==', ['get', 'level'], 'municipality'] as FilterSpecification } : {};
  const layers: LayerSpecification[] = [
    { ...common, ...filter, id: `${prefix}-fill`, type: 'fill', paint: {
      'fill-color': ['coalesce', ['feature-state', 'resultColor'], NEUTRAL_COLOR],
      'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.48, 0.28],
    } },
    { ...common, ...filter, id: `${prefix}-line`, type: 'line', paint: {
      'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#163a30', '#536e96'],
      'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.5, 1],
      'line-opacity': 0.75,
    } },
  ];
  if (level === 'ward') {
    layers.push(
      { ...common, id: 'wards-selected', type: 'line', filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#163a30', 'line-width': 3 } },
      { ...common, id: 'ward-numbers', type: 'symbol', minzoom: 11.5, layout: {
        'text-field': ['concat', 'Ward ', ['to-string', ['get', 'number']]],
        'text-font': ['Noto Sans Medium'], 'text-size': 12,
      }, paint: { 'text-color': '#385578', 'text-halo-color': '#fffdf6', 'text-halo-width': 2 } },
    );
  }
  return { level, sourceId, sourceLayer, source, fillLayer: `${prefix}-fill`, layers };
}

/** Remove the old source as well as its layers to release its decoded tiles. */
export function replaceBoundaryOverlay(
  map: Pick<LibreMap, 'removeLayer' | 'removeSource' | 'addSource' | 'addLayer'>,
  previous: BoundaryOverlay, next: BoundaryOverlay, beforeId?: string,
) {
  for (const layer of [...previous.layers].reverse()) map.removeLayer(layer.id);
  map.removeSource(previous.sourceId);
  map.addSource(next.sourceId, next.source);
  for (const layer of next.layers) map.addLayer(layer, beforeId);
}
