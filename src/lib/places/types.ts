export type Place = {
  id: string; slug: string; name: string; kind: 'metro' | 'municipality' | 'town' | 'suburb';
  province: string; aliases: string[]; description: string; indexable: boolean;
  bbox?: [number,number,number,number];
  geometry?: { level: 'town' | 'municipality'; id: string };
  municipalityName?: string;
  relationships: { election: number; level: 'municipality' | 'ward'; areaId: string;
    relation: 'equals' | 'within' | 'overlaps'; boundaryVersion: string; method: string }[];
  boundaryContext?: { notes: string[]; method: string; map?: string };
  sources: { label: string; url: string }[];
};
