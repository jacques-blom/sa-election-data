import {spawnSync} from 'node:child_process';
import {renameSync} from 'node:fs';
import ffmpeg from 'ffmpeg-static';
const output='out/counted-councils-4x3.mp4';
const temp='out/counted-councils-final.mp4';
const result=spawnSync(ffmpeg,['-y','-i',output,'-t','20','-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',temp],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
renameSync(temp,output);
