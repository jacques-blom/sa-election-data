import { historyChart, type HistoryMetric } from '../history/chart.ts';
import { latestYear } from '../history/comparison.ts';
import type { ElectionTrends } from '../history/trends.ts';
import type { ShareCard } from './model.ts';

/** Share the same chart data as the page, including Other and missing elections. */
export function historyShareCard(history: ElectionTrends, metric: HistoryMetric, area: string): ShareCard {
  const chart = historyChart(history, metric);
  return selectHistoryShareCard({
    kind:'history', year:history.through, area, headline:metric==='seats'?'How the council changed':'How the vote changed',
    metric:String(history.through), metricLabel:metric==='seats'?'Council seats':'Vote share by election',
    ballot:metric==='seats'?'Reported council allocations':history.ballotLabel,
    parties:[], total:null, progress:null, reportedAt:history.latest?.source.reportedAt??'',
    note:[history.through===latestYear?'2026 provisional.':'Historical results.', 'Gaps = unavailable.', history.level!=='national'?'Boundaries may differ.':''].filter(Boolean).join(' '),
    caption:'', history:{chart,metric,year:history.through,party:null},
  }, {year:history.through,party:null});
}

export function selectHistoryShareCard(base: ShareCard, selection: {year:number;party:string|null}): ShareCard {
  const card=structuredClone(base);
  if (!card.history) return card;
  const h=card.history;
  h.year=h.chart.columns.some(c=>c.year===selection.year)?selection.year:card.year;
  h.party=h.chart.series.some(p=>p.id===selection.party)?selection.party:null;
  const selected=h.chart.columns.find(c=>c.year===h.year);
  const party=h.chart.series.find(p=>p.id===h.party);
  card.metric=String(h.year);
  card.metricLabel=party?`${party.short} · ${h.metric==='seats'?'seats':'vote share'}`:h.metric==='seats'?'Council seats':'Vote share by election';
  const rows=h.party?selected?.values.filter(p=>p.id===h.party):h.chart.readouts.find(r=>r.year===h.year)?.values;
  const values=rows?.map(p=>`${p.short}: ${!selected?.available||p.value===null?'unavailable':h.metric==='seats'?`${p.value} seats`:`${p.value.toFixed(1)}%`}`).join(' · ');
  card.caption=`${card.area}: ${card.headline.toLowerCase()} (${h.chart.columns[0]?.year}–${card.year}).\n${card.ballot}.\n${h.year}: ${selected?.available?values:'Figures unavailable.'}\n${card.note}\nSource: IEC.`;
  return card;
}
