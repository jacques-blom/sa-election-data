import { selectedAddress } from '../address/selected-address.ts';
const mounted = new Map<HTMLElement, () => void>();
// Keep the renderer, WebGL worker and tile requests off the critical path.
let renderer:Promise<typeof import('./fixed-client.ts')>|undefined;
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(!entry.isIntersecting)continue;
  observer.unobserve(entry.target);
  const figure=entry.target as HTMLElement;
  const options = JSON.parse(figure.dataset.options ?? '{}') as { level?: string; id?: string };
  const selected = options.level === 'ward' && options.id && selectedAddress(options.id);
  const module = selected ? import('./address-map.ts') : (renderer ??= import('./fixed-client.ts'));
  void module.then(module=>{
   if(!figure.isConnected || !figure.hasAttribute('data-region-map') || mounted.has(figure))return;
   const dispose = module.mountRegionMap(figure);
   if(dispose)mounted.set(figure,dispose);
  }).catch(()=>{
   const status=figure.querySelector<HTMLElement>('.region-map-status');
   if(status)status.textContent='Map preview is unavailable. Use the area links below or open the full map.';
  });
 }
},{rootMargin:'200px'});
const observed = new Set<HTMLElement>();
function observeMaps() {
 // Year scrubbing retains map canvases. Dispose only maps actually removed from
 // the page, including pending mounts whose elements disappeared before loading.
 for (const figure of observed) {
  if (figure.isConnected && figure.hasAttribute('data-region-map')) continue;
  mounted.get(figure)?.(); mounted.delete(figure); observed.delete(figure); observer.unobserve(figure);
 }
 document.querySelectorAll<HTMLElement>('[data-region-map]').forEach(figure=>{
  if (observed.has(figure)) return;
  observed.add(figure);
  observer.observe(figure);
 });
}
observeMaps();
document.addEventListener('results:updated', observeMaps);
