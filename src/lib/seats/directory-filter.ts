// Keep the browser filter independent of the server's result storage modules.
export const normaliseCouncilSearch = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function matchesBuilderCouncil(council: { search: string; provinceId: string; status: string; loaded?: boolean }, query: string, province = '', status = '') {
  return normaliseCouncilSearch(query).split(' ').filter(Boolean).every(word => council.search.includes(word))
    && (!province || council.provinceId === province)
    // Let unknown cards enter the viewport so their allocation can be checked.
    && (!status || council.loaded === false || (status === 'reported' ? council.status === 'reported' : council.status !== 'reported'));
}
