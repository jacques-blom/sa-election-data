/** Display helpers shared by SSR result pages and the browser map. No server imports. */
export const formatNumber = (n: number | null) => n === null ? 'Not available' : new Intl.NumberFormat('en-ZA').format(n);
export const formatTime = (s: string) => Number.isFinite(Date.parse(s)) ? new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }).format(new Date(s)) + ' SAST' : 'Not available';
export function partyStyle(name: string) {
  const additional: Record<string, [string,string]> = {
    'UMKHONTO WESIZWE PARTY': ['MK', '#54632c'], 'ACTIONSA': ['ActionSA', '#658247'],
    'SOUTH AFRICAN COMMUNIST PARTY': ['SACP', '#b64038'], 'OTHER': ['Other', '#8b9998'],
    'IND': ['Independent', '#627875'],
    'UNITED DEMOCRATIC MOVEMENT': ['UDM', '#b36c29'],
    'NEW NATIONAL PARTY': ['NNP', '#966f38'], 'NATIONAL PARTY': ['NP', '#966f38'],
    'INDEPENDENT DEMOCRATS': ['ID', '#c36b48'], 'CONGRESS OF THE PEOPLE': ['COPE', '#ae7936'],
    'AFRICAN CHRISTIAN DEMOCRATIC PARTY': ['ACDP', '#824c62'],
    'PAN AFRICANIST CONGRESS OF AZANIA': ['PAC', '#40846a'],
  };
  const map: Record<string, [string,string]> = { 'DEMOCRATIC ALLIANCE': ['DA','#2872ba'], 'AFRICAN NATIONAL CONGRESS': ['ANC','#b29022'], 'ECONOMIC FREEDOM FIGHTERS': ['EFF','#b64038'], 'PATRIOTIC ALLIANCE': ['PA','#287b57'], 'NATIONAL COLOURED CONGRESS': ['NCC','#665788'], 'VRYHEIDSFRONT PLUS | FREEDOM FRONT PLUS': ['FF+','#ba632f'], 'FREEDOM FRONT PLUS': ['FF+','#ba632f'], 'INKATHA FREEDOM PARTY': ['IFP','#b44b69'] };
  return additional[name.toUpperCase()] ?? map[name.toUpperCase()] ?? [name, '#627875'];
}
