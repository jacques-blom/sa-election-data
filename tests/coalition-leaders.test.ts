import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coalitionLeader, coalitionLeaders } from '../src/lib/seats/leaders.ts';

const municipalities = JSON.parse(readFileSync(new URL('../src/lib/places/municipalities.json', import.meta.url), 'utf8')) as { slug: string; geometry: { id: string } }[];
const municipality = (slug: string) => municipalities.find(p => p.slug === slug)!.geometry.id;

test('Johannesburg uses Helen Zille for DA while other councils retain GHL', () => {
  assert.equal(coalitionLeader('DA', municipality('johannesburg'))?.name, 'Helen Zille');
  for (const slug of ['cape-town', 'ekurhuleni', 'tshwane', 'witzenberg']) {
    assert.equal(coalitionLeader('DA', municipality(slug))?.name, 'Geordin Hill-Lewis');
  }
  assert.equal(coalitionLeader('DA')?.name, 'Geordin Hill-Lewis');
});

test('a municipal cameo does not replace other parties or missing-art fallbacks', () => {
  for (const party of Object.keys(coalitionLeaders).filter(p => p !== 'DA')) {
    assert.equal(coalitionLeader(party, municipality('johannesburg')), coalitionLeaders[party]);
  }
  assert.equal(coalitionLeader('unillustrated-party', municipality('johannesburg')), undefined);
});
