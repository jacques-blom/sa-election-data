import { latestYear } from '../history/comparison.ts';

/** Preserve mounted search controls and typed text while switching election years. */
export function syncSearchState(next: Document) {
  for (const template of next.querySelectorAll<HTMLElement>('[data-place-search]')) {
    const root = document.getElementById(template.id);
    if (!root) continue;
    const disabled = template.dataset.searchDisabled === 'true';
    const changed = root.dataset.searchDisabled !== String(disabled);
    root.dataset.searchDisabled = String(disabled);
    if (disabled) root.setAttribute('aria-disabled', 'true'); else root.removeAttribute('aria-disabled');
    for (const control of root.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button:not([data-search-close])')) control.disabled = disabled;
    const trigger = root.querySelector<HTMLElement>('[data-search-open]');
    if (trigger) {
      if (disabled) { trigger.setAttribute('aria-disabled', 'true'); trigger.tabIndex = -1; trigger.title = `Search is available for the ${latestYear} election`; }
      else { trigger.removeAttribute('aria-disabled'); trigger.removeAttribute('tabindex'); trigger.removeAttribute('title'); }
    }
    root.querySelector<HTMLElement>('[data-search-enabled-hint]')!.hidden = disabled;
    root.querySelector<HTMLElement>('[data-search-disabled-hint]')!.hidden = !disabled;
    root.querySelector<HTMLElement>('.place-search-hint')!.hidden = !disabled && root.dataset.configured === 'true';
    if (changed && disabled) root.dispatchEvent(new Event('place-search:disabled'));
  }
}
