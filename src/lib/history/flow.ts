import type { historyChart } from './chart.ts';

type FlowColumn = Omit<ReturnType<typeof historyChart>['columns'][number], 'year'> & { year: number };
/** Shared stacked-band geometry; column keys can also identify hypothetical scenarios. */
export function historyFlow(chart: { columns: FlowColumn[]; ceiling: number }) {
  const height=220,step=120,barWidth=36,width=Math.max(1,chart.columns.length)*step;
  const columns=chart.columns.map((column,index)=>{
    let cumulative=0;
    const remainder=column.segments.find(p=>p.id==='remainder');
    const values=[...column.values,{id:'remainder',short:'Other',name:'Other',color:'#b1baa8',value:column.available?(remainder?.value??0):null}];
    const nodes=values.map(value=>{
      const amount=value.value??0;
      const bottom=height-cumulative/chart.ceiling*height;
      const top=bottom-amount/chart.ceiling*height;
      cumulative+=amount;
      return {...value,top,bottom,height:bottom-top,known:column.available&&value.value!==null};
    });
    return {...column,x:index*step+(step-barWidth)/2,nodes};
  });
  const bands=columns.slice(1).flatMap((column,i)=>{
    const before=columns[i]!;
    if(!before.available||!column.available)return [];
    const x1=before.x+barWidth,x2=column.x,mid=(x1+x2)/2;
    return column.nodes.flatMap(node=>{
      const old=before.nodes.find(n=>n.id===node.id);
      if(!old?.known||!node.known||old.value===0&&node.value===0)return [];
      return [{id:node.id,color:node.color,from:before.year,to:column.year,
        path:`M${x1},${old.top}C${mid},${old.top} ${mid},${node.top} ${x2},${node.top}L${x2},${node.bottom}C${mid},${node.bottom} ${mid},${old.bottom} ${x1},${old.bottom}Z`}];
    });
  });
  return {width,height,barWidth,columns,bands};
}
