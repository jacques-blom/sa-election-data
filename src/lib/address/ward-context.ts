import { loadSelectedAddress, selectedAddress } from './selected-address.ts';
import { resultsUrl } from '../history/view.ts';

const initialized = new WeakSet<HTMLElement>();
function setup() {
  document.querySelectorAll<HTMLElement>('[data-ward-address]').forEach(root => {
    const id = root.dataset.wardAddress!;
    const selected = selectedAddress(id);
    root.hidden = !selected || resultsUrl().pathname !== `/2026/wards/${id}`;
    if (!selected || initialized.has(root)) return;
    initialized.add(root);
    const label = root.querySelector<HTMLElement>('[data-ward-address-label]')!;
    label.textContent = 'Loading your selected address…';
    void loadSelectedAddress(id).then(place => {
      if (!place || !root.isConnected) return;
      label.textContent = place.formattedAddress || place.displayName || 'Selected address';
    }).catch(() => {
      label.textContent = 'Your ward results are ready. The selected address could not load.';
      root.querySelector<HTMLElement>('[data-ward-address-map]')!.hidden = true;
    });
  });
}
setup();
document.addEventListener('results:updated', setup);
