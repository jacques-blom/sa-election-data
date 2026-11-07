import test from 'node:test';
import assert from 'node:assert/strict';
import { historyFlow } from '../src/lib/history/flow.ts';
import { changeValue } from '../src/lib/history/change.ts';
import type { historyChart } from '../src/lib/history/chart.ts';

type Chart=ReturnType<typeof historyChart>;
function chart(values:(number|null)[][],ceiling=100):Chart {
  return {series:[],readouts:[],ceiling,available:true,columns:values.map((shares,index)=>{
    const available=shares.some(n=>n!==null);
    const values=shares.map((value,i)=>({id:String(i),name:`Party ${i}`,short:`P${i}`,color:'#333',value}));
    const total=available?values.reduce((n,p)=>n+(p.value??0),0):null;
    return {year:([2011,2016,2021] as const)[index]!,available,total,ceiling,majority:null,values,segments:values.filter(p=>p.value!==null&&p.value>0)};
  })};
}
test('party ribbons connect matching parties and conserve the full column height',()=>{
  const data=chart([[40,30],[35,35]]);
  for(const c of data.columns)c.segments.push({id:'remainder',name:'Other',short:'Other',color:'#aaa',value:30});
  const flow=historyFlow(data);
  for(const c of flow.columns){
    assert.equal(c.nodes.reduce((n,p)=>n+p.height,0),flow.height);
    assert.equal(c.nodes[0]!.bottom,flow.height);
    assert.equal(c.nodes.at(-1)!.top,0);
  }
  assert.deepEqual(flow.bands.map(b=>[b.id,b.from,b.to]),[['0',2011,2016],['1',2011,2016],['remainder',2011,2016]]);
  assert(flow.bands.every(b=>!b.path.includes('NaN')));
  assert(flow.columns[1]!.nodes[0]!.height<flow.columns[0]!.nodes[0]!.height);
});
test('missing years and unknown parties remain gaps; known zero can taper to a point',()=>{
  assert.equal(historyFlow(chart([[70,30],[null,null],[60,40]])).bands.length,0);
  const flow=historyFlow(chart([[70,0,null],[60,10,30]]));
  assert.deepEqual(flow.bands.map(b=>b.id),['0','1']);
  assert.equal(flow.columns[0]!.nodes[1]!.height,0);
  assert.equal(flow.columns[0]!.nodes[1]!.known,true);
  assert.equal(flow.columns[0]!.nodes[2]!.known,false);
});
test('seat histories share one scale instead of stretching different councils to 100%',()=>{
  const flow=historyFlow(chart([[6,4],[12,8]],20));
  assert.equal(flow.columns[0]!.nodes.reduce((n,p)=>n+p.height,0),110);
  assert.equal(flow.columns[1]!.nodes.reduce((n,p)=>n+p.height,0),220);
});
test('delta signs, colours and accessible descriptions agree with rounded display values',()=>{
  assert.deepEqual(changeValue(-0.04),{direction:'flat',text:'0.0 pp',description:'No change'});
  assert.deepEqual(changeValue(3.85),{direction:'up',text:'+3.9 pp',description:'Increase of 3.9 percentage points'});
  assert.deepEqual(changeValue(-1,'seats'),{direction:'down',text:'−1 seat',description:'Decrease of 1 seat'});
  assert.deepEqual(changeValue(2,'seats'),{direction:'up',text:'+2 seats',description:'Increase of 2 seats'});
});
