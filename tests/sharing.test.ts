import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { resultFromRow } from '../src/lib/places/results.ts';
import { resultShareCard } from '../src/lib/sharing/results.ts';
import { coalitionShareCard } from '../src/lib/seats/share-image.ts';
import { imageDescription, publicShareUrl, shareCaption } from '../src/lib/sharing/model.ts';
import { shareImage } from '../src/lib/sharing/actions.ts';

function stubGlobal(t: TestContext, name: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, name, original);
    else Reflect.deleteProperty(globalThis, name);
  });
}

function result(votes: (number | null)[] = [60, 40]) {
  return resultFromRow({ year: 2026, level: 'municipality', area_id: '1', name: 'Example', municipality_id: '1',
    snapshot_id: 'one', reported_at: '2026-11-05T12:00:00Z', url: 'https://results.elections.org.za',
    last_checked_at: new Date().toISOString(), last_success_at: new Date().toISOString(), last_error: null,
    payload: JSON.stringify({ party_list_scope: 'all_rows_in_source',
      parties: votes.map((v, i) => ({ source_entry_id: String(i), party_id: String(i + 1),
        party_name: ['AFRICAN NATIONAL CONGRESS', 'DEMOCRATIC ALLIANCE'][i], entry_type: 'party_or_candidate',
        votes: { pr: v, ward: null, source_total: v }, seats: { ward: null, pr: null, total: null } })),
      progress: { voting_districts: { completed: 7, expected: 10 } }, reported_totals: { valid_ballot_papers: 100 } }),
  });
}

test('result images preserve the selected ballot and distinguish a live lead from a win', () => {
  const card = resultShareCard(result(), 'Example', 'pr');
  assert.equal(card.headline, 'ANC leads so far.');
  assert.equal(card.metric, '60.0%');
  assert.equal(card.ballot, 'Municipal PR votes');
  assert.equal(card.total, 100);
  assert.deepEqual(card.progress, { completed: 7, expected: 10, percent: 70 });
  assert.match(card.note, /Provisional/);
  const accessible = imageDescription(card);
  assert.match(accessible, /14:00 SAST/);
  assert.match(accessible, /7 of 10 districts reporting/);
  assert.match(accessible, /100 valid ballots/);
  assert(card.caption.length < 200);
  assert.doesNotMatch(card.caption, /snapshot|Source:|winner/i);
});

test('partial summaries retain the full denominator and label the highest shown share', () => {
  const data = result([30, 20]); data.level = 'province';
  data.results.party_list_scope = 'leading_parties_only';
  const card = resultShareCard(data, 'Example province');
  assert.equal(card.metric, '30.0%');
  assert.equal(card.headline, 'The count so far.');
  assert.match(card.metricLabel, /highest shown/);
  assert.match(card.note, /Provisional.*Selected parties only/);
  assert.match(card.caption, /Selected parties only/);
  assert.equal(card.parties[1]!.share, 20);
});

test('ties, missing figures, empty ballots and aggregate rows never become a named leader', () => {
  const tied = resultShareCard(result([50, 50]), 'Example', 'pr');
  assert.equal(tied.headline, 'Level at the top.');
  assert.equal(tied.metric, '50.0%');
  const missing = resultShareCard(result([60, null]), 'Example', 'pr');
  assert.equal(missing.metric, '—');
  assert.equal(missing.total, null);
  assert(missing.parties.every(p => p.share === null));
  const zero = resultShareCard(result([0, 0]), 'Example', 'pr');
  assert.equal(zero.headline, 'Awaiting the first votes.');
  assert.equal(zero.metric, '—');
  const aggregate = result(); aggregate.results.parties[0]!.entry_type = 'aggregate';
  assert.equal(resultShareCard(aggregate, 'Example', 'pr').headline, 'The count so far.');
});

test('historical cards keep their election year and do not label old results as delayed', () => {
  const data = result(); data.year = 2021; data.source.successfulAt = '2021-11-01T00:00:00Z';
  const card = resultShareCard(data, 'Example', 'pr');
  assert.equal(card.year, 2021);
  assert.doesNotMatch(card.note, /delayed/);
});

test('coalition cards count every council seat and keep the selection hypothetical', () => {
  const data = { name: 'Example council', status: 'estimated' as const, total: 10, majority: 6,
    source: { url: 'https://results.elections.org.za', reportedAt: '2026-11-05T12:00:00Z', snapshotId: 'one' },
    parties: [
      { id: 'a', name: 'A', short: 'A', color: '#123456', seats: 5, selectable: true },
      { id: 'b', name: 'B', short: 'B', color: '#abcdef', seats: 4, selectable: true },
      { id: 'ind', name: 'Independents', short: 'IND', color: '#999999', seats: 1, selectable: false },
    ],
  };
  const card = coalitionShareCard(data, ['a', 'ind', 'unknown']);
  assert.equal(card.metric, '5');
  assert.equal(card.headline, '1 seat short.');
  assert.equal(card.council!.groups.reduce((sum, p) => sum + p.seats, 0), 10);
  assert.equal(card.council!.groups[2]!.selected, false);
  assert.match(card.ballot, /Hypothetical.*estimated/);
  assert.match(card.note, /No agreement implied/);
  assert.equal(coalitionShareCard(data, ['a', 'b']).headline, 'A possible majority.');
});

test('share links allow only public ballot and coalition selections, with one URL in the caption', () => {
  const url = publicShareUrl('https://counted.co.za/2026/places/example?address=private&lat=-33&q=search#ward', 'ward');
  assert.equal(url, 'https://counted.co.za/2026/places/example?ballot=ward');
  assert.equal(publicShareUrl('https://counted.co.za/2026/places/example/coalition?parties=1,2&address=private'), 'https://counted.co.za/2026/places/example/coalition?parties=1%2C2');
  const text = shareCaption(resultShareCard(result(), 'Example', 'ward'), url);
  assert.equal(text.split(url).length, 2);
  assert.doesNotMatch(text, /address=|lat=|q=/);
});

test('WhatsApp uses the prepared PNG and caption through native file sharing', async t => {
  let shared: unknown;
  stubGlobal(t, 'navigator', { canShare: () => true, share: async (data: unknown) => { shared = data; } });
  const file = new File(['png'], 'counted.png', { type: 'image/png' });
  assert.equal(await shareImage(file, 'A short caption', 'Counted', true), 'native');
  assert.deepEqual(shared, { files: [file], title: 'Counted', text: 'A short caption' });
});

test('WhatsApp web fallback downloads the PNG and opens a caption-only composer', async t => {
  const links: { href: string; download: string; clicked: boolean; click(): void }[] = [];
  let opened: unknown[] = [];
  stubGlobal(t, 'navigator', { canShare: () => false });
  stubGlobal(t, 'document', { createElement: () => {
    const link = { href: '', download: '', clicked: false, click() { this.clicked = true; } }; links.push(link); return link;
  } });
  stubGlobal(t, 'window', { open: (...args: unknown[]) => { opened = args; } });
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const file = new File(['png'], 'counted.png', { type: 'image/png' });
  assert.equal(await shareImage(file, 'Short & simple\nhttps://counted.co.za/', 'Counted', true), 'whatsapp');
  assert.equal(links[0]!.download, 'counted.png');
  assert.equal(links[0]!.clicked, true);
  assert.match(links[0]!.href, /^blob:/);
  assert.deepEqual(opened, ['https://wa.me/?text=Short%20%26%20simple%0Ahttps%3A%2F%2Fcounted.co.za%2F', '_blank', 'noopener,noreferrer']);
});

test('cancelling the device share menu does not download or open WhatsApp', async t => {
  const cancellation = new DOMException('Cancelled', 'AbortError');
  stubGlobal(t, 'navigator', { canShare: () => true, share: async () => { throw cancellation; } });
  await assert.rejects(shareImage(new File(['png'], 'image.png'), 'Caption', 'Counted', true), { name: 'AbortError' });
});
