/// <reference types="google.maps" />
import { rememberAddress } from './selected-address.ts';

const initialized = new WeakSet<HTMLElement>();
function setupAddresses() {
  document.querySelectorAll<HTMLElement>('[data-address-lookup]').forEach(root => {
    if (initialized.has(root)) return;
    initialized.add(root);
    initialize(root);
  });
}
setupAddresses();
document.addEventListener('results:updated', setupAddresses);

function initialize(root: HTMLElement) {
  const search = (root.dataset.addressSearch ? document.getElementById(root.dataset.addressSearch)?.closest('[data-place-search]') : root.querySelector('[data-place-search]')) ?? root;
  const status = root.querySelector<HTMLElement>('[data-address-status]')!;
  const choices = root.querySelector<HTMLElement>('[data-address-wards]')!;
  let selection = 0;
  let controller: AbortController | undefined;
  const cancel = () => {
    ++selection;
    controller?.abort();
    status.textContent = '';
    choices.replaceChildren();
  };
  for (const event of ['place-search:input', 'place-search:pending', 'place-search:cancel', 'place-search:area', 'place-search:sync-query']) search.addEventListener(event, cancel);
  document.addEventListener('results:before-year-change', cancel);
  search.addEventListener('place-search:select', async event => {
    cancel();
    const version = selection;
    controller = new AbortController();
    status.textContent = 'Finding your ward results…';
    try {
      const place = (event as CustomEvent<google.maps.places.Place>).detail;
      if (!place.location) throw new Error('No location');
      const response = await fetch('/api/locate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(place.location.toJSON()), signal: controller.signal });
      if (!response.ok) throw new Error('Ward lookup unavailable');
      const data = await response.json() as { wards: { id: string; number: number; municipality: string }[] };
      if (version !== selection) return;
      const open = (ward: typeof data.wards[number]) => {
        if (version !== selection || !/^\d{8}$/.test(ward.id)) return;
        rememberAddress(place.id, ward.id);
        window.location.assign(`/2026/wards/${ward.id}`);
      };
      if (data.wards.length === 1) { open(data.wards[0]!); return; }
      status.textContent = data.wards.length
        ? 'This address is near a ward boundary. Choose the ward results to open.'
        : 'No ward matched this address. Try a nearby address or browse the area directory.';
      for (const ward of data.wards) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button primary';
        button.textContent = `Ward ${ward.number}, ${ward.municipality} results ↗`;
        button.addEventListener('click', () => open(ward));
        choices.appendChild(button);
      }
    } catch {
      if (version === selection) status.textContent = 'We couldn’t look up this ward. Please try another address or use the area directory.';
    }
  });
}
