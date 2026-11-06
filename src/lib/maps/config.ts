export const ADMIN_KEY = 'administrative-2026-20261105-v3.pmtiles';
export const VD_KEY = 'voting-districts-2026-20261105.pmtiles';
export const ADMIN_URL = `/maps/basemap/${ADMIN_KEY}`;
export const PROVINCES_URL = '/maps/geometry/provinces-2026-20261105-v3.geojson';
export const MUNICIPALITIES_URL = '/maps/geometry/municipalities-2026-20261105-v3.geojson';
export const BOUNDARY_BATCH_SIZE = 40;
export const VD_URL = `/maps/basemap/${VD_KEY}`;
export const WARDS_KEY = 'wards-2026-20261105.pmtiles';
export const WARDS_URL = `/maps/basemap/${WARDS_KEY}`;
export const BASEMAP_KEY = 'south-africa-20261105.pmtiles';
export const BASEMAP_URL = `/maps/basemap/${BASEMAP_KEY}`;
export const regions = {
    'cape-town': { name: 'Cape Town', municipalityId: '9006', geometry: '/maps/geometry/cape-town-2026.geojson', center: [18.55, -33.95] as [
            number,
            number
        ], zoom: 9.5 },
    hantam: { name: 'Hantam', municipalityId: '6605', geometry: '/maps/geometry/hantam-2026.geojson', center: [19.6, -31.3] as [
            number,
            number
        ], zoom: 7.5 },
} as const;
export type Region = keyof typeof regions;
export function mapPlace(value: string | null) { return value === 'calvinia' || value === 'cape-town' || value === 'hantam' ? value : 'south-africa'; }
export const mapLink = (place: string, ward?: string) => `/map?place=${encodeURIComponent(place)}${ward ? `&ward=${encodeURIComponent(ward)}` : ''}`;
