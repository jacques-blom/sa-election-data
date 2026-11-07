import test from 'node:test';
import assert from 'node:assert/strict';
import { coalitionDeal, coalitionCommentary, coalitionFingerprint, coalitionTwist, drawCoalitionRoll } from '../src/lib/seats/game.ts';
import { matchingPoliticalHistory, politicalHistories } from '../src/lib/seats/political-history.ts';
import type { CoalitionData } from '../src/lib/seats/coalition.ts';

const data: CoalitionData = {
  name: 'Test council', total: 23, majority: 12, status: 'reported',
  source: { snapshotId: 'one', reportedAt: '2026-11-07T10:00:00Z', url: 'https://example.com' },
  parties: [10, 6, 3, 1, 1, 1, 1].map((seats, i) => ({
    id: String(i), name: `Party ${i}`, short: `P${i}`, seats, color: '#163a30', selectable: true,
  })),
};

test('a tied council is not a win; an exact majority identifies every pivotal partner', () => {
  const even = { ...data, total: 22 };
  assert.equal(coalitionDeal(even, ['0', '3']).majority, false);
  const deal = coalitionDeal(data, ['0', '3', '4']);
  assert.equal(deal.total, 12);
  assert.equal(deal.spare, 0);
  assert.equal(deal.lean, true);
  assert.deepEqual(deal.pivotal.map(p => p.id), ['0', '3', '4']);
});
test('redundant partners are distinguished from those who can sink the deal', () => {
  const deal = coalitionDeal(data, ['0', '1', '2']);
  assert.equal(deal.total, 19);
  assert.equal(deal.lean, false);
  assert.deepEqual(deal.pivotal.map(p => p.id), ['0']);
});
test('speaker commentary distinguishes a broad majority from a fragile large coalition', () => {
  const broad = coalitionDeal(data, data.parties.map(p => p.id));
  assert.equal(broad.title, 'The very big group project.');
  assert.match(coalitionCommentary(broad)[0]!, /7 parties\. No single exit sinks it/);
  const vulnerable = coalitionDeal(data, ['0', '1', '2', '3', '4']);
  assert.equal(vulnerable.pivotal.length, 1);
  assert.match(coalitionCommentary(vulnerable)[0]!, /5 parties\. One can sink this deal/);
  const lean = coalitionDeal(data, ['0', '2']);
  assert.match(coalitionCommentary(lean)[0]!, /Every partner counts/);
  const exact = coalitionDeal(data, ['0', '3', '4']);
  assert.match(coalitionCommentary(exact)[0]!, /Exactly enough seats/);
});
test('speaker keeps political backstories available without burying majority commentary', () => {
  const history = 'A dated local backstory.';
  const majority = coalitionCommentary(coalitionDeal(data, ['0', '1']), history);
  assert.notEqual(majority[0], history);
  assert.ok(majority.includes(history));
  assert.equal(new Set(majority).size, majority.length);
  assert.equal(coalitionCommentary(coalitionDeal(data, ['0']), history)[0], history);
  const solo = coalitionCommentary(coalitionDeal({ ...data, total: 15, majority: 8 }, ['0']));
  assert.ok(solo.every(line => !/partner can|parties|single exit/.test(line)), 'solo deals do not invent partners');
});
test('twists use real arithmetic, keep the fixed target and never mutate the selected deal', () => {
  const ids = new Set(['0', '2']);
  const original = structuredClone(data);
  const small = coalitionTwist(data, ids, 'small-exit')!;
  assert.equal(small.remaining, 10);
  assert.equal(small.shortfall, 2);
  assert.equal(small.survived, false);
  const large = coalitionTwist(data, ids, 'big-exit')!;
  assert.equal(large.remaining, 3);
  const rebel = coalitionTwist(data, ids, 'rogue')!;
  assert.equal(rebel.remaining, 12);
  assert.equal(rebel.survived, true, 'meeting the target exactly still survives');
  assert.deepEqual(data, original);
  assert.deepEqual([...ids], ['0', '2']);
  assert.equal(coalitionDeal(data, ids).total, 13);
});
test('single-party majorities get caucus scenarios instead of an imaginary coalition partner', () => {
  const solo = { ...data, total: 15, majority: 8 };
  assert.equal(coalitionTwist(solo, ['0'], 'caucus-split')!.lost, 5);
  assert.equal(coalitionTwist(solo, ['0'], 'breakaway'), null);
  assert.equal(coalitionTwist(solo, ['0'], 'rogue')!.remaining, 9);
  const tiny = { ...solo, total: 1, majority: 1, parties: [{ ...data.parties[0]!, seats: 1 }] };
  assert.equal(coalitionTwist(tiny, ['0'], 'traffic')!.remaining, 0);
  const absence = coalitionTwist(tiny, ['0'], 'double-booked')!;
  assert.equal(absence.lost, 1);
  assert.equal(absence.remaining, 0);
  assert.match(absence.story, /^One councillor chooses/);
  assert.match(coalitionTwist(data, ['0', '1'], 'double-booked')!.story, /^Two councillors choose/);
  assert.equal(coalitionTwist(tiny, ['0'], 'photo-truce')!.remaining, 1);
});
test('unknown IDs, duplicates and unselectable aggregates cannot inflate a score', () => {
  const aggregate = { ...data, parties: [...data.parties, { ...data.parties[0]!, id: 'ind', selectable: false }] };
  const deal = coalitionDeal(aggregate, ['unknown', '0', '0', 'ind']);
  assert.equal(deal.total, 10);
  assert.equal(coalitionTwist(aggregate, ['ind'], 'small-exit'), null);
  assert.equal(coalitionTwist(data, [], 'rogue'), null);
});
test('renaming and recolouring every party cannot affect its treatment or outcome', () => {
  const renamed = { ...data, parties: data.parties.map((p, i) => ({ ...p, name: `Other ${i}`, short: `O${i}`, color: '#fff' })) };
  for (let bits = 0; bits < 1 << data.parties.length; bits++) {
    const ids = data.parties.filter((_, i) => bits & 1 << i).map(p => p.id);
    assert.deepEqual(coalitionDeal(data, ids).pivotal.map(p => p.id), coalitionDeal(renamed, ids).pivotal.map(p => p.id));
    for (const card of ['small-exit', 'big-exit', 'random-exit', 'rogue', 'committee-quarrel', 'budget-truce']) {
      const a = coalitionTwist(data, ids, card, () => 0.3), b = coalitionTwist(renamed, ids, card, () => 0.3);
      assert.equal(a?.remaining, b?.remaining);
      assert.equal(a?.survived, b?.survived);
    }
  }
});
test('live allocation changes invalidate a twist, even if the selected total stays the same', () => {
  const ids = ['0', '1'];
  const original = coalitionFingerprint(data, ids);
  assert.equal(original, coalitionFingerprint(data, ['1', '0']));
  assert.notEqual(original, coalitionFingerprint({ ...data, source: { ...data.source, snapshotId: 'two' } }, ids));
  assert.notEqual(original, coalitionFingerprint({ ...data, majority: 13 }, ids));
  const redistributed = { ...data, parties: data.parties.map((p, i) => ({ ...p, seats: p.seats + (i === 0 ? 1 : i === 1 ? -1 : 0) })) };
  assert.notEqual(original, coalitionFingerprint(redistributed, ids));
});


test('independent rolls exhaust the applicable deck before repeating', () => {
  let seen: string[] = [];
  const cycles: string[][] = [[], []];
  let cycle = 0;
  for (let i = 0; i < 100 && cycle < 2; i++) {
    const draw = drawCoalitionRoll(data, ['0', '1'], seen, () => 0.4);
    assert.ok(draw.twist);
    assert.notEqual(draw.twist.id, seen.at(-1), 'a new cycle must not repeat the previous draw');
    if (draw.seen.length <= seen.length) cycle++;
    if (cycle < 2) cycles[cycle]!.push(draw.twist.id);
    seen = draw.seen;
    assert.equal(draw.twist.original, 16, 'each roll starts from all original seats');
  }
  assert.equal(cycle, 2, 'both cycles complete');
  assert.ok(cycles[0]!.length > 1);
  for (const cards of cycles) assert.equal(new Set(cards).size, cards.length);
  assert.deepEqual(new Set(cycles[0]), new Set(cycles[1]));
  assert.ok(cycles[0]!.includes('pothole-pact'));
  assert.ok(cycles[0]!.includes('small-exit'));
});
test('a truce keeps the original seats and an exact majority has no seats to spare', () => {
  const truce = coalitionTwist(data, ['0', '3', '4'], 'budget-truce')!;
  assert.equal(truce.original, 12); assert.equal(truce.lost, 0);
  assert.equal(truce.remaining, 12); assert.equal(truce.target, 12);
  assert.equal(truce.spare, 0); assert.equal(truce.shortfall, 0); assert.equal(truce.survived, true);
  const screenshot = coalitionTwist(data, ['0', '1', '3'], 'small-exit')!;
  assert.equal(screenshot.original, 17); assert.equal(screenshot.lost, 1);
  assert.equal(screenshot.remaining, 16); assert.equal(screenshot.spare, 4);
});
const local = (municipalityId: string, names: string[], province = 'Gauteng'): CoalitionData => ({
  ...data, municipalityId, province,
  parties: names.map((short, i) => ({ ...data.parties[i]!, short })),
});
test('DA–ActionSA history is local and only appears when both are selected', () => {
  const joburg = local('3003', ['DA', 'ActionSA']);
  assert.deepEqual(matchingPoliticalHistory(joburg, joburg.parties).map(h => h.id), ['joburg-da-actionsa']);
  assert.equal(matchingPoliticalHistory(joburg, [joburg.parties[0]!])[0]!.id, 'national-party-da');
  const elsewhere = { ...joburg, municipalityId: 'unresearched' };
  assert.deepEqual(matchingPoliticalHistory(elsewhere, elsewhere.parties).map(h => h.id), ['da-actionsa-charter']);
  const tshwane = { ...joburg, municipalityId: '3004' };
  assert.deepEqual(matchingPoliticalHistory(tshwane, tshwane.parties).map(h => h.id), ['tshwane-da-actionsa']);
});
test('local stories take precedence over the same pair’s national reference; KZN is scoped', () => {
  const joburg = local('3003', ['DA', 'PA']);
  assert.deepEqual(matchingPoliticalHistory(joburg, joburg.parties).map(h => h.id), ['joburg-da-pa']);
  assert.deepEqual(matchingPoliticalHistory({ ...joburg, municipalityId: 'unresearched' }, joburg.parties).map(h => h.id), ['da-pa-gnu']);
  const kzn = local('4005', ['ANC', 'IFP'], 'KwaZulu-Natal');
  assert.equal(matchingPoliticalHistory(kzn, kzn.parties).length, 1);
  assert.deepEqual(matchingPoliticalHistory({ ...kzn, province: 'Western Cape' }, kzn.parties).map(h => h.id), ['anc-ifp-gnu']);
});
test('first draw foregrounds relevant history and either partner can exit under the same rule', () => {
  const joburg = local('3003', ['DA', 'ActionSA']);
  const first = drawCoalitionRoll(joburg, ['0', '1'], [], () => 0);
  assert.equal(first.twist!.id, 'joburg-da-actionsa:walkout');
  const second = drawCoalitionRoll(joburg, ['0', '1'], first.seen, () => 0);
  assert.equal(second.twist!.id, 'joburg-da-actionsa:truce');
  const da = coalitionTwist(joburg, ['0', '1'], 'joburg-da-actionsa:walkout', () => 0)!;
  const asa = coalitionTwist(joburg, ['0', '1'], 'joburg-da-actionsa:walkout', () => 0.99)!;
  assert.equal(da.lost, 10); assert.equal(asa.lost, 6);
  assert.match(da.story, /DA leaves/); assert.match(asa.story, /ActionSA leaves/);
  assert.equal(coalitionTwist(joburg, ['0', '1'], 'tshwane-da-actionsa:walkout'), null);
});
test('every history has sources, a truce and a walkout with valid seat arithmetic', () => {
  assert.equal(new Set(politicalHistories.map(h => h.id)).size, politicalHistories.length);
  for (const history of politicalHistories) {
    const council = local(history.municipalities?.[0] ?? 'unresearched', history.parties, history.province ?? 'Western Cape');
    if (history.parties.length === 1) { council.total = 15; council.majority = 8; }
    assert.ok(history.sources.length);
    assert.ok(history.sources.every(s => new URL(s.url).protocol === 'https:'));
    for (const variant of ['walkout', 'truce']) {
      const twist = coalitionTwist(council, ['0', '1'], `${history.id}:${variant}`, () => 0.9)!;
      assert.ok(twist, `${history.id}:${variant}`); assert.equal(twist.original - twist.lost, twist.remaining);
      assert.equal(twist.survived, twist.remaining >= council.majority);
      assert.ok(twist.lost >= 0 && twist.remaining >= 0);
      assert.ok(!twist.story.includes('{actor}'));
    }
  }
});
test('solo decks have no partner exits and insufficient majorities cannot roll', () => {
  const solo = { ...data, total: 15, majority: 8 };
  let seen: string[] = [];
  for (let i = 0; i < 15; i++) {
    const draw = drawCoalitionRoll(solo, ['0'], seen, () => 0.9); seen = draw.seen;
    assert.ok(draw.twist && !draw.twist.id.endsWith('-exit') && !draw.twist.history);
  }
  assert.equal(drawCoalitionRoll(data, ['0']).twist, null);
});
test('visual departures identify exactly the party and seats removed', () => {
  const exit = coalitionTwist(data, ['0', '1'], 'big-exit')!;
  assert.deepEqual(exit.affected, [{ partyId: '0', lost: 10, kind: 'exit' }]);
  const partial = coalitionTwist(data, ['0', '1'], 'committee-quarrel', () => 0)!;
  assert.deepEqual(partial.affected, [{ partyId: '0', lost: 5, kind: 'withheld' }]);
  assert.equal(coalitionTwist(data, ['0', '1'], 'traffic')!.affected, undefined, 'do not invent a party for an unidentified absence');
});
test('new municipal records are scoped and override a national pairing', () => {
  for (const [id, pair, story] of [
    ['3002', ['ANC', 'EFF'], 'ekurhuleni-anc-eff'],
    ['1001', ['ANC', 'EFF'], 'bay-anc-eff'],
    ['4005', ['ANC', 'EFF'], 'ethekwini-anc-eff'],
    ['9928', ['ANC', 'PA'], 'knysna-anc-pa'],
  ] as const) {
    const council = local(id, [...pair]);
    assert.equal(matchingPoliticalHistory(council, council.parties)[0]!.id, story);
    assert.equal(drawCoalitionRoll(council, ['0', '1'], [], () => 0).twist!.history!.id, story);
  }
});
test('all eight major parties have a dated sourced fallback even in an unresearched council', () => {
  for (const party of ['ANC', 'DA', 'EFF', 'MK', 'IFP', 'PA', 'FF+', 'ActionSA']) {
    const council = { ...local('unresearched', [party]), total: 15, majority: 8 };
    const history = matchingPoliticalHistory(council, council.parties)[0]!;
    assert.ok(history && history.parties.length === 1);
    assert.match(history.period, /·.*20\d{2}/);
    assert.ok(history.sources.length > 0);
    const twist = coalitionTwist(council, ['0'], `${history.id}:walkout`)!;
    assert.equal(twist.lost, 5);
    assert.equal(twist.affected![0]!.kind, 'withheld');
    assert.ok(!twist.story.includes('{actor}'));
    assert.equal(coalitionTwist(council, ['0'], `${history.id}:truce`)!.lost, 0);
  }
  const unknown = local('unresearched', ['Unresearched Party']);
  assert.deepEqual(matchingPoliticalHistory(unknown, unknown.parties), []);
});
