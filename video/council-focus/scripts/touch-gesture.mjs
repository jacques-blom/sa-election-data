import {execFileSync} from 'node:child_process';
const [session,selector]=process.argv.slice(2);
const url=execFileSync('agent-browser',['--session',session,'get','cdp-url'],{encoding:'utf8'}).trim();
const socket=new WebSocket(url);
await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject});
let id=0;const pending=new Map();
socket.onmessage=e=>{const m=JSON.parse(e.data);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)}};
const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params,...(sessionId?{sessionId}:{})}))});
const {targetInfos}=await send('Target.getTargets');
const target=targetInfos.find(t=>t.type==='page'&&t.url.includes('127.0.0.1:4321'));
if(!target)throw new Error('Recording page not found');
const {sessionId}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true});
const {result}=await send('Runtime.evaluate',{expression:`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();return {x:r.x+r.width*.8,y:r.y+r.height*.45,before:e.scrollLeft}})()`,returnByValue:true},sessionId);
const {x,y,before}=result.value;
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1},sessionId);
await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,radiusX:8,radiusY:8,force:1,id:0}]},sessionId);
for(let step=1;step<=16;step++){
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-310*step/16,y,radiusX:8,radiusY:8,force:1,id:0}]},sessionId);
  await new Promise(resolve=>setTimeout(resolve,25));
}
await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},sessionId);
await new Promise(resolve=>setTimeout(resolve,200));
const {result:after}=await send('Runtime.evaluate',{expression:`document.querySelector(${JSON.stringify(selector)}).scrollLeft`,returnByValue:true},sessionId);
console.log(JSON.stringify({before,after:after.value,x,y}));
socket.close();
if(after.value<=before)throw new Error('The native touch gesture did not advance the timeline');
