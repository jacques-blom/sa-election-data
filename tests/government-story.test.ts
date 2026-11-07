import test from 'node:test';
import assert from 'node:assert/strict';
import { governmentHistory, memberKeys, type VerifiedGovernment } from '../src/lib/governance/index.ts';
import { governmentStory, municipalityGovernmentStory, preElectionGovernment } from '../src/lib/governance/story.ts';

test('the latest recorded government is dated context while the new government is pending',()=>{
  const story=municipalityGovernmentStory('6605',2026)!;
  assert.deepEqual(story.points.map(p=>[p.label,p.date,p.parties.map(p=>p.short),p.arrangement]),[['Last recorded','2021-11-22',['ANC','PA'],'coalition']]);
  assert.equal(story.pending,true);
  assert.equal(story.change.status,'unconfirmed');
  const historic=municipalityGovernmentStory('6605',2021)!;
  assert.equal(historic.points[0]!.label,'After 2021');assert.equal(historic.pending,false);
  assert.equal(municipalityGovernmentStory('6605',2016),null);
});

test('2026 uses the latest administration; historical 2021 still uses the one formed then',()=>{
  const history=governmentHistory('1102')!;
  const first=history.records.find(r=>r.start.startsWith('2021'))!;
  assert.notDeepEqual(memberKeys(first),memberKeys(history.latest!));
  assert.deepEqual(governmentStory(history,2026)!.points[0]!.parties.map(p=>p.key),memberKeys(history.latest!));
  assert.deepEqual(governmentStory(history,2021)!.points[0]!.parties.map(p=>p.key),memberKeys(first));
  assert.equal(governmentStory({...history,records:history.records.filter(r=>!r.start.startsWith('2021'))},2021),null);
  const umzumbe=municipalityGovernmentStory('4404',2026)!;
  assert.deepEqual(umzumbe.points[0]!.parties.map(p=>p.key),['ANC','IFP']);
  assert.equal(umzumbe.points[0]!.date,'2024-08-06');
  assert.equal(umzumbe.pending,true);assert.equal(umzumbe.change.status,'unconfirmed');
});

test('only a separately confirmed post-election government replaces pending',()=>{
  const h=governmentHistory('6605')!;
  const after={municipalityId:'6605',election:2026 as const,phase:'after-election' as const,effectiveFrom:'2026-11-01',verifiedAt:'2026-11-07',members:['DA','PA'],supporters:['FFPlus'],arrangement:'coalition' as const,leadParty:'DA',sources:[{title:'Test minutes',url:'https://example.org/minutes'}],notes:'Test fixture'};
  const confirmed=governmentStory({...h,afterElection:after},2026)!;
  assert.equal(confirmed.pending,false);assert.deepEqual(confirmed.points[1]!.parties.map(p=>p.key),['DA','PA']);
  assert.equal(confirmed.points[1]!.label,'After election');assert.equal(confirmed.points[1]!.date,after.effectiveFrom);
  assert.equal(confirmed.change.status,'unconfirmed','An older recorded government is not a verified election-eve baseline');
  assert.equal(governmentStory({...h,afterElection:after},2021)!.points.length,1);
  assert.equal(governmentStory({...h,beforeElection:{...after,phase:'before-election'}},2026)!.pending,true);
  const afterOnly=governmentStory({...governmentHistory('CPT')!,afterElection:{...after,municipalityId:'CPT'}},2026)!;
  assert.equal(afterOnly.points.length,1);assert.equal(afterOnly.change.status,'unconfirmed');
});

test('missing or disputed history never turns election seats into a governing coalition',()=>{
  assert.equal(municipalityGovernmentStory('CPT',2026),null);
  assert.equal(governmentStory(null,2026),null);
  const h=governmentHistory('6605')!;
  assert.equal(governmentStory({...h,latest:{...h.latest!,membershipDisputed:true}},2026),null);
  assert.equal(governmentStory({...h,records:h.records.map(r=>({...r,membershipDisputed:true}))},2021),null);
  const supporter=structuredClone(h);supporter.records[0]!.parties.find(p=>p.key==='PA')!.role='Supporter';
  assert.deepEqual(governmentStory(supporter,2026)!.points[0]!.parties.map(p=>p.key),['ANC']);
  assert.deepEqual(municipalityGovernmentStory('BUF',2021)!.points[0]!.parties.map(p=>p.key),['ANC']);
});

test('council modals show the latest dated coalition, omit unknown membership and keep later context out of historical pages',()=>{
  const h=governmentHistory('george')!;
  const latest=preElectionGovernment(h,2026)!;
  assert.deepEqual(latest.parties.map(p=>p.key),['ACDP','DA','FFPlus']);
  assert.equal(latest.date,'2025-11-21');assert.equal(latest.label,'Last recorded');
  assert.match(latest.title,/Members at formation/);assert.match(latest.href,/#government$/);
  assert.equal(preElectionGovernment(h,2021),null);
  assert.equal(preElectionGovernment({...h,latest:{...h.latest!,membershipDisputed:true}},2026),null);
  assert.equal(preElectionGovernment(governmentHistory('dawid-kruiper'),2026),null);
  const before={municipalityId:h.municipality.id,election:2026 as const,phase:'before-election' as const,effectiveFrom:'2026-10-01',verifiedAt:'2026-10-31',members:['DA','PA'],supporters:['FFPlus'],arrangement:'coalition' as const,leadParty:'DA',sources:[{title:'Fixture',url:'https://example.org'}],notes:''};
  const verified=preElectionGovernment({...h,beforeElection:before,afterElection:{...before,phase:'after-election',members:['ANC']}},2026)!;
  assert.deepEqual(verified.parties.map(p=>p.key),['DA','PA']);assert.equal(verified.label,'Before election');
  assert.equal(verified.date,'2026-10-31');
});

test('actual government changes use the verified pre-election members, not the 2021 winners or latest static row',()=>{
  const h=governmentHistory('umzumbe')!;
  const before={municipalityId:h.municipality.id,election:2026 as const,phase:'before-election' as const,effectiveFrom:'2026-10-01',verifiedAt:'2026-10-31',members:['IFP','PA'],supporters:[],arrangement:'coalition' as const,leadParty:'IFP',sources:[{title:'Fixture',url:'https://example.org'}],notes:''};
  const after={...before,phase:'after-election' as const,effectiveFrom:'2026-11-06',verifiedAt:'2026-11-07'};
  const compare=(record:VerifiedGovernment)=>governmentStory({...h,beforeElection:before,afterElection:record},2026)!;
  const retained=compare(after);
  assert.deepEqual(retained.points.map(p=>p.parties.map(p=>p.key)),[['IFP','PA'],['IFP','PA']]);
  assert.equal(retained.points[0]!.label,'Before election');
  assert.equal(retained.change.status,'retained');
  assert.equal(compare({...after,members:['IFP'],arrangement:'single-party'}).change.status,'partner-governs-alone');
  assert.equal(compare({...after,leadParty:'PA'}).change.status,'lead-party-changed');
  assert.equal(compare({...after,members:['IFP','DA']}).change.status,'composition-changed');
  assert.equal(compare({...after,supporters:['EFF']}).change.status,'composition-changed');
  const minority=governmentStory({...h,beforeElection:{...before,members:['IFP'],arrangement:'minority'}},2026)!;
  assert.equal(minority.points[0]!.arrangement,'minority government');
  assert.equal(minority.pending,true);
});
