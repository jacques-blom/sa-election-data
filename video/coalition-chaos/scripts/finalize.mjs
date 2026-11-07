import {execFileSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
if(!ffmpeg) throw new Error('ffmpeg-static has no binary for this platform.');
const [input='out/coalition-chaos-render.mp4',output='out/coalition-chaos-x.mp4']=process.argv.slice(2);
// Preserve every rendered video frame. Trim AAC padding to exactly 20 seconds
// and put MP4 metadata first, so playback starts before the entire file downloads.
execFileSync(ffmpeg,['-y','-i',input,'-t','20','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',output,'-loglevel','error'],{stdio:'inherit'});
