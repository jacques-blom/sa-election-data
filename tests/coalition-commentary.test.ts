import test from 'node:test';
import assert from 'node:assert/strict';
import { drawSpeakerComment } from '../src/lib/seats/commentary.ts';
import { matchingPoliticalHistory } from '../src/lib/seats/political-history.ts';
import { partyCommentaries } from '../src/lib/seats/party-commentary.ts';
import type { CoalitionData } from '../src/lib/seats/coalition.ts';

const data: CoalitionData = {
  name: 'Ekurhuleni', municipalityId: '3002', province: 'Gauteng', total: 40, majority: 21, status: 'reported',
  source: { snapshotId: 'one', reportedAt: '2026-11-07T10:00:00Z', url: 'https://example.com' },
  parties: ['DA', 'EFF', 'MK', 'ANC', 'Unknown'].map((name, i) => ({ id: String(i), name, short: name,
    seats: [12, 8, 6, 10, 4][i]!, color: '#123456', selectable: true })),
};
test('new DA–EFF and DA–MK pairings immediately surface their documented public positions', () => {
  const alone = drawSpeakerComment(data, ['0'], undefined, () => 0);
  const eff = drawSpeakerComment(data, ['0', '1'], alone, () => .99);
  assert.equal(eff.history?.id, 'da-eff-red-lines');
  assert.match(eff.quote, /DA \+ EFF/);
  const mk = drawSpeakerComment(data, ['0', '1', '2'], eff, () => 0);
  assert.equal(mk.history?.id, 'da-mk-red-lines');
  assert.match(mk.quote, /DA \+ MK/);
});
test('national public positions coexist with earlier local cooperation and require both parties', () => {
  const histories = matchingPoliticalHistory(data, data.parties.slice(0, 2));
  assert.ok(histories.some(h => h.id === 'ekurhuleni-da-eff'));
  assert.ok(histories.some(h => h.id === 'da-eff-red-lines'));
  const withoutDa = matchingPoliticalHistory(data, data.parties.slice(1));
  assert.ok(withoutDa.every(h => !h.id.startsWith('da-eff') && !h.id.startsWith('da-mk')));
});
test('unchanged seat data preserves the comment across live refreshes and reordered selections', () => {
  const comment = drawSpeakerComment(data, ['0', '1'], undefined, () => 0);
  const refreshed = { ...data, source: { ...data.source, snapshotId: 'new-snapshot' } };
  assert.equal(drawSpeakerComment(refreshed, ['1', '0'], comment, () => { throw new Error('Must not redraw'); }), comment);
  const changed = { ...data, majority: 22 };
  assert.notEqual(drawSpeakerComment(changed, ['0', '1'], comment, () => 0).key, comment.key);
});
test('changed deals draw varied relevant comments and keep the selected seats immutable', () => {
  const original = structuredClone(data);
  const first = drawSpeakerComment(data, ['0', '1'], undefined, () => 0);
  const second = drawSpeakerComment(data, ['0', '1', '4'], first, () => 0);
  assert.notEqual(second.quote, first.quote, 'skip an already shown line while fresh choices remain');
  assert.equal(second.history?.id, 'ekurhuleni-da-eff', 'the alternative local history remains discoverable');
  const third = drawSpeakerComment(data, ['4'], second, () => 0);
  assert.equal(third.history, undefined, 'removed parties cannot leave behind a stale history');
  assert.deepEqual(data, original);
});

test('every featured first pick exhausts its own sourced lines before repeating', () => {
  for (const party of ['ANC', 'DA', 'EFF', 'MK', 'IFP', 'PA', 'FF+', 'ActionSA']) {
    const council = { ...data, municipalityId: 'unresearched', parties: [{ ...data.parties[0]!, name: party, short: party }] };
    const stories = partyCommentaries.filter(h => h.parties[0] === party);
    const expected = new Set(stories.flatMap(h => h.comments));
    assert.ok(stories.length >= 2 && expected.size >= 2, `${party} has distinct sourced hooks`);
    let memory: ReturnType<typeof drawSpeakerComment> | undefined;
    const shown = new Set<string>();
    for (let i = 0; i < expected.size; i++) {
      memory = drawSpeakerComment(council, ['0'], memory, () => 0);
      assert.ok(expected.has(memory.quote), `${party} never gets a generic first-pick line`);
      assert.ok(!shown.has(memory.quote), `${party} avoids repeats before exhaustion`);
      const story = stories.find(h => h.comments.includes(memory!.quote))!;
      assert.equal(memory.history, story, 'source disclosure follows the exact joke');
      assert.match(story.period, /20\d{2}/);
      assert.ok(story.sources.length > 0);
      shown.add(memory.quote);
      memory = drawSpeakerComment(council, [], memory, () => 0);
    }
    assert.deepEqual(shown, expected);
    assert.ok(expected.has(drawSpeakerComment(council, ['0'], memory, () => .5).quote), 'exhaustion can safely repeat');
  }
});

test('a local first-pick story remains available alongside the national introduction bank', () => {
  const mangaung = { ...data, municipalityId: '2207', province: 'Free State', parties: [{ ...data.parties[0]!, short: 'ANC', name: 'ANC' }] };
  const comment = drawSpeakerComment(mangaung, ['0'], undefined, () => .999);
  assert.equal(comment.history?.id, 'mangaung-anc-caucus');
  assert.ok(comment.quote.includes('Mangaung'));
});

test('other documented tensions surface immediately and lose relevance when a partner leaves', () => {
  const council = { ...data, municipalityId: 'unresearched', parties: ['EFF', 'FF+', 'MK'].map((name, i) => ({
    ...data.parties[i]!, id: String(i), short: name, name,
  })) };
  const eff = drawSpeakerComment(council, ['0'], undefined, () => 0);
  const ff = drawSpeakerComment(council, ['0', '1'], eff, () => 0);
  assert.equal(ff.history?.id, 'eff-ff-gnu-terms');
  const mk = drawSpeakerComment(council, ['1', '2'], ff, () => 0);
  assert.equal(mk.history?.id, 'mk-ff-policy-gap');
  const alone = drawSpeakerComment(council, ['2'], mk, () => 0);
  assert.deepEqual(alone.history?.parties, ['MK']);
});
