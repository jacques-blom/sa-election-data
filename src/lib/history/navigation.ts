/** Carry only public view choices. Search text and addresses never enter result links. */
export function selectionUrl(href: string, current: URL) {
  const url=new URL(href,current);
  if(url.origin!==current.origin)return href;
  for(const key of ['party','metric'] as const){
    const value=current.searchParams.get(key);
    if(value && (key==='metric' ? ['votes','seats'].includes(value) : /^[a-zA-Z0-9_-]{1,80}$/.test(value)))url.searchParams.set(key,value);
    else url.searchParams.delete(key);
  }
  return url.pathname+url.search+url.hash;
}

export function syncExploreLinks(root:ParentNode=document) {
  const current=new URL(window.location.href);
  for(const link of root.querySelectorAll<HTMLAnchorElement>('a[data-explore-link], .breadcrumbs a, .ward-result-card, .overview-province-card, .province-map-link, .province-map-result-link, .home-metro-link, .related-places a, [data-municipality-card] a, .explore-grid a, .place-parent a'))
    link.setAttribute('href',selectionUrl(link.getAttribute('href')!,current));
}

/** Search resolves familiar names once, then opens the selected election. */
export function searchResultUrl(href:string,year:number,current:URL) {
  const url=new URL(href,current);
  if(url.origin!==current.origin)return href;
  if(url.pathname==='/'||/^\/\d{4}\/?$/.test(url.pathname)) url.pathname=year===2026?'/':`/${year}`;
  else url.pathname=url.pathname.replace(/^\/\d{4}\//,`/${year}/`);
  return selectionUrl(url.pathname+url.search+url.hash,current);
}
