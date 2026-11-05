/// <reference types="google.maps" />

let loading: Promise<void> | undefined;

/** Load once, on demand, for both autocomplete and the selected location's map. */
export function loadGoogleMaps(): Promise<void> {
  if (typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function') return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const key = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) { reject(new Error('Address search is not configured')); return; }
    const globals = window as typeof window & { countedMapsReady?: () => void; gm_authFailure?: () => void };
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timer); script.remove(); reject(new Error('Google Maps could not load')); };
    const timer = window.setTimeout(fail, 15000);
    globals.countedMapsReady = () => { clearTimeout(timer); resolve(); };
    globals.gm_authFailure = fail;
    const url = new URL('https://maps.googleapis.com/maps/api/js');
    for (const [name, value] of Object.entries({ key, v: 'weekly', loading: 'async', callback: 'countedMapsReady', language: 'en', region: 'ZA' })) url.searchParams.set(name, value);
    script.src = url.href;
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}
