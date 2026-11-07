/** MISTRA codebook v1.0 Appendix C. Keys identify organisations, not IEC numeric IDs. */
const definitions = `ABC|Abantu Batho Congress
ABMM|Abahlali Base Mkhanyakude Movement
ACC|Active Citizens Coalition
ACDP|African Christian Democratic Party
ACM|African Content Movement
ActionSA|ActionSA
ACU|Academic Congress Union
ADeC|African Democratic Change
AHC|African Heart Congress
AIC|African Independent Congress
AIM|Abantu Integrity Movement
AK|Advieskantoor
AlJama|Al Jama-ah
AM4C|Allied Movement for Change
ANC|African National Congress
APC|African People's Convention
APEMO|African People's Movement
APF|African People First
Arona|Arona
ARP|Azania Resident Party
ATM|African Transformation Movement
AUF|Active United Front
AULA|All Unemployment Labour Alliance
AZAPO|Azanian People's Organisation
BCM|Botho Community Movement
BO|Breedevallei Onafhanklik
CCC|Cape Coloured Congress
CFP|Community Freedom Party
CFRA|Cederberg First Residents Association
COPE|Congress of the People
COSA|Community Solidarity Association
CSA|Compatriots of South Africa
DA|Democratic Alliance
DLC|Democratic Liberal Congress
DLRP|Dienslewerings Party
DOP|Defenders of the People
DPSA|Dikwankwetla Party of South Africa
EFF|Economic Freedom Fighters
F4SD|Forum 4 Service Delivery
FFPlus|Vryheidsfront Plus
GCF|Gamagara Community Forum
GOOD|GOOD
IA|Independent Alliance
ICM|Independent Citizens Movement
ICOSA|Independent Civic Organisation of South Africa
IFP|Inkatha Freedom Party
IPM|Ikhwezi Political Movement
Irasa|Independent Ratepayers Association of SA
JEP|Justice and Employment Party
KCM|Kareeberg Civic Movement
KDF|Karoo Democratic Force
KGP|Karoo Gemeenskap Party
KIM|Knysna Independent Movement
KIP|Kannaland Independent Party
KZNI|KZN Independence
Labour|Labour Party of South Africa
LCF|Lekwa Community Forum
LIP|Langeberg Independent Party
MAoC|Merafong Agents of Change
MAP16|Mapsixteen Civic Movement
MCA|Metsimaholo Community Association
MCF|Moqhaka Community Forum
MF|Minority Front
MHRF|Middelburg and Hendrina Residents Front
MKP|uMkhonto weSizwe Party
MSA|Minorities of South Africa
NA|Northern Alliance
NAPF|National People's Front
NCF|Nala Community Forum
NCM|Namakwa Civic Movement
NFP|National Freedom Party
NHM|New Horizon Movement
NPA|National Peoples Ambassadors
OGI|Oudtshoorn Gemeenskap Inisiatief
PA|Patriotic Alliance
PAC|Pan Africanist Congress of Azania
PAU|Power of Africans Unity
PBI|Plaaslike Besorgde Inwoners
PDC|Plett Democratic Congress
PDM|People's Democratic Movement
PFP|People's Freedom Party
PRM|People's Revolutionary Movement
PSDF|Phokwane Service Delivery Forum
RCoT|Republican Conference of Tshwane
RPP|Randfontein Peoples Party
Saamstaan|Suid-Kaap Saamstaan
SAPA|South African Political Association
SARKO|South African Royal Kingdoms Organization
SCM|Siyathemba Community Movement
SDM|Save Ditsobotla Movement
SEFM|Socialist Economic Freedom Movement
SPSDF|Sol-Plaatjie Service Delivery Forum
SRWP|Socialist Revolutionary Workers Party
TA|Truly Alliance
TCM|Tsogang Civic Movement
TFSD|Thabazimbi Forum for Service Delivery
TRA|Thabazimbi Residents Association
TSSA|Team Sugar South Africa
UDM|United Democratic Movement
UIM|United Independent Movement
VAAL|Vaal Alternative Alliance Lekgotla
WA|Witzenberg Aksie
WP|Witzenberg Party
IND1|Independent councillors (grouped)`;
export const governmentParties = Object.fromEntries(definitions.split('\n').map(line => {
  const [key, name] = line.split('|') as [string, string];
  return [key, { key, name, short: key === 'FFPlus' ? 'FF+' : key === 'AlJama' ? 'Al Jama-ah' : key === 'IND1' ? 'Independents (grouped)' : key }];
}));
export const partyName = (key: string) => governmentParties[key]?.name ?? key;
export const partyShort = (key: string) => governmentParties[key]?.short ?? key;
const normalise = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases: Record<string, string[]> = {
  FFPlus: ['Freedom Front Plus', 'Vryheidsfront Plus | Freedom Front Plus', 'FF+', 'VF+'],
  AlJama: ['Al Jama-ah', 'Al Jama-Ah'],
  MKP: ['uMkhonto weSizwe', 'MK Party'],
};
/** Exact normalised names only. No fuzzy matching, abbreviations from vote feeds, or independent aggregation. */
export function governmentPartyKey(name: string): string | null {
  const matches = Object.values(governmentParties).filter(p => p.key !== 'IND1'
    && [p.name, ...(aliases[p.key] ?? [])].some(alias => normalise(alias) === normalise(name)));
  return matches.length === 1 ? matches[0]!.key : null;
}

