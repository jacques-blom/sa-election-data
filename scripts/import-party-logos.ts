import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { partyDirectory, PARTY_DIRECTORY_URL } from './lib/parties.ts';
import { DATA_DIR } from './lib/store.ts';

// Import only parties present in the site's election data, not the IEC's training
// parties or independent-candidate portraits. Run after refreshing the local data.
const year = Number(process.argv[2] ?? 2026);
if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('Expected an election year');
await partyDirectory();
const directoryBody = await readFile(resolve(DATA_DIR, 'party-directory.json'), 'utf8');
const directory = JSON.parse(directoryBody) as { ID: number; PartyFullName: string; PartyImage: string }[];
const db = new DatabaseSync(resolve(DATA_DIR, 'elections.sqlite'), { readOnly: true });
const ids = new Set((db.prepare(`SELECT DISTINCT json_extract(p.value, '$.party_id') AS id
  FROM area_results r, json_each(r.payload, '$.parties') p
  WHERE r.year = ?`).all(year) as { id: string | null }[]).flatMap(p => p.id ? [p.id] : []));
db.close();
if (!ids.size) throw new Error(`No imported party results for ${year}`);

const base = 'https://results.elections.org.za/dashboards/lge/Party_Images/';
const destination = resolve('public/parties');
await mkdir(destination, { recursive: true });
type Logo = { name: string; src: string; source: string; sha256: string; width: number; height: number };
const logos: Record<string, Logo> = {};
const unavailable: { id: string; name: string; source: string; reason: string }[] = [];
const parties = directory.filter(p => ids.has(String(p.ID)) && p.ID !== 0 && p.ID !== -2);
let next = 0;
let completed = 0;
async function download() {
  while (next < parties.length) {
    const party = parties[next++]!;
    const id = String(party.ID);
    if (!/^-?\d+$/.test(id)) throw new Error('Invalid IEC party ID');
    const source = base + encodeURIComponent(party.PartyImage);
    if (!party.PartyImage) {
      unavailable.push({ id, name: party.PartyFullName, source, reason: 'No image in the IEC directory' });
      continue;
    }
    let response: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
        if (response.status !== 429 && response.status < 500) break;
        if (attempt === 2) throw new Error(`HTTP ${response.status}`);
        await response.body?.cancel();
      } catch (error) {
        if (attempt === 2) throw new Error(`Could not fetch ${source}`, { cause: error });
      }
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
    if (response?.status === 404 || response?.status === 410) {
      unavailable.push({ id, name: party.PartyFullName, source, reason: `HTTP ${response.status}` });
      await response.body?.cancel();
      continue;
    }
    if (!response?.ok) throw new Error(`${source}: HTTP ${response?.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    // Reject error documents and unsuitable images instead of shipping broken logos.
    if (body.length < 24 || body.length > 1_000_000 || body.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
      throw new Error(`Expected a PNG logo under 1 MB: ${source}`);
    }
    const width = body.readUInt32BE(16), height = body.readUInt32BE(20);
    if (!width || !height || width > 2048 || height > 2048) throw new Error(`Unexpected logo dimensions: ${source}`);
    const sha256 = createHash('sha256').update(body).digest('hex');
    // Content-addressed filenames also prevent stale browser caches after an update.
    const filename = `${id}-${sha256.slice(0, 12)}.png`;
    await writeFile(resolve(destination, filename), body);
    logos[id] = { name: party.PartyFullName, src: `/parties/${filename}`, source, sha256, width, height };
    completed++;
    if (completed % 50 === 0) console.log(`Imported ${completed}/${parties.length} party logos`);
  }
}
await Promise.all(Array.from({ length: 6 }, download));
const manifest = {
  source: PARTY_DIRECTORY_URL,
  directorySha256: createHash('sha256').update(directoryBody).digest('hex'),
  fetchedAt: new Date().toISOString(), year,
  logos: Object.fromEntries(Object.entries(logos).sort(([a], [b]) => Number(a) - Number(b))),
  unavailable: unavailable.sort((a, b) => Number(a.id) - Number(b.id)),
};
await mkdir(resolve('src/lib/parties'), { recursive: true });
await writeFile(resolve('src/lib/parties/logos.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported ${completed} official IEC logos; ${unavailable.length} unavailable. Independents and aggregates use neutral markers.`);
