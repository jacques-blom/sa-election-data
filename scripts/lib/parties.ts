import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { DATA_DIR } from './store.ts';

export const PARTY_DIRECTORY_URL = 'https://results.elections.org.za/dashboards/lge/MapsJason/2016/PartyList.js';

export async function partyDirectory(): Promise<ReadonlyMap<string, string>> {
  const cache = resolve(DATA_DIR, 'party-directory.json');
  let body: string;
  try { body = await readFile(cache, 'utf8'); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const response = await fetch(PARTY_DIRECTORY_URL, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Party directory returned HTTP ${response.status}`);
    body = await response.text();
    const sha256 = createHash('sha256').update(body).digest('hex');
    await mkdir(resolve(DATA_DIR, 'raw/party-directory'), { recursive: true });
    await writeFile(resolve(DATA_DIR, 'raw/party-directory', `${sha256}.json.gz`), gzipSync(body));
    await writeFile(cache, body);
    await writeFile(resolve(DATA_DIR, 'party-directory-source.json'), JSON.stringify({
      url: PARTY_DIRECTORY_URL, sha256, fetched_at: new Date().toISOString(),
    }, null, 2));
  }
  const data: unknown = JSON.parse(body);
  if (!Array.isArray(data)) throw new Error('Invalid party directory');
  const names = new Map<string, string>();
  for (const party of data) {
    if (!party || !/^-?\d+$/.test(String(party.ID)) || typeof party.PartyFullName !== 'string') throw new Error('Invalid party directory entry');
    names.set(String(party.ID), party.PartyFullName);
  }
  return names;
}
