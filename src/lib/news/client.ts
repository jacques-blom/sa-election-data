import type { NewsData } from './feed.ts';

const dates = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' });
class RelatedNews extends HTMLElement {
  private controller?: AbortController;
  private loaded = false;
  connectedCallback() { queueMicrotask(() => { if (this.isConnected && !this.loaded && !this.controller) void this.load(); }); }
  disconnectedCallback() { this.controller?.abort(); this.controller = undefined; }
  private async load() {
    const status = this.querySelector<HTMLElement>('[data-news-status]');
    const list = this.querySelector<HTMLOListElement>('[data-news-list]');
    const more = this.querySelector<HTMLButtonElement>('[data-news-more]');
    if (!status || !list || !more || !this.dataset.endpoint) return;
    const controller = new AbortController();
    this.controller = controller;
    this.setAttribute('aria-busy', 'true');
    try {
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]);
      let response = await fetch(this.dataset.endpoint, { signal });
      // A different visitor may own the shared cache's short refresh lease.
      for (let attempt = 0; response.status === 503 && response.headers.get('Retry-After') === '2' && attempt < 8; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2_000));
        signal.throwIfAborted();
        response = await fetch(this.dataset.endpoint, { signal });
      }
      if (!response.ok) throw new Error('News unavailable');
      const data = await response.json() as NewsData;
      if (controller.signal.aborted) return;
      list.replaceChildren();
      data.articles.forEach((article, index) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = article.url; link.textContent = article.title;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        const meta = document.createElement('p');
        meta.className = 'news-meta'; meta.textContent = article.source || 'News article';
        if (article.publishedAt) {
          const time = document.createElement('time');
          time.dateTime = article.publishedAt;
          time.textContent = `${dates.format(new Date(article.publishedAt))} SAST`;
          meta.appendChild(document.createTextNode(' · ')); meta.appendChild(time);
        }
        item.appendChild(link); item.appendChild(meta); item.hidden = index >= 3; list.appendChild(item);
      });
      more.hidden = data.articles.length <= 3;
      more.onclick = () => {
        const next = list.querySelector<HTMLElement>('li[hidden] a');
        const hidden = [...list.querySelectorAll<HTMLElement>('li[hidden]')];
        hidden.slice(0, 6).forEach(item => { item.hidden = false; });
        more.hidden = hidden.length <= 6;
        next?.focus();
      };
      status.textContent = data.stale
        ? `Showing saved headlines from ${dates.format(new Date(data.fetchedAt))} SAST. Google News is temporarily unavailable.`
        : data.articles.length ? '' : 'No headlines found for this search since election day.';
      status.hidden = !status.textContent;
      this.loaded = true;
    } catch {
      if (!controller.signal.aborted) {
        status.hidden = false;
        status.textContent = 'Headlines are temporarily unavailable. You can still search Google News above.';
      }
    } finally {
      if (this.controller === controller) { this.removeAttribute('aria-busy'); this.controller = undefined; }
    }
  }
}
if (!customElements.get('related-news')) customElements.define('related-news', RelatedNews);
