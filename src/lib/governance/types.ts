export type PartyRole = 'Member' | 'Supporter' | 'Opposition' | 'Unknown' | null;
export type GovernmentRecord = {
  id: string; code: string; municipalityId: string; municipality: string; province: string;
  start: string; approximateStart: boolean; end: string | null; termination: string;
  sizeType: string; coalitionType: string; transition: string | null; formalisation: string;
  totalSeats: number; majority: number; governmentSeats: number;
  parties: { key: string; role: PartyRole; seats: number }[];
  inauguralMayor: { name: string; party: string }; inauguralSpeaker: { name: string; party: string };
  inauguralDeputyMayor: { name: string; party: string };
  notes: string; issues: string[]; membershipDisputed: boolean;
  editorialCorrection?: { reviewedAt: string; originalNotes: string; originalTermination?: string; sources: { title: string; url: string }[] };
};
export type VerifiedGovernment = {
  municipalityId: string; election: 2026; phase: 'before-election' | 'after-election';
  effectiveFrom: string; verifiedAt: string; members: string[]; supporters: string[];
  arrangement: 'coalition' | 'single-party' | 'minority'; leadParty: string | null;
  sources: { title: string; url: string }[]; notes: string;
};
export type SeatSnapshot = { status: 'reported' | 'estimated'; total: number; majority: number;
  parties: { id: string; name: string; count: number }[] };

