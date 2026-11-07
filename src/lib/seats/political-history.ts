import type { CoalitionData } from './coalition.ts';
import { governmentPartyKey, partyShort } from '../governance/parties.ts';
import { localPoliticalHistories } from './local-history.ts';
import { additionalPoliticalHistories } from './relationship-history.ts';
import { partyCommentaries, partySources } from './party-commentary.ts';

export type PoliticalBackstory = {
  id: string; parties: string[];
  title: string; period: string; fact: string;
  sources: { label: string; url: string }[];
};
export type PoliticalHistory = PoliticalBackstory & {
  municipalities?: string[]; province?: string;
  publicPosition?: boolean;
  tease: string;
  walkout: { title: string; story: string };
  truce: { title: string; story: string };
};
const joburgNegotiations = { label: 'ActionSA statement · 26 Jan 2023', url: 'https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/' };
const joburgRecord = { label: 'Johannesburg council · 26 Jan 2023', url: 'https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf' };
const tshwaneWithdrawal = { label: 'ActionSA statement · 25 Sep 2024', url: 'https://www.actionsa.org.za/gauteng-in-action-25-september-2024/' };
const gnu = { label: 'Presidency · 30 Jun 2024', url: 'https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024' };
const daGnuPosition = { label: 'DA statement · 17 Jul 2024', url: 'https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists' };
const daCoalitionInterview = { label: 'Newsday interview with Helen Zille · 3 Nov 2025', url: 'https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/' };

// Dated history, not a current coalition map or a model of political reliability.
// Party statements establish what a party said, not that its accusations were true.
// {actor} is picked equally from the relevant selected partners for fictional exits.
export const politicalHistories: PoliticalHistory[] = [
  {
    id: 'da-eff-red-lines', parties: ['DA', 'EFF'], publicPosition: true,
    title: 'The campaign speeches meet the seating plan', period: 'Party positions · 2019–November 2026',
    tease: 'DA + EFF: first item on the agenda: pretend nobody remembers the campaign insults.',
    fact: 'The DA acknowledged issue-by-issue EFF support for councils after 2016. Its July 2024 GNU statement sought to keep EFF and MK out of executive power; Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. These dated statements do not establish a local agreement.',
    sources: [partySources.daEff, daGnuPosition, daCoalitionInterview, partySources.coalitionTalks2026],
    walkout: { title: 'The campaign insults enter the chat.', story: 'DA and EFF sit down to negotiate. Someone brings a folder of the insults they traded during the campaign. {actor} leaves before the folder is opened.' },
    truce: { title: 'The water pipes win this round.', story: 'DA and EFF put the old campaign insults aside and agree on the water-pipe repairs. The work plan has fewer exclamation marks. Everyone stays.' },
  },
  {
    id: 'da-mk-red-lines', parties: ['DA', 'MK'], publicPosition: true,
    title: 'The unlikely seating plan', period: 'Party positions · July 2024–November 2026',
    tease: 'DA + MK: the DA’s Helen Zille doubted this match. You’ve arranged the date.',
    fact: 'The DA’s July 2024 GNU statement sought to keep MK and EFF out of executive power. Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. That is not an announcement of a DA–MK deal.',
    sources: [daGnuPosition, daCoalitionInterview, partySources.coalitionTalks2026],
    walkout: { title: 'Enough seats. Wrong neighbour.', story: 'DA and MK approve your deal’s seat totals. Then they see they’ll be sitting next to each other. {actor} leaves before the place cards are printed.' },
    truce: { title: 'An extremely awkward group photo.', story: 'DA and MK agree on the road repairs in your fictional deal. Nobody agrees on the photo caption. Everyone stays for the work anyway.' },
  },
  {
    id: 'joburg-da-actionsa', parties: ['DA', 'ActionSA'], municipalities: ['3003'],
    title: 'The ex-coalition partners', period: 'Johannesburg · January 2023',
    tease: 'DA + ActionSA: Joburg’s coalition exes are trying again. Hide the old screenshots.',
    fact: 'DA and ActionSA were partners in Johannesburg’s governing coalition. In January 2023, ActionSA publicly criticised the DA’s coalition negotiations and proposed putting forward its own mayoral candidate.',
    sources: [joburgNegotiations, joburgRecord],
    walkout: { title: 'The coalition reunion special.', story: 'DA and ActionSA agree to start fresh. Then someone says “about last time”. {actor} leaves the deal before the group photo.' },
    truce: { title: 'The coalition exes agree on something.', story: 'DA and ActionSA put the old Joburg arguments in a folder marked “after the election”. Everyone stays. Nobody deletes the screenshots.' },
  },
  {
    id: 'tshwane-da-actionsa', parties: ['DA', 'ActionSA'], municipalities: ['3004'],
    title: 'The Tshwane sequel', period: 'Tshwane · September 2024',
    tease: 'DA + ActionSA in Tshwane: coalition exes. Same office keys, fresh trust issues.',
    fact: 'ActionSA announced its withdrawal of support from Tshwane’s DA-led coalition in September 2024. Its own statement cited the city’s finances; that was the party’s stated explanation.',
    sources: [tshwaneWithdrawal],
    walkout: { title: 'Previously, on Tshwane…', story: 'DA and ActionSA disagree over who gets the mayor’s office. {actor} leaves. The Speaker asks whether anyone kept the previous seating plan.' },
    truce: { title: 'A new season. Same cast.', story: 'DA and ActionSA agree on a council plan. The first clause: no replaying the 2024 breakup at every meeting. Everyone stays.' },
  },
  {
    id: 'tshwane-anc-actionsa', parties: ['ANC', 'ActionSA'], municipalities: ['3004'],
    title: 'The Tshwane remix', period: 'Tshwane · 9 October 2024',
    tease: 'ANC + ActionSA: ANC votes helped elect ActionSA’s Tshwane mayor. The anti-ANC speeches are on unpaid leave.',
    fact: 'ActionSA joined the August 2023 Multi-Party Charter aimed at replacing the ANC government. The ANC then backed ActionSA’s Nasiphi Moya for Tshwane mayor in October 2024. She was elected on 9 October, illustrating how local partners can differ from earlier national alignments.',
    sources: [
      partySources.charter,
      { label: 'Tshwane council minutes · 9 Oct 2024', url: 'https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997' },
      partySources.moya,
    ],
    walkout: { title: 'The mayoral credit dispute.', story: 'ANC and ActionSA both want the headline. The ribbon-cutting invitation becomes a coalition summit. {actor} leaves the deal.' },
    truce: { title: 'Both logos fit.', story: 'ANC and ActionSA agree to share the credit for fixing the roads. Two logos fit on the announcement. Everyone stays.' },
  },
  {
    id: 'joburg-da-pa', parties: ['DA', 'PA'], municipalities: ['3003'],
    title: 'The Joburg bargaining table', period: 'Johannesburg · January 2023',
    tease: 'DA + PA in Joburg: the handshake comes with a counteroffer.',
    fact: 'Talks to restore PA support for Johannesburg’s DA-led coalition broke down in January 2023. DA mayor Mpho Phalatse subsequently lost a no-confidence vote. Accounts of responsibility were disputed.',
    sources: [joburgRecord, joburgNegotiations, { label: 'SABC · 26 Jan 2023, after the vote', url: 'https://www.sabcnews.com/sabcnews/joburg-mayor-mpho-phalatse-voted-out-of-office/' }],
    walkout: { title: 'One office. Two wish lists.', story: 'DA and PA sit down to divide the council jobs. There are more wish lists than offices. {actor} withdraws its support.' },
    truce: { title: 'The office keys find their owners.', story: 'DA and PA finally agree on who does what. Even the parking bays are in writing. Everyone stays in the deal.' },
  },
  {
    id: 'joburg-anc-eff', parties: ['ANC', 'EFF'], municipalities: ['3003'],
    title: 'Opponents, then partners', period: 'Johannesburg · January 2023',
    tease: 'ANC + EFF in Joburg: enemies on the posters, colleagues at the photocopier.',
    fact: 'Johannesburg’s 2022/23 annual reporting lists both the ANC and EFF in the Government of Local Unity formed in January 2023, alongside several smaller parties.',
    sources: [{ label: 'Johannesburg annual report · 2022/23', url: 'https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf' }],
    walkout: { title: 'The joint statement has two versions.', story: 'ANC and EFF agree to issue one statement. Both send a final version. {actor} leaves after discovering the other version has already been posted.' },
    truce: { title: 'The microphones are shared.', story: 'ANC and EFF each get five minutes at the joint briefing. Somehow, everyone sticks to it. All your partners stay.' },
  },
  {
    id: 'kzn-anc-ifp', parties: ['ANC', 'IFP'], province: 'KwaZulu-Natal',
    title: 'The KwaZulu-Natal remix', period: 'KwaZulu-Natal · June 2024',
    tease: 'ANC + IFP: KZN’s old rivals now arguing over who booked the meeting room.',
    fact: 'IFP, ANC, DA and NFP formed KwaZulu-Natal’s provincial unity government in June 2024. The legislature elected IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This was provincial cooperation, not a blanket municipal agreement.',
    sources: [partySources.kzn, { label: 'SABC · 18 Jun 2024, provincial government formed', url: 'https://www.sabcnews.com/sabcnews/new-kzn-premier-calls-on-executive-to-serve-with-dignity/' }],
    walkout: { title: 'The seating plan summit.', story: 'ANC and IFP spend the first meeting negotiating the seating plan. {actor} leaves before anyone reaches the actual agenda.' },
    truce: { title: 'The double act gets to work.', story: 'ANC and IFP agree on the repairs and how residents can track progress. The minutes come with deadlines. Everyone stays in the deal.' },
  },
  {
    id: 'anc-da-gnu', parties: ['ANC', 'DA'],
    title: 'The GNU reunion', period: 'National politics · June 2024',
    tease: 'ANC + DA: the attack ads must make excellent Cabinet icebreakers.',
    fact: 'The ANC and DA joined the national Government of National Unity in June 2024. National cooperation does not establish an agreement in this municipality.',
    sources: [gnu],
    walkout: { title: 'Same rivals. Smaller meeting room.', story: 'ANC and DA draft a joint statement. The tracked changes develop tracked changes. {actor} leaves before they agree on the first sentence.' },
    truce: { title: 'Two authors. One agenda.', story: 'ANC and DA agree on the council agenda. Both claim to have written it. Everyone stays, so Madam Speaker lets that one slide.' },
  },
  {
    id: 'anc-mk-family', parties: ['ANC', 'MK'],
    title: 'The political family reunion', period: 'National politics · 2023–2024',
    tease: 'ANC + MK: Jacob Zuma’s old party meets his new one. Bring your own grudge.',
    fact: 'Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party. That history informs the reunion joke, not a prediction of this deal.',
    sources: [{ label: 'ANC membership statement · 29 Jan 2024', url: 'https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/' }],
    walkout: { title: 'The family group chat.', story: 'ANC and MK promise not to bring up the past. Someone brings up the past. {actor} leaves with its entire delegation.' },
    truce: { title: 'A truce at the family braai.', story: 'ANC and MK agree to discuss the water pipes instead of the family history. Nobody leaves. The minutes record this as progress.' },
  },
  {
    id: 'da-ff-gnu', parties: ['DA', 'FF+'],
    title: 'Same tent, separate banners', period: 'National politics · June 2024',
    tease: 'DA + FF+: the anti-ANC carpool now stops at Cabinet. The ANC is already inside.',
    fact: 'DA and FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. Both were then named as participants in the ANC-inclusive national GNU in June 2024. These national precedents do not confirm a local coalition.',
    sources: [partySources.charter, gnu],
    walkout: { title: 'The logo must be bigger.', story: 'DA and FF+ approve the joint poster. Then someone measures the logos. {actor} leaves the deal over a matter of “equal partnership”.' },
    truce: { title: 'Two logos, one pothole.', story: 'DA and FF+ agree that fixing the road can happen before agreeing on the poster. All partners stay in your deal.' },
  },
  {
    id: 'da-pa-gnu', parties: ['DA', 'PA'],
    title: 'National partners, local negotiations', period: 'National politics · June 2024',
    tease: 'DA + PA: one unity government, two parties refusing to let the other finish a sentence.',
    fact: 'The DA and PA were both named in the national GNU in June 2024. Parties can cooperate nationally while competing or bargaining differently in individual councils.',
    sources: [gnu],
    walkout: { title: 'The microphone is not a job title.', story: 'DA and PA hold a joint briefing. Both want the last word. {actor} withdraws its support and leaves the other party with the microphone.' },
    truce: { title: 'A handshake with footnotes.', story: 'DA and PA put the local deal in writing. Even the press conference has a speaking order. Everyone stays.' },
  },
  {
    id: 'ekurhuleni-anc-eff', parties: ['ANC', 'EFF'], municipalities: ['3002'],
    title: 'The East Rand reunion', period: 'Ekurhuleni · March 2024',
    tease: 'ANC + EFF in Ekurhuleni: couples’ counselling, with a Speaker and a gavel.',
    fact: 'ANC and EFF governed together in Ekurhuleni in 2023–2024. In March 2024, ANC representatives publicly threatened to end the arrangement after a disrupted council sitting. Their explanations were political claims, not an agreed account of blame.',
    sources: [{ label: 'EWN · 6 Mar 2024', url: 'https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff' }],
    walkout: { title: 'The reunion needs a referee.', story: 'ANC and EFF agree to leave the old Ekurhuleni arguments outside. The arguments get their own visitor passes. {actor} leaves the deal.' },
    truce: { title: 'The agenda reaches the last page.', story: 'ANC and EFF agree on a work plan and a deadline for reporting back to residents. This meeting earns a full stop. Everyone stays.' },
  },
  {
    id: 'bay-anc-eff', parties: ['ANC', 'EFF'], municipalities: ['1001'],
    title: 'The Bay’s musical chairs', period: 'Nelson Mandela Bay · May 2023',
    tease: 'ANC + EFF in the Bay: they brought the votes. The Northern Alliance got the mayor’s chair.',
    fact: 'In May 2023, a coalition including ANC and EFF helped replace DA mayor Retief Odendaal with Gary van Niekerk of the Northern Alliance. Van Niekerk had been council speaker. This is a historical leadership change, not today’s coalition map.',
    sources: [{ label: 'eNCA · 26 May 2023', url: 'https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor' }, { label: 'ACCORD · Bay coalition timeline', url: 'https://coalitions.accord.org.za/coalition/nelson-mandela-bay/' }],
    walkout: { title: 'The music stops. Who’s mayor?', story: 'ANC and EFF discuss the Bay’s seating plan. Someone moves the mayoral chair while the others are talking. {actor} walks out.' },
    truce: { title: 'Same mayor after lunch.', story: 'ANC and EFF agree to finish the water-services agenda before discussing the mayoral chain. The chairs stay exactly where they are.' },
  },
  {
    id: 'knysna-anc-pa', parties: ['ANC', 'PA'], municipalities: ['9928'],
    title: 'The lagoon-side breakup', period: 'Knysna · September 2023',
    tease: 'ANC + PA in Knysna: PA says hiring decisions sank the last deal. This time, that agenda item is double-underlined.',
    fact: 'In September 2023, PA councillors resigned from Knysna’s mayoral committee and the party announced its withdrawal from the ANC-led coalition. The PA linked its decision to senior appointments; that was its stated reason.',
    sources: [{ label: 'Knysna-Plett Herald · 7 Sep 2023', url: 'https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039' }],
    walkout: { title: 'The lagoon is the calm part.', story: 'ANC and PA promise a quiet Knysna meeting. Then the staff appointments item arrives. {actor} leaves before anyone reaches “any other business”.' },
    truce: { title: 'An agreement with a view.', story: 'ANC and PA agree on the staff appointments process before debating office views. The meeting ends with all partners still in the room.' },
  },
  {
    id: 'ethekwini-anc-eff', parties: ['ANC', 'EFF'], municipalities: ['4005'],
    title: 'The Durban confidence shuffle', period: 'eThekwini · 3 February 2023',
    tease: 'ANC + EFF in Durban: the EFF’s revolution can wait. The ANC mayor needs their votes.',
    fact: 'EFF councillors voted against a no-confidence motion targeting ANC mayor Mxolisi Kaunda in February 2023. The motion failed. Supporting a mayor in that vote did not by itself establish a formal coalition agreement.',
    sources: [{ label: 'TimesLIVE · 3 Feb 2023', url: 'https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/' }],
    walkout: { title: 'Confidence has left the building.', story: 'ANC and EFF agree the mayor must have everyone’s confidence. Then they name two different people. {actor} leaves the Durban deal.' },
    truce: { title: 'A point of agreement.', story: 'ANC and EFF turn a point of order into a point of agreement: publish the repair schedule. Everyone stays for the actual agenda.' },
  },
  {
    id: 'da-actionsa-charter', parties: ['DA', 'ActionSA'],
    title: 'The national pact reunion', period: 'National politics · August 2023',
    tease: 'DA + ActionSA: signed the anti-ANC pact. Kept the grudge.',
    fact: 'DA and ActionSA were among the signatories to the Multi-Party Charter in August 2023, ahead of the 2024 national and provincial elections. This was a national pact, not evidence of a deal in this council.',
    sources: [{ label: 'Multi-Party Charter · Aug 2023', url: 'https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/' }],
    walkout: { title: 'Please see the original agreement.', story: 'DA and ActionSA bring different versions of the old pact to the meeting. Both files are called FINAL. {actor} leaves before FINAL_v3 appears.' },
    truce: { title: 'One document. Two signatures.', story: 'DA and ActionSA agree on a local plan. They even sign the same version. The printer gets a standing ovation.' },
  },
  {
    id: 'da-ifp-charter', parties: ['DA', 'IFP'],
    title: 'From charter to coalition', period: 'National politics · 2023–2024',
    tease: 'DA + IFP: the anti-ANC pact took a scenic route into a government with the ANC.',
    fact: 'DA and IFP signed the August 2023 Multi-Party Charter and both joined the national GNU in June 2024. Those national arrangements do not establish a municipal coalition.',
    sources: [{ label: 'Multi-Party Charter · Aug 2023', url: 'https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/' }, gnu],
    walkout: { title: 'The small print gets bigger.', story: 'DA and IFP agree on the big picture. Who gets which council job needs another page. {actor} leaves while it is still being drafted.' },
    truce: { title: 'The fine print fits on one page.', story: 'DA and IFP approve a local agreement shorter than the meeting agenda. Everyone signs. Nobody requests a subcommittee.' },
  },
  {
    id: 'anc-pa-gnu', parties: ['ANC', 'PA'],
    title: 'The GNU bargaining room', period: 'National politics · June 2024',
    tease: 'ANC + PA: unity government is a team sport. Both have appointed themselves captain.',
    fact: 'ANC and PA were named as participants in the national GNU in June 2024. This national history does not confirm a coalition in this municipality.', sources: [gnu],
    walkout: { title: 'The handshake needs a schedule.', story: 'ANC and PA agree to share the stage at their coalition launch. Then they compare speaking times. {actor} leaves before the microphones are switched on.' },
    truce: { title: 'The deal makes it past the photo.', story: 'ANC and PA agree on who does what after the handshake. Everyone stays for the less glamorous part: the work plan.' },
  },

  ...localPoliticalHistories,
  ...additionalPoliticalHistories,
];

// Used only when there is no researched pairing for the selected combination.
// Single-party stories withhold half a delegation; they never invent a partner.
const nationalPartyHistory: PoliticalHistory[] = ['ANC', 'DA', 'EFF', 'MK', 'IFP', 'PA', 'FF+', 'ActionSA'].map(party => {
  const intro = partyCommentaries.find(h => h.parties[0] === party)!;
  return {
    id: `national-party-${party.toLowerCase().replace('+', 'plus')}`, parties: [party],
    title: intro.title, period: intro.period,
    tease: intro.comments[0]!, fact: intro.fact, sources: intro.sources,
    walkout: { title: 'One party. Two plans.', story: `${party}’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.` },
    truce: { title: 'One party. One signed plan.', story: `${party}’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.` },
  };
});

/** Match real organisations, including small parties whose display label is a full name. */
export function politicalPartyKey(party: CoalitionData['parties'][number]) {
  const key = governmentPartyKey(party.name);
  return key === 'MKP' ? 'MK' : key ? partyShort(key) : party.short;
}

export function matchingPoliticalHistory(data: CoalitionData, parties: CoalitionData['parties']) {
  const names = new Set(parties.map(politicalPartyKey));
  const pairs = politicalHistories.filter(h => h.parties.every(p => names.has(p))
    && (!h.municipalities || !!data.municipalityId && h.municipalities.includes(data.municipalityId))
    && (!h.province || h.province === data.province))
    // A dated public red line can coexist with an older local cooperation story.
    .filter((h, _, all) => h.publicPosition || h.municipalities || h.province || !all.some(other => (other.municipalities || other.province)
      && h.parties.length === other.parties.length && h.parties.every(p => other.parties.includes(p))))
    // A specific local relationship is more useful than repeating its solo backstory.
    .filter((h, _, all) => h.parties.length > 1 || !all.some(other => other.municipalities
      && other.parties.length > 1 && other.parties.includes(h.parties[0]!)))
    .sort((a, b) => Number(!!b.municipalities) - Number(!!a.municipalities) || Number(!!b.province) - Number(!!a.province));
  return pairs.length ? pairs : nationalPartyHistory.filter(h => names.has(h.parties[0]!));
}
