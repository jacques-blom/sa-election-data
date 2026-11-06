import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';
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

// The dashboard's Party_Images files bake in circular frames and drop shadows.
// The public site's img_parties directory contains the original party artwork.
const base = 'https://www.elections.org.za/content/img_parties/';
const destination = resolve('public/parties');
const originals = resolve(DATA_DIR, 'party-logos/originals');
await mkdir(destination, { recursive: true });
await mkdir(originals, { recursive: true });
type Logo = { name: string; src: string; source: string; sourceSha256: string;
  sourceWidth: number; sourceHeight: number; sha256: string; width: number; height: number };
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
    let source = base + encodeURIComponent(party.PartyImage.replace(/\.png$/i, '.jpg'));
    if (!party.PartyImage) {
      unavailable.push({ id, name: party.PartyFullName, source, reason: 'No image in the IEC directory' });
      continue;
    }
    async function request(url: string) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
          if (response.status !== 429 && response.status < 500) return response;
          await response.body?.cancel();
          if (attempt === 2) throw new Error(`HTTP ${response.status}`);
        } catch (error) {
          if (attempt === 2) throw new Error(`Could not fetch ${url}`, { cause: error });
        }
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
      throw new Error(`Could not fetch ${url}`);
    }
    let response = await request(source);
    if (response.status === 404 || response.status === 410) {
      await response.body?.cancel();
      source = base + encodeURIComponent(party.PartyImage);
      response = await request(source);
    }
    if (response.status === 404 || response.status === 410) {
      unavailable.push({ id, name: party.PartyFullName, source, reason: `HTTP ${response.status}` });
      await response.body?.cancel();
      continue;
    }
    if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    // IEC sometimes serves PNG bytes with a .jpg filename and JPEG Content-Type.
    // Decode the bytes rather than trusting either the extension or response header.
    if (body.length < 24 || body.length > 10_000_000) {
      throw new Error(`Expected a party image under 10 MB: ${source}`);
    }
    const input = sharp(body);
    const metadata = await input.metadata().catch(error => {
      throw new Error(`Could not decode the IEC logo for ${party.PartyFullName}: ${source}`, { cause: error });
    });
    if (!['jpeg', 'png', 'gif', 'webp'].includes(metadata.format) || !metadata.width || !metadata.height) {
      throw new Error(`Unsupported logo image: ${source}`);
    }
    const sourceSha256 = createHash('sha256').update(body).digest('hex');
    await writeFile(resolve(originals, `${id}-${sourceSha256}.${metadata.format}`), body);
    // Keep the full design and aspect ratio. 192px supports high-density UI and
    // share cards without making visitors download multi-megapixel originals.
    const { data, info } = await input.rotate().resize({ width: 192, height: 192,
      fit: 'inside', withoutEnlargement: true }).webp({ lossless: true }).toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const sha256 = createHash('sha256').update(data).digest('hex');
    // Content-addressed filenames also prevent stale browser caches after an update.
    const filename = `${id}-${sha256.slice(0, 12)}.webp`;
    await writeFile(resolve(destination, filename), data);
    logos[id] = { name: party.PartyFullName, src: `/parties/${filename}`, source,
      sourceSha256, sourceWidth: metadata.width, sourceHeight: metadata.height, sha256, width, height };
    completed++;
    if (completed % 50 === 0) console.log(`Imported ${completed}/${parties.length} party logos`);
  }
}
await Promise.all(Array.from({ length: 6 }, download));
const manifest = {
  source: PARTY_DIRECTORY_URL,
  imageSource: base,
  directorySha256: createHash('sha256').update(directoryBody).digest('hex'),
  fetchedAt: new Date().toISOString(), year,
  logos: Object.fromEntries(Object.entries(logos).sort(([a], [b]) => Number(a) - Number(b))),
  unavailable: unavailable.sort((a, b) => Number(a.id) - Number(b.id)),
};
await mkdir(resolve('src/lib/parties'), { recursive: true });
await writeFile(resolve('src/lib/parties/logos.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported ${completed} original IEC logos; ${unavailable.length} unavailable. Independents and aggregates use neutral markers.`);
