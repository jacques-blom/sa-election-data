import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coalitionTwist, drawCoalitionRoll, gamePartyLabel } from '../src/lib/seats/game.ts';
import { matchingPoliticalHistory, politicalHistories, politicalPartyKey } from '../src/lib/seats/political-history.ts';
import { governmentParties } from '../src/lib/governance/parties.ts';
import type { CoalitionData } from '../src/lib/seats/coalition.ts';

const places = JSON.parse(readFileSync(new URL('../src/lib/places/municipalities.json', import.meta.url), 'utf8')) as {
  name: string; kind: string; province: string; geometry: { id: string };
}[];
const localHistories = politicalHistories.filter(h => h.municipalities);
const council = (municipalityId: string, names: string[]): CoalitionData => ({
  name: 'Test council', total: 23, majority: 12, status: 'reported', municipalityId,
  province: places.find(p => p.geometry.id === municipalityId)?.province,
  source: { snapshotId: 'history-test', reportedAt: '2026-11-07T10:00:00Z', url: 'https://example.com' },
  parties: names.map((short, i) => ({ id: String(i), short, name: short, seats: i === 0 ? 13 : 5,
    selectable: true, color: '#163a30' })),
});

test('local coverage reaches every metro and all nine provinces with valid municipality IDs', () => {
  const covered = new Set(localHistories.flatMap(h => h.municipalities!));
  for (const metro of places.filter(p => p.kind === 'metro')) {
    assert.ok(covered.has(metro.geometry.id), `${metro.name} has a local history`);
  }
  const provinces = new Set<string>();
  for (const id of covered) {
    const place = places.find(p => p.geometry.id === id);
    assert.ok(place, `history uses a real IEC municipality: ${id}`);
    provinces.add(place.province);
  }
  assert.equal(provinces.size, 9);
  assert.ok(covered.size >= 30);
});

test('every local episode requires its own geography and selected parties', () => {
  for (const history of localHistories) {
    const data = council(history.municipalities![0]!, history.parties);
    assert.ok(matchingPoliticalHistory(data, data.parties).some(h => h.id === history.id), history.id);
    assert.ok(!matchingPoliticalHistory({ ...data, municipalityId: 'elsewhere' }, data.parties).some(h => h.id === history.id), history.id);
    for (const party of data.parties) {
      assert.ok(!matchingPoliticalHistory(data, data.parties.filter(p => p.id !== party.id)).some(h => h.id === history.id), history.id);
    }
    assert.match(history.period, /20\d{2}/, `dated: ${history.id}`);
    assert.ok(history.sources.length && history.sources.every(s => s.label && new URL(s.url).protocol === 'https:'));
  }
});

test('real full-name party labels activate the same histories and correct departure portraits', () => {
  for (const [id, labels, story] of [
    ['3003', ['ANC', 'Al Jama-ah'], 'joburg-anc-aljama'],
    ['3040', ['ANC', 'ATM'], 'mogale-anc-atm'],
    ['5506', ['LCF', 'EFF'], 'lekwa-lcf-eff'],
    ['2219', ['MAP16', 'EFF'], 'maluti-map16-eff'],
    ['4430', ['ANC', 'ABC'], 'umvoti-anc-abc'],
    ['6603', ['DA', 'NCM'], 'nama-khoi-da-ncm'],
    ['9903', ['DA', 'CFRA'], 'cederberg-da-cfra'],
    ['9927', ['DA', 'PDC'], 'bitou-da-pdc'],
    ['9928', ['DA', 'KIM'], 'knysna-da-kim'],
    ['9922', ['ANC', 'ICOSA'], 'kannaland-anc-icosa'],
    ['1102', ['DA', 'CSA'], 'beyers-naude-da-csa'],
  ] as const) {
    const data = council(id, [...labels]);
    for (const party of data.parties) {
      const definition = Object.values(governmentParties).find(p => p.short === party.short)!;
      party.name = definition.name.toUpperCase();
      party.short = party.name; // IEC labels without a special partyStyle abbreviation.
    }
    assert.deepEqual(data.parties.map(politicalPartyKey), labels);
    assert.deepEqual(data.parties.map(gamePartyLabel), labels);
    assert.equal(matchingPoliticalHistory(data, data.parties)[0]!.id, story);
    for (const [random, actor] of [[0, 0], [0.99, 1]] as const) {
      const twist = coalitionTwist(data, ['0', '1'], `${story}:walkout`, () => random)!;
      assert.ok(twist);
      assert.equal(twist.lost, data.parties[actor]!.seats);
      assert.deepEqual(twist.affected, [{ partyId: String(actor), lost: data.parties[actor]!.seats, kind: 'exit' }]);
      assert.ok(!twist.story.includes('{actor}'));
    }
  }
  const unrelated = council('6603', ['DA', 'NCM lookalike']);
  assert.ok(!matchingPoliticalHistory(unrelated, unrelated.parties).some(h => h.id === 'nama-khoi-da-ncm'), 'no fuzzy party matching');
});

test('solo local history withdraws only half a delegation; local pairings replace national fallbacks', () => {
  for (const history of localHistories.filter(h => h.parties.length === 1)) {
    const data = council(history.municipalities![0]!, history.parties);
    const twist = drawCoalitionRoll(data, ['0'], [], () => 0).twist!;
    assert.equal(twist.history!.id, history.id);
    assert.equal(twist.lost, 7);
    assert.equal(twist.affected![0]!.kind, 'withheld');
    assert.equal(coalitionTwist(data, ['0'], `${history.id}:truce`)!.lost, 0);
  }
  const data = council('3003', ['DA', 'ActionSA']);
  const history = matchingPoliticalHistory(data, data.parties).map(h => h.id);
  assert.ok(history.includes('joburg-da-actionsa'));
  assert.ok(history.every(id => !id.startsWith('national-party-')));

});

test('a larger local deck exhausts its different histories before national or generic cards', () => {
  const data = council('3003', ['DA', 'ActionSA', 'ANC', 'Al Jama-ah', 'PA', 'EFF']);
  const ids = data.parties.map(p => p.id);
  const history = matchingPoliticalHistory(data, data.parties).filter(h => h.municipalities);
  const expected = new Set(history.flatMap(h => [`${h.id}:walkout`, `${h.id}:truce`]));
  let seen: string[] = [];
  const original = structuredClone(data);
  for (let i = 0; i < expected.size; i++) {
    const draw = drawCoalitionRoll(data, ids, seen, () => 0.63);
    assert.ok(draw.twist && expected.has(draw.twist.id));
    assert.ok(!seen.includes(draw.twist.id));
    assert.equal(draw.twist.original, 38);
    seen = draw.seen;
  }
  assert.deepEqual(new Set(seen), expected);
  assert.ok(!drawCoalitionRoll(data, ids, seen, () => 0.63).twist!.history?.municipalities);
  assert.deepEqual(data, original);
});

test('coin-toss history cannot override the game’s fixed majority threshold', () => {
  const data = council('7724', ['DA', 'EFF']);
  data.total = 28; data.majority = 15; data.parties[0]!.seats = 7; data.parties[1]!.seats = 7;
  assert.equal(drawCoalitionRoll(data, ['0', '1'], [], () => 0).twist, null);
  data.parties[0]!.seats = 8;
  const twist = coalitionTwist(data, ['0', '1'], 'modimolle-da-eff:truce')!;
  assert.equal(twist.target, 15); assert.equal(twist.remaining, 15); assert.equal(twist.spare, 0);
});
