import { read, utils, type CellObject, type WorkSheet } from 'xlsx';
import type { District } from '../maps/districts.ts';
import type { DistrictResult, DistrictParty } from './results.ts';

export const DISTRICT_MAX_BYTES = 2 * 1024 * 1024;
const signature = [0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1];
const normal = (v: unknown) => typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
function count(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid ${label}`);
  return value;
}
function cells(sheet: WorkSheet) {
  return Object.entries(sheet).filter(([key]) => !key.startsWith('!')) as [string, CellObject][];
}
/** Parse numeric cells, never formatted currency strings or executable spreadsheet content. */
export function parseDistrictReport(bytes: Uint8Array, district: District, now = Date.now()): DistrictResult {
  if (bytes.byteLength > DISTRICT_MAX_BYTES || !signature.every((b,i) => bytes[i] === b)) throw new Error('Expected a bounded BIFF XLS district report');
  const workbook = read(bytes, { type: 'array', sheetRows: 1000, cellFormula: false, cellHTML: false, cellNF: false, cellText: false });
  const summaries = workbook.SheetNames.map(name => workbook.Sheets[name]!).filter(sheet => cells(sheet).some(([,c]) => normal(c.v) === 'Report Summary'));
  if (summaries.length !== 1) throw new Error('Expected exactly one district report summary');
  const sheet = summaries[0]!, entries = cells(sheet), strings = entries.map(([,c]) => normal(c.v));
  if (!strings.includes('2026 Local Government Elections') || !strings.includes('Detailed DC 40% Ballot Results Report')
    || !strings.includes('DC 40%') || !strings.includes(district.province)
    || !strings.some(v => v.startsWith(`${district.id} - `))) throw new Error('District report identity or ballot does not match');
  const printed = strings.find(v => v.startsWith('Printed on:'))?.match(/^Printed on: (\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!printed) throw new Error('Missing district report timestamp');
  // IEC report clocks are SAST. This is generation time, not a declaration or completion time.
  const localDate = `${printed[1]}-${printed[2]}-${printed[3]}T${printed[4]}:${printed[5]}:${printed[6]}`;
  const time = Date.parse(`${localDate}+02:00`);
  if (!Number.isFinite(time) || new Date(time + 7_200_000).toISOString().slice(0,19) !== localDate
    || time > now + 300_000 || time < Date.parse('2026-01-01T00:00:00Z')) throw new Error('Invalid district report timestamp');
  const header = entries.find(([,c]) => normal(c.v) === 'Party Name');
  if (!header) throw new Error('Missing party column');
  const { r: start, c: nameColumn } = utils.decode_cell(header[0]);
  const atHeader = (label: string) => entries.find(([a,c]) => utils.decode_cell(a).r === start && normal(c.v) === label);
  const votesHeader = atHeader('Total Valid Votes'), abbrHeader = atHeader('Abbr.');
  if (!votesHeader) throw new Error('Missing vote column');
  const voteColumn = utils.decode_cell(votesHeader[0]).c;
  const total = entries.find(([a,c]) => utils.decode_cell(a).r > start && normal(c.v) === 'Total Valid Votes');
  const spoilt = entries.find(([a,c]) => utils.decode_cell(a).r > start && normal(c.v) === 'Spoilt Votes');
  if (!total || !spoilt) throw new Error('Missing district totals');
  const value = (r: number, c: number) => sheet[utils.encode_cell({r,c})]?.v;
  const end = utils.decode_cell(total[0]).r;
  const validVotes = count(value(end, voteColumn), 'total valid votes');
  const spoiltVotes = count(value(utils.decode_cell(spoilt[0]).r, voteColumn), 'spoilt votes');
  const parties: DistrictParty[] = [], names = new Set<string>();
  for (let row = start + 1; row < end; row++) {
    const name = normal(value(row, nameColumn));
    if (!name || names.has(name.toUpperCase())) throw new Error('Missing or duplicate district party');
    names.add(name.toUpperCase());
    const votes = count(value(row, voteColumn), 'party votes');
    parties.push({ name, abbreviation: abbrHeader ? normal(value(row, utils.decode_cell(abbrHeader[0]).c)) || null : null,
      votes, share: validVotes ? votes / validVotes * 100 : null });
  }
  if (!parties.length || parties.reduce((sum,p) => sum+p.votes,0) !== validVotes) throw new Error('District party votes do not reconcile');
  parties.sort((a,b) => b.votes-a.votes || a.name.localeCompare(b.name));
  return { version: 1, year: 2026, districtId: district.id, ballot: 'district', reportedAt: new Date(time).toISOString(), validVotes, spoiltVotes, parties };
}
