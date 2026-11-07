const controls = new WeakMap<HTMLElement, { year: string; party: string | null; metric: string; election: string }>();

/** Local selections survive live patches; a page-year change selects that election. */
export function setupVoteHistory(root: ParentNode = document) {
  for (const chart of root.querySelectorAll<HTMLElement>('[data-vote-history]')) {
    let state = controls.get(chart);
    const render = () => {
      const state = controls.get(chart)!;
      if (state.election !== chart.dataset.defaultYear) state.year = state.election = chart.dataset.defaultYear ?? '';
      const years = [...chart.querySelectorAll<HTMLButtonElement>('[data-trend-year]')];
      if (!years.some(b => b.dataset.trendYear === state.year)) state.year = chart.dataset.defaultYear ?? '';
      const parties = [...chart.querySelectorAll<HTMLButtonElement>('[data-trend-party]')];
      if (!parties.some(b => b.dataset.trendParty === state.party)) state.party = null;
      const metrics = [...chart.querySelectorAll<HTMLButtonElement>('[data-trend-metric]')];
      const panels = [...chart.querySelectorAll<HTMLElement>('[data-trend-metric-panel]')];
      if (panels.length && !panels.some(p=>p.dataset.trendMetricPanel===state.metric)) state.metric=chart.dataset.defaultMetric??'votes';
      else if (metrics.length && !metrics.some(b=>b.dataset.trendMetric===state.metric)) state.metric='votes';
      chart.dataset.selectedYear=state.year;
      chart.dataset.selectedMetric=state.metric;
      chart.dataset.selectedParty=state.party??'';
      const title=state.metric==='seats'?'How the council changed':'How the vote changed';
      const heading=chart.querySelector<HTMLElement>('[data-trend-title]');
      if(heading)heading.textContent=title;
      chart.querySelector('[data-share-history]')?.setAttribute('aria-label',`Share ${title.toLowerCase()}`);
      for(const key of chart.querySelectorAll<HTMLElement>('[data-trend-seat-key]'))key.hidden=state.metric!=='seats';
      for (const button of years) button.setAttribute('aria-pressed', String(button.dataset.trendYear === state.year));
      for (const panel of chart.querySelectorAll<HTMLElement>('[data-trend-panel]')) panel.hidden = panel.dataset.trendPanel !== state.year && panel.dataset.trendPanel !== `${state.metric}:${state.year}`;
      for (const panel of chart.querySelectorAll<HTMLElement>('[data-trend-metric-panel]')) panel.hidden=panel.dataset.trendMetricPanel!==state.metric;
      for (const button of metrics) button.setAttribute('aria-pressed',String(button.dataset.trendMetric===state.metric));
      for (const marker of chart.querySelectorAll<SVGElement>('[data-trend-year-marker]')) marker.setAttribute('opacity', marker.dataset.trendYearMarker === state.year ? '1' : '0');
      for (const button of parties) button.setAttribute('aria-pressed', String(button.dataset.trendParty === state.party));
      for (const line of chart.querySelectorAll<HTMLElement>('[data-trend-line]')) line.style.opacity = state.party === null || line.dataset.trendLine === state.party ? '1' : '.14';
      for (const value of chart.querySelectorAll<HTMLElement>('[data-trend-value]')) value.hidden=state.party!==null&&value.dataset.trendValue!==state.party;
    };
    if (!state) {
      state = { year: chart.dataset.inspectYear ?? chart.dataset.defaultYear ?? '', election:chart.dataset.defaultYear??'', party: chart.dataset.defaultParty??null,metric:chart.dataset.defaultMetric??'votes' };
      controls.set(chart, state);
      const saveSelection = () => {
        const state = controls.get(chart)!;
        const view = chart.ownerDocument.defaultView;
        if (!view || !/^https?:/.test(view.location.protocol)) return;
        const url = new URL(view.location.href);
        url.searchParams.set('metric', state.metric);
        if (state.party) url.searchParams.set('party', state.party); else url.searchParams.delete('party');
        if (state.year !== state.election) url.searchParams.set('history-year', state.year); else url.searchParams.delete('history-year');
        view.history.replaceState(null, '', url);
        chart.ownerDocument.dispatchEvent(new Event('results:selection-changed'));
      };
      let drag: { id: number; plot: HTMLElement; year: string; x: number; y: number; moved: boolean } | null = null;
      let suppressClickUntil = 0;
      const inspectAt = (plot: HTMLElement, x: number) => {
        const bounds = plot.getBoundingClientRect();
        const years = [...plot.querySelectorAll<HTMLButtonElement>('[data-trend-year]')];
        if (!bounds.width || !years.length) return;
        const index = Math.max(0, Math.min(years.length - 1, Math.floor((x - bounds.left) / bounds.width * years.length)));
        const state = controls.get(chart)!;
        const year = years[index]!.dataset.trendYear!;
        if (state.year !== year) { state.year = year; render(); }
      };
      chart.addEventListener('pointerdown', event => {
        if (drag || !event.isPrimary || event.button !== 0) return;
        const plot = (event.target as Element).closest<HTMLElement>('[data-trend-scrub]');
        if (!plot || !chart.contains(plot)) return;
        drag = { id: event.pointerId, plot, year: controls.get(chart)!.year, x: event.clientX, y: event.clientY, moved: false };
        // Capture the drag across year buttons while leaving vertical page scrolling native.
        plot.setPointerCapture?.(event.pointerId);
        inspectAt(plot, event.clientX);
      });
      chart.addEventListener('pointermove', event => {
        if (!drag || event.pointerId !== drag.id) return;
        if (!drag.moved) {
          const x = Math.abs(event.clientX - drag.x), y = Math.abs(event.clientY - drag.y);
          if (x < 6 || x <= y) return;
          drag.moved = true;
        }
        inspectAt(drag.plot, event.clientX);
      });
      const endDrag = (event: PointerEvent) => {
        if (!drag || event.pointerId !== drag.id) return;
        const current = drag;
        drag = null;
        if (current.plot.hasPointerCapture?.(current.id)) current.plot.releasePointerCapture(current.id);
        if (event.type !== 'pointerup') {
          controls.get(chart)!.year = current.year;
          render();
          return;
        }
        if (current.moved) {
          inspectAt(current.plot, event.clientX);
          suppressClickUntil = Date.now() + 400;
        }
        saveSelection();
      };
      chart.addEventListener('pointerup', endDrag);
      chart.addEventListener('pointercancel', endDrag);
      chart.addEventListener('lostpointercapture', endDrag);
      chart.addEventListener('click', event => {
        const button = (event.target as Element).closest<HTMLButtonElement>('button');
        if (!button || !chart.contains(button)) return;
        if (button.dataset.trendYear && event.detail !== 0 && Date.now() < suppressClickUntil) return;
        const state = controls.get(chart)!;
        if (button.dataset.trendYear) state.year = button.dataset.trendYear;
        if (button.dataset.trendParty) state.party = state.party === button.dataset.trendParty ? null : button.dataset.trendParty;
        if (button.dataset.trendMetric) state.metric=button.dataset.trendMetric;
        render();
        if (button.dataset.trendParty||button.dataset.trendMetric||button.dataset.trendYear) {
          saveSelection();
        }
      });
    }
    render();
  }
}
