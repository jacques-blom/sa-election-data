import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { importMunicipalGovernments } from '../src/lib/governance/import.ts';

const root = new URL('../', import.meta.url);
const csv = await readFile(new URL('data/mistra/2026-v1.0/municipal_administrations.csv', root), 'utf8');
const checksum = createHash('sha256').update(csv).digest('hex');
if (checksum !== '82357d932e63b21832c871d03298445782b433128d7949ec17b88f54ec512834') throw new Error('Pinned MISTRA v1.0 CSV checksum changed; review the source before updating the pin');
const directory = JSON.parse(await readFile(new URL('src/lib/places/municipalities.json', root), 'utf8'));
const municipalities = directory.map((p: { id: string; relationships: { election: number; level: string; relation: string; areaId: string }[] }) => ({
  code: p.id.replace('za-municipality-', '').toUpperCase(),
  id: p.relationships.find(r => r.election === 2026 && r.level === 'municipality' && r.relation === 'equals')!.areaId,
}));
const records = importMunicipalGovernments(csv, municipalities);
if (records.length !== 175 || new Set(records.map(r => r.code)).size !== 80) throw new Error('Unexpected v1.0 coverage');
const output = JSON.stringify({ source: {
  title: 'MISTRA Coalitions Barometer Dataset, 2026 edition', version: '1.0', published: '2026-10-07',
  cutoff: '2026-02-28', start: '2021-11-01', url: 'https://coalitions.mistra.org.za/',
  download: 'https://coalitions.mistra.org.za/downloads.html', releaseNotes: 'https://coalitions.mistra.org.za/release-notes.html',
  codebook: 'https://coalitions.mistra.org.za/assets/downloads/MISTRA-Coalitions-Barometer-2026-Codebook-v1.0.pdf',
  commit: '3f4fe9baa0a50e8289cf1c1a0dc807cad993dd6d', sha256: checksum,
  attribution: 'Caromba, L., Simayile, S., & Ndletyana, A. (2026). MISTRA Coalitions Barometer Dataset, 2026 edition (Version 1.0) [Data set]. Mapungubwe Institute for Strategic Reflection. https://coalitions.mistra.org.za',
  licence: 'CC BY 4.0 for original MISTRA coding. Underlying IEC seats and municipal identifiers retain their original terms.',
  licenceUrl: 'https://coalitions.mistra.org.za/sources.html',
  modifications: 'Dates normalised; municipal codes matched to Counted IDs; party labels expanded; release-note issues attached. Sourced Counted clarifications are marked editorialCorrection, which retains the original notes and any changed termination code. Inaugural values retained.',
  basis: 'Party roles, seats and officeholders describe inauguration. Later changes may appear only in notes. Active means active at the source cutoff, not today.',
  coverage: '175 administrations in 80 local and metropolitan municipalities. Districts are excluded. Missing coverage does not mean no coalition.',
}, records }, null, 2) + '\n';
const target = new URL('src/lib/governance/data.json', root);
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== output) throw new Error('Governance data is stale; run pnpm data:governance');
} else await writeFile(target, output);
console.log(`${records.length} administrations, ${new Set(records.map(r => r.code)).size} municipalities; all municipal codes mapped.`);

