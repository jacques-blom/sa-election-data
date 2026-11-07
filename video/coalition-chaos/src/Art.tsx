import React from 'react';
import {AbsoluteFill, staticFile, interpolate, useCurrentFrame} from 'remotion';

export const C = {ink:'#123b32', dark:'#071f1b', cream:'#fff8e5', gold:'#f6cf58', red:'#ee593a', pale:'#d7dfb5'};
const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const ease = (f:number, from:number, to:number, a:number, b:number) => interpolate(f,[from,to],[a,b],clamp);
export const pop = (f:number, start=0) => interpolate(f,[start,start+5,start+9],[.7,1.08,1],clamp);

export function Sprite({kind='leader',row=0,pose=0,size=256,style={}}:{kind?:'leader'|'bird'|'walk';row?:number;pose?:number;size?:number;style?:React.CSSProperties}) {
  const file = kind==='bird'?'speaker-frames-v3.webp':kind==='walk'?'leaders-walk-v4.webp':'leaders-expressions-v4.webp';
  const cols = kind==='walk'?8:4, rows=kind==='bird'?3:9;
  return <div style={{width:size,height:size,flexShrink:0,backgroundImage:`url(${staticFile(`sprites/${file}`)})`,backgroundSize:`${cols*100}% ${rows*100}%`,backgroundPosition:`${pose*100/(cols-1)}% ${row*100/(rows-1)}%`,imageRendering:'pixelated',...style}}/>;
}
export function Grain() {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents:'none',opacity:.025,backgroundImage:'repeating-linear-gradient(0deg, transparent 0px, transparent 5px, #000 5px, #000 7px)',transform:`translateY(${f%2}px)`}}/>;
}
export function Sparks({count=28,gold=true,height=1920}:{count?:number;gold?:boolean;height?:number}) {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents:'none'}}>{Array.from({length:count},(_,i)=>{
    const x=(i*173+81)%1080, y=((i*277+f*(i%3+1)*3)%(height+180))-90;
    return <div key={i} style={{position:'absolute',left:x,top:y,width:i%3===0?12:7,height:i%3===0?12:7,background:gold?C.gold:C.pale,opacity:.15+(i%4)*.08}}/>;
  })}</AbsoluteFill>;
}
export function Logo({size=106}:{size?:number}){
  return <div style={{fontFamily:'Pixel',fontSize:size,lineHeight:1.04,letterSpacing:-4,color:C.cream,textShadow:`7px 7px 0 ${C.dark}`}}>COALITION<br/>CHAOS<span style={{color:C.red}}>_</span></div>;
}
export function Chain({size=330}:{size?:number}){
  // Crisp original vector ornament; the game sprites remain untouched.
  return <svg width={size} height={size} viewBox="0 0 64 64" style={{imageRendering:'pixelated',filter:'drop-shadow(0 12px 0 #061c17)'}} shapeRendering="crispEdges">
    <path d="M10 6h8v20h-8zM18 24h8v10h-8zM26 32h12v8H26zM38 24h8v10h-8zM46 6h8v20h-8z" fill="#9a6224"/>
    <path d="M8 4h8v20H8zM16 22h8v10h-8zM24 30h16v8H24zM40 22h8v10h-8zM48 4h8v20h-8z" fill={C.gold}/>
    <path d="M10 6h3v14h-3zM50 6h3v14h-3zM18 24h3v5h-3zM42 24h3v5h-3z" fill="#fff0a0"/>
    <path d="M24 38h16v4h4v14h-4v4H24v-4h-4V42h4z" fill="#a66a24"/>
    <path d="M24 36h16v4h4v14h-4v4H24v-4h-4V40h4z" fill={C.gold}/>
    <path d="M26 41h12v3h-9v7h-3z" fill="#fff0a0"/><path d="M31 44h5v9h-5z" fill="#b2782b"/>
  </svg>;
}
