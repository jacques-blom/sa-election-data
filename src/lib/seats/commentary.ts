import type { CoalitionData } from './coalition.ts';
import { coalitionDeal, coalitionCommentary } from './game.ts';
import { matchingPoliticalHistory, politicalPartyKey, type PoliticalBackstory } from './political-history.ts';
import { partyCommentaries } from './party-commentary.ts';

export type SpeakerMemory = {
  key: string;
  quote: string;
  history?: PoliticalBackstory;
  historyIds: string[];
  seen: string[];
};

/** Draw on a changed deal, never on a timer or an unchanged live refresh. */
export function drawSpeakerComment(data: CoalitionData, ids: Iterable<string>, previous?: SpeakerMemory, random = Math.random): SpeakerMemory {
  const deal = coalitionDeal(data, ids);
  const key = JSON.stringify([data.municipalityId, data.province, data.total, data.majority, data.status,
    deal.parties.map(p => [p.id, p.seats]).sort((a, b) => String(a[0]).localeCompare(String(b[0])))]);
  if (previous?.key === key) return previous;
  const histories = matchingPoliticalHistory(data, deal.parties);
  const contextual = histories.map(history => ({ quote: history.tease, history }));
  const introductions = deal.parties.length === 1 ? partyCommentaries
    .filter(h => h.parties[0] === politicalPartyKey(deal.parties[0]!))
    .flatMap(history => history.comments.map(quote => ({ quote, history }))) : [];
  const general = coalitionCommentary(deal).map(quote => ({ quote, history: undefined }));
  const newPairs = contextual.filter(c => c.history.parties.length > 1 && !previous?.historyIds.includes(c.history.id));
  const newPositions = newPairs.filter(c => c.history.publicPosition);
  // React immediately when a newly completed pairing crosses a documented red line.
  // Otherwise, mix the relevant histories with seat-based commentary.
  let candidates: { quote: string; history?: PoliticalBackstory }[] = introductions.length
    ? [...introductions, ...contextual.filter(c => c.history.municipalities)]
    : newPositions.length ? newPositions : newPairs.length ? newPairs : [...contextual, ...general];
  const unseen = candidates.filter(c => !previous?.seen.includes(c.quote));
  if (unseen.length) candidates = unseen;
  else {
    const different = candidates.filter(c => c.quote !== previous?.quote);
    if (different.length) candidates = different;
  }
  const comment = candidates[Math.floor(random() * candidates.length)]!;
  return { key, ...comment, historyIds: histories.map(h => h.id), seen: [...new Set([...(previous?.seen ?? []), comment.quote])].slice(-256) };
}
