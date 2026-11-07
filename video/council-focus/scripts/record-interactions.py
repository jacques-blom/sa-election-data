import os, subprocess, time, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=Path('/tmp/council-recut-recordings');out.mkdir(exist_ok=True)
env=os.environ.copy();env['PATH']=str(root/'node_modules/ffmpeg-static')+':'+env['PATH']
env['AGENT_BROWSER_STREAM_QUALITY']='100';env['AGENT_BROWSER_STREAM_MAX_WIDTH']='1440';env['AGENT_BROWSER_STREAM_MAX_HEIGHT']='1920'
events=[]
overlay='''(()=>{if(document.querySelector('#demo-tap-style'))return;const s=document.createElement('style');s.id='demo-tap-style';s.textContent='astro-dev-toolbar{display:none!important}.demo-tap{position:fixed;width:38px;height:38px;margin:-19px 0 0 -19px;border:2px solid #fff;border-radius:50%;background:#e6b34b66;box-shadow:0 0 0 2px #163a30b0;pointer-events:none;z-index:2147483647;animation:tap .55s ease-out forwards}@keyframes tap{0%{transform:scale(.5);opacity:1}35%{transform:scale(1);opacity:1}100%{transform:scale(1.45);opacity:0}}';document.head.append(s);document.addEventListener('pointerdown',e=>{const dot=document.createElement('i');dot.className='demo-tap';dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';document.body.append(dot);setTimeout(()=>dot.remove(),600)},true)})()'''
def run(*args):
    r=subprocess.run(['agent-browser','--session','council-recut',*args],env=env,text=True,capture_output=True)
    if r.returncode:raise RuntimeError(r.stdout+r.stderr)
    return r.stdout.strip()
def note(action):
    events.append({'clip':clip,'seconds':round(time.monotonic()-start,3),'action':action});print(events[-1],flush=True)
def prepare(url,selector):
    run('open',url);run('set','viewport','480','640','3');time.sleep(.8)
    run('eval',overlay)
    run('eval',f'document.querySelector({json.dumps(selector)}).scrollIntoView({{behavior:"instant",block:"start"}})');time.sleep(.3)
def begin(name):
    global clip,start
    clip=name;p=out/(name+'.mp4')
    if p.exists():p.unlink()
    run('record','start',str(p),'--fps','30');start=time.monotonic();note('start')
def tap(selector):
    raw=run('eval',f'JSON.stringify((()=>{{const r=document.querySelector({json.dumps(selector)}).getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2}}}})())')
    p=json.loads(json.loads(raw));run('mouse','move',str(round(p['x'])),str(round(p['y'])));run('mouse','down');run('mouse','up')
def end():
    note('stop');run('record','stop');run('screenshot',str(out/(clip+'.png')))
run('close')
prepare('http://127.0.0.1:4321/councils','.dashboard-hero')
begin('05-search');time.sleep(.25);note('Tap search');tap('#dashboard-place-search')
for c in 'Tshwane':run('keyboard','type',c);time.sleep(.05)
run('wait','[role=option]');time.sleep(.2)
note('Open Tshwane suggestion');tap('[role=option]')
run('wait','.council-seats');time.sleep(.5);run('eval',overlay)
run('eval','document.querySelector("h1").scrollIntoView({behavior:"instant",block:"start"})');note('Council loaded')
time.sleep(1.2);end()

prepare('http://127.0.0.1:4321/2026/places/tshwane','#vote-history')
begin('06-chart');time.sleep(.3)
note('Inspect 2021');tap('[data-trend-metric-panel=seats] [data-trend-year="2021"]');time.sleep(.8)
note('Inspect 2026');tap('[data-trend-metric-panel=seats] [data-trend-year="2026"]');time.sleep(.8)
note('Switch to vote share');tap('[data-trend-metric=votes]');time.sleep(.8)
note('Highlight DA');tap('[aria-label="Highlight DEMOCRATIC ALLIANCE"]');time.sleep(1)
end()

prepare('http://127.0.0.1:4321/2026/places/tshwane','#government')
begin('07-coalitions');time.sleep(.4)
note('Touch swipe through administrations')
r=subprocess.run(['node',str(root/'scripts/touch-gesture.mjs'),'council-recut','.government-timeline'],env=env,text=True,capture_output=True)
print(r.stdout,r.stderr,flush=True)
if r.returncode:raise RuntimeError('Touch gesture failed')
time.sleep(.8)
note('Open administrations and sources');tap('#government-evidence > summary');time.sleep(.65)
note('Scroll to recorded members and notes');run('scroll','down','255');time.sleep(1.3);end()
out.joinpath('events.json').write_text(json.dumps(events,indent=2)+'\n')
print('Interaction captures complete',flush=True)
