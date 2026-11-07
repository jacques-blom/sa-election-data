import { mkdirSync, writeFileSync } from 'node:fs';
import { coalitionLeaders, coalitionLocalLeaders } from '../src/lib/seats/leaders.ts';

// Review the actual runtime artwork, rather than a separately generated cast.
const destination = new URL('../public/__preview/coalition-cast/', import.meta.url);
mkdirSync(destination, { recursive: true });
const expressions = ['Neutral', 'Blink', 'Pleased', 'Disappointed'];
const cast = [...Object.entries(coalitionLeaders), ['DA · Johannesburg', coalitionLocalLeaders['3003'].DA]];
const cards = cast.map(([party, leader]) => `
  <article class="${leader.cell === 8 ? 'local-cameo' : ''}" style="--row:${leader.cell}">
    <div class="label"><b>${party}</b>${[1, 5, 6, 7, 8].includes(leader.cell) ? '<span class="updated">NEW LIKENESS</span>' : ''}</div>
    <h2>${leader.name}</h2>
    <div class="figures" role="img" aria-label="${leader.name}: current portrait and walk cycle">
      <div class="portrait large"></div><div class="walk"></div>
    </div>
    <div class="expressions">${expressions.map((label, col) => `<div><div class="portrait" style="--col:${col}"></div><small>${label}</small></div>`).join('')}</div>
  </article>`).join('');
writeFileSync(new URL('index.html', destination), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Coalition Chaos · Cast review</title>
<style>
@font-face{font-family:Space;src:url('/fonts/SpaceGrotesk.ttf')}@font-face{font-family:Pixel;src:url('/fonts/Silkscreen-Regular.ttf')}
*{box-sizing:border-box}body{margin:0;background:#e7eddd;color:#193f35;font-family:Space,system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:28px 20px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}h1{font:26px Pixel,monospace;margin:0 0 7px}header p{margin:0;font-size:14px}button{font:600 14px Space,sans-serif;color:#193f35;background:#f5ce60;border:2px solid #193f35;min-height:44px;padding:10px 15px;cursor:pointer;flex-shrink:0}button:focus-visible{outline:3px solid #193f35;outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}article{background:#fffdf3;border:2px solid #193f35;padding:14px 10px 12px;box-shadow:3px 3px 0 #b8c7ad}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font:12px Pixel,monospace;min-height:20px}.updated{font:9px Pixel,monospace;background:#e1ebbc;padding:4px}h2{font-size:17px;letter-spacing:-.4px;margin:6px 0 0;white-space:nowrap}.figures{height:143px;display:flex;justify-content:center;align-items:center;gap:2px}.portrait,.walk,.bird,.delegate{background-repeat:no-repeat;image-rendering:pixelated;flex-shrink:0}.portrait{width:48px;height:48px;background-image:url('/images/coalition/leaders-expressions-v4.webp');background-size:192px 432px;background-position:calc(var(--col,0) * -48px) calc(var(--row) * -48px)}.large{width:96px;height:96px;background-size:384px 864px;background-position:0 calc(var(--row) * -96px)}.walk{width:128px;height:128px;background-image:url('/images/coalition/leaders-walk-v4.webp');background-size:1024px 1152px;background-position:0 calc(var(--row) * -128px);animation:walk .72s steps(8) infinite}.expressions{display:flex;justify-content:space-between;border-top:1px solid #d5dec9;padding-top:10px;gap:0}.expressions>div{display:flex;flex-direction:column;align-items:center}.expressions small{font-size:9px;margin-top:4px}.local-cameo{grid-column:span 2}.extras{grid-column:span 1;display:flex;flex-direction:column;text-align:center;align-items:center;justify-content:space-around;gap:10px;min-height:154px}.extras h2{white-space:normal}.extras p{font-size:13px;max-width:230px;margin:8px 0 0;line-height:1.5}.bird{width:128px;height:128px;background-image:url('/images/coalition/speaker-frames-v3.webp');background-size:512px 384px;animation:bird 1.2s steps(4) infinite}.delegate{width:128px;height:128px;background-image:url('/images/coalition/delegate-walk-v2.webp');background-size:1024px 128px;animation:walk .72s steps(8) infinite}.paused .walk,.paused .bird,.paused .delegate{animation-play-state:paused}footer{font-size:12px;margin-top:18px;line-height:1.5;color:#49604b}
@keyframes walk{to{background-position-x:-1024px}}@keyframes bird{to{background-position-x:-512px}}
@media(max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.extras{grid-column:span 1}.extras p{max-width:180px}.extras{flex-direction:column;text-align:center}}
@media(max-width:540px){main{padding:20px 16px}header{align-items:flex-start;flex-direction:column;gap:12px}h1{font-size:23px}.local-cameo{grid-column:span 1}.grid{grid-template-columns:1fr}article{padding:14px 18px}.figures{gap:22px}.expressions small{font-size:11px}.extras{flex-direction:row;text-align:left}.extras p{max-width:175px}}
@media(prefers-reduced-motion:reduce){.walk,.bird,.delegate{animation:none}}
</style></head><body><main><header><div><h1>Coalition Chaos · The cast</h1><p>Portraits, walk cycles and all four expressions — straight from the game.</p></div><button type="button" aria-pressed="false" id="pause">Pause animations</button></header><div class="grid">${cards}
<article class="extras"><div class="bird" role="img" aria-label="Madam Speaker, the secretary bird"></div><div><div class="label"><b>THE REFEREE</b></div><h2>Madam Speaker</h2><p>The new secretary bird, complete with gavel and side-eye.</p></div></article>
<article class="extras"><div class="delegate" role="img" aria-label="Anonymous delegate walking"></div><div><div class="label"><b>SUPPORTING CAST</b></div><h2>Anonymous delegate</h2><p>Walkout fallback for parties without a leader sprite. Their party logo appears in the game.</p></div></article>
</div><footer>Photo-referenced redraws: Herman Mashaba, Geordin Hill-Lewis, Gayton McKenzie and Corné Mulder. Helen Zille is the DA cameo in Johannesburg only; GHL appears elsewhere. The remaining four leaders are unchanged.</footer></main>
<script>document.querySelector('#pause').addEventListener('click',function(){const paused=document.body.classList.toggle('paused');this.textContent=paused?'Play animations':'Pause animations';this.setAttribute('aria-pressed',String(paused));});</script></body></html>`);
console.log('Prepared /__preview/coalition-cast/index.html');
