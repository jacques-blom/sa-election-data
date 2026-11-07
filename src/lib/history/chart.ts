import type { ElectionTrends } from './trends.ts';

export type HistoryMetric = 'votes' | 'seats';
export const HISTORY_GAIN_THRESHOLD_PP = 2;
/** An explicit shared view wins; otherwise municipalities start with reported seats. */
export function initialHistoryMetric(level: string, hasSeats: boolean, requested: string | null): HistoryMetric {
  if (requested==='votes') return 'votes';
  return level==='municipality'&&hasSeats?'seats':'votes';
}
/** Keep full denominators. Unshown and grouped entries occupy a visible remainder. */
export function historyChart(history: ElectionTrends, metric: HistoryMetric) {
  const series = history.series.filter(s=>history.defaultPartyIds.includes(s.id));
  const totals = history.elections.flatMap(e=>e.seats?[e.seats.total]:[]);
  const ceiling = metric === 'votes' ? 100 : Math.max(1,...totals);
  const columns = history.years.map(year=>{
    const election = history.elections.find(e=>e.year===year);
    const total = metric === 'votes' ? election?.total : election?.seats?.total;
    const available = total !== null && total !== undefined && total > 0;
    const values = series.map(s=>{
      const vote = s.points.find(p=>p.year===year)?.share ?? null;
      const seat = election?.seats?.parties.find(p=>p.id===s.id && !p.grouped);
      const seatValue = seat?.count ?? (election?.seats && !election.seats.parties.some(p=>p.grouped) ? 0 : null);
      return {id:s.id,name:s.name,short:s.short,color:s.color,value:metric==='votes'?vote:seatValue};
    });
    const sum = values.reduce((n,p)=>n+(p.value??0),0);
    const whole = metric === 'votes' ? 100 : total ?? 0;
    const valid = available && sum <= whole + 1e-8;
    const remainder = valid ? Math.max(0,whole-sum) : null;
    const segments = valid ? [...values.filter(p=>p.value!==null&&p.value>0),
      ...(remainder!>1e-8?[{id:'remainder',name:'Other and unlisted parties',short:'Other',color:'#b1baa8',value:remainder}]:[])] : [];
    return {year,available:valid,total:available?total:null,values,segments,ceiling,
      majority:metric==='seats'?election?.seats?.majority:null};
  });
  const readouts = columns.map((column,index)=>{
    const previous = columns[index-1];
    const previousValue = (id:string) => metric==='votes'
      ? history.series.find(p=>p.id===id)?.points.find(p=>p.year===previous?.year)?.share ?? null
      : previous?.values.find(p=>p.id===id)?.value ?? null;
    const gainers = metric==='votes' && column.available && previous?.available
      ? history.series.filter(p=>!history.defaultPartyIds.includes(p.id)).flatMap(p=>{
        const value=p.points.find(point=>point.year===column.year)?.share ?? null;
        const before=previousValue(p.id);
        return value!==null && before!==null && value-before>=HISTORY_GAIN_THRESHOLD_PP-1e-8
          ? [{id:p.id,name:p.name,short:p.short,color:p.color,value,delta:value-before}] : [];
      }).sort((a,b)=>b.delta-a.delta||a.name.localeCompare(b.name)) : [];
    const values = column.available ? column.values.filter(p=>p.value!==null).map(p=>{
      const before=previous?.available?previousValue(p.id):null;
      return {...p,value:p.value!,delta:before===null?null:p.value!-before};
    }).concat(gainers) : [];
    if(metric==='votes' && column.available) {
      const remainder=Math.max(0,100-values.reduce((sum,p)=>sum+p.value,0));
      // Compare the same set of remaining parties, even when the source's named rows change.
      const before=previous?.available && values.every(p=>previousValue(p.id)!==null)
        ? Math.max(0,100-values.reduce((sum,p)=>sum+previousValue(p.id)!,0)) : null;
      if(remainder>1e-8 || before!==null && before>1e-8) values.push({
        id:'remainder',name:'Other and unlisted parties',short:'Other',color:'#b1baa8',value:remainder,
        delta:before===null?null:remainder-before,
      });
    }
    return {year:column.year,values};
  });
  return {series,columns,readouts,ceiling,available:columns.some(c=>c.available)};
}
