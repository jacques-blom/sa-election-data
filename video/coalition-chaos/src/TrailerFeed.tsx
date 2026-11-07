import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, Chain, Grain, Logo, Sparks, Sprite, ease, pop} from './Art';
import {footage, trailerCast} from './footage';
import './style.css';

// The 4:5 film has its own shot layouts. Coordinates below are composed for
// 1080×1350; no portrait master is scaled down or cropped as a whole.
const H = 1350;
type RegionProps = {
  source: typeof footage.build;
  crop: readonly [x:number, y:number, width:number, height:number];
  left:number;
  top:number;
  width:number;
};
function RecordedRegion({source,crop:[x,y,w,h],left,top,width}:RegionProps) {
  const scale=width/w;
  return <div style={{position:'absolute',left,top,width,height:h*scale,overflow:'hidden'}}>
    <OffthreadVideo src={staticFile(source.file)} trimBefore={source.start} playbackRate={source.speed} muted style={{position:'absolute',left:-x*scale,top:-y*scale,width:540*scale,height:960*scale,maxWidth:'none'}}/>
  </div>;
}
function HookFeed(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.dark,alignItems:'center'}}>
    <Sparks count={18} height={H}/>
    <div className="hero" style={{top:115,fontSize:106,transform:`scale(${pop(f)})`}}>ONE MAYORAL<br/><span style={{color:C.gold}}>CHAIN.</span></div>
    <div style={{position:'absolute',top:435,transform:`rotate(${Math.sin(f/10)*5}deg) scale(${ease(f,0,48,1,1.1)})`}}><Chain size={320}/></div>
    <div style={{position:'absolute',left:28,top:865,width:1024,height:384}}>
      <Img src={staticFile('sprites/council-chamber-v2.webp')} style={{width:1024,height:384,imageRendering:'pixelated'}}/>
      {[0,8,2,3].map((row,i)=><Sprite key={row} kind="walk" row={row} pose={Math.floor(f/3)%8} size={192} style={{position:'absolute',left:68+i*216,top:150}}/>)}
    </div>
  </AbsoluteFill>;
}
function CastFeed(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.cream,color:C.ink}}>
    <div className="hero" style={{top:150,fontSize:96,color:C.ink,transform:`scale(${pop(f)})`}}>SEVERAL<br/><span style={{color:C.red}}>PERSONALITIES.</span></div>
    <div style={{position:'absolute',left:36,top:515,display:'grid',gridTemplateColumns:'repeat(4,240px)',gap:'80px 16px'}}>
      {trailerCast.map((row,i)=><div key={i} style={{position:'relative',opacity:ease(f,i*1.4,i*1.4+3,0,1),transform:`translateY(${ease(f,i*1.4,i*1.4+7,55,0)}px) scale(${pop(f,i*1.4)})`}}>
        <div style={{position:'absolute',left:16,right:16,bottom:0,height:180,background:C.pale,borderBottom:`8px solid ${C.ink}`}}/>
        <Sprite row={row} pose={f<15?0:i%2===0?2:3} size={240} style={{position:'relative'}}/>
      </div>)}
    </div>
  </AbsoluteFill>;
}
function SetupFeed(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.gold,color:C.ink}}>
    <div style={{position:'absolute',left:68,top:210,fontFamily:'Pixel',fontSize:92,lineHeight:1.12,letterSpacing:-4,transform:`scale(${pop(f)})`,transformOrigin:'left center'}}>WHAT COULD<br/>POSSIBLY<br/><span style={{color:C.red}}>GO WRONG?</span></div>
    <Sprite kind="bird" row={0} pose={f<20?0:3} size={704} style={{position:'absolute',left:335,top:535,transform:`translateY(${ease(f,0,8,45,0)}px)`}}/>
  </AbsoluteFill>;
}
function BuildFeed(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.cream,color:C.ink}}>
    <div style={{position:'absolute',top:42,width:'100%',fontFamily:'Pixel',fontSize:49,textAlign:'center',transform:`scale(${pop(f)})`}}>BUILD A MAJORITY.</div>
    <Freeze frame={116} active={f>=116}>
      <RecordedRegion source={footage.build} crop={[22,20,500,49]} left={65} top={144} width={950}/>
      <RecordedRegion source={footage.build} crop={[22,82,500,174]} left={65} top={246} width={950}/>
      <RecordedRegion source={footage.build} crop={[22,310,500,256]} left={65} top={610} width={950}/>
      <RecordedRegion source={footage.build} crop={[22,722,500,78]} left={65} top={1140} width={950}/>
    </Freeze>
    {/* The recorded test opens a modal. Hold the board for the edit and mark
        that same real button press at its recomposed screen position. */}
    {f>=119?<div style={{position:'absolute',left:490,top:1165,width:100,height:100,border:`7px solid ${C.red}`,boxShadow:`0 0 0 5px ${C.cream}`,pointerEvents:'none',opacity:ease(f,119,134,1,0),transform:`scale(${ease(f,119,134,.65,1.3)})`}}/>:null}
  </AbsoluteFill>;
}
function OutcomeFeed(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.cream,color:C.ink}}>
    <div style={{position:'absolute',top:48,width:'100%',fontFamily:'Pixel',fontSize:24,textAlign:'center',letterSpacing:2,color:'#a54027'}}>ESTIMATED SEATS · FICTIONAL DRAMA</div>
    <Freeze frame={114} active={f>=114}>
      <RecordedRegion source={footage.outcome} crop={[22,145,496,602]} left={60} top={100} width={960}/>
    </Freeze>
  </AbsoluteFill>;
}
function BirdFeed(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.gold,color:C.ink}}>
    <div style={{position:'absolute',left:55,top:155,width:850,padding:'55px 28px',background:C.cream,border:`8px solid ${C.ink}`,boxShadow:`14px 14px 0 ${C.ink}`,transform:`scale(${pop(f)})`}}>
      <div style={{fontFamily:'Pixel',fontSize:80,lineHeight:1.16,textAlign:'center'}}>WELL.<br/>THAT LASTED.</div>
      <div style={{position:'absolute',bottom:-48,left:560,width:76,height:76,background:C.cream,borderBottom:`8px solid ${C.ink}`,borderRight:`8px solid ${C.ink}`,transform:'rotate(45deg)'}}/>
    </div>
    <Sprite kind="bird" row={2} pose={Math.min(3,Math.floor(f/6))} size={704} style={{position:'absolute',left:335,top:535}}/>
  </AbsoluteFill>;
}
function EndFeed(){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:C.ink,alignItems:'center'}}>
    <Sparks count={20} height={H}/>
    <div style={{position:'absolute',top:140,textAlign:'center',transform:`scale(${pop(f)})`}}><Logo size={108}/></div>
    <div style={{position:'absolute',top:465,color:C.gold,fontSize:47,textAlign:'center'}}>Now with a restart button.</div>
    <div style={{position:'absolute',top:650,left:35,width:1010,display:'flex',justifyContent:'center'}}>
      {[0,2,4,6,8,3,5,7].map((row,i)=><Sprite key={row} kind="walk" row={row} pose={Math.floor((f+i)/3)%8} size={128} style={{marginLeft:i===0?0:-4,transform:`translateY(${i%2===0?-14:14}px)`}}/>)}
    </div>
    <div style={{position:'absolute',left:65,top:965,width:950,padding:'34px 20px',background:C.gold,boxShadow:`12px 12px 0 ${C.dark}`,textAlign:'center',transform:`translateY(${ease(f,0,8,45,0)}px)`}}>
      <div style={{fontFamily:'Pixel',fontSize:32,color:C.ink}}>PLAY AT</div>
      <div style={{marginTop:14,fontSize:65,fontWeight:700,color:C.ink}}>counted.co.za/chaos</div>
    </div>
  </AbsoluteFill>;
}
export function TrailerFeed(){
  return <AbsoluteFill style={{fontFamily:'Space',background:C.dark}}>
    <Audio src={staticFile('audio/coalition-chaos.wav')}/>
    <Sequence name="One mayoral chain · 4:5" from={0} durationInFrames={48}><HookFeed/></Sequence>
    <Sequence name="Several personalities · 4:5" from={48} durationInFrames={48}><CastFeed/></Sequence>
    <Sequence name="Secretary bird setup · 4:5" from={96} durationInFrames={48}><SetupFeed/></Sequence>
    <Sequence name="Johannesburg — choices and majority" from={144} durationInFrames={135}><BuildFeed/></Sequence>
    <Sequence name="ActionSA walkout — 136 to 93" from={279} durationInFrames={153}><OutcomeFeed/></Sequence>
    <Sequence name="Madam Speaker · 4:5" from={432} durationInFrames={60}><BirdFeed/></Sequence>
    <Sequence name="Play Coalition Chaos · 4:5" from={492} durationInFrames={108}><EndFeed/></Sequence>
    <Grain/>
  </AbsoluteFill>;
}
