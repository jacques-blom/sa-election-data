import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { ELECTIONS, sourceFor } from '../src/lib/data/catalogue.ts';
import { normalize, validateDocument } from '../src/lib/data/normalize.ts';
import { DATA_DIR, getSource, openStore, saveDocument } from './lib/store.ts';
import { partyDirectory } from './lib/parties.ts';

const names = await partyDirectory();
const db = openStore();
let processed = 0;
try {
  const sources = db.prepare('SELECT year, kind, area_id FROM source_documents WHERE active_snapshot_id IS NOT NULL ORDER BY year DESC, id').all();
  for (const item of sources) {
    const election = ELECTIONS.find((entry) => entry.year === item.year)!;
    const source = sourceFor(election, item.kind === 'summary' ? undefined : String(item.area_id));
    const cached = getSource(db, source)!;
    const body = gunzipSync(await readFile(resolve(DATA_DIR, cached.raw_path!))).toString('utf8');
    const root = validateDocument(JSON.parse(body), election, source);
    saveDocument(db, election, source, { sha256: cached.sha256!, checkedAt: cached.fetched_at!,
      reportedAt: cached.reported_at!, rawPath: cached.raw_path!, etag: cached.etag,
      lastModified: cached.last_modified, reprocess: true }, normalize(root, source, names));
    processed++;
    if (processed % 100 === 0) console.log(JSON.stringify({ reprocessed: processed, total: sources.length }));
  }
  console.log(JSON.stringify({ reprocessed: processed, fetchedNewElectionData: false }));
} finally { db.close(); }
