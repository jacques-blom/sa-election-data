import { loadGoogleMaps } from './google.ts';

const storageKey = 'counted:selected-address';
type Selection = { placeId: string; wardId: string; savedAt: number };
const lifetime = 60 * 60 * 1000;

/** Keep only the place ID in this tab; address text and coordinates never enter URLs or storage. */
export function rememberAddress(placeId: string, wardId: string) {
  try {
    sessionStorage.removeItem(storageKey);
    if (placeId && /^\d{8}$/.test(wardId)) sessionStorage.setItem(storageKey, JSON.stringify({ placeId, wardId, savedAt: Date.now() }));
  } catch { /* Results navigation still works when browser storage is disabled. */ }
}

export function selectedAddress(wardId: string): Selection | undefined {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as Selection | null;
    if (!value || typeof value.placeId !== 'string' || !value.placeId || value.placeId.length > 500
      || !/^\d{8}$/.test(value.wardId) || !Number.isFinite(value.savedAt)
      || Date.now() - value.savedAt > lifetime || value.savedAt > Date.now()) return;
    if (value.wardId === wardId) return value;
  } catch { /* Missing or blocked tab storage means an ordinary ward page. */ }
}

let details: { placeId: string; promise: Promise<google.maps.places.Place> } | undefined;
export function loadSelectedAddress(wardId: string) {
  const selected = selectedAddress(wardId);
  if (!selected) return Promise.resolve(undefined);
  if (details?.placeId === selected.placeId) return details.promise;
  const promise = (async () => {
    await loadGoogleMaps();
    const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
    const place = new Place({ id: selected.placeId });
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
    if (!place.location) throw new Error('Address location unavailable');
    return place;
  })();
  details = { placeId: selected.placeId, promise };
  void promise.catch(() => { if (details?.promise === promise) details = undefined; });
  return promise;
}
