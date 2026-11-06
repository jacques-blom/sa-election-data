import { hydrateResults, joinedResults, resultColumns } from '../data/packed-results.ts';
import { resultFromRow, type Result, type ResultRow } from '../places/results.ts';
import { previousElection } from './comparison.ts';
import { ELECTIONS } from '../data/catalogue.ts';

/** One bounded query per page/batch, not one query per party or ward. */
export async function attachPrevious(db: D1Database, results: Result[], bucket?: R2Bucket) {
  if (!results.length) return results;
  const year = previousElection(results[0]!.year);
  if (!year) return results;
  try {
    const keys = results.map(r => `${r.level}:${r.id}`);
    const rows = await db.prepare(`SELECT ${resultColumns} ${joinedResults}
      WHERE r.year=? AND r.level IN (SELECT value FROM json_each(?))
      AND r.area_id IN (SELECT value FROM json_each(?))
      AND r.level || ':' || r.area_id IN (SELECT value FROM json_each(?))`)
      .bind(year, JSON.stringify([...new Set(results.map(r => r.level))]),
        JSON.stringify([...new Set(results.map(r => r.id))]), JSON.stringify(keys)).all<ResultRow>();
    const previous = new Map((await hydrateResults(db, bucket, rows.results)).map(r => [`${r.level}:${r.area_id}`, resultFromRow(r)]));
    for (const result of results) result.previous = previous.get(`${result.level}:${result.id}`) ?? null;
  } catch (error) {
    // Historical storage failing must not hide the latest count.
    console.error('Historical comparison unavailable', error);
  }
  return results;
}

export async function availableYears(db: D1Database, level: string, id: string) {
  const rows = await db.prepare(`SELECT DISTINCT r.year ${joinedResults}
    WHERE r.year IN (SELECT value FROM json_each(?)) AND r.level=? AND r.area_id=? ORDER BY r.year`)
    .bind(JSON.stringify(ELECTIONS.map(e => e.year)), level, id).all<{ year: number }>();
  return rows.results.map(r => r.year);
}
