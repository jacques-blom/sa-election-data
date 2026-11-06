/** Short, contextual explanations shared by results pages and the visual guide. */
const iec = 'https://www.elections.org.za/content/Documents/Voter-education/Continuous-Voter-Education/How-Council-seats-are-calculated/';
const government = 'https://www.cogta.gov.za/index.php/2021/06/01/understanding-local-government/';
const coalitions = 'https://www.gov.za/CoalitionsDialogue/faqs';

export const guides = {
  outcomes: {
    title: 'Majority or hung council?',
    hint: 'More than half the seats makes an outright majority.',
    cards: [
      { visual: '6 / 10', label: 'Outright majority', text: 'One party holds more than half the council seats.', dots: [6, 4] },
      { visual: '4 + 3 + 3', label: 'Hung council', text: 'No party has a majority. Parties may work together in a coalition or support agreement.', dots: [4, 3, 3] },
      { visual: '…', label: 'Seats pending', text: 'The allocation is incomplete. Estimates can change as more results arrive.' },
    ],
    note: 'Illustration: a 10-seat council needs 6 seats for a majority. Exactly half is not enough. Election results alone do not tell us who governs now.',
    source: coalitions, sourceLabel: 'Government guide to coalitions',
  },
  seats: {
    title: 'Vote share vs seats',
    hint: '% measures votes. Seats are places on the council.',
    cards: [
      { visual: '40%', label: 'Vote share', text: '40 out of every 100 valid votes on the ballot shown.', dots: [4, 6] },
      { visual: '1 seat', label: 'One councillor', text: 'A representative who votes on council decisions.' },
      { visual: '> ½', label: 'Seats decide a majority', text: 'Use the council seat total, not the percentage on a single ballot.' },
    ],
    note: 'Ward wins and the proportional allocation determine the final seats. A party’s PR vote percentage alone is not its share of council seats.',
    source: iec, sourceLabel: 'IEC guide to council seats',
  },
  ballots: {
    title: 'Ward vs PR ballots',
    hint: 'Ward: choose a person. PR: choose a party.',
    cards: [
      { visual: 'Person', label: 'Ward ballot', text: 'The candidate with the most votes in the whole ward wins one seat. They do not need more than 50%.' },
      { visual: 'Party', label: 'Municipal PR ballot', text: 'PR means proportional representation. Party-list seats balance the council’s overall party representation.' },
      { visual: '1 council', label: 'Two ballots work together', text: 'Party ward votes and municipal PR votes both count towards the party’s overall seat allocation.' },
    ],
    note: 'Outside metros, voters also have a separate district PR ballot. An independent can stand in a ward but not on a party PR list.',
    source: iec, sourceLabel: 'IEC guide to council seats',
  },
  government: {
    title: 'Local, district or metro?',
    hint: 'Local councils and district councils share responsibilities. Metros combine both.',
    cards: [
      { visual: 'Local', label: 'Your town and nearby areas', text: 'Handles local services such as refuse collection and local roads, with responsibilities shared with the district.' },
      { visual: 'District', label: 'Several local municipalities', text: 'Coordinates planning and shared services across its area, such as bulk water infrastructure. Functions vary by area.' },
      { visual: 'Metro', label: 'One council for a large city', text: 'Combines local and district responsibilities. There is no separate district council above it.' },
    ],
    note: 'A district municipality is a level of local government. A voting district is a small voting area; it has no council of its own.',
    source: government, sourceLabel: 'CoGTA guide to local government',
  },
  district: {
    title: 'How a district council works',
    hint: 'A district council serves several local municipalities together.',
    cards: [
      { visual: '40%', label: 'Elected on the district ballot', text: 'Voters choose a party on a separate district PR ballot.', dots: [4, 6] },
      { visual: '60%', label: 'From local councils', text: 'Local councils elect representatives from their own councillors to serve on the district council.', dots: [6, 4] },
    ],
    note: 'Its work includes district-wide planning and shared services. Adding local council results together does not give the district council’s result.',
    source: iec, sourceLabel: 'IEC guide to council seats',
  },
  ward: {
    title: 'What is a ward?',
    hint: 'One ward elects one councillor to the municipal council.',
    cards: [
      { visual: 'Your area', label: 'A ward', text: 'A part of a local or metro municipality. Its councillor represents residents on that council.' },
      { visual: 'Most votes', label: 'One seat', text: 'The ward candidate with the most votes wins, even with less than half the votes.' },
    ],
    note: 'Winning a ward does not mean winning control of the whole council. The council also includes PR councillors.',
    source: iec, sourceLabel: 'IEC guide to council seats',
  },
  'voting-district': {
    title: 'What is a voting district?',
    hint: 'A voting district is a small voting area inside a ward.',
    cards: [
      { visual: 'Voting area', label: 'A voting district', text: 'Voters are assigned to a voting station in this area. These results show only that part of the ward.' },
      { visual: 'Whole ward', label: 'Votes added together', text: 'Results from all the ward’s voting districts decide its councillor.' },
    ],
    note: 'A lead here is not a ward win. A voting district has no council and is different from a district municipality.',
    source: 'https://www.elections.org.za/pw/Voters-Roll/About-voting-districts-and-stations', sourceLabel: 'IEC guide to voting districts',
  },
  reporting: {
    title: 'Reporting vs turnout',
    hint: 'Reporting shows where results are in, not how many people voted.',
    cards: [
      { visual: '8 / 10', label: '80% reporting', text: 'Example: results have arrived from 8 of 10 voting districts.', dots: [8, 2] },
      { visual: 'People', label: 'Turnout is different', text: 'Turnout measures the share of registered voters who voted. It cannot be read from reporting progress.' },
    ],
    note: 'Voting districts differ in size, so 80% reporting does not mean 80% of votes counted. Reported results may still be corrected.',
    source: '/disclaimer', sourceLabel: 'About Counted’s results',
  },
  national: {
    title: 'What do these totals show?',
    hint: 'Local election votes added together. Each municipality elects its own council.',
    cards: [
      { visual: 'Votes', label: 'A national or provincial picture', text: 'Ward and municipal PR ballots are added together to show party support across the area.' },
      { visual: 'Councils', label: 'Decided municipality by municipality', text: 'These totals do not elect Parliament or a provincial legislature, or establish a council majority.' },
    ],
    note: 'Ballots are not individual voters: one person can cast more than one ballot. Council outcomes are based on seats in each municipality.',
    source: iec, sourceLabel: 'IEC guide to council seats',
  },
  change: {
    title: 'What does “pp” mean?',
    hint: 'Percentage points show the change in vote share.',
    cards: [
      { visual: '30% → 35%', label: '+5 percentage points', text: 'The party’s share rose by 5 points, not by 5% of its old vote total.' },
      { visual: 'Same basis?', label: 'Compare with care', text: 'Check the ballot and election year. Boundary changes can mean different communities are being compared.' },
    ],
    note: 'A change in vote share is different from gaining or losing council seats.',
    source: '/disclaimer', sourceLabel: 'About comparisons',
  },
  map: {
    title: 'How to read the map',
    hint: 'Map colours show vote leaders, not who controls a council.',
    cards: [
      { visual: 'Colour', label: 'Leading on the ballot shown', text: 'A party can lead in votes without having a majority of council seats.' },
      { visual: 'Zoom in', label: 'From area to neighbourhood', text: 'Explore municipalities and wards. Open council results to see the seat allocation.' },
    ],
    note: 'Read the ballot label as you explore. Missing results or a tied lead do not identify a winning party.',
    source: '/councils', sourceLabel: 'Explore council outcomes',
  },
} satisfies Record<string, { title: string; hint: string; cards: { visual: string; label: string; text: string; dots?: number[] }[]; note: string; source: string; sourceLabel: string }>;

export type GuideTopic = keyof typeof guides;
