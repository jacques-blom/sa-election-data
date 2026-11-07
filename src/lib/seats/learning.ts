import type { CoalitionData } from './coalition.ts';
import { gamePartyLabel, type CoalitionTwist } from './game.ts';

export type CoalitionLesson = { id: string; title: string; text: string; href: string; linkLabel: string };
const seats = (n: number) => `${n} ${n === 1 ? 'seat' : 'seats'}`;

/** Explain the resolved draw; never reroll it or infer a party's political reliability. */
export function coalitionLesson(data: CoalitionData, twist: CoalitionTwist): CoalitionLesson {
  const guide = { href: '/guide#outcomes', linkLabel: 'How council majorities work' };
  if (twist.id === 'budget-truce') return {
    id: 'budget', title: 'A majority has work to do',
    text: 'A council also decides how public money is spent. Its budget needs support from a majority of all council members, not just the largest party.',
    href: '/participate#budgets', linkLabel: 'How to have a say on the budget',
  };
  if (twist.id === 'pothole-pact') return {
    id: 'residents', title: 'Residents have a part to play',
    text: 'In this story, residents give the parties a reason to cooperate. In real life, you can raise local priorities through ward meetings and comments on municipal plans.',
    href: '/participate#priorities', linkLabel: 'Ways to raise a local priority',
  };
  if (twist.id === 'traffic' || twist.id === 'double-booked') return {
    id: 'attendance', title: 'Attendance and support are different',
    text: `This roll leaves ${seats(twist.remaining)} supporting your deal against the fixed ${twist.target}-seat game target. Real council votes also have quorum and voting rules; an absence does not remove an elected seat.`,
    href: '/participate#decisions', linkLabel: 'How council decisions work',
  };
  if (twist.lost === 0) return {
    id: 'cooperation', title: 'Agreement needs more than numbers',
    text: `All ${seats(twist.original)} still support your deal. The numbers show a possible majority; a real governing agreement also needs people to agree on decisions and responsibilities.`,
    ...guide,
  };
  if (twist.affected?.some(effect => effect.kind === 'withheld')) return {
    id: 'caucus', title: 'A party can split on a vote',
    text: 'Councillors from the same party can disagree on a vote and may face party discipline. Losing half a delegation’s support is a fictional game rule, not a prediction. Their elected seats stay unchanged in this roll.',
    href: '/participate#caucuses', linkLabel: 'Real examples of a caucus split',
  };
  if (twist.survived) return {
    id: 'cushion', title: twist.spare === 0 ? 'Your cushion is used up' : 'Extra support gave you a cushion',
    text: `Your deal started ${seats(twist.original - twist.target)} above the target. After losing support from ${seats(twist.lost)}, it still reaches ${twist.target}${twist.spare === 0 ? ', with none to spare' : `, with ${twist.spare} to spare`}.`,
    ...guide,
  };
  const exit = twist.affected?.find(effect => effect.kind === 'exit');
  const party = exit && data.parties.find(p => p.id === exit.partyId);
  if (party) return {
    id: 'pivotal', title: 'A key partner has bargaining power',
    text: `${gamePartyLabel(party)} held ${seats(party.seats)} in your deal. Without its support, you have ${twist.remaining} of the ${twist.target} needed.${party.seats < data.majority ? ' A partner can be decisive without holding a majority on its own.' : ' A deal depends on who continues to support it.'}`,
    ...guide,
  };
  return {
    id: 'support', title: 'Seats do not guarantee support',
    text: `Your deal began with ${seats(twist.original)}, but only ${twist.remaining} support it in this scenario. Withholding support changes this deal's numbers, not the council's election result.`,
    ...guide,
  };
}
