import React from 'react';
import {AbsoluteFill, Audio, Composition, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import './style.css';

const cream='#f4f2e7',ink='#163a30',muted='#62776a',gold='#d7af53';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const cuts=[
  {from:60,duration:210,file:'01-directory.mp4',title:'Every council. A clearer picture.',foot:'Council results · Seats and majorities',crop:18},
  {from:270,duration:210,file:'02-council.mp4',title:'Put the council at the centre.',foot:'Tshwane · Council seats',crop:0},
  {from:480,duration:225,file:'03-history.mp4',title:'See how your council has changed.',foot:'Tshwane · Explore results across elections',crop:90},
  {from:705,duration:270,file:'04-coalitions.mp4',title:'Now, follow who governed.',foot:'Coalition history · MISTRA · Through 28 February 2026',crop:75},
];

function Brand({light=false,large=false}:{light?:boolean;large?:boolean}){
  return <div style={{display:'flex',alignItems:'center',gap:large?22:12,color:light?cream:ink}}>
    <Img src={staticFile('counted-icon.svg')} style={{width:large?74:38}}/>
    <div style={{fontSize:large?54:29,fontWeight:650,letterSpacing:-1.4}}>Counted<span style={{fontSize:large?29:18,fontWeight:450,opacity:.65}}>.co.za</span></div>
  </div>;
}

function Title({closing=false}:{closing?:boolean}){
  const frame=useCurrentFrame();
  const enter=interpolate(frame,[0,22],[0,1],{...clamp,easing:Easing.out(Easing.cubic)});
  return <AbsoluteFill style={{background:ink,color:cream,padding:100}}>
    <Brand light large/>
    <div style={{position:'absolute',left:100,top:310,opacity:enter,transform:`translateY(${(1-enter)*20}px)`}}>
      <div style={{width:72,height:5,background:gold,marginBottom:36}}/>
      <div style={{fontSize:108,fontWeight:550,letterSpacing:-5,lineHeight:1.05}}>{closing?<>Find your<br/>council.</>:<>Your council.<br/>In focus.</>}</div>
      <div style={{marginTop:48,fontSize:closing?43:35,color:closing?'#efd078':'#c5d0bd',letterSpacing:-.7}}>{closing?'counted.co.za/councils':'Seats. Majorities. Coalition history.'}</div>
    </div>
    <div style={{position:'absolute',bottom:83,left:100,right:100,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:23,color:'#bac8b5'}}>
      <span>{closing?'Explore the local picture.':'A council-focused update'}</span>
      <span style={{width:84,height:3,background:gold}}/>
    </div>
  </AbsoluteFill>;
}

function Shot({shot,index}:{shot:typeof cuts[number];index:number}){
  const frame=useCurrentFrame();
  const isHistory=index===2;
  const crop=isHistory?90:shot.crop;
  const zoom=interpolate(frame,[0,shot.duration],[1,1.013],clamp);
  const fade=interpolate(frame,[0,7,shot.duration-6,shot.duration],[0,1,1,0],clamp);
  const title=index===3&&frame>140?'Even where no party had a majority.':shot.title;
  return <AbsoluteFill style={{background:cream,color:ink}}>
    <div style={{position:'absolute',top:30,left:120,fontSize:18,letterSpacing:2.2,fontWeight:550,color:muted}}>COUNCIL UPDATE <span style={{marginLeft:18,color:'#a1ad99'}}>0{index+1} / 04</span></div>
    <div style={{position:'absolute',top:31,right:120}}><Brand/></div>
    <div style={{position:'absolute',top:78,left:120,fontSize:42,fontWeight:550,letterSpacing:-1.3}}>{title}</div>
    <div style={{position:'absolute',left:120,top:146,width:1200,height:840,overflow:'hidden',borderRadius:16,boxShadow:'0 14px 34px #163a3010',background:cream,border:'1px solid #ccd4c1',opacity:fade}}>
      <div style={{position:'absolute',inset:0,transform:`scale(${zoom})`,transformOrigin:'50% 45%'}}>
        <OffthreadVideo src={staticFile(`footage/${shot.file}`)} muted style={{position:'absolute',width:1200,height:1600,maxWidth:'none',left:0,top:-crop*2.5}}/>
      </div>
    </div>
    <div style={{position:'absolute',left:120,right:120,top:1010,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:22,color:muted}}>
      <span>{shot.foot}</span><span style={{fontSize:17,color:'#7d8c75'}}>Development preview</span>
    </div>
  </AbsoluteFill>;
}

function Film(){
  return <AbsoluteFill style={{fontFamily:'Space, sans-serif',background:cream}}>
    <Sequence durationInFrames={60}><Title/></Sequence>
    {cuts.map((shot,index)=><Sequence key={shot.file} from={shot.from} durationInFrames={shot.duration}><Shot shot={shot} index={index}/></Sequence>)}
    <Sequence from={975} durationInFrames={105}><Title closing/></Sequence>
    <Audio src={staticFile('audio/council-focus.wav')} volume={.55}/>
  </AbsoluteFill>;
}

export const Root=()=> <Composition id="CouncilFocus" component={Film} width={1440} height={1080} fps={30} durationInFrames={1080}/>;
