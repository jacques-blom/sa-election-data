import { attachPrevious } from '../history/results.ts';
import { partyMovement } from '../history/comparison.ts';
import { hydrateResults, joinedResults, resultColumns } from '../data/packed-results.ts';
import { ballotResults, resultFromRow, type Result, type ResultRow } from '../places/results.ts';
import { partyStyle } from '../places/format.ts';
import { resultDelay, summaryBallot } from '../overview/results.ts';
import type { BoundaryLevel } from './detail.ts';
import { LEADER_BATCH_SIZE, NEUTRAL_COLOR, type MapLeader } from './leader-types.ts';

export function leaderFor(id: string, result: Result | null): MapLeader {
  const empty: MapLeader = { id, color: NEUTRAL_COLOR, party: null, share: null, status: 'unavailable', delayed: false };
  if (!result) return empty;
  const ballot = result.level === 'province' ? summaryBallot(result) : ballotResults(result, result.level === 'ward' ? 'ward' : 'pr');
  const leader = 'topShown' in ballot ? ballot.topShown : ballot.leader;
  const delayed = resultDelay(result) !== null;
  if (!leader) return { ...empty, delayed, status: ballot.tied ? 'tied' : ballot.total === 0 ? 'awaiting' : 'unavailable' };
  return { id, color: partyStyle(leader.party_name)[1]!, party: leader.party_name, share: leader.share,
    movement: partyMovement(result,leader,result.level === 'province' ? 'source_total' : result.level === 'ward' ? 'ward' : 'pr'),
    status: result.level === 'province' ? 'highest-shown' : 'leading', delayed };
}

export function parseLeaderQuery(params: URLSearchParams): { level: BoundaryLevel; ids: string[] } | null {
  const level = params.get('level');
  if (level !== 'province' && level !== 'municipality' && level !== 'ward') return null;
  const ids = [...new Set((params.get('ids') ?? '').split(','))];
  const pattern = level === 'province' ? /^[1-9]$/ : level === 'municipality' ? /^\d{4}$/ : /^\d{8}$/;
  if (!ids.length || ids.length > LEADER_BATCH_SIZE || ids.some(id => !pattern.test(id))) return null;
  return { level, ids: ids.sort() };
}

/** A bounded viewport batch shares the existing snapshot-safe packed result reader. */
export async function getMapLeaders(db: D1Database, bucket: R2Bucket | undefined, level: BoundaryLevel, ids: string[]) {
  const rows = await db.prepare(`SELECT ${resultColumns} ${joinedResults}
    WHERE r.year=2026 AND r.level=? AND r.area_id IN (SELECT value FROM json_each(?))`)
    .bind(level, JSON.stringify(ids)).all<ResultRow>();
  const hydrated = await attachPrevious(db, (await hydrateResults(db, bucket, rows.results)).map(resultFromRow), bucket);
  const results = new Map(hydrated.map(result => [result.id, result]));
  return ids.map(id => leaderFor(id, results.get(id) ?? null));
}
