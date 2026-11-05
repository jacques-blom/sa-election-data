import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { parseArgs } from 'node:util';
import { ELECTIONS, DETAIL_DISCOVERY_SUPPLEMENTS, sourceFor, type Election, type Source } from '../src/lib/data/catalogue.ts';
import { fetchDocument } from '../src/lib/data/fetch.ts';
import { discoverMunicipalities, normalize, validateDocument } from '../src/lib/data/normalize.ts';
import { DATA_DIR, getSource, openStore, recordFailure, recordUnchanged, saveDocument } from './lib/store.ts';
import { partyDirectory } from './lib/parties.ts';

const { values } = parseArgs({ options: {
  years: { type: 'string', default: '2026' },
  municipality: { type: 'string' },
  'interval-ms': { type: 'string', default: '500' },
} });
const years = values.years === 'all' ? ELECTIONS.map((e) => e.year) : values.years.split(',').map(Number);
if (years.some((year) => !ELECTIONS.some((e) => e.year === year))) throw new Error('Supported years: 2000,2006,2011,2016,2021,2026 or all');
const interval = Number(values['interval-ms']);
if (!Number.isFinite(interval) || interval < 250) throw new Error('interval-ms must be at least 250');
const db = openStore();
const partyNames = await partyDirectory();
let nextRequestAt = 0;
let failures = 0;
let changed = 0;
let unchanged = 0;
let consecutiveFailures = 0;

async function acquire(election: Election, source: Source) {
  const cached = getSource(db, source);
  const wait = Math.max(0, nextRequestAt - Date.now());
  await new Promise((resolve) => setTimeout(resolve, wait));
  nextRequestAt = Date.now() + interval;
  try {
    const result = await fetchDocument(source, { etag: cached?.etag, lastModified: cached?.last_modified });
    if (result.unchanged) {
      if (!cached?.raw_path) throw new Error('Received 304 without a usable cached snapshot');
      const root = validateDocument(JSON.parse(gunzipSync(await readFile(resolve(DATA_DIR, cached.raw_path))).toString('utf8')), election, source);
      recordUnchanged(db, source, result.checkedAt);
      consecutiveFailures = 0;
      unchanged++;
      return root;
    }
    const sha256 = createHash('sha256').update(result.body).digest('hex');
    const rawPath = `raw/${election.year}/${source.kind}-${source.areaId}/${sha256}.json.gz`;
    const archive = resolve(DATA_DIR, rawPath);
    await mkdir(dirname(archive), { recursive: true });
    // Retain the exact payload even if validation rejects it; never execute the .js response.
    await writeFile(archive, gzipSync(result.body), { flag: 'wx' }).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'EEXIST') throw error;
    });
    const root = validateDocument(JSON.parse(result.body), election, source);
    if (cached?.sha256 === sha256) {
      recordUnchanged(db, source, result.checkedAt);
      consecutiveFailures = 0;
      unchanged++;
      return root;
    }
    const records = saveDocument(db, election, source, { sha256, checkedAt: result.checkedAt,
      reportedAt: new Date(root.ReportDate as string).toISOString(), rawPath,
      etag: result.etag, lastModified: result.lastModified }, normalize(root, source, partyNames));
    changed++;
    consecutiveFailures = 0;
    console.log(JSON.stringify({ source: source.id, status: 'updated', records }));
    return root;
  } catch (error) {
    recordFailure(db, source, error);
    failures++;
    consecutiveFailures++;
    console.error(JSON.stringify({ source: source.id, status: 'failed', error: String(error) }));
    if (consecutiveFailures >= 5) throw new Error('Stopped after five consecutive source failures; rerun to resume.');
    return null;
  }
}

try {
  // Count the current election first, then backfill historical elections.
  for (const election of ELECTIONS.filter((e) => years.includes(e.year)).toReversed()) {
    const summary = await acquire(election, sourceFor(election));
    if (!summary) continue;
    const known = db.prepare("SELECT area_id FROM source_documents WHERE year = ? AND kind = 'municipality'").all(election.year)
      .map((row) => String(row.area_id));
    const ids = values.municipality ? values.municipality.split(',') : [...new Set([
      ...discoverMunicipalities(summary), ...(DETAIL_DISCOVERY_SUPPLEMENTS[election.year] ?? []), ...known,
    ])].sort((a, b) => Number(a) - Number(b));
    console.log(JSON.stringify({ year: election.year, discoveredMunicipalities: discoverMunicipalities(summary).length, requestedMunicipalities: ids.length }));
    for (const municipality of ids) await acquire(election, sourceFor(election, municipality));
  }
} finally {
  console.log(JSON.stringify({ changed, unchanged, failures, database: '.data/elections.sqlite' }));
  db.close();
}
if (failures > 0) process.exitCode = 1;
