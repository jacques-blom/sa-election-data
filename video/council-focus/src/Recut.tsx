import React from 'react';
import {AbsoluteFill, Composition, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import './style.css';

const cream='#f4f2e7',ink='#163a30',gold='#efd078';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

function Brand({light=false,small=false}:{light?:boolean;small?:boolean}){
  return <div style={{display:'flex',alignItems:'center',gap:small?11:19,color:light?cream:ink}}>
    <Img src={staticFile('counted-icon.svg')} style={{width:small?35:64}}/>
    <div style={{fontSize:small?31:49,fontWeight:650,letterSpacing:-1.5}}>Counted<span style={{fontSize:small?19:28,fontWeight:450,opacity:.65}}>.co.za</span></div>
  </div>;
}

type CardKind='hook'|'seats'|'coalitions'|'end';
const cards={
  hook:{lines:['Who runs','your council?'],accent:1,size:154},
  seats:{lines:['Watch the','balance shift.'],accent:1,size:154},
  coalitions:{lines:['No majority?','Follow the','coalition.'],accent:2,size:133},
  end:{lines:['Find your','council.'],accent:1,size:166},
};

function Title({kind}:{kind:CardKind}){
  const frame=useCurrentFrame();
  const card=cards[kind];
  const settle=interpolate(frame,[0,10],[1.035,1],{...clamp,easing:Easing.out(Easing.cubic)});
  return <AbsoluteFill style={{background:ink,color:cream,padding:88}}>
    <Brand light/>
    <div style={{position:'absolute',left:88,top:kind==='coalitions'?265:310,transform:`scale(${settle})`,transformOrigin:'0 50%',fontSize:card.size,fontWeight:650,letterSpacing:-6.5,lineHeight:1.04}}>
      {card.lines.map((line,i)=><div key={line} style={{color:i===card.accent?gold:cream}}>{line}</div>)}
    </div>
    {kind==='end'?<div style={{position:'absolute',left:93,bottom:120,fontSize:57,fontWeight:500,letterSpacing:-1.4}}>counted.co.za/councils</div>
      :<div style={{position:'absolute',left:93,bottom:120,height:6,width:interpolate(frame,[0,14],[80,250],clamp),background:gold}}/>}
  </AbsoluteFill>;
}

function Demo({file,crop=0,rate=1,coalition=false}:{file:string;crop?:number;rate?:number;coalition?:boolean}){
  return <AbsoluteFill style={{background:cream}}>
    <div style={{position:'absolute',left:0,top:0,width:1440,height:1008,overflow:'hidden'}}>
      <OffthreadVideo src={staticFile(`footage/${file}`)} muted playbackRate={rate} style={{position:'absolute',width:1440,height:1920,maxWidth:'none',left:0,top:-crop*3}}/>
    </div>
    <div style={{position:'absolute',left:0,right:0,bottom:0,height:72,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 44px',borderTop:'1px solid #ccd4c1',color:ink}}>
      <Brand small/>
      <span style={{fontSize:coalition?28:27,color:'#62776a'}}>{coalition?'Coalition history · MISTRA · Through Feb 2026':'Development preview'}</span>
    </div>
  </AbsoluteFill>;
}

function Film(){
  return <AbsoluteFill style={{fontFamily:'Space, sans-serif',background:cream}}>
    <Sequence durationInFrames={36} name="Who runs your council?"><Title kind="hook"/></Sequence>
    <Sequence from={36} durationInFrames={108} name="Search and open Tshwane"><Demo file="05-search.mp4" rate={1.3}/></Sequence>
    <Sequence from={144} durationInFrames={36} name="Watch the balance shift"><Title kind="seats"/></Sequence>
    <Sequence from={180} durationInFrames={132} name="Tap years, votes and DA"><Demo file="06-chart.mp4" crop={90}/></Sequence>
    <Sequence from={312} durationInFrames={54} name="Follow the coalition"><Title kind="coalitions"/></Sequence>
    <Sequence from={366} durationInFrames={150} name="Swipe history and open sources"><Demo file="07-coalitions.mp4" crop={75} coalition/></Sequence>
    <Sequence from={516} durationInFrames={84} name="Find your council"><Title kind="end"/></Sequence>
  </AbsoluteFill>;
}

export const Root=()=> <Composition id="CouncilFocus" component={Film} width={1440} height={1080} fps={30} durationInFrames={600}/>;
