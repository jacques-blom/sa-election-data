from pathlib import Path
import subprocess, shutil, concurrent.futures
root=Path(__file__).resolve().parents[1]
src=Path('/tmp/council-recut-recordings')
dst=root/'public/footage'
ffmpeg=root/'node_modules/ffmpeg-static/ffmpeg'
def convert(p):
    r=subprocess.run([str(ffmpeg),'-y','-i',str(p),'-vf','fps=30,tpad=stop_mode=clone:stop_duration=2','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-an','-movflags','+faststart',str(dst/p.name)],capture_output=True,text=True)
    if r.returncode:raise RuntimeError(r.stderr)
    print(p.name,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(convert,sorted(src.glob('*.mp4'))))
shutil.copyfile(src/'events.json',dst/'events.json')
