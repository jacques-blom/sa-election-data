export const ELECTIONS = [
  { year: 2000, eventId: 2, status: 'historical' },
  { year: 2006, eventId: 95, status: 'historical' },
  { year: 2011, eventId: 197, status: 'historical' },
  { year: 2016, eventId: 402, status: 'historical' },
  { year: 2021, eventId: 1091, status: 'historical' },
  { year: 2026, eventId: 1887, status: 'provisional' },
] as const;

export type Election = (typeof ELECTIONS)[number];
// Verified 2026 detail feeds omitted by LiteMapsNational on 2026-11-05.
// Keep these in discovery even if the lightweight index temporarily loses them.
export const DETAIL_DISCOVERY_SUPPLEMENTS: Record<number, readonly string[]> = {
  2026: ['4430', '4446'], // uMvoti and Inkosi uMtubatuba
};
export type Source = {
  id: string;
  year: number;
  kind: 'summary' | 'municipality';
  areaId: string;
  url: string;
};

export function sourceFor(election: Election, municipalityId?: string): Source {
  const kind = municipalityId === undefined ? 'summary' : 'municipality';
  const areaId = municipalityId ?? 'ZA';
  const filename = municipalityId === undefined ? 'LiteMapsNational' : `Munic${municipalityId}`;
  if (municipalityId !== undefined && !/^\d+$/.test(municipalityId)) {
    throw new Error('Municipality IDs must be numeric IEC IDs.');
  }
  return {
    id: `${election.year}:${kind}:${areaId}`,
    year: election.year,
    kind,
    areaId,
    url: `https://results.elections.org.za/dashboards/lge/MapsJason/${election.year}/EEID${election.eventId}${filename}.js`,
  };
}
