import os, subprocess, time, json
from pathlib import Path
env=os.environ.copy()
env['PATH']='/tmp/council-demo-bin:'+env['PATH']
out=Path('/tmp/council-mobile-recordings');out.mkdir(exist_ok=True)
events=[]
def run(*args):
    r=subprocess.run(['agent-browser','--session','council-demo',*args],env=env,text=True,capture_output=True)
    if r.returncode: raise RuntimeError(r.stdout+r.stderr)
    return r.stdout.strip()
def note(action):
    events.append({'clip':clip,'seconds':round(time.monotonic()-start,3),'action':action});print(events[-1],flush=True)
def prepare(url,selector):
    run('open',url);run('set','viewport','480','640','3')
    run('eval','const s=document.createElement("style");s.textContent="astro-dev-toolbar{display:none!important}";document.head.append(s);document.fonts.ready')
    time.sleep(1)
    run('eval',f'document.querySelector({json.dumps(selector)}).scrollIntoView({{behavior:"instant",block:"start"}})')
    time.sleep(.4)
def begin(name):
    global clip,start
    clip=name;p=out/(name+'.mp4')
    if p.exists():p.unlink()
    run('record','start',str(p),'--fps','30');start=time.monotonic();note('start')
def end():
    note('stop');run('record','stop');run('screenshot',str(out/(clip+'.png')))
def tap(selector):
    raw=run('eval',f'JSON.stringify((()=>{{const r=document.querySelector({json.dumps(selector)}).getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2}}}})())')
    p=json.loads(json.loads(raw))
    run('mouse','move',str(round(p['x'])),str(round(p['y'])));run('mouse','down');run('mouse','up')

prepare('http://127.0.0.1:4321/councils','.dashboard-council-list')
begin('01-directory');time.sleep(2.8)
note('Scroll from Buffalo City to Cape Town')
run('eval','const e=document.querySelector("h3 a[href$=cape-town]").closest("article");scrollTo({top:e.getBoundingClientRect().top+scrollY-24,behavior:"smooth"})')
time.sleep(3.7);end()

prepare('http://127.0.0.1:4321/2026/places/tshwane','h1')
begin('02-council');time.sleep(2.5)
note('Scroll to council seats')
run('eval','document.querySelector(".council-seats").scrollIntoView({behavior:"smooth",block:"start"})')
time.sleep(4);end()

prepare('http://127.0.0.1:4321/2026/places/tshwane','#vote-history')
begin('03-history');time.sleep(1.4)
note('Inspect 2021');tap('[data-trend-metric-panel=seats] [data-trend-year="2021"]');time.sleep(2.2)
note('Inspect 2026');tap('[data-trend-metric-panel=seats] [data-trend-year="2026"]');time.sleep(3)
end()

prepare('http://127.0.0.1:4321/2026/places/tshwane','#government')
begin('04-coalitions');time.sleep(2.7)
note('Swipe through recorded administrations to 2024')
run('eval','const e=document.querySelector(".government-timeline");const from=e.scrollLeft,to=e.scrollWidth-e.clientWidth,t=performance.now();function step(now){const p=Math.min(1,(now-t)/1700);e.scrollLeft=from+(to-from)*(p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2);if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)')
time.sleep(5.8);end()
out.joinpath('events.json').write_text(json.dumps(events,indent=2)+'\n')
print('Mobile capture complete',flush=True)
