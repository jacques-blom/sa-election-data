/** Keep filtering separate from the desktop preview so a matching card is never lost. */
class CardCollection extends HTMLElement {
  private expanded = false;
  private frame = 0;
  private resize?: ResizeObserver;
  private mutations?: MutationObserver;
  private mobile = matchMedia('(max-width: 650px)');

  connectedCallback() {
    this.addEventListener('click', this.toggle);
    this.mobile.addEventListener('change', this.schedule);
    document.addEventListener('results:updated', this.schedule);
    document.addEventListener('results:year-changed', this.schedule);
    window.addEventListener('hashchange', this.schedule);
    this.resize = new ResizeObserver(this.schedule);
    this.resize.observe(this);
    this.mutations = new MutationObserver(records => {
      const grid = this.grid;
      if (records.some(record => record.type === 'childList' && record.target === this
        || grid && (record.target === grid || grid.contains(record.target)))) this.schedule();
    });
    this.mutations.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    this.schedule();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.frame);
    this.resize?.disconnect();
    this.mutations?.disconnect();
    this.removeEventListener('click', this.toggle);
    this.mobile.removeEventListener('change', this.schedule);
    document.removeEventListener('results:updated', this.schedule);
    document.removeEventListener('results:year-changed', this.schedule);
    window.removeEventListener('hashchange', this.schedule);
  }

  private get grid() { return this.querySelector<HTMLElement>(':scope > [data-card-grid]'); }
  private schedule = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.refresh());
  };

  private refresh() {
    const grid = this.grid;
    const button = this.querySelector<HTMLButtonElement>('.card-collection-toggle');
    if (!grid || !button) return;
    const collapsible = this.dataset.collapsible !== 'false';
    const cards = [...grid.children].filter((child): child is HTMLElement => child instanceof HTMLElement && !child.hidden);
    const style = getComputedStyle(grid);
    const columns = style.gridTemplateColumns.split(/\s+/).filter(Boolean).length;
    const limit = Math.max(1, columns) * 2;
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target && cards.slice(limit).some(card => card === target || card.contains(target))) this.expanded = true;
    grid.id = `${this.id}-grid`;
    grid.dataset.cardCount = String(cards.length);
    if (!grid.hasAttribute('aria-label')) grid.setAttribute('aria-label', this.dataset.label ?? 'Cards');
    grid.style.setProperty('--card-scroll-padding', style.paddingLeft);
    if (grid.tagName === 'DIV') grid.setAttribute('role', 'region');
    if (this.mobile.matches && cards.length > 1) grid.tabIndex = 0;
    else grid.removeAttribute('tabindex');
    cards.forEach((card, index) => card.toggleAttribute('data-card-overflow', collapsible && !this.mobile.matches && !this.expanded && index >= limit));
    const hint = this.querySelector<HTMLElement>('.card-collection-hint');
    if (hint) {
      hint.hidden = cards.length < 2;
      const text = hint.querySelector('[data-card-hint]');
      if (text) text.textContent = `Swipe to explore ${cards.length} ${this.dataset.label}`;
    }
    button.hidden = !collapsible || this.mobile.matches || cards.length <= limit;
    button.setAttribute('aria-expanded', String(!collapsible || this.expanded));
    button.textContent = this.expanded ? 'View fewer' : `View all ${cards.length} ${this.dataset.label}`;
  }

  private toggle = (event: Event) => {
    if (!(event.target instanceof Element) || !event.target.closest('.card-collection-toggle')) return;
    const firstHidden = this.grid?.querySelector<HTMLElement>(':scope > [data-card-overflow]:not([hidden])');
    this.expanded = !this.expanded;
    this.refresh();
    if (this.expanded && firstHidden) {
      const focus = firstHidden.matches('a, button') ? firstHidden : firstHidden.querySelector<HTMLElement>('a, button');
      focus?.focus({ preventScroll: true });
    } else this.querySelector<HTMLButtonElement>('.card-collection-toggle')?.scrollIntoView({ block: 'nearest' });
  };
}

if (!customElements.get('card-collection')) customElements.define('card-collection', CardCollection);
