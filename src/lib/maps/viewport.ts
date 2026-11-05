import { administrative } from './administrative.ts';
import type { BoundaryLevel } from './detail.ts';

export type WardPick = { id: string; number: number; municipality: string; code: string };
export type AreaPick = { id: string; name: string; detail: string; url: string; bbox?: [number, number, number, number]; ward?: WardPick };

/** Query the rendered layer, then deduplicate its clipped tile fragments. */
export function visibleAreas(level: BoundaryLevel, properties: Record<string, unknown>[]): AreaPick[] {
  if (level === 'ward') return visibleWards(properties).map(ward => ({ id: ward.id, name: `Ward ${ward.number}`,
    detail: ward.municipality, url: `/2026/wards/${ward.id}`, ward }));
  const catalogue = level === 'province' ? administrative.provinces : administrative.municipalities;
  const areas = new Map<string, AreaPick>();
  for (const properties_ of properties) {
    const id = String(properties_.id ?? '');
    if (!Object.hasOwn(catalogue, id)) continue;
    const area = catalogue[id]!;
    areas.set(id, { id, name: area.name, url: area.url, bbox: area.bbox, detail: '' });
  }
  return [...areas.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export function parseView(value: string | null): { center: [number, number]; zoom: number } | undefined {
  if (!value) return;
  const parts = value.split(',');
  if (parts.length !== 3 || parts.some(p => p.trim() === '')) return;
  const [lng, lat, zoom] = parts.map(Number) as [number, number, number];
  if (![lng, lat, zoom].every(Number.isFinite) || lng < 14 || lng > 35 || lat < -37 || lat > -21 || zoom < 3 || zoom > 17) return;
  return { center: [lng, lat], zoom };
}
/** Vector tiles clip polygons at tile edges, so one ward can appear many times. */
export function visibleWards(properties: Record<string, unknown>[]): WardPick[] {
  const unique = new Map<string, WardPick>();
  for (const p of properties) {
    const id = String(p.id ?? '');
    if (!/^\d{8}$/.test(id) || typeof p.municipality !== 'string' || typeof p.code !== 'string') continue;
    unique.set(id, { id, number: Number(p.number), municipality: p.municipality, code: p.code });
  }
  return [...unique.values()].sort((a,b) => a.municipality.localeCompare(b.municipality) || a.number - b.number);
}
