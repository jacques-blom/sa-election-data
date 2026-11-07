import type { PoliticalHistory } from './political-history.ts';
import { partySources as s } from './party-commentary.ts';

// Final eight-party pairing audit, 7 November 2026. Shared national membership
// establishes a precedent, never a municipal pact or a compatibility score.
const gnuPairs = [
  ['anc-ifp-gnu', 'ANC', 'IFP', 'Separate parties, shared cabinet', 'ANC + IFP: old rivals, shared Cabinet. The polite smiles must hurt.'],
  ['anc-ff-gnu', 'ANC', 'FF+', 'The unexpected cabinet colleagues', 'ANC + FF+: former opponents, Cabinet colleagues. The old campaign posters have requested a transfer.'],
  ['ifp-pa-gnu', 'IFP', 'PA', 'Governance meets Sport', 'IFP + PA: IFP’s Hlabisa got Cooperative Governance. PA’s Gayton got Sport. They still need a referee.'],
  ['ifp-ff-gnu', 'IFP', 'FF+', 'From the pact to the cabinet', 'IFP + FF+: signed an anti-ANC pact. Then joined a Cabinet with the ANC. Please update the lanyards.'],
  ['pa-ff-gnu', 'PA', 'FF+', 'Two very different portfolios', 'PA + FF+: Sport meets the prisons portfolio. Extra time has two meanings.'],
];
const charterPairs = [
  ['ifp-actionsa-charter', 'IFP', 'ActionSA', 'IFP + ActionSA: signed an anti-ANC pact. Later worked with the ANC. Please face the camera.'],
  ['ff-actionsa-charter', 'FF+', 'ActionSA', 'FF+ + ActionSA: anti-ANC pact, then ANC partners. The old group photo needs a new caption.'],
];

export const additionalPoliticalHistories: PoliticalHistory[] = [
  ...gnuPairs.map(([id, a, b, title, tease]) => ({
    id: id!, parties: [a!, b!], title: title!, tease: tease!, period: 'National government · June 2024',
    fact: `${a} and ${b} were named as participants in the national GNU in June 2024.${id === 'ifp-pa-gnu' ? ' IFP’s Velenkosini Hlabisa received Cooperative Governance and Traditional Affairs; PA’s Gayton McKenzie received Sport, Arts and Culture.' : id === 'pa-ff-gnu' ? ' PA’s Gayton McKenzie received Sport, Arts and Culture; FF+’s Pieter Groenewald received Correctional Services.' : id === 'ifp-ff-gnu' ? ' IFP and FF+ had also joined the August 2023 Charter talks aimed at replacing the ANC government.' : ''} This does not establish a local coalition.`,
    sources: id === 'ifp-ff-gnu' ? [s.gnu, s.charter] : [s.gnu],
    walkout: { title: 'The national handshake needs a local sequel.', story: `${a} and ${b} bring a photo of their national unity government. It does not say who gets the local mayor’s office. {actor} leaves to renegotiate.` },
    truce: { title: 'The local sequel gets a happy ending.', story: `${a} and ${b} agree on the road repairs before the press conference. Both can take a photo with the same repaired road. Everyone stays.` },
  })),
  ...charterPairs.map(([id, a, b, tease]) => ({
    id: id!, parties: [a!, b!], title: 'The pre-election pact returns', period: 'National party negotiations · August 2023',
    tease: tease!,
    fact: `${a} and ${b} participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, ${a} joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.`,
    sources: [s.charter, s.gnu, s.moyaRecord, s.moya],
    walkout: { title: 'The old pact gets new demands.', story: `${a} and ${b} open the old agreement. Each has brought a different updated version. {actor} leaves before they agree which one to read.` },
    truce: { title: 'The reunion finishes its homework.', story: `${a} and ${b} agree on the road repairs and put deadlines in writing. Everyone stays. The calendar has joined the coalition.` },
  })),
  {
    id: 'eff-mk-transfer', parties: ['EFF', 'MK'], title: 'The transfer-window reunion', period: 'National party history · August 2024',
    tease: 'EFF + MK: Floyd Shivambu moved from EFF to MK. Please date the group photos.',
    fact: 'EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This dated leadership transfer is a backstory, not his current role or proof of a local alliance.',
    sources: [s.shivambu, s.mk],
    walkout: { title: 'The group photo needs a date.', story: 'EFF and MK agree to look forward. Someone brings a group photo from before Floyd Shivambu left EFF for MK. {actor} leaves before the introductions are finished.' },
    truce: { title: 'The reunion skips the awkward bit.', story: 'EFF and MK put the old party badges away and agree on the water repairs. Everyone stays. Questions about who joined whom can wait.' },
  },
  {
    id: 'eff-ifp-breakup', parties: ['EFF', 'IFP'], title: 'The mayoral-chair breakup', period: 'Party negotiations · January 2023',
    tease: 'EFF + IFP: last time, there was a row over uMhlathuze’s mayor’s job. This time, hide the chair.',
    fact: 'IFP and EFF accounts describe the end of their cooperation in January 2023. The IFP said it declined an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their accounts of responsibility differed. National negotiations concerned particular councils, not every municipality.',
    sources: [s.ifpEff, s.effIfp],
    walkout: { title: 'About that mayoral chair…', story: 'EFF and IFP agree the past is behind them. The first agenda item is who gets the mayoral chair. {actor} leaves with a strong sense of déjà vu.' },
    truce: { title: 'A different chair, a different ending.', story: 'EFF and IFP agree who chairs the meeting and which roads get repaired. Nobody reopens the old fight over who gets the mayor’s job. Everyone stays.' },
  },
  {
    id: 'eff-ff-gnu-terms', parties: ['EFF', 'FF+'], publicPosition: true,
    title: 'The GNU guest-list dispute', period: 'Party positions · June 2024 / November 2026',
    tease: 'EFF + FF+: almost the same initials. Different planets.',
    fact: 'In June 2024, the EFF said it would not join a GNU containing DA or FF+. By 6 November 2026, Daily Maverick reported treasurer-general Omphile Maotwe saying the party would not exclude potential partners on principle, while requiring agreement on a socialist programme. Positions and negotiating conditions can change; neither statement establishes a local agreement.',
    sources: [{ label: 'SABC, reporting Malema’s briefing · 13 Jun 2024', url: 'https://www.sabcnews.com/sabcnews/eff-wont-join-gnu-if-da-and-ff-plus-part-of-it-malema-2/' }, s.coalitionTalks2026],
    walkout: { title: 'The invitation meets the old conditions.', story: 'EFF and FF+ sit down. Someone remembers that in 2024, the EFF ruled out sharing the national government with FF+. {actor} leaves before the welcome drinks.' },
    truce: { title: 'The guest list gets a fictional rewrite.', story: 'EFF and FF+ agree on one local repair plan in your imaginary deal. The press conference has more questions than chairs. Everyone stays.' },
  },
  {
    id: 'anc-eff-gnu-terms', parties: ['ANC', 'EFF'], title: 'Support with conditions', period: 'National negotiations · June 2024',
    tease: 'ANC + EFF: dinner for two. EFF leader Julius Malema has opinions about the DA and FF+ plus-ones.',
    fact: 'During June 2024 negotiations, the EFF proposed cooperation with the ANC while excluding DA and FF+ participation. The ANC went on to form the GNU including those parties. This describes the negotiations, not an agreement reached between ANC and EFF.',
    sources: [{ label: 'EWN · 30 Jun 2024', url: 'https://www.ewn.co.za/2024/06/30/eff-proposes-coalition-with-anc-without-the-da-or-ff-plus' }, s.gnu],
    walkout: { title: 'The plus-one is disputed.', story: 'ANC and EFF agree to negotiate. They disagree about who else can join the meeting. {actor} leaves before anyone orders extra chairs.' },
    truce: { title: 'The guest list closes.', story: 'ANC and EFF settle on a work plan for the people already at the table. Everyone stays. Further invitations can wait.' },
  },
  {
    id: 'actionsa-mk-talks', parties: ['ActionSA', 'MK'], title: 'Open to talks, questions included', period: 'Party negotiations · November 2026',
    tease: 'ActionSA + MK: ActionSA leader Herman Mashaba is open to talks. His eyebrows have reservations.',
    fact: 'On 6 November 2026, Daily Maverick reported Herman Mashaba’s openness to negotiations including MK, alongside his concerns about the party. Openness to talks is not a signed coalition or evidence that the concerns were resolved.',
    sources: [s.coalitionTalks2026],
    walkout: { title: 'Available to talk. Still talking.', story: 'ActionSA and MK agree that talks are possible. The first round is about the conditions for round two. {actor} leaves before round three is scheduled.' },
    truce: { title: 'The talks reach an actual sentence.', story: 'ActionSA and MK turn a willingness to talk into a fictional local repair plan. Everyone stays. The questions get an appendix.' },
  },
  {
    id: 'mk-ff-policy-gap', parties: ['MK', 'FF+'], publicPosition: true,
    title: 'The policy gap at the table', period: 'National party positions · May 2026',
    tease: 'MK + FF+: even agreeing to disagree may need a recess.',
    fact: 'At the FF+ voter-registration campaign launch in May 2026, Corné Mulder said the party preferred not to form coalitions with MK, EFF or ANC because of policy differences, while remaining open to coalition government. A stated preference is not an unconditional refusal to negotiate.',
    sources: [{ label: 'SABC · 21 May 2026', url: 'https://www.sabcnews.com/sabcnews/ff-plus-says-its-time-for-it-to-govern-south-africa/' }],
    walkout: { title: 'The policy discussion reaches page two.', story: 'MK and FF+ agree on the meeting time. Their policy documents prove less cooperative. {actor} leaves after a very long first paragraph.' },
    truce: { title: 'One road. Two policy documents.', story: 'MK and FF+ disagree on plenty but approve the same local road repair in this fictional deal. Everyone stays; the wider debate gets another date.' },
  },
  {
    id: 'kzn-ifp-mk-premier', parties: ['IFP', 'MK'], province: 'KwaZulu-Natal',
    title: 'The biggest bloc and the premier’s chair', period: 'KwaZulu-Natal · June 2024',
    tease: 'IFP + MK: MK won the most KZN seats. IFP got the premier’s job. Lovely reunion.',
    fact: 'MK won the largest share in KwaZulu-Natal in 2024 without an outright majority. IFP’s Thami Ntuli became premier after a 41–39 legislature vote. This provincial rivalry is not proof of a municipal agreement or a permanent ban on cooperation.',
    sources: [s.kznResult, s.kzn],
    walkout: { title: 'Two versions of who won.', story: 'IFP and MK each explain why they should chair the meeting. Both explanations come with the 2024 results. {actor} leaves before a chair is chosen.' },
    truce: { title: 'The chair takes turns.', story: 'IFP and MK agree on the repairs and a speaking order. The 2024 result can stay in the history books for one meeting. Everyone stays.' },
  },
  {
    id: 'tshwane-eff-actionsa', parties: ['EFF', 'ActionSA'], municipalities: ['3004'],
    title: 'The mayoral support remix', period: 'Tshwane · October 2024',
    tease: 'EFF + ActionSA in Tshwane: from an anti-EFF pact to EFF votes for ActionSA’s mayor. Roll out the red carpet.',
    fact: 'EFF support helped ActionSA’s Nasiphi Moya become Tshwane mayor in October 2024, alongside the ANC and other parties. This was a particular local arrangement, despite the earlier national Charter’s aim to keep the EFF out.',
    sources: [s.moyaRecord, s.moya, s.charter],
    walkout: { title: 'Who gets the credit this time?', story: 'EFF and ActionSA agree that the mayoral win was historic. Both want their logo first on the anniversary poster. {actor} leaves before it goes to print.' },
    truce: { title: 'The remix gets an encore.', story: 'EFF and ActionSA agree that the next repair matters more than who gets first billing. Everyone stays in the deal.' },
  },
  {
    id: 'joburg-pa-actionsa', parties: ['PA', 'ActionSA'], municipalities: ['3003'],
    title: 'Two portfolios on the negotiating table', period: 'Johannesburg · January 2023',
    tease: 'PA + ActionSA in Joburg: ActionSA says it offered PA two council leadership jobs. Some welcome-back cards come with job titles.',
    fact: 'ActionSA said it offered two mayoral committee positions in January 2023 to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.',
    sources: [s.paOffer],
    walkout: { title: 'The welcome-back package needs work.', story: 'PA and ActionSA discuss who gets which council job. The welcome-back card has more conditions than signatures. {actor} leaves to make a counteroffer.' },
    truce: { title: 'The offer finally has an answer.', story: 'PA and ActionSA settle the roles in your fictional deal. The public announcement fits on one page. Everyone stays.' },
  },
  {
    id: 'joburg-eff-pa', parties: ['EFF', 'PA'], municipalities: ['3003'],
    title: 'The crowded unity table', period: 'Johannesburg · January 2023',
    tease: 'EFF + PA in Joburg: unity government. Separate microphones, please.',
    fact: 'Johannesburg’s 2022/23 annual report lists EFF and PA among parties in the Government of Local Unity formed in January 2023. This was a wider coalition, not a standalone EFF–PA pact.',
    sources: [{ label: 'Johannesburg annual report · 2022/23', url: 'https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf' }],
    walkout: { title: 'The unity briefing has two finales.', story: 'EFF and PA both prepare the closing speech. The microphone has only one switch. {actor} leaves before the final final word.' },
    truce: { title: 'The spotlight has room for two.', story: 'EFF and PA agree to share the briefing and get on with the repairs. Everyone stays. The microphone survives.' },
  },
];
