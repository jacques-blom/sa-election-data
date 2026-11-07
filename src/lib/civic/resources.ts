import directory from './municipal-directory.json' with { type: 'json' };
import type { Place } from '../places/types.ts';
import { mapLink } from '../maps/config.ts';

export type CivicLink = { url: string; label: string; checkedAt: string; note: string; validThrough?: string };
type LocalResources = { meetings?: CivicLink; participation?: CivicLink };
const checkedAt = '2026-11-07';
const link = (url: string, label: string, note: string): CivicLink => ({ url, label, note, checkedAt });

/** Reviewed destination pages, not a feed of currently open consultations.
 * Use persistent indexes; never label an old document's deadline as an open opportunity.
 * Evidence is the linked municipal page itself. See docs/civic-participation.md.
 */
export const localCivicResources: Record<string, LocalResources> = {
  johannesburg: {
    participation: { ...link('https://joburg.org.za/Pages/2026-Notices/2026-Notices.aspx', 'View public notices', 'Look for IDP, budget and public-comment notices. Check the year and closing date on each notice.'), validThrough: '2026-12-31' },
  },
  'cape-town': {
    participation: link('https://www.capetown.gov.za/city-connect/have-your-say/', 'Explore Have your say', 'Choose a consultation, survey or submission topic. Read its notice to check the deadline and how to take part.'),
  },
  tshwane: {
    participation: link('https://www.tshwane.gov.za/?page_id=6652', 'View public participation notices', 'Browse the City’s public participation documents and check the closing date for the topic you choose.'),
  },
  ekurhuleni: {
    meetings: link('https://www.ekurhuleni.gov.za/my-council/public-notices/', 'View public notices', 'Look for meeting notices and agendas. Confirm the date and arrangements with the municipality.'),
    participation: link('https://www.ekurhuleni.gov.za/idp/', 'Explore the IDP and budget', 'Read the plan and budget, then check the consultation period. Published comment forms may relate to a closed consultation.'),
  },
  ethekwini: {
    participation: link('https://www.durban.gov.za/pages/government/documents?d=Public+Notices', 'View public notices', 'Select the relevant year and check the notice for the subject, submission method and deadline.'),
  },
  hantam: {
    meetings: link('https://www.hantam.gov.za/documents/', 'Browse council documents', 'Open “Council_Meetings” for meeting documents. Check the date and confirm public attendance arrangements.'),
    participation: link('https://www.hantam.gov.za/documents/', 'Browse IDP and budget documents', 'Open “IDP/Budget” and “Notices” for plans and participation notices. Check which consultation period they cover.'),
  },
  witzenberg: {
    participation: link('https://www.witzenberg.gov.za/resource-category/general-documents-notices', 'View municipal notices', 'Browse IDP, budget and planning notices. Check the closing date and how the municipality accepts comments.'),
  },
  'city-of-mbombela': {
    participation: link('https://www.mbombela.gov.za/city-services/', 'Read the participation guide', 'Read the City’s public participation guidance, then ask the municipal office about meetings and current consultations.'),
  },
  polokwane: {
    participation: link('https://www.polokwane.gov.za/news/', 'View news and public notices', 'Look for public participation notices and check the relevant dates and submission instructions.'),
  },
};

export const councillorDirectory: CivicLink = link(
  'https://www.elections.org.za/pw/Voter/Who-Is-My-Ward-Councillor',
  'Find a councillor on the IEC website',
  'National lookup. Confirm the ward boundaries, council term and contact details with the municipality, especially after an election.',
);

export function civicResources(place: Pick<Place, 'slug' | 'name'>, now = new Date()) {
  const records: Record<string, { name: string; url: string }> = directory.records;
  const record = records[place.slug];
  const contact: CivicLink = {
    url: record?.url ?? directory.sourceUrl,
    label: record ? 'Municipal contact details' : 'Find municipal contact details',
    checkedAt: directory.checkedAt,
    note: record ? 'Official government directory. Ask for the Speaker’s office or public participation unit.'
      : 'National government directory. Choose your province and municipality, or ask the provincial office for help.',
  };
  // A stale deep link falls back to guidance and the official contact directory.
  // This is not a claim that a consultation is currently open.
  const current = (resource?: CivicLink) => {
    if (!resource) return undefined;
    const age = now.getTime() - Date.parse(`${resource.checkedAt}T00:00:00Z`);
    if (age < 0 || age > 180 * 86_400_000) return undefined;
    if (resource.validThrough && now.getTime() > Date.parse(`${resource.validThrough}T23:59:59+02:00`)) return undefined;
    return resource;
  };
  const local = localCivicResources[place.slug];
  return {
    wardUrl: mapLink(place.slug),
    guideUrl: `/participate?place=${encodeURIComponent(place.slug)}`,
    contact, localContact: !!record,
    meetings: current(local?.meetings), participation: current(local?.participation),
  };
}
