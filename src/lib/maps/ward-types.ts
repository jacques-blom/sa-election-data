import type { Movement } from '../history/comparison.ts';
export type WardInfo = {
  id: string;
  number: number;
  municipality: string;
  code: string;
  province: string;
  bbox: [number, number, number, number];
};
export type MapWardResult = {
  total: number | null;
  progress: { completed: number; expected: number; percent: number } | null;
  freshness: string | null;
  source: { reportedAt: string; checkedAt: string; url: string; snapshotId: string };
  parties: { name: string; logo: string | null; candidate: string | null; votes: number | null; share: number | null; movement?: Movement | null }[];
};
export type MapWardResponse = {
  year: 2026;
  status: 'provisional';
  ward: WardInfo;
  url: string;
  result: MapWardResult | null;
};
