import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {footage, trailerCast} from './footage';
import './style.css';

import {C, Sprite, Grain, Sparks, Logo, Chain, ease, pop} from './Art';

function Hook(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.dark,alignItems:'center'}}>
    <Sparks count={16}/>
    <div className="hero" style={{top:340,fontSize:108,transform:`scale(${pop(f)})`}}>ONE MAYORAL<br/><span style={{color:C.gold}}>CHAIN.</span></div>
    <div style={{position:'absolute',top:760,transform:`rotate(${Math.sin(f/10)*5}deg) scale(${ease(f,0,48,1,1.12)})`}}><Chain size={440}/></div>
    <div style={{position:'absolute',top:1320,width:1024,height:384}}><Img src={staticFile('sprites/council-chamber-v2.webp')} style={{width:'100%',imageRendering:'pixelated'}}/>
      {[0,8,2,3].map((row,i)=><Sprite key={row} kind="walk" row={row} pose={Math.floor(f/3)%8} size={208} style={{position:'absolute',left:70+i*216,top:132}}/>)}
    </div>
  </AbsoluteFill>;
}
function Cast(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.cream,color:C.ink,alignItems:'center'}}>
    <div className="hero" style={{color:C.ink,top:340,fontSize:96,transform:`scale(${pop(f)})`}}>SEVERAL<br/><span style={{color:C.red}}>PERSONALITIES.</span></div>
    <div style={{position:'absolute',top:830,display:'grid',gridTemplateColumns:'repeat(4, 220px)',gap:'110px 20px'}}>{trailerCast.map((row,i)=>
      <div key={i} style={{position:'relative',transform:`translateY(${ease(f,i*1.4,i*1.4+7,80,0)}px) scale(${pop(f,i*1.4)})`,opacity:ease(f,i*1.4,i*1.4+3,0,1)}}><div style={{position:'absolute',left:14,right:14,bottom:0,height:170,background:C.pale,borderBottom:`8px solid ${C.ink}`}}/><Sprite row={row} size={220} pose={f<15?0:i%2===0?2:3} style={{position:'relative'}}/></div>
    )}</div>
  </AbsoluteFill>;
}
function Setup(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.gold,alignItems:'center'}}>
    <div className="hero" style={{top:285,fontSize:102,color:C.ink,transform:`scale(${pop(f)})`}}>WHAT COULD<br/>POSSIBLY<br/><span style={{color:C.red}}>GO WRONG?</span></div>
    <Sprite kind="bird" row={0} pose={f<20?0:3} size={832} style={{position:'absolute',top:870,transform:`translateY(${ease(f,0,8,50,0)}px)`}}/>
  </AbsoluteFill>;
}
function Gameplay(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.cream,alignItems:'center'}}>
    <div style={{position:'absolute',top:48,fontFamily:'Pixel',fontSize:54,lineHeight:1.1,color:C.ink,transform:`scale(${pop(f)})`,textAlign:'center'}}>BUILD A MAJORITY.</div>
    <div style={{position:'absolute',top:160,width:972,height:1510,overflow:'hidden'}}>
      <OffthreadVideo src={staticFile(footage.build.file)} trimBefore={footage.build.start} playbackRate={footage.build.speed} muted style={{width:972,height:1728}}/>
    </div>
  </AbsoluteFill>;
}
function Outcome(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.cream,alignItems:'center'}}>
    <div style={{position:'absolute',top:170,width:1080,height:1540,overflow:'hidden',transform:`translateX(${f>=50&&f<58?(f%2===0?5:-5):0}px)`}}>
      <Freeze frame={114} active={f >= 114}><OffthreadVideo src={staticFile(footage.outcome.file)} trimBefore={footage.outcome.start} playbackRate={footage.outcome.speed} muted style={{width:1080,height:1920}}/></Freeze>
    </div>
  </AbsoluteFill>;
}
function Bird(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.gold,color:C.ink,alignItems:'center'}}>
    <div style={{position:'absolute',top:280,width:920,background:C.cream,border:`9px solid ${C.ink}`,boxShadow:`16px 16px 0 ${C.ink}`,padding:'68px 30px',transform:`scale(${pop(f)})`}}>
      <div style={{fontFamily:'Pixel',fontSize:88,textAlign:'center',lineHeight:1.17}}>WELL.<br/>THAT LASTED.</div>
      <div style={{position:'absolute',bottom:-51,left:430,width:80,height:80,background:C.cream,borderRight:`9px solid ${C.ink}`,borderBottom:`9px solid ${C.ink}`,transform:'rotate(45deg)'}}/>
    </div>
    <Sprite kind="bird" row={2} pose={Math.min(3,Math.floor(f/6))} size={832} style={{position:'absolute',top:870}}/>
  </AbsoluteFill>;
}
function End(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.ink,alignItems:'center'}}>
    <Sparks count={20}/>
    <div style={{position:'absolute',top:320,textAlign:'center',transform:`scale(${pop(f)})`}}><Logo size={114}/></div>
    <div style={{position:'absolute',top:720,color:C.gold,fontSize:50,textAlign:'center',lineHeight:1.3}}>Now with a restart button.</div>
    <div style={{position:'absolute',top:955,width:880,height:300,display:'flex',justifyContent:'center',alignItems:'center'}}>{[0,2,4,6,8,3,5,7].map((row,i)=><Sprite key={row} kind="walk" row={row} pose={Math.floor((f+i)/3)%8} size={128} style={{marginLeft:i===0?0:-20,transform:`translateY(${i%2===0?-18:18}px)`}}/>)}</div>
    <div style={{position:'absolute',top:1370,width:880,padding:'40px 30px',background:C.gold,boxShadow:'12px 12px 0 #061e18',textAlign:'center',transform:`translateY(${ease(f,0,8,60,0)}px)`}}>
      <div style={{fontFamily:'Pixel',fontSize:36,color:C.ink}}>PLAY AT</div>
      <div style={{marginTop:14,fontSize:68,fontWeight:700,color:C.ink}}>counted.co.za/chaos</div>
    </div>
  </AbsoluteFill>;
}
export function Trailer(){
  return <AbsoluteFill style={{fontFamily:'Space',background:C.dark}}>
    <Audio src={staticFile('audio/coalition-chaos.wav')}/>
    <Sequence name="One mayoral chain" from={0} durationInFrames={48}><Hook/></Sequence>
    <Sequence name="Several personalities" from={48} durationInFrames={48}><Cast/></Sequence>
    <Sequence name="What could possibly go wrong?" from={96} durationInFrames={48}><Setup/></Sequence>
    <Sequence name="Build a majority — real game" from={144} durationInFrames={135}><Gameplay/></Sequence>
    <Sequence name="ActionSA walks out — real game" from={279} durationInFrames={153}><Outcome/></Sequence>
    <Sequence name="Madam Speaker" from={432} durationInFrames={60}><Bird/></Sequence>
    <Sequence name="Play Coalition Chaos" from={492} durationInFrames={108}><End/></Sequence>
    <Grain/>
  </AbsoluteFill>;
}
