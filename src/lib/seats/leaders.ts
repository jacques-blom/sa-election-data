// Party cameos, with an explicit Johannesburg DA override. Verified 7 November 2026.
// Sprite cells are in reading order. Keep names/sources with the art when updating.
export type CoalitionLeader = { name: string; cell: number; source: string };
export const coalitionLeaderRows = 9;
export const coalitionLeaders: Record<string, CoalitionLeader> = {
  ANC: { name: 'Cyril Ramaphosa', cell: 0, source: 'https://www.anc1912.org.za/officials/' },
  DA: { name: 'Geordin Hill-Lewis', cell: 1, source: 'https://www.da.org.za/our-people' },
  EFF: { name: 'Julius Malema', cell: 2, source: 'https://effonline.org/eff-parliament-members/' },
  MK: { name: 'Jacob Zuma', cell: 3, source: 'https://mkparty.org.za/about-mk/leadership/party-leaders/' },
  IFP: { name: 'Velenkosini Hlabisa', cell: 4, source: 'https://ifp.org.za/structures/our-leadership/' },
  PA: { name: 'Gayton McKenzie', cell: 5, source: 'https://elections.sabcnews.com/party-profile/the-patriotic-alliance/' },
  ActionSA: { name: 'Herman Mashaba', cell: 6, source: 'https://www.actionsa.org.za/herman-mashaba/' },
  'FF+': { name: 'Corné Mulder', cell: 7, source: 'https://www.vfplus.org.za/leadership/federal-management/' },
};

export const coalitionLocalLeaders: Record<string, Record<string, CoalitionLeader>> = {
  '3003': {
    DA: { name: 'Helen Zille', cell: 8, source: 'https://www.da.org.za/2025/09/i-accept-the-das-nomination-as-mayoral-candidate-for-johannesburg' },
  },
};

export function coalitionLeader(party: string, municipalityId?: string): CoalitionLeader | undefined {
  return (municipalityId ? coalitionLocalLeaders[municipalityId]?.[party] : undefined) ?? coalitionLeaders[party];
}

export function leaderSpriteStyle(cell: number): string {
  return `--sprite-y:${cell * 100 / (coalitionLeaderRows - 1)}%;--sprite-rows:${coalitionLeaderRows * 100}%`;
}
