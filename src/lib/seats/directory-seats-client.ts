import type { BuilderSeatSummary } from './directory.ts';

let stopObserving: (() => void) | undefined;

/** Keep the directory quick without treating unread result packs as unavailable. */
export function observeBuilderSeats() {
  stopObserving?.();
  if (typeof IntersectionObserver === 'undefined') return; // Council links also work without JS.
  const controller = new AbortController();
  const queue: HTMLElement[] = [];
  let running = false;

  function label(card: HTMLElement, text: string) {
    card.querySelector('[data-builder-seat-status]')!.textContent = text;
  }
  function apply(card: HTMLElement, seats: BuilderSeatSummary) {
    card.dataset.loaded = 'true';
    card.dataset.status = seats.status;
    card.classList.toggle('builder-council-card--pending', seats.status === 'pending');
    const badge = card.querySelector<HTMLElement>('[data-builder-seat-status]')!;
    badge.classList.toggle('builder-seat-status--pending', seats.status !== 'reported');
    label(card, seats.status === 'reported' ? 'Reported seats' : seats.status === 'estimated' ? 'Current estimates' : 'Seats pending');
    card.querySelector<HTMLElement>('[data-builder-target]')!.hidden = seats.majority === null;
    card.querySelector<HTMLElement>('[data-builder-wait]')!.hidden = seats.majority !== null;
    card.querySelector('[data-builder-majority]')!.textContent = String(seats.majority ?? '');
    card.querySelector('[data-builder-total]')!.textContent = String(seats.total ?? '');
    card.querySelector('[data-builder-wait-text]')!.textContent = 'Awaiting seats';
    card.querySelector('[data-builder-play-label]')!.textContent = seats.status === 'pending' ? 'Check seats' : 'Play this council';
  }
  async function drain() {
    if (running) return;
    running = true;
    try {
      while (queue.length && !controller.signal.aborted) {
        const cards = queue.splice(0, 8);
        for (const card of cards) { label(card, 'Loading seats…'); card.setAttribute('aria-busy', 'true'); }
        try {
          const ids = cards.map(card => card.dataset.council!).sort().join(',');
          const response = await fetch(`/api/majority-builder?councils=${ids}`, { signal: controller.signal });
          if (!response.ok) throw new Error('Seat summaries unavailable');
          const data = await response.json() as { councils: BuilderSeatSummary[] };
          if (controller.signal.aborted) return;
          for (const card of cards) {
            if (!card.isConnected) continue;
            const seats = data.councils.find(c => c.id === card.dataset.council);
            if (seats) apply(card, seats); else label(card, 'Open to check');
          }
          document.dispatchEvent(new Event('builder:seats-updated'));
        } catch {
          if (!controller.signal.aborted) for (const card of cards) label(card, 'Open to check');
        } finally {
          for (const card of cards) card.removeAttribute('aria-busy');
        }
      }
    } finally { running = false; }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      queue.push(entry.target as HTMLElement);
    }
    void drain();
  }, { rootMargin: '250px' });
  for (const card of document.querySelectorAll<HTMLElement>('[data-builder-card][data-loaded=false]')) observer.observe(card);
  stopObserving = () => { observer.disconnect(); controller.abort(); };
}
