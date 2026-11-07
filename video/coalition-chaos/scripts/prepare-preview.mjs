import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const target=fileURLToPath(new URL('../../../public/__preview/coalition-chaos/',import.meta.url));
const output=fileURLToPath(new URL('../out/',import.meta.url));
mkdirSync(target,{recursive:true});
writeFileSync(`${target}.gitignore`,'*\n!.gitignore\n');
for(const [from,to] of [
  ['coalition-chaos-x-4x5.mp4','trailer-4x5.mp4'],
  ['coalition-chaos-poster-4x5.png','poster-4x5.png'],
  ['coalition-chaos-x.mp4','trailer.mp4'],
  ['coalition-chaos-poster.png','poster.png'],
  ['coalition-chaos-source.zip','remotion-source.zip'],
]) copyFileSync(`${output}${from}`,`${target}${to}`);
for(const portrait of [false,true]) {
  const file=portrait?'trailer.mp4':'trailer-4x5.mp4';
  const poster=portrait?'poster.png':'poster-4x5.png';
  const name=portrait?'9:16 full-screen':'4:5 for X';
  writeFileSync(`${target}${portrait?'portrait.html':'index.html'}`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Coalition Chaos · ${name}</title><style>
*{box-sizing:border-box}body{margin:0;background:#071f1b;color:#fff8e5;font:16px system-ui,sans-serif}main{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 12px;min-height:100dvh}h1{font-size:18px;margin:0;font-weight:600}p{margin:0;color:#c7d4bb;font-size:13px}video{display:block;max-width:100%;max-height:calc(100dvh - 190px);width:auto;aspect-ratio:${portrait?'9/16':'4/5'};background:#071f1b;border:1px solid #436256}nav{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}a{display:flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;color:#071f1b;background:#f6cf58;border-radius:3px;font-weight:600;text-decoration:none}a.secondary{background:#294a40;color:#fff8e5}.formats a{background:none;color:#c7d4bb;padding:8px 12px}.formats a[aria-current=page]{color:#f6cf58;border-bottom:2px solid #f6cf58}a:focus-visible{outline:3px solid #fff8e5;outline-offset:3px}
</style></head><body><main><h1>Coalition Chaos — the trailer</h1><nav class="formats" aria-label="Video format"><a href="index.html" ${portrait?'':'aria-current="page"'}>4:5 · X</a><a href="portrait.html" ${portrait?'aria-current="page"':''}>9:16 · Full-screen</a></nav><video controls playsinline preload="metadata" poster="${poster}" aria-label="20-second Coalition Chaos trailer, ${name}"><source src="${file}" type="video/mp4"></video><nav aria-label="Downloads"><a href="${file}" download="coalition-chaos-${portrait?'9x16':'4x5'}.mp4">Download MP4</a><a class="secondary" href="remotion-source.zip" download>Remotion source</a></nav><p>Fictional scenario · Satirical game · 20 seconds</p></main></body></html>`);
}
console.log(`Both formats copied to ${target}`);
