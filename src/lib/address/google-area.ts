/// <reference types="google.maps" />
import { isWholeArea, type ResolvedArea } from './selection.ts';
import { addressSearchBounds } from './scope.ts';

/** Keep an unlisted suburb useful without treating its pin as its electoral scope. */
export function googleAreaView(place: Pick<google.maps.places.Place, 'id' | 'displayName' | 'formattedAddress' | 'viewport' | 'types'>, name = place.displayName): ResolvedArea | undefined {
  const viewport = place.viewport?.toJSON();
  if (!place.id || !name || !viewport || !isWholeArea(place.types ?? [])) return;
  const bbox: [number, number, number, number] = [viewport.west, viewport.south, viewport.east, viewport.north];
  if (!addressSearchBounds(bbox)) return;
  return { id: place.id, googlePlaceId: place.id, name, kind: 'area',
    description: place.formattedAddress ?? name, bbox,
    url: `/map?google-place=${encodeURIComponent(place.id)}` };
}
