import manifest from './logos.json' with { type: 'json' };

export type PartyIdentity = { party_id: string | null; entry_type?: string };

const normalizedName = (name: string) => name.trim().replace(/\s+/g, ' ').toUpperCase();
const idsByName = new Map<string, string | null>();
for (const [id, party] of Object.entries(manifest.logos)) {
  const name = normalizedName(party.name);
  idsByName.set(name, idsByName.has(name) ? null : id);
}

/** IEC district reports omit IDs. Match only a unique full registered party name. */
export function partyIdByName(name: string): string | null {
  return idsByName.get(normalizedName(name)) ?? null;
}

/** Match the IEC ID, never an ambiguous abbreviation or a candidate's name. */
export function partyLogo(party: PartyIdentity): string | null {
  if (party.entry_type === 'aggregate' || !party.party_id || party.party_id === '0') return null;
  const logos: Record<string, { src: string }> = manifest.logos;
  return Object.hasOwn(logos, party.party_id) ? logos[party.party_id]!.src : null;
}
