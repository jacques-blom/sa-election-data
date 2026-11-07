/** Import links actually listed by GCIS, without constructing municipal URLs.
 * Usage: node scripts/import-civic-directory.ts /tmp/directory.html YYYY-MM-DD
 * Fetch https://www.gov.za/about-government/contact-directory/provincial-local-government first.
 * Review the diff and run tests/civic-resources.test.ts before publishing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import municipalities from '../src/lib/places/municipalities.json' with { type: 'json' };

const [input, checkedAt] = process.argv.slice(2);
if (!input || !checkedAt || !/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) throw new Error('Provide a saved GCIS directory HTML file and its fetch date (YYYY-MM-DD).');
const sourceUrl = 'https://www.gov.za/about-government/contact-directory/provincial-local-government';
const provinces: Record<string, string> = { 'Eastern Cape': 'ec', 'Free State': 'fs', Gauteng: 'gp', 'KwaZulu-Natal': 'kzn', Limpopo: 'lp', Mpumalanga: 'mp', 'North West': 'nw', 'Northern Cape': 'nc', 'Western Cape': 'wc' };
// Reviewed spelling/name differences between the IEC catalogue and the GCIS directory.
const aliases: Record<string, string> = {
  'ngquza-hill': 'Ingquza Hill', 'kumkani-mhlontlo': 'Mhlontlo', 'merafong-city': 'Merafong',
  nqutu: 'Nquthu', 'inkosi-umtubatuba': 'Inkosi Mtubatuba', 'big-five-hlabisa': 'Big 5 Hlabisa',
  'johannes-phumani-pungula': 'Johannes Phumani Phungula', 'lepele-nkumpi': 'Lepelle-Nkumpi',
  'elias-motsoaledi': 'Elias Motswaledi', makhuduthamaga: 'Makhudutamaga',
  'dr-pixley-ka-isaka-seme': 'Pixley Ka Seme', mafikeng: 'Mahikeng',
};
const normal = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/\b(city of|local|metropolitan|municipality|the)\b/g, '').replace(/[^a-z0-9]/g, '');
const { document } = parseHTML(readFileSync(input, 'utf8'));
const links = [...document.querySelectorAll('a')].map(a => ({ name: a.textContent.trim(), url: new URL(a.getAttribute('href') || '', sourceUrl).href }))
  .filter(a => a.url.startsWith('https://www.gov.za/about-government/contact-directory/') && /\/(ec|fs|gp|kzn|lp|mp|nw|nc|wc)-municipalities\//.test(a.url));
if (links.length < 200) throw new Error('Directory is incomplete or its markup changed; do not replace the existing catalogue.');
const records: Record<string, { name: string; url: string }> = {};
const missing: string[] = [];
for (const place of municipalities) {
  const names = [place.name, ...place.aliases, aliases[place.slug] ?? ''].filter(Boolean).map(normal);
  const matches = links.filter(link => link.url.includes(`/${provinces[place.province]}-municipalities/`) && names.includes(normal(link.name)));
  if (matches.length > 1) throw new Error(`Ambiguous match: ${place.slug}`);
  if (matches[0]) records[place.slug] = matches[0];
  else missing.push(place.slug);
}
writeFileSync(new URL('../src/lib/civic/municipal-directory.json', import.meta.url), JSON.stringify({ sourceUrl, checkedAt, records }, null, 2) + '\n');
console.log(`Matched ${Object.keys(records).length}/${municipalities.length} municipalities. National-directory fallback: ${missing.join(', ') || 'none'}.`);
