import test from 'node:test';
import assert from 'node:assert/strict';
import { findPlace, places } from '../src/lib/places/catalogue.ts';
import { districts } from '../src/lib/maps/districts.ts';
import { districtMunicipalities, placeCouncilParents } from '../src/lib/places/hierarchy.ts';

test('every local council has exactly one district, while metros have none', () => {
  const members=districts.flatMap(d=>districtMunicipalities(d));
  assert.equal(members.length,205);assert.equal(new Set(members.map(p=>p.id)).size,205);
  for(const p of places.filter(p=>p.kind==='metro'||p.kind==='municipality')) {
    const parents=placeCouncilParents(p);
    assert.equal(parents.length,1,p.slug);assert.equal(parents[0]!.municipality.id,p.id);
    if(p.kind==='metro') assert.equal(parents[0]!.district,undefined);
    else assert(parents[0]!.district?.municipalitySlugs.includes(p.slug),p.slug);
  }
});

test('towns retain every municipality-to-district relationship, including cross-district and metro overlaps', () => {
  const calvinia=findPlace('calvinia')!;
  const parents=placeCouncilParents(calvinia);
  assert.equal(parents.length,1);assert.equal(parents[0]!.municipality.slug,'hantam');
  assert.equal(parents[0]!.district?.name,'Namakwa');
  const cross=structuredClone(calvinia);
  for(const slug of ['cape-town','witzenberg']) cross.relationships.push({...findPlace(slug)!.relationships[0]!,relation:'overlaps'});
  cross.relationships.push({...cross.relationships[0]!}); // Repeated evidence is not another parent.
  cross.municipalityName='Outdated display name';
  const mapped=placeCouncilParents(cross);
  assert.equal(mapped.length,3);
  assert.deepEqual(mapped.map(p=>[p.municipality.slug,p.district?.name]),[['cape-town',undefined],['hantam','Namakwa'],['witzenberg','Cape Winelands']]);
});

test('current district membership is never inferred for historical or unmapped places', () => {
  const town=structuredClone(findPlace('calvinia')!);
  assert.deepEqual(placeCouncilParents(town,2021),[]);
  town.relationships.forEach(r=>r.election=2021);
  assert.deepEqual(placeCouncilParents(town),[]);
  town.relationships=[];assert.deepEqual(placeCouncilParents(town),[]);
});
