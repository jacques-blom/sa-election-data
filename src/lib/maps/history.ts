import { latestYear } from '../history/comparison.ts';

/** Keep an existing map and its slider mounted, using current geometry as context. */
export function updateRegionMap(current: HTMLElement, next: HTMLElement) {
  const historical = next.dataset.mapHistorical === 'true';
  const changed = current.dataset.options !== next.dataset.options
    || current.dataset.mapHistorical !== String(historical);
  current.dataset.mapHistorical = String(historical);
  current.dataset.options = next.dataset.options!;
  const caption = current.querySelector<HTMLElement>('[data-map-caption]');
  if (caption) caption.textContent = historical
    ? `${latestYear} boundaries · historical boundaries unavailable.`
    : current.dataset.addressMap === 'true' ? 'Selected address · Ward boundary: MDB, 2026'
    : next.querySelector('[data-map-caption]')!.textContent;
  const link = current.querySelector<HTMLAnchorElement>('figcaption a');
  const nextLink = next.querySelector<HTMLAnchorElement>('figcaption a');
  if (link && nextLink) {
    link.href = nextLink.href;
    link.textContent = historical ? `Explore ${latestYear} map ↗` : nextLink.textContent;
  }
  if (changed) current.dispatchEvent(new Event('results:map-update'));
}
