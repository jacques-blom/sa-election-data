import { coalitionSelection, type CoalitionData } from './coalition.ts';
import { matchingPoliticalHistory, politicalPartyKey, type PoliticalHistory } from './political-history.ts';

export function gamePartyLabel(party: CoalitionData['parties'][number]) {
  const short = politicalPartyKey(party);
  if (short.length <= 16) return short;
  return party.name.split(/[^\p{L}\p{N}]+/u).filter(word => word && !['OF', 'THE', 'AND'].includes(word.toUpperCase()))
    .map(word => word[0]).join('').slice(0, 10).toUpperCase();
}

/** The same seat-based rules apply to every party. These are puzzles, not forecasts. */
export function coalitionDeal(data: CoalitionData, ids: Iterable<string>) {
  const selection = coalitionSelection(data, ids);
  const majority = selection.total >= data.majority;
  const pivotal = majority ? selection.parties.filter(p => selection.total - p.seats < data.majority) : [];
  const spare = Math.max(0, selection.total - data.majority);
  const lean = majority && pivotal.length === selection.parties.length;
  const title = !selection.parties.length ? 'Some assembly required.'
    : !majority ? 'Still in the group chat.'
    : selection.parties.length === 1 ? 'The solo act.'
    : spare === 0 ? 'The one-seat tightrope.'
    : lean ? 'The marriage of inconvenience.'
    : selection.parties.length >= 5 ? 'The very big group project.' : 'The crowded table.';
  const quip = !selection.parties.length ? 'Everyone wants the mayor’s chain. Nobody wants to take the meeting notes.'
    : !majority ? `${selection.shortfall} more ${selection.shortfall === 1 ? 'seat' : 'seats'}. Time for a very principled phone call.`
    : selection.parties.length === 1 ? 'No coalition partners to blame. Your own councillors will have to improvise.'
    : spare === 0 ? 'You have the numbers. Please don’t let anyone leave the group chat.'
    : lean ? 'Every partner is essential. Everyone has noticed.'
    : selection.parties.length >= 5 ? 'One mayoral chain. A whole season of main characters.'
    : 'The press conference is booked. Has anyone read the agreement?';
  return { ...selection, majority, pivotal, spare, lean, title, quip };
}

/** Seat-based banter never mistakes a large coalition for an automatically fragile one. */
export function coalitionCommentary(deal: ReturnType<typeof coalitionDeal>, historyTease?: string): string[] {
  const count = deal.parties.length, critical = deal.pivotal.length;
  const fragility = count >= 5
    ? critical === 0 ? `${count} parties. No single exit sinks it. The egos travel separately.`
      : `${count} parties. ${critical === 1 ? 'One can' : `${critical} can each`} sink this deal. Nobody tell the negotiators.`
    : deal.spare === 0 ? 'Exactly enough seats. Nobody is allowed a dramatic exit.'
    : deal.lean ? 'Every partner counts. Keep a chair for everyone.'
    : critical === 0 ? 'No single exit sinks this deal. The group chat can still explode.'
    : `${critical === 1 ? 'One partner can' : `${critical} partners can each`} sink this deal. Check who holds the balance.`;
  const first = !deal.majority ? deal.quip : count === 1 ? deal.quip : fragility;
  const extra = !count ? 'The chairs are empty. The demands are already arriving.'
    : !deal.majority ? 'The group photo can wait. You still need the numbers.'
    : count === 1 ? 'One party. Still arguing over who gets the microphone.'
    : count >= 5 ? 'One mayoral chain. A whole committee of main characters.'
    : 'The press conference is booked. Has anyone read the agreement?';
  const referee = !count
    ? ['Order. Who’s still speaking to whom?', 'I’ve brought the agenda. They’ve brought demands.']
    : !deal.majority
      ? ['Lovely speeches. I’m still counting.', 'Fewer press statements. More seats, please.']
      : count === 1
        ? ['One party. I’m keeping the gavel.', 'A whole majority. Now watch the party argue with itself.']
        : ['You’ve agreed on the numbers. Now comes the tricky part: agreeing what to do.', deal.lean
          ? 'Even the smallest partner can bring this down. Handle with care.'
          : 'I’ll take the meeting notes. Someone else can take the credit.'];
  // Before a majority, retain the local/national history as the opening line.
  return [...new Set([!deal.majority && historyTease ? historyTease : first, historyTease, first, deal.quip, extra, ...referee].filter((line): line is string => !!line))];
}

type Random = () => number;
type Deal = ReturnType<typeof coalitionDeal>;
type Party = CoalitionData['parties'][number];
type Event = { title: string; story: string; lost: number; rule: string; affected?: { partyId: string; lost: number; kind: 'exit' | 'withheld' }[] };
type Card = { id: string; history?: PoliticalHistory; resolve: (deal: Deal, random: Random) => Event };
const seats = (n: number) => `${n} ${n === 1 ? 'seat' : 'seats'}`;
const pick = <T>(items: T[], random: Random): T => items[Math.floor(random() * items.length)]!;
const exit = (party: Party, title: string, story: string): Event => ({
  title, story, lost: party.seats, affected: [{ partyId: party.id, lost: party.seats, kind: 'exit' }], rule: `${gamePartyLabel(party)} withdraws support from ${seats(party.seats)}. Its council seats are unchanged.`,
});
function cardsFor(data: CoalitionData, deal: Deal): Card[] {
  const multi = deal.parties.length > 1;
  const cards: Card[] = [
    { id: 'rogue', resolve: () => ({ title: '“We need to consult the party.”', story: 'One councillor withholds support for an urgent party consultation. The only person consulted so far is the barista.', lost: 1, rule: 'One councillor withdraws support. Their council seat is unchanged.' }) },
    { id: 'traffic', resolve: () => ({ title: 'The diversion has a diversion.', story: 'One councillor misses the meeting after a road closure. The detour sign has developed a detour of its own.', lost: 1, rule: 'One councillor is absent: support from 1 seat is unavailable in this scenario.' }) },
    { id: 'double-booked', resolve: d => { const absent = Math.min(2, d.total); return { title: 'The ribbon-cutting clash.', story: `${absent === 1 ? 'One councillor chooses' : 'Two councillors choose'} a photo opportunity over the council meeting. The ribbon is cut. Your numbers are too.`, lost: absent, rule: `Support from ${seats(absent)} is unavailable through absence. Council seats are unchanged.` }; } },
    { id: 'committee-quarrel', resolve: (d, r) => { const p = pick(d.parties, r), lost = Math.ceil(p.seats / 2); return { title: 'The committee needs a committee.', story: `Half the ${gamePartyLabel(p)} councillors withhold support while everyone argues over who gets to lead the committees. They agree to form another committee to decide.`, lost, affected: [{ partyId: p.id, lost, kind: 'withheld' }], rule: `${gamePartyLabel(p)} withholds support from ${seats(lost)}: half its delegation, rounded up.` }; } },
    { id: 'speaker-recess', resolve: () => ({ title: 'Madam Speaker calls tea.', story: 'A tea break gives your councillors time to settle their disagreement. The biscuits are divided less successfully. Everyone stays.', lost: 0, rule: 'Everyone stays. No support lost.' }) },
    { id: 'budget-truce', resolve: () => ({ title: 'The budget finds a majority.', story: 'Your councillors agree which repairs come first and back the budget. Madam Speaker puts a tick next to “something we can actually do”.', lost: 0, rule: 'All your councillors keep supporting the deal. No support lost.' }) },
    { id: 'pothole-pact', resolve: () => ({ title: 'The pothole peace treaty.', story: 'Residents bring photos and a repair request to the meeting. Your councillors agree on a plan. Common ground turns out to need resurfacing.', lost: 0, rule: 'The deal holds together. No support lost.' }) },
    { id: 'photo-truce', resolve: () => ({ title: 'Just one more group photo.', story: 'Nobody walks out: the photographer has not finished. For one glorious moment, everyone faces the same direction.', lost: 0, rule: 'Everyone stays in the deal. No support lost.' }) },
  ];
  if (multi) cards.push(
    { id: 'small-exit', resolve: (d, r) => { const min = Math.min(...d.parties.map(p => p.seats)), p = pick(d.parties.filter(p => p.seats === min), r); return exit(p, '“It’s a matter of principle.”', `${gamePartyLabel(p)} leaves the deal. The argument was definitely not about the deputy mayor’s office. Definitely.`); } },
    { id: 'big-exit', resolve: (d, r) => { const max = Math.max(...d.parties.map(p => p.seats)), p = pick(d.parties.filter(p => p.seats === max), r); return exit(p, 'The big partner rage-quits.', `${gamePartyLabel(p)} exits the coalition WhatsApp. The others are “not panicking” at an urgent press conference.`); } },
    { id: 'random-exit', resolve: (d, r) => { const p = pick(d.parties, r); return exit(p, 'The voice note was forwarded.', `${gamePartyLabel(p)} accidentally sends the private coalition voice note to the public group. The apology is seven minutes long. Then the party leaves.`); } },
  );
  else cards.push({ id: 'caucus-split', resolve: d => ({ title: 'One party. Two group chats.', story: 'Half your party’s councillors refuse to back the deal. Both sides claim to speak for the whole party. Both have made a new group icon.', lost: Math.ceil(d.total / 2), affected: [{ partyId: d.parties[0]!.id, lost: Math.ceil(d.total / 2), kind: 'withheld' }], rule: `Half the caucus withdraws support, representing ${seats(Math.ceil(d.total / 2))}.` }) });
  for (const history of matchingPoliticalHistory(data, deal.parties)) {
    cards.push({ id: `${history.id}:walkout`, history, resolve: (d, r) => {
      const actor = pick(d.parties.filter(p => history.parties.includes(politicalPartyKey(p))), r);
      if (history.parties.length === 1) {
        const lost = Math.ceil(actor.seats / 2);
        return { ...history.walkout, story: history.walkout.story.replace('{actor}', gamePartyLabel(actor)), lost,
          affected: [{ partyId: actor.id, lost, kind: 'withheld' }], rule: `${gamePartyLabel(actor)} withholds support from ${seats(lost)}: half its delegation, rounded up.` };
      }
      return exit(actor, history.walkout.title, history.walkout.story.replace('{actor}', gamePartyLabel(actor)));
    } });
    cards.push({ id: `${history.id}:truce`, history, resolve: () => ({ ...history.truce, lost: 0, rule: 'Everyone stays. No support lost.' }) });
  }
  return cards;
}
export type CoalitionTwist = Event & {
  id: string; history?: PoliticalHistory; original: number; remaining: number; target: number;
  survived: boolean; shortfall: number; spare: number;
};
function resolveCard(card: Card, deal: Deal, target: number, random: Random): CoalitionTwist {
  const event = card.resolve(deal, random), remaining = deal.total - event.lost;
  return { ...event, id: card.id, history: card.history, original: deal.total, target, remaining,
    survived: remaining >= target, shortfall: Math.max(0, target - remaining), spare: Math.max(0, remaining - target) };
}
/** Resolve once when drawn, so a live DOM refresh never rerolls an outcome. */
export function coalitionTwist(data: CoalitionData, ids: Iterable<string>, cardId: string, random: Random = Math.random) {
  const deal = coalitionDeal(data, ids);
  if (!deal.majority) return null;
  const card = cardsFor(data, deal).find(c => c.id === cardId);
  return card ? resolveCard(card, deal, data.majority, random) : null;
}
/** One independent roll. Memory survives changes of coalition during this visit.
 * Local context takes priority over national context on its first appearance. */
export function drawCoalitionRoll(data: CoalitionData, ids: Iterable<string>, seen: string[] = [], random: Random = Math.random) {
  const deal = coalitionDeal(data, ids);
  if (!deal.majority) return { twist: null, seen };
  const cards = cardsFor(data, deal);
  let memory = [...seen], fresh = cards.filter(c => !memory.includes(c.id));
  if (!fresh.length) {
    const last = memory.at(-1);
    memory = memory.filter(id => !cards.some(c => c.id === id));
    fresh = cards.filter(c => c.id !== last);
  }
  const local = fresh.filter(c => c.history?.municipalities);
  const contextual = fresh.filter(c => c.history);
  const candidates = local.length ? local : contextual.length ? contextual : fresh;
  const card = pick(candidates, random);
  return { twist: resolveCard(card, deal, data.majority, random), seen: [...memory, card.id] };
}

/** Invalidate fictional outcomes whenever their underlying seat allocation changes. */
export function coalitionFingerprint(data: CoalitionData, ids: Iterable<string>) {
  const deal = coalitionSelection(data, ids);
  return JSON.stringify([data.source.snapshotId, data.total, data.majority, data.status, data.municipalityId, data.province,
    deal.parties.map(p => [p.id, p.seats])]);
}
