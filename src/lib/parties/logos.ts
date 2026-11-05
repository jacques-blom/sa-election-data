import manifest from './logos.json' with { type: 'json' };

export type PartyIdentity = { party_id: string | null; entry_type?: string };

/** Match the IEC ID, never an ambiguous abbreviation or a candidate's name. */
export function partyLogo(party: PartyIdentity): string | null {
  if (party.entry_type === 'aggregate' || !party.party_id || party.party_id === '0') return null;
  const logos: Record<string, { src: string }> = manifest.logos;
  return Object.hasOwn(logos, party.party_id) ? logos[party.party_id]!.src : null;
}
