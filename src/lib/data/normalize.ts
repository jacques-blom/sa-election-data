import type { Election, Source } from './catalogue.ts';
export const NORMALIZER_VERSION = 2;

type ObjectValue = Record<string, unknown>;
export type Level = 'national' | 'province' | 'municipality' | 'ward' | 'voting-district';
export type AreaRecord = {
  level: Level;
  id: string;
  provinceId: string | null;
  municipalityId: string | null;
  wardId: string | null;
  name: string;
  reportedAt: string;
  payload: ReturnType<typeof resultPayload>;
};

function object(value: unknown, label: string): ObjectValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  return value as ObjectValue;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`Missing or invalid ${label}`);
  return value;
}

function id(value: unknown, label: string): string {
  if ((typeof value !== 'number' && typeof value !== 'string') || !/^\d+$/.test(String(value))) {
    throw new Error(`Invalid ${label}`);
  }
  return String(value);
}

function number(value: unknown, label: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error(`Invalid ${label}`);
  return value;
}

function date(value: unknown): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('Invalid ReportDate');
  return new Date(value).toISOString();
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function progress(data: ObjectValue, expectedKey: string, completeKey: string) {
  const count = (value: unknown, key: string) => typeof value === 'number' && value < 0 ? null : number(value, key);
  const expected = count(data[expectedKey], expectedKey);
  const completed = count(data[completeKey], completeKey);
  // Ward/VD documents frequently contain placeholder zeros, not measured progress.
  return expected !== null && expected > 0 ? { expected, completed } : null;
}

function resultPayload(data: ObjectValue, leadingOnly: boolean, partyNames: ReadonlyMap<string, string>) {
  const parties = array(data.PartyBallotResults, 'PartyBallotResults').map((value) => {
    const party = object(value, 'party');
    if ((typeof party.ID !== 'number' && typeof party.ID !== 'string') || !/^-?\d+$/.test(String(party.ID))) {
      throw new Error('Invalid party ID');
    }
    // Other negative IDs are real historical parties (e.g. -27 is the NNP).
    const aggregate = String(party.ID) === '-2';
    const anomalies: { field: string; reported_value: number; reason: string }[] = [];
    function seats(field: string) {
      const value = party[field];
      if (typeof value === 'number' && Number.isFinite(value) && value < 0) {
        anomalies.push({ field, reported_value: value, reason: 'negative_seat_count' });
        return null;
      }
      return number(value, field);
    }
    const seatCounts = { ward: seats('WardSeatsWon'), pr: seats('PRSeatsWon'), total: seats('TotalSeatsWon') };
    const nameFromResult = typeof party.Name === 'string' && party.Name.trim() ? party.Name : null;
    const directoryName = partyNames.get(String(party.ID));
    return {
      source_entry_id: String(party.ID),
      entry_type: aggregate ? 'aggregate' as const : 'party_or_candidate' as const,
      party_id: aggregate ? null : String(party.ID),
      party_name: nameFromResult ?? directoryName ?? 'Unnamed party',
      party_name_source: nameFromResult ? 'result_file' : directoryName ? 'iec_party_directory' : 'unavailable',
      candidate_name: typeof party.CandidateName === 'string' && party.CandidateName !== '-' ? party.CandidateName : null,
      votes: {
        source_total: number(party.TotalValidVotes, 'TotalValidVotes'),
        ward: number(party.WardVotes, 'WardVotes'),
        pr: number(party.PRVotes, 'PRVotes'),
      },
      source_share_percent: number(party.PercOfVotes, 'PercOfVotes'),
      seats: seatCounts,
      ...(anomalies.length ? { source_anomalies: anomalies } : {}),
    };
  });
  const firstParty = data.PartyBallotResults instanceof Array && data.PartyBallotResults.length
    ? object(data.PartyBallotResults[0], 'party') : {};
  const registered = number(data.RegPop ?? firstParty.RegisteredVoters, 'RegisteredVoters');
  return {
    party_list_scope: leadingOnly ? 'leading_parties_only' as const : 'all_rows_in_source' as const,
    ballot_scope: 'source_combined' as const,
    parties,
    reported_totals: {
      registered_voters: registered !== null && registered > 0 ? registered : null,
      ballot_papers_cast: number(firstParty.TotalVotesCast, 'TotalVotesCast'),
      valid_ballot_papers: number(firstParty.ValidVotesCast, 'ValidVotesCast'),
      spoilt_ballot_papers: number(firstParty.SpoiltVotes, 'SpoiltVotes'),
    },
    progress: {
      municipalities: progress(data, 'MunicExpected', 'MuncipalitiesComplete'),
      wards: progress(data, 'WardExpected', 'WardsComplete'),
      voting_districts: progress(data, 'VDExpected', 'VDsComplete'),
      seats: progress(data, 'SeatsExpected', 'SeatsComplete'),
    },
  };
}

export function validateDocument(input: unknown, election: Election, source: Source): ObjectValue {
  const root = object(input, 'document');
  if (root.ElectoralEventID !== election.eventId) throw new Error(`Wrong electoral event: ${root.ElectoralEventID}`);
  date(root.ReportDate);
  array(root.PartyBallotResults, 'PartyBallotResults');
  if (source.kind === 'summary') array(root.ProvinceResults, 'ProvinceResults');
  else {
    if (id(root.MunicipalityID, 'MunicipalityID') !== source.areaId) throw new Error('Wrong municipality');
    array(root.WardResults, 'WardResults');
  }
  return root;
}

export function discoverMunicipalities(root: ObjectValue): string[] {
  const ids = new Set<string>();
  for (const value of array(root.ProvinceResults, 'ProvinceResults')) {
    const province = object(value, 'province');
    for (const entry of array(province.MunicipalityResults, 'MunicipalityResults')) {
      ids.add(id(object(entry, 'municipality').MunicipalityID, 'MunicipalityID'));
    }
  }
  return [...ids].sort((a, b) => Number(a) - Number(b));
}

export function* normalize(root: ObjectValue, source: Source, partyNames: ReadonlyMap<string, string> = new Map()): Generator<AreaRecord> {
  const reportedAt = date(root.ReportDate);
  if (source.kind === 'summary') {
    yield { level: 'national', id: 'ZA', provinceId: null, municipalityId: null, wardId: null,
      name: 'South Africa', reportedAt, payload: resultPayload(root, true, partyNames) };
    for (const value of array(root.ProvinceResults, 'ProvinceResults')) {
      const province = object(value, 'province');
      const provinceId = id(province.ProvinceID, 'ProvinceID');
      yield { level: 'province', id: provinceId, provinceId, municipalityId: null, wardId: null,
        name: text(province.Province, `Province ${provinceId}`), reportedAt: date(province.ReportDate),
        payload: resultPayload(province, true, partyNames) };
    }
    return;
  }
  const provinceId = id(root.ProvinceID, 'ProvinceID');
  const municipalityId = id(root.MunicipalityID, 'MunicipalityID');
  yield { level: 'municipality', id: municipalityId, provinceId, municipalityId, wardId: null,
    name: text(root.Municipality, `Municipality ${municipalityId}`), reportedAt, payload: resultPayload(root, false, partyNames) };
  for (const value of array(root.WardResults, 'WardResults')) {
    const ward = object(value, 'ward');
    const groupId = id(ward.WardID, 'WardID');
    // Some 2000 municipalities use a synthetic ...0000 group where no wards are defined.
    const wardId = root.WardExpected === -1 && groupId.endsWith('0000') ? null : groupId;
    if (wardId !== null) yield { level: 'ward', id: wardId, provinceId, municipalityId, wardId,
      name: `Ward ${wardId}`, reportedAt: date(ward.ReportDate), payload: resultPayload(ward, false, partyNames) };
    for (const entry of array(ward.VotingDistrictResults, 'VotingDistrictResults')) {
      const district = object(entry, 'voting district');
      const districtId = id(district.VotingDistrictID, 'VotingDistrictID');
      yield { level: 'voting-district', id: districtId, provinceId, municipalityId, wardId,
        name: `Voting district ${districtId}`, reportedAt: date(district.ReportDate), payload: resultPayload(district, false, partyNames) };
    }
  }
}
