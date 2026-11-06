export {};
const mounted = new Map<HTMLElement, () => void>();
// Keep the renderer, WebGL worker and tile requests off the critical path.
let generation = 0;
let renderer:Promise<typeof import('./fixed-client.ts')>|undefined;
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(!entry.isIntersecting)continue;
  observer.unobserve(entry.target);
  const figure=entry.target as HTMLElement;
  renderer??=import('./fixed-client.ts');
  const version = generation;
  void renderer.then(module=>{
   if(version !== generation || !figure.isConnected || !figure.hasAttribute('data-region-map') || mounted.has(figure))return;
   const dispose = module.mountRegionMap(figure);
   if(dispose)mounted.set(figure,dispose);
  }).catch(()=>{
   const status=figure.querySelector<HTMLElement>('.region-map-status');
   if(status)status.textContent='Map preview is unavailable. Use the area links below or open the full map.';
  });
 }
},{rootMargin:'200px'});
const observed = new WeakSet<HTMLElement>();
function observeMaps() {
 document.querySelectorAll<HTMLElement>('[data-region-map]').forEach(figure=>{
  if (observed.has(figure)) return;
  observed.add(figure);
  observer.observe(figure);
 });
}
observeMaps();
document.addEventListener('results:updated', observeMaps);

document.addEventListener('results:before-year-change', () => {
  generation++;
  observer.disconnect();
  for (const [figure, dispose] of mounted) { dispose(); observed.delete(figure); }
  mounted.clear();
  document.querySelectorAll<HTMLElement>('[data-region-map]').forEach(figure => observed.delete(figure));
});
