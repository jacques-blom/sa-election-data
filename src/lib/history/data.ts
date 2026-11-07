import { ELECTIONS } from '../data/catalogue.ts';
import { hydrateResults, joinedResults, resultColumns } from '../data/packed-results.ts';
import { resultFromRow, type Result, type ResultRow } from '../places/results.ts';
import { electionTrends } from './trends.ts';
import { combinedOnly, type VoteBasis } from './comparison.ts';

/** At most six election rows, read from published snapshot pointers. Reuse page snapshots. */
export async function readElectionHistory(db: D1Database, bucket: R2Bucket | undefined,
  options: {level:Result['level'];id:string;through:number;basis?:VoteBasis;current?:Result|null}) {
  const seeds=[options.current,options.current?.previous].filter((r):r is Result=>!!r&&r.level===options.level&&r.id===options.id&&r.year<=options.through);
  const years=ELECTIONS.map(e=>e.year).filter(y=>y<=options.through&&!seeds.some(r=>r.year===y));
  const records=[...seeds];let warning:string|null=null;
  if(years.length)try{
    const rows=await db.prepare(`SELECT ${resultColumns} ${joinedResults}
      WHERE r.level=? AND r.area_id=? AND r.year IN (SELECT value FROM json_each(?)) ORDER BY r.year LIMIT 6`)
      .bind(options.level,options.id,JSON.stringify(years)).all<ResultRow>();
    try { await hydrateResults(db,bucket,rows.results); }
    catch { warning='Some archived results are temporarily unavailable.'; }
    for(const row of rows.results)try {
      if(!row.payload)throw new Error('Missing archived payload');
      records.push(resultFromRow(row));
    }catch{warning='Some archived results are temporarily unavailable.';}
  }catch{warning='Election history is temporarily unavailable; showing the snapshots already loaded.';}
  const basis=options.basis ?? (['ward','voting-district'].includes(options.level) && records.some(combinedOnly) ? 'source_total' : undefined);
  return electionTrends(records,{...options,basis,warning});
}

