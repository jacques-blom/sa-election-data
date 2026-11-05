import data from './ward-index.json' with { type: 'json' };
import type { WardInfo } from './ward-types.ts';
// Server only: clients receive tiles and the selected ward, never this national index.
const index: Record<string, Omit<WardInfo, 'bbox'> & { bbox: number[] }> = data;
export function findMapWard(id: string): WardInfo | undefined {
  if (!/^\d{8}$/.test(id) || !Object.hasOwn(index, id)) return;
  const ward = index[id]!;
  if (ward.bbox.length !== 4) return;
  return { ...ward, bbox: [ward.bbox[0]!, ward.bbox[1]!, ward.bbox[2]!, ward.bbox[3]!] };
}
