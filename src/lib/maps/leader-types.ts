import type { Movement } from '../history/comparison.ts';
import type { BoundaryLevel } from './detail.ts';

export const NEUTRAL_COLOR = '#b8c2b3';
export const LEADER_BATCH_SIZE = 80;
export type MapLeader = {
  id: string;
  color: string;
  party: string | null;
  share: number | null;
  status: 'leading' | 'highest-shown' | 'tied' | 'awaiting' | 'unavailable';
  delayed: boolean;
  government?: string | null;
  movement?: Movement | null;
};
export type MapLeadersResponse = { level: BoundaryLevel; areas: MapLeader[] };
export const ballotLabel = (level: BoundaryLevel) => level === 'province'
  ? 'Ward + municipal PR votes'
  : level === 'municipality' ? 'Municipal PR votes' : 'Ward votes';
