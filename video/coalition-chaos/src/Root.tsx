import {AbsoluteFill, Composition, useVideoConfig} from 'remotion';
import {Trailer} from './Trailer';
import {TrailerFeed} from './TrailerFeed';
function ScenarioNotice() {
  const {height} = useVideoConfig();
  return <div style={{position:'absolute',left:0,right:0,bottom:height > 1350 ? 100 : 0,padding:'10px 24px',background:'#193b32',color:'#f3c85b',fontFamily:'Space, sans-serif',fontSize:32,fontWeight:700,lineHeight:'38px',textAlign:'center'}}>FICTIONAL SCENARIO · SATIRICAL GAME</div>;
}
const LabelledTrailerFeed = () => <AbsoluteFill><TrailerFeed/><ScenarioNotice/></AbsoluteFill>;
const LabelledTrailer = () => <AbsoluteFill><Trailer/><ScenarioNotice/></AbsoluteFill>;
export const VideoRoot = () => <>
  <Composition id="CoalitionChaosFeed" component={LabelledTrailerFeed} durationInFrames={600} fps={30} width={1080} height={1350}/>
  <Composition id="CoalitionChaos" component={LabelledTrailer} durationInFrames={600} fps={30} width={1080} height={1920}/>
</>;
