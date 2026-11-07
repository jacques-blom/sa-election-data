// Editorial metadata only. Current quotes and facts come from the game.
// Original explanations and stable IDs live in docs/coalition-copy-audit.json.
export const removalReasons:{[id:string]:string}={
  breakaway:'Removed: a breakaway could imply councillors take their elected seats into a new party. The game models support, not floor crossing.',
};
export const genericMeanings:{[id:string]:string}={
  rogue:'A supposedly urgent party consultation turns into a conversation with a barista. No real councillor is identified.',
  traffic:'An absurd detour prevents attendance; absence is distinct from losing a seat.',
  'double-booked':'Councillors chase a ribbon-cutting photo opportunity; “your numbers are too” turns cutting the ribbon into losing support at the meeting. The story uses one or two councillors to match the available seats.',
  'committee-quarrel':'An argument about committee leaders produces yet another committee.',
  'speaker-recess':'A break helps settle disagreement; sharing the biscuits supplies the punchline.',
  'budget-truce':'Councillors agree spending priorities and turn their majority into a budget decision.',
  'pothole-pact':'Residents prompt cooperation; common ground becomes a road-repair pun.',
  'photo-truce':'The wish to appear in a group photo briefly keeps everyone together. Facing the same direction is literal for the photo and figurative for agreement.',
  'small-exit':'The repeated denial jokingly hints at a dispute over the deputy mayor’s office. This is an invented motive in a fictional scene, not an allegation about a real negotiation. The smallest party’s exit may or may not remove the majority.',
  'big-exit':'A major partner’s departure becomes a WhatsApp exit followed by a hurried press conference.',
  'random-exit':'An invented forwarding mistake and long apology disrupt the deal. No real leak is alleged.',
  'caucus-split':'A split within one party becomes rival group chats, each claiming to represent everyone.',
};
export const revisedMeanings:{[id:string]:string}={
  'da-eff-red-lines':'The imaginary first agenda item asks DA and EFF negotiators to ignore their earlier campaign insults. Those past attacks are the awkward baggage at this fictional table.',
  'da-mk-red-lines':'The seating plan puts Helen Zille’s publicly opposed parties at one fictional table. Nightmare is comic exaggeration of the political contradiction.',
  'ekurhuleni-anc-eff':'Couples’ counselling turns the parties’ strained relationship into a council scene, complete with Speaker and gavel.',
  'ethekwini-anc-eff':'Revolutionary rhetoric is contrasted with EFF votes supporting the ANC mayor in the dated confidence vote. Favour means voting support.',
  'anc-ifp-gnu':'Longstanding rivals become Cabinet colleagues; the strained polite smiles are imagined relationship humour.',
  'ifp-pa-gnu':'Cooperative Governance and Sport become a fictional exchange between Hlabisa and McKenzie, with an appeal to the referee.',
  'eff-ff-gnu-terms':'Similar party abbreviations contrast with substantial political differences. Different planets is a metaphor, not a permanent refusal to negotiate.',
  'bay-da-udm':'The deputy mayor’s chair is personified after the coalition dispute. Abandonment issues describes imaginary furniture, not a person’s health.',
  'mangaung-anc-caucus':'Holding enough seats does not ensure caucus discipline; the joke riffs on the documented split in voting.',
  'swellendam-da-ff':'One abstention left the mayoral candidates tied. The seating plan needing therapy personifies the resulting council predicament.',
  'beyers-naude-da-csa':'The agreement was reached shortly before the council meeting. Immediately arguing over the agenda is invented comic scene-setting.',
  'modimolle-da-eff':'Heads and tails refer to the real coin toss used to settle a tied mayoral election. Principles is the satirical contrast with a chance tiebreaker.',
  'ANC-01':'The party-selection prompt turns the ANC’s loss of its national majority into a game instruction: choose partners to keep governing. It does not claim the ANC never governed with partners before 2024.',
  'ANC-10':'The family reunion is a metaphor for Zuma’s former ANC affiliation and later MK support. Competing campaign posters distinguish the parties without inventing separate ballots.',
  'DA-05':'Common ground refers both to political agreement and agriculture. The line identifies Steenhuisen and dates his appointment to avoid confusing him with the current DA cameo.',
  'DA-09':'Dated EFF voting support complicates categorical campaign refusals; the joke does not invent a formal DA–EFF coalition.',
  'EFF-09':'The EFF’s ambition to gain power is contrasted with deputy president Floyd Shivambu leaving for MK. Took is a transfer metaphor, not coercion.',
  'MK-06':'The forwarding-address metaphor refers to Shivambu changing parties. It does not claim he became MK’s deputy leader.',
  'PA-11':'The joke compares a political offer of portfolios with a reunion gift. It explicitly attributes the offer to ActionSA and does not assert appointments followed.',
  'FF+-01':'Freedom in the party name is contrasted with the Correctional Services portfolio assigned to Pieter Groenewald in 2024; it does not accuse partners of crimes.',
};
export const proposed=[
  {id:'DRAFT-DA',text:'DA: the ANC was the problem. Until it had vacancies.',basisKey:'intro-da-gnu',meaning:'Recasts entering the GNU as job hunting.',note:'Not selected: implies an unsupported private motive and repeats office-perk jokes.'},
  {id:'DRAFT-EFF',text:'EFF: wanted to take power. MK took the deputy.',basisKey:'intro-eff-shivambu',meaning:'Contrasts the EFF’s ambitions with Shivambu’s move to MK.',note:'A historical proposal, not an additional active line unless its exact text appears in the game.'},
  {id:'DRAFT-IFP-1',text:'IFP: got the KZN premier’s chair. It came with three back-seat drivers.',basisKey:'intro-ifp-premier',meaning:'Three other parties backed the IFP premier in the 2024 arrangement.',note:'Not selected: duplicates the clearer approved cellphone-contract joke.'},
  {id:'DRAFT-IFP-2',text:'IFP: booked the KZN premier’s suite. Got three roommates.',basisKey:'intro-ifp-premier',meaning:'A metaphor for governing alongside ANC, DA and NFP.',note:'Not selected: duplicates the same power-sharing hook.'},
  {id:'DRAFT-IFP-3',text:'IFP: the premier’s chair came with more conditions than a cellphone contract.',basisKey:'intro-ifp-premier',meaning:'Coalition compromises are compared with cellphone-contract fine print.',note:'Approved and retained; not a literal claim about contract clauses.'},
  {id:'DRAFT-IFP-4',text:'IFP: premier on the letterhead. Group project everywhere else.',basisKey:'intro-ifp-premier',meaning:'Holding the premiership still requires cooperation.',note:'Not selected: duplicates the approved line and could understate the premier’s authority.'},
  {id:'DRAFT-IFP-5',text:'IFP: happy to share power. Certain mayoral chairs excluded.',basisKey:'intro-ifp-eff-split',meaning:'Refers to the dated dispute over uMhlathuze negotiations.',note:'Not selected: compresses disputed party accounts into an unqualified jibe.'},
  {id:'DRAFT-IFP-6',text:'IFP: took Cooperative Governance. Clearly didn’t read the room.',basisKey:'intro-ifp-cogta',meaning:'Wordplay on a ministry’s name.',note:'Not selected: weak ministry-name pun; COGTA is not a department for managing coalition personalities.'},
];
