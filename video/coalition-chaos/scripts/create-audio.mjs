import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
// An original, deterministic 20-second chip score. No samples or external music.
const rate=48000, duration=20, frames=rate*duration;
const left=new Float64Array(frames), right=new Float64Array(frames);
const midi=n=>440*2**((n-69)/12);
let noiseSeed=9137;
function noise(){noiseSeed=(Math.imul(noiseSeed,1664525)+1013904223)>>>0;return noiseSeed/2147483648-1;}
function note(time,length,pitch,{volume=.08,type='pulse',pan=0,endPitch=pitch,duty=.25}={}){
  const first=Math.round(time*rate), count=Math.round(length*rate);
  let phase=0;
  for(let j=0;j<count&&first+j<frames;j++){
    const t=j/rate,ratio=j/count;
    const freq=midi(pitch+(endPitch-pitch)*ratio);
    phase=(phase+freq/rate)%1;
    const raw=type==='noise'?noise():type==='sine'?Math.sin(phase*2*Math.PI):type==='triangle'?1-4*Math.abs(phase-.5):phase<duty?1:-1;
    const envelope=Math.min(1,t/.006)*Math.min(1,(length-t)/.035)*(type==='noise'?Math.exp(-t*35):.85+.15*Math.exp(-t*18));
    const value=raw*volume*envelope;
    left[first+j]+=value*(1-Math.max(0,pan)*.55);right[first+j]+=value*(1+Math.min(0,pan)*.55);
  }
}
function kick(t,v=.13){note(t,.15,45,{type:'sine',endPitch:22,volume:v});}
function snare(t){note(t,.09,40,{type:'noise',volume:.05,pan:.12});note(t,.07,50,{type:'triangle',volume:.055});}
function hat(t){note(t,.03,100,{type:'noise',volume:.017,pan:-.3});}
function arp(t,notes,s=.07,v=.08){notes.forEach((n,i)=>note(t+i*s,s*.9,n,{volume:v,pan:i%2?.15:-.15}));}
// Cold open: ceremonial chimes and an ominously self-important bass.
arp(.03,[48,55,60,64,67,72],.09,.08);
[0,.6,1.2].forEach(t=>{kick(t);note(t,.5,36,{type:'triangle',volume:.13});});
// Character-selection flourish.
arp(1.6,[60,64,67,72,76,79,84,88],.09,.065);
[1.6,2,2.4,2.8].forEach(t=>{kick(t);hat(t+.225);note(t,.2,43,{type:'triangle',volume:.1});});
// The bird raises an eyebrow at the third intro card.
arp(3.2,[64,63,60],.18,.055);note(3.8,.45,43,{type:'triangle',volume:.09});
// Bright, slightly overconfident arcade loop under the real deal.
const lead=[72,76,79,76,74,77,81,77,76,79,84,79,74,77,81,79];
for(let i=0;i<30;i++){
  const t=4.8+i*.225;
  if(t>=10.5)break;
  note(t,.15,lead[i%16],{volume:.043,pan:.25});hat(t);
  if(i%2===0){kick(t,.09);note(t,.32,[36,41,43,36][Math.floor(i/8)%4],{volume:.105,type:'triangle',pan:-.12});}
  if(i%4===2)snare(t);
}
// UI taps and victory fanfare, before negotiations take their inevitable turn.
arp(5.7,[79,84],.045,.08);arp(6.9,[79,84,88],.045,.08);
arp(7.1,[72,76,79,84],.1,.1);note(7.5,.65,60,{type:'triangle',volume:.13});
// A comedy power-down aligned to the real walkout reveal.
note(10.53,.5,76,{endPitch:30,volume:.14,duty:.125});
note(10.57,.43,64,{endPitch:24,volume:.07,pan:-.2});
// Deliberate dead air, then a tiny defeated question.
arp(12.1,[55,54,48],.18,.04);
// Bird's dry response: two low blips, no voice imitation.
note(14.4,.1,55,{volume:.06});note(14.62,.2,48,{volume:.055});
// Restart: cheerful final sting, with room for the end card to be read.
const final=[72,76,79,84,79,76,74,77,81,86,84,79,76,79,84,88];
for(let i=0;i<16;i++){
  const t=16.4+i*.18;
  note(t,.13,final[i],{volume:.055,pan:i%2?.2:-.2});hat(t);
  if(i%2===0){kick(t,.1);note(t,.3,[36,41,43,36][Math.floor(i/4)],{type:'triangle',volume:.12});}
  if(i%4===2)snare(t);
}
arp(19.48,[60,67,72,76,84],.055,.07);
// Small stereo echo; clean headroom, and a 60ms final fade.
for(let i=frames-1;i>=rate*.11;i--){left[i]+=right[i-Math.round(rate*.11)]*.15;right[i]+=left[i-Math.round(rate*.11)]*.15;}
let peak=0;for(let i=0;i<frames;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
const gain=.78/peak, data=Buffer.alloc(frames*4);
let squares=0;
for(let i=0;i<frames;i++){
  const fade=Math.min(1,(frames-i)/(rate*.06));
  const l=left[i]*gain*fade,r=right[i]*gain*fade;
  squares+=(l*l+r*r)/2;
  data.writeInt16LE(Math.round(l*32767),i*4);data.writeInt16LE(Math.round(r*32767),i*4+2);
}
const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(data.length+36,4);header.write('WAVE',8);header.write('fmt ',12);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(data.length,40);
const dir=fileURLToPath(new URL('../public/audio/',import.meta.url));mkdirSync(dir,{recursive:true});writeFileSync(`${dir}coalition-chaos.wav`,Buffer.concat([header,data]));
console.log(`Original score: ${duration}s, ${rate}Hz stereo; peak -2.16dBFS; RMS ${20*Math.log10(Math.sqrt(squares/frames))}dBFS.`);
