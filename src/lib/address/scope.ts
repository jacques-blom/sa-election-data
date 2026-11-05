/** Google accepts rectangular search bounds; ward matching still uses the selected pin. */
export function addressSearchBounds(bbox: unknown) {
  if (!Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(value => typeof value === 'number' && Number.isFinite(value))) return undefined;
  const [west, south, east, north] = bbox as [number, number, number, number];
  if (west < -180 || east > 180 || south < -90 || north > 90 || west >= east || south >= north) return undefined;
  return { west, south, east, north };
}
