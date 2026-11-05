export type AreaSuggestion = { name: string; description: string; url: string };

export type AreaSelection = {
  names: string[];
  types: string[];
  province?: string;
  location?: { lat: number; lng: number };
};

export type ResolvedArea = AreaSuggestion & {
  id: string;
  kind: 'country' | 'province' | 'metro' | 'municipality' | 'town' | 'suburb';
  bbox?: [number, number, number, number];
  geometry?: { level: 'province' | 'municipality' | 'town'; id: string };
};

export type AreaResolution = { area?: ResolvedArea; alternatives: ResolvedArea[] };

/** Whole areas must open area results, never inherit the ward at their centre. */
export function isWholeArea(types: readonly string[]) {
  return types.some(type => type === 'country' || type === 'locality' || type === 'postal_code'
    || type === 'neighborhood' || type === 'sublocality' || type.startsWith('sublocality_level_')
    || type.startsWith('administrative_area_level_'));
}
