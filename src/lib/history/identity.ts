import { partyIdByName } from '../parties/logos.ts';
import type { Result } from '../places/results.ts';

/** A named ward candidate may represent a party; independently coded people do not. */
export function comparableParty(p: Result['results']['parties'][number]) {
  return p.entry_type !== 'aggregate' && !!p.party_id && p.party_id !== '0'
    && p.party_name_source !== 'unavailable'
    && !/^(ind|independents?|independent candidates?|unnamed(?: party)?)$/i.test(p.party_name.trim())
    && (!p.candidate_name || partyIdByName(p.party_name) === p.party_id);
}
