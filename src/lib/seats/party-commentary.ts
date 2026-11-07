import type { PoliticalBackstory } from './political-history.ts';

export type PartyCommentary = PoliticalBackstory & { comments: string[] };
const source = (label: string, url: string) => ({ label, url });
export const partySources = {
  gnu: source('Presidency · 30 Jun 2024', 'https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024'),
  daCampaign: source('DA election manifesto · 2024', 'https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa'),
  majority: source('AP · 1 Jun 2024', 'https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91'),
  zuma: source('ANC membership statement · 29 Jan 2024', 'https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/'),
  charter: source('Joint party statement · 16 Aug 2023', 'https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/'),
  daEff: source('DA account of earlier EFF support · July 2019', 'https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power'),
  uniform: source('Sowetan · 22 May 2014', 'https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/'),
  shivambu: source('EWN · 15 Aug 2024', 'https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party'),
  mk: source('MK organisational statement · 22 Aug 2024', 'https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/'),
  kzn: source('KZN legislature minutes · 14 Jun 2024', 'https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf'),
  kznResult: source('SABC · 12 Jun 2024', 'https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/'),
  ifpEff: source('IFP account of coalition talks · January 2023', 'https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/'),
  effIfp: source('EFF statement · 29 Jan 2023', 'https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf'),
  karoo: source('SABC · 12 Apr 2022', 'https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/'),
  paOffer: source('ActionSA account of negotiations · 25 Jan 2023', 'https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/'),
  cape: source('ACCORD / Zwelethu Jolobe · Cape Town 2006', 'https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf'),
  action: source('ActionSA organisational history', 'https://www.actionsa.org.za/ready-for-action/'),
  mashaba: source('ActionSA account of Mashaba’s DA mayoralty', 'https://www.actionsa.org.za/responding-to-often-raised-issues/'),
  moya: source('The Citizen · 9 Oct 2024', 'https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/'),
  moyaRecord: source('Tshwane council minutes · 9 Oct 2024', 'https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997'),
  coalitionTalks2026: source('Daily Maverick · 6 Nov 2026', 'https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/'),
};

function story(party: string, slug: string, title: string, period: string, fact: string,
  sources: PoliticalBackstory['sources'], comments: string[]): PartyCommentary {
  return { id: `intro-${party.toLowerCase().replace('+', 'plus')}-${slug}`, parties: [party], title,
    period, fact, sources, comments };
}
const s = partySources;

// Curated satire mixes political contradictions with recognisable public personas.
// Dates, factual context and sources belong in the backstory. Comic exaggeration
// is not a reported incident; never attribute invented quotations to a real person.
// These are background stories, not claims about the selected municipality.
export const partyCommentaries: PartyCommentary[] = [
  story('ANC', 'majority', 'The majority becomes a negotiation', 'National election · May–June 2024',
    'The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.', [s.majority], [
      'ANC: lost its majority. Please select a coalition partner to continue.',
      'ANC: the majority left. The main-character energy stayed.',
      'ANC: discovering that “the people have spoken” can mean “find a roommate”.',
    ]),
  story('ANC', 'gnu', 'Eleven parties, one government', 'National government · June 2024',
    'The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.', [s.gnu], [
      'ANC: promised a smaller Cabinet. Ordered a bigger table.',
      'ANC: eleven parties sharing a government. Still acting like it owns the remote.',
      'ANC: unity government is a family meeting where everyone brought their own party.',
    ]),
  story('ANC', 'zuma', 'The former president’s new party', 'National party history · December 2023–January 2024',
    'Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.', [s.zuma], [
      'ANC: ex-president Zuma backed MK. Now the family reunion needs two sets of campaign posters.',
      'ANC: even the former president started seeing other parties.',
      'ANC: suspended ex-president Zuma for backing MK. Couldn’t cancel the comeback tour.',
    ]),
  story('DA', 'gnu', 'From opposition to cabinet colleagues', 'National government · June 2024',
    'The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.', [s.daCampaign, s.gnu], [
      'DA: spent years opposing the ANC. Then asked for a desk in the same government.',
      'DA: promised a rescue from ANC rule. The escape route led to a shared Cabinet.',
      'DA: anti-ANC speeches hit differently when the ANC joins you for Cabinet tea.',
    ]),
  story('DA', 'agriculture', 'The cabinet came with Agriculture', 'National cabinet · June 2024',
    'John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.', [s.gnu], [
      'DA: Steenhuisen became Agriculture minister in 2024. Finally, common ground he could point at.',
      'DA: Steenhuisen got the Agriculture ministry. The coalition still needs manure management.',
    ]),
  story('DA', 'eff-support', 'An earlier chapter with the EFF', 'Municipal politics · 2016–2019',
    'The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Its July 2024 GNU statement took a different position, seeking to keep EFF and MK out of executive power. Both statements are dated political positions.', [s.daEff, source('DA statement · 17 Jul 2024', 'https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists')], [
      'DA: EFF votes once helped it govern councils. Awkward footnote to the anti-EFF speeches.',
      'DA: accepted EFF council votes, opposed EFF Cabinet seats. Red lines with a municipal setting.',
    ]),
  story('EFF', 'overalls', 'The dress code enters Parliament', 'Parliament · May 2014',
    'EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.', [s.uniform], [
      'EFF: red overalls in Parliament. Even the dress code wants a speaking slot.',
      'EFF: wore red overalls to Parliament. Business casual was apparently counter-revolutionary.',
      'EFF: red overalls. Absolutely no indoor voice.',
      'EFF: rejected Parliament’s catering. Even lunch needed a revolution.',
    ]),
  story('EFF', 'kingmaker', 'Support without joining', 'Municipal politics · 2016–2019',
    'After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.', [s.daEff], [
      'EFF: helped the DA govern. Strictly no relationship status, please.',
      'EFF: helped DA councils govern without joining the coalition. Don’t tag them in photos.',
      'EFF: helped the DA govern councils. Revolutionary principles, municipal terms and conditions apply.',
    ]),
  story('EFF', 'shivambu', 'The deputy changes party', 'National party history · August 2024',
    'EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.', [s.shivambu, s.mk], [
      'EFF: wanted to take power. MK took the deputy.',
      'EFF: lost the deputy to MK. Awkward time to print matching T-shirts.',
    ]),
  story('MK', 'arrival', 'New badge, familiar president', 'National party history · December 2023–August 2024',
    'MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.', [s.mk], [
      'MK: brand-new party. Pre-owned president.',
      'MK: the ANC’s greatest hits, with ex-president Zuma back on lead vocals.',
    ]),
  story('MK', 'recruit', 'The recruitment plot twist', 'National party history · August 2024',
    'Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.', [s.shivambu, s.mk], [
      'MK: recruited the EFF’s deputy, Floyd Shivambu. The EFF got a forwarding address.',
      'MK: building a new party from other parties’ spare parts.',
    ]),
  story('MK', 'kzn', 'Most seats, different premier', 'KwaZulu-Natal · June 2024',
    'MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.', [s.kznResult, s.kzn], [
      'MK: most seats in KwaZulu-Natal. Its rivals pooled theirs and took the cake.',
      'MK: most seats in KwaZulu-Natal, but no majority. Then the other parties started adding.',
    ]),
  story('IFP', 'premier', 'The premier’s coalition arithmetic', 'KwaZulu-Natal · June 2024',
    'The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.', [s.kzn, s.kznResult], [
      'IFP: got the KwaZulu-Natal premier’s office. The coalition partners kept the spare keys.',
      'IFP: the premier’s chair came with more conditions than a cellphone contract.',
      'IFP: won KZN’s premier vote 41–39. Too tight for a tea break.',
    ]),
  story('IFP', 'cogta', 'Cooperative Governance gets literal', 'National cabinet · June 2024',
    'IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.', [s.gnu], [
      'IFP: Hlabisa got the Cooperative Governance ministry. In a coalition, even the title is wishful thinking.',
    ]),
  story('IFP', 'eff-split', 'The uMhlathuze disagreement', 'Party negotiations · January 2023',
    'IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.', [s.ifpEff, s.effIfp], [
      'IFP: after the EFF breakup, any reunion needs a mediator and separate chairs.',
    ]),
  story('PA', 'sport', 'Coalition politics becomes a team sport', 'National cabinet · June 2024',
    'PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.', [s.gnu], [
      'PA: got the Sport, Arts and Culture ministry. The coalition already had enough drama.',
      'PA: Gayton McKenzie got the sports ministry. Passing the microphone remains optional.',
    ]),
  story('PA', 'karoo', 'The Karoo before the cabinet', 'Central Karoo district · April 2022',
    'Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.', [s.karoo], [
      'PA: Gayton McKenzie became Central Karoo district mayor. His opening speech needed a bigger district.',
      'PA: took the Karoo mayoral chain. Wore it like a heavyweight belt.',
    ]),
  story('PA', 'joburg', 'The offer of two mayoral committee posts', 'Johannesburg negotiations · January 2023',
    'ActionSA said in January 2023 that it had offered two mayoral committee positions to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.', [s.paOffer], [
      'ActionSA said it offered two Joburg mayoral committee posts to win PA back in 2023. Apparently flowers wouldn’t do.',
    ]),
  story('FF+', 'corrections', 'The cabinet appointment', 'National cabinet · June 2024',
    'FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.', [s.gnu, source('FF+ leadership statement · 22 Jul 2024', 'https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/')], [
      'FF+: Freedom in the name. Prison keys in the 2024 Cabinet deal.',
      'FF+: got Correctional Services. Still can’t sentence anyone for a long speech.',
    ]),
  story('FF+', 'charter', 'From the Charter to the GNU', 'National agreements · August 2023–June 2024',
    'FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.', [s.charter, s.gnu], [
      'FF+: pledged to replace the ANC, then joined it in government. Cabinet-sized loophole.',
      'FF+: opposed the ANC, then joined it in the Cabinet carpool.',
      'FF+: joined the ANC in government. So that’s what the plus was for.',
    ]),
  story('FF+', 'speaker', 'The Cape Town prequel', 'Cape Town · March 2006',
    'FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.', [s.cape], [
      'FF+: got the Speaker’s job in Cape Town. Small party, big volume control.',
      'FF+: why win Cape Town outright when you can get the Speaker’s bell that shuts everyone up?',
    ]),
  story('ActionSA', 'origins', 'A former DA mayor starts a party', 'Party history · 2016–2020',
    'Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.', [s.action, s.mashaba, source('Johannesburg mayoral history', 'https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx')], [
      'ActionSA: founder Herman Mashaba left the DA. The arguments followed him home.',
      'ActionSA: founded by an ex-DA mayor. New party, still knows the DA’s buttons by heart.',
      'ActionSA: its founder left the DA. The breakup keeps getting renewed for another season.',
    ]),
  story('ActionSA', 'charter', 'The pact before the election', 'National party negotiations · August 2023',
    'ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.', [s.charter], [
      'ActionSA: founded by a former DA mayor. Signed a pact with the ex. What could possibly go wrong?',
    ]),
  story('ActionSA', 'tshwane', 'The mayoral remix', 'Tshwane · October 2024',
    'ActionSA’s Nasiphi Moya became Tshwane mayor on 9 October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.', [s.moyaRecord, s.moya], [
      'ActionSA: from an anti-ANC pact to ANC help winning Tshwane’s mayoralty. Sharp turn. No indicator.',
      'ActionSA: signed an anti-ANC pact, then won Tshwane’s mayoralty with ANC support. Same ambition, new supporting cast.',
    ]),
];
