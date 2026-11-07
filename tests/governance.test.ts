import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { governmentContext, governmentHistory, governmentRecords, governmentSource, memberKeys, supporterKeys,
  compareFormationMembers, compareGovernmentPartners, governmentChange, governmentComparison, governmentCaption, validateVerifiedGovernments, type VerifiedGovernment, type SeatSnapshot } from '../src/lib/governance/index.ts';
import { importMunicipalGovernments, parseCsv, sourceDate } from '../src/lib/governance/import.ts';
import { governmentPartyKey } from '../src/lib/governance/parties.ts';
import { resultsApi } from '../src/lib/api/results.ts';
import { dashboardCouncils } from '../src/lib/overview/dashboard.ts';
import { electionHighlights } from '../src/lib/overview/highlights.ts';

const csv = readFileSync(new URL('../data/mistra/2026-v1.0/municipal_administrations.csv', import.meta.url), 'utf8');
const mapping = [...new Map(governmentRecords.map(r => [r.code, { code: r.code, id: r.municipalityId }])).values()];
const record = governmentContext('EC101')!.latest!;
const seats: SeatSnapshot = { status: 'reported', total: 24, majority: 13, parties: [
  { id: 'anc', name: 'AFRICAN NATIONAL CONGRESS', count: 14 },
  { id: 'csa', name: 'COMPATRIOTS OF SOUTH AFRICA', count: 1 },
  { id: 'da', name: 'DEMOCRATIC ALLIANCE', count: 9 },
] };
const confirmed = (phase: VerifiedGovernment['phase'], members: string[], supporters: string[] = [], leadParty: string | null = null): VerifiedGovernment => ({
  municipalityId: '1102', election: 2026, phase, effectiveFrom: '2026-11-01', verifiedAt: '2026-11-07',
  members, supporters, leadParty, arrangement: members.length > 1 ? 'coalition' : 'single-party',
  sources: [{title:'Test council proceedings',url:'https://example.org/council-minutes'}], notes:'Test fixture, not a real confirmation.',
});

test('the pinned import is deterministic, fully mapped, dated and separately licensed', () => {
  assert.equal(createHash('sha256').update(csv).digest('hex'), '82357d932e63b21832c871d03298445782b433128d7949ec17b88f54ec512834');
  assert.deepEqual(importMunicipalGovernments(csv, mapping), governmentRecords);
  assert.equal(governmentRecords.length, 175);
  assert.equal(mapping.length, 80);
  assert.equal(new Set(governmentRecords.map(r => r.id)).size, 175);
  assert.equal(governmentSource.cutoff, '2026-02-28');
  assert.match(governmentSource.licence, /Underlying IEC/);
  assert.equal(governmentRecords.filter(r => r.approximateStart).length, 35);
  assert(governmentRecords.find(r => r.id === 'GEO_04')!.issues.some(i=>i.includes('do not sum')));
  assert(governmentRecords.find(r => r.id === 'JHB_05')!.membershipDisputed);
});

test('CSV/date validation prevents corruption, new unknown columns and unmapped councils', () => {
  assert.deepEqual(parseCsv('a,b\r\n"x, ""y""","two\nlines"\r\n'), [{ a:'x, "y"',b:'two\nlines' }]);
  assert.throws(()=>parseCsv('a,b\n1'), /fields/);
  assert.throws(()=>parseCsv('a,a\n1,2'), /headers/);
  assert.throws(()=>parseCsv('a,b\n"x"oops,y'), /quoting/);
  assert.equal(sourceDate('28/02/2026'),'2026-02-28');
  assert.throws(()=>sourceDate('31/02/2026'));
  assert.throws(()=>sourceDate('2026-02-28'));
  assert.throws(()=>importMunicipalGovernments(csv,mapping.slice(1)), /Unmapped/);
  assert.throws(()=>importMunicipalGovernments(csv.replace('ABC_Role','NewParty_Role'),mapping), /party columns/);
});

test('editorial corrections retain source wording and do not silently rewrite chronology', () => {
  const ditsobotla = governmentRecords.find(r => r.id === 'DTS_03')!;
  assert.equal(ditsobotla.termination, 'Council_Reconstitution');
  assert.equal(ditsobotla.editorialCorrection?.originalTermination, 'Provincial_Dissolution');
  assert.match(ditsobotla.notes, /not dissolved/);
  assert.match(ditsobotla.editorialCorrection!.originalNotes, /termination value names dissolution/);
  const george = governmentRecords.find(r => r.id === 'GEO_01')!;
  assert.equal(george.end, '2023-07-31');
  assert.match(george.notes, /majority was temporary/);
  assert.match(george.editorialCorrection!.originalNotes, /governed alone from then/);
  assert.ok(george.editorialCorrection!.sources.some(s => s.url.startsWith('https://www.elections.org.za/')));
});

test('Dr Beyers Naudé retains its history, inauguration roles and gaps; active is never current', () => {
  const history = governmentHistory('dr-beyers-naude')!;
  assert.equal(history.municipality.id, '1102');
  assert.equal(history.records.length, 4);
  assert.equal(history.latest!.id, 'BN_04');
  assert.deepEqual(memberKeys(history.latest!), ['ANC','CSA']);
  assert.deepEqual(supporterKeys(history.latest!), []);
  assert.equal(history.latest!.governmentSeats, 12);
  assert.equal(history.latest!.majority, 13);
  assert.equal(history.records[1]!.end,'2022-05-18');
  assert.equal(history.records[2]!.start,'2022-06-07');
  assert.equal(history.currentStatus,'unverified');
  assert.equal(history.beforeElection,null);
  assert.equal(history.afterElection,null);
  assert.equal(history.change.status,'unconfirmed');
  assert.equal(governmentContext('1102',2021),null);
  assert.equal(governmentContext('DC10'),null);
  assert.equal(governmentContext('CPT')!.coverage,'not-covered');
  assert.equal(governmentContext('CPT')!.currentStatus,'unverified');
});

test('partner seat comparisons stay hypothetical, exclude outside support and retain estimate status', () => {
  const compared = compareFormationMembers(record,seats);
  assert.equal(compared.status,'reported');
  assert.equal(compared.total,15);
  assert.equal(compared.shortfall,0);
  assert.deepEqual(compared.partyIds,['anc','csa']);
  assert.match(compared.caveat,/Hypothetical/);
  assert.equal(compareFormationMembers(record,{...seats,status:'estimated'}).status,'estimated');
  const withSupporter = { ...record, parties: [...record.parties.filter(p=>p.key!=='DA'), { key:'DA', role:'Supporter' as const, seats:10 }] };
  const outside = compareFormationMembers(withSupporter,seats);
  assert(outside.status!=='unavailable' && outside.total===15);
  assert.equal(governmentContext('1102')!.change.status,'unconfirmed', 'Even a complete seat majority never confirms the government');
});

test('ambiguous, missing, disputed, unknown and grouped independent partners block arithmetic', () => {
  assert.equal(compareFormationMembers(record,{...seats,parties:seats.parties.filter(p=>p.id!=='csa')}).status,'unavailable');
  assert.equal(compareFormationMembers(record,{...seats,parties:[...seats.parties,{...seats.parties[0]!,id:'duplicate'}]}).status,'unavailable');
  assert.equal(compareFormationMembers({...record,membershipDisputed:true},seats).status,'unavailable');
  for(const [key,role] of [['IND1','Member'],['DA','Unknown']] as const)
    assert.equal(compareFormationMembers({...record,parties:[...record.parties,{key,role,seats:1}]},seats).status,'unavailable');
  assert.equal(governmentPartyKey('VRYHEIDSFRONT PLUS | FREEDOM FRONT PLUS'),'FFPlus');
  assert.equal(governmentPartyKey('DEMOCRATIC ALLIANCE'),'DA');
  assert.equal(governmentPartyKey('DA'),null, 'No short-name guess');
  assert.equal(governmentPartyKey('Independent councillors (grouped)'),null);
  assert.equal(governmentPartyKey('National Coloured Congress'),null,'No unverified organisational rename');
});

test('verified government changes distinguish retention, partner governing alone and hung-to-hung change', () => {
  const before=confirmed('before-election',['ANC','CSA'],[],'ANC');
  const after=confirmed('after-election',['CSA','ANC'],[],'ANC');
  assert.equal(governmentChange(before,after).status,'retained');
  assert.equal(governmentChange({...before,leadParty:null},after).status,'retained', 'An unknown former lead party is not evidence of a change');
  assert.equal(governmentChange(before,{...after,leadParty:'CSA'}).status,'lead-party-changed');
  assert.equal(governmentChange(before,confirmed('after-election',['ANC'],[],'ANC')).status,'partner-governs-alone');
  assert.equal(governmentChange(before,confirmed('after-election',['DA','PA'],[],'DA')).status,'lead-party-changed');
  assert.equal(governmentChange(before,{...after,supporters:['EFF']}).status,'composition-changed');
  assert.equal(governmentChange(confirmed('before-election',['ANC'],['EFF'],'ANC'),confirmed('after-election',['ANC'],[],'ANC')).status,'composition-changed', 'Support changes in a single-party administration are not a former coalition partner governing alone');
  assert.equal(governmentChange(null,after).status,'unconfirmed');
  assert.equal(governmentChange(before,null).status,'unconfirmed');
  assert.deepEqual(validateVerifiedGovernments([before,after]),[before,after]);
  assert.throws(()=>validateVerifiedGovernments([before,before]),/duplicate/);
  assert.throws(()=>validateVerifiedGovernments([{...after,sources:[]}]),/evidence/);
  assert.throws(()=>validateVerifiedGovernments([{...after,members:['IND1']}]),/grouped/);
  assert.throws(()=>validateVerifiedGovernments([{...after,supporters:['ANC']}]),/duplicate/);
  assert.throws(()=>validateVerifiedGovernments([{...after,leadParty:'EFF'}]),/Lead/);
  assert.throws(()=>validateVerifiedGovernments([{...after,verifiedAt:'2026-02-31'}]),/date/);
  const baseline = compareGovernmentPartners({ ...governmentContext('1102')!, beforeElection: confirmed('before-election',['DA']) }, seats);
  assert.equal(baseline.basis,'verified-before-election');
  assert(baseline.status !== 'unavailable');
  assert.equal(baseline.total,9, 'Use verified pre-election membership rather than stale inaugural membership');
});

test('government API is independent of live storage, paginates, and supports conditional/head requests', async () => {
  const env={RESULTS_DB:null!,RAW_RESULTS:null!};
  const get=(path:string,init?:RequestInit)=>resultsApi(new Request('https://counted.co.za/api/v1/governments'+path,init),env);
  const response=await get('/EC101');
  assert.equal(response.status,200);
  const body=await response.json() as {currentStatus:string;records:unknown[]};
  assert.equal(body.currentStatus,'unverified');assert.equal(body.records.length,4);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'),'*');
  assert.equal((await get('/EC101',{headers:{'If-None-Match':response.headers.get('ETag')!}})).status,304);
  assert.equal(await (await get('/EC101',{method:'HEAD'})).text(),'');
  assert.equal((await get('/EC101',{method:'POST'})).status,405);
  assert.equal((await get('/missing')).status,404);
  const page=await (await get('?limit=1&offset=1')).json() as {total:number;municipalities:unknown[]};
  assert.equal(page.total,81);assert.equal(page.municipalities.length,1);
  assert.equal((await get('?limit=201')).status,400);
  const uncovered=await (await get('/CPT')).json() as {coverage:string;records:unknown[]};
  assert.equal(uncovered.coverage,'not-covered');assert.deepEqual(uncovered.records,[]);
});

test('dashboard context never turns a historical coalition into an election majority or verified change', () => {
  const councils=dashboardCouncils();
  const council=councils.find(c=>c.id==='1102')!;
  assert.equal(council.government!.label,'ANC + CSA');
  assert.equal(council.status,'pending');assert.equal(council.changed,false);
  const h=electionHighlights(councils);
  assert.equal(h.governmentChanges.length,0);assert.equal(h.recordedPartners.length,0);
});

test('captions and comparisons keep the pre-election, post-election and historical memberships separate',()=>{
  const context=governmentContext('1102')!;
  const before=confirmed('before-election',['DA','PA']),after=confirmed('after-election',['DA']);
  const updated={...context,beforeElection:before,afterElection:after,label:'A stale display label'};
  const comparison=governmentComparison(updated)!;
  assert.deepEqual(comparison.before!.members,['DA','PA']);
  assert.deepEqual(comparison.after!.members,['DA']);
  assert.equal(comparison.change.status,'partner-governs-alone');
  const caption=governmentCaption(updated)!;
  assert.match(caption,/Before the 2026 election \(2026-11-07\): DA \+ PA → After the 2026 election \(2026-11-01\): DA/);
  assert.doesNotMatch(caption,/stale display label|ANC \+ CSA/);
  const recorded=governmentComparison(context)!;
  assert.equal(recorded.before!.basis,'recorded');assert.equal(recorded.after,null);
  assert.equal(recorded.change.status,'unconfirmed');
  assert.match(governmentCaption(context)!,/After the 2026 election: pending/);
  assert.equal(governmentComparison(governmentContext('CPT')),null);
});

test('government change highlights exclude retention and unconfirmed comparisons',()=>{
  const council=dashboardCouncils().find(c=>c.id==='1102')!;
  assert(council.kind!=='district');
  const before=confirmed('before-election',['ANC','CSA']);
  const row=(id:string,after:VerifiedGovernment|null)=>({...council,id,government:{...council.government!,beforeElection:before,afterElection:after,change:governmentChange(before,after)}});
  const retained=row('retained',confirmed('after-election',['ANC','CSA']));
  const changed=row('changed',confirmed('after-election',['ANC']));
  const pending=row('pending',null);
  assert.deepEqual(electionHighlights([retained,changed,pending]).governmentChanges.map(c=>c.id),['changed']);
});

