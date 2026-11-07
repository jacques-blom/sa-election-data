import { governmentParties } from './parties.ts';
import type { GovernmentRecord, PartyRole } from './types.ts';
import { clarifyGovernmentRecord } from './corrections.ts';

/** RFC 4180, including quoted commas/newlines and escaped quotes. Reject malformed rows. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], field = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } } else field += c; continue; }
    if (c === '"' && !field && !closed) { quoted = true; continue; }
    if (c === ',' || c === '\n' || c === '\r') {
      row.push(field); field = ''; closed = false;
      if (c !== ',') { if (c === '\r' && text[i + 1] === '\n') i++; rows.push(row); row = []; }
    } else { if (closed || c === '"') throw new Error('Malformed CSV quoting'); field += c; }
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (field || row.length || closed) { row.push(field); rows.push(row); }
  const headers = rows.shift(); if (!headers?.length || new Set(headers).size !== headers.length) throw new Error('Invalid CSV headers');
  return rows.filter(r => r.length !== 1 || r[0] !== '').map((r, i) => {
    if (r.length !== headers.length) throw new Error(`CSV row ${i + 2} has ${r.length} fields; expected ${headers.length}`);
    return Object.fromEntries(headers.map((h, j) => [h, r[j]!]));
  });
}
export function sourceDate(value: string): string {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) throw new Error(`Invalid source date: ${value}`);
  const [day, month, year] = value.split('/'); const date = `${year}-${month}-${day}`;
  if (new Date(date).toISOString().slice(0, 10) !== date) throw new Error(`Invalid calendar date: ${value}`);
  return date;
}
const knownIssues: Record<string, string[]> = {
  EKU_03: ['Release note: transition should be Reshuffling, not Reduction.'],
  ETH_03: ['Release note: ideological classification conflicts with coded membership.'],
  KAN_02: ['Release note: KIP membership has weak supporting evidence.'],
  LAN_02: ['Release note: LIP support has weak supporting evidence.'],
  JHB_05: ['Release note: AHC is coded as opposition but a cited source lists it as a member.'],
  MAT_01: ['Release note: conflicting start dates; inaugural mayor is coded Unknown despite a named source.'],
  SYC_02: ['Release note: conflicting start dates; inaugural mayor is coded Unknown despite a named source.'],
  PHK_02: ['Release note: conflicting start dates.'],
  KGT_01: ['Release note: inaugural mayor is coded Unknown despite a named source.'],
  MAT_02: ['Release note: inaugural mayor is coded Unknown despite a named source.'],
  SYC_01: ['Release note: inaugural mayor is coded Unknown despite a named source.'],
  GAM_03: ['Release note: named mayor took office after the administration began; inaugural mayor is uncertain.'],
  DAN_02: ['Release note: deputy mayor vacancy date conflicts with a financial statement.'],
};
export function importMunicipalGovernments(csv: string, municipalities: { id: string; code: string }[]): GovernmentRecord[] {
  const mapping = new Map(municipalities.map(m => [m.code.toUpperCase(), m.id]));
  if (mapping.size !== municipalities.length) throw new Error('Duplicate municipal codes');
  const seen = new Set<string>();
  const integer = (s: string, name: string) => {
    if (!/^\d+$/.test(s) || !Number.isSafeInteger(Number(s))) throw new Error(`Invalid ${name}: ${s}`);
    return Number(s);
  };
  return parseCsv(csv).map(row => {
    const id = row.Coalition_ID!, code = row.Geo_Code!, municipalityId = mapping.get(code);
    if (!id || seen.has(id)) throw new Error(`Duplicate/missing administration: ${id}`); seen.add(id);
    if (!municipalityId) throw new Error(`Unmapped municipal code: ${code}`);
    const sourceKeys = Object.keys(row).filter(k => k.endsWith('_Role')).map(k => k.slice(0, -5));
    // The pinned municipal edition has 104 party columns. The registry may also
    // gain parties used only by separately verified 2026 administrations.
    if (sourceKeys.length !== 104 || sourceKeys.some(k => !governmentParties[k])) throw new Error('Unmapped party columns');
    const parties = Object.keys(governmentParties).filter(key => sourceKeys.includes(key)).map(key => {
      const role = row[`${key}_Role`]!;
      if (!['', 'Member', 'Supporter', 'Opposition', 'Unknown'].includes(role)) throw new Error(`Unknown role: ${role}`);
      return { key, role: (role || null) as PartyRole, seats: integer(row[`${key}_Seats`] || '0', key) };
    }).filter(p => p.seats > 0 || p.role);
    const start = sourceDate(row.Start_Date!), end = row.End_Date ? sourceDate(row.End_Date) : null;
    if (end && end < start || start > '2026-02-28' || end && end > '2026-02-28') throw new Error(`Invalid date range: ${id}`);
    if ((row.Termination_Reason === 'Active') !== (end === null)) throw new Error(`Inconsistent termination: ${id}`);
    if (!['', 'TRUE'].includes(row.Start_Date_Approximate!)) throw new Error('Unknown approximate date flag');
    const totalSeats = integer(row.Total_Seats!, 'Total_Seats'), majority = integer(row.Gov_Threshold!, 'Gov_Threshold');
    if (majority !== Math.floor(totalSeats / 2) + 1) throw new Error(`Invalid majority threshold: ${id}`);
    const issues = [...(knownIssues[id] ?? [])];
    if (parties.reduce((s, p) => s + p.seats, 0) !== totalSeats) issues.push('Source party seats do not sum to the recorded council size (vacancies or incomplete allocation).');
    const office = (key: string) => ({ name: row[`Inaugural_${key}`]!, party: row[`Inaugural_${key}_Party`]! });
    return clarifyGovernmentRecord({ id, code, municipalityId, municipality: row.Municipality!, province: row.Province!,
      start, approximateStart: row.Start_Date_Approximate === 'TRUE', end, termination: row.Termination_Reason!,
      sizeType: row.Size_Type!, coalitionType: row.Coalition_Type!, transition: row.Transition_Type || null,
      formalisation: row.Formalisation_Status!, totalSeats, majority, governmentSeats: integer(row.Govt_Size_Total!, 'Govt_Size_Total'),
      parties, inauguralMayor: office('Mayor'), inauguralSpeaker: office('Speaker'), inauguralDeputyMayor: office('Deputy_Mayor'),
      notes: row.Notes ?? '', issues, membershipDisputed: ['KAN_02', 'LAN_02', 'JHB_05'].includes(id) });
  }).sort((a, b) => a.code.localeCompare(b.code) || a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
}

