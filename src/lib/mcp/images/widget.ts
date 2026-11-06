export const imageWidgetUri = 'ui://counted/result-image-v1.html';
export const imageWidgetMeta = { ui: { resourceUri: imageWidgetUri }, 'openai/outputTemplate': imageWidgetUri };

// A portable MCP Apps resource, served by this MCP server; no plugin package.
export const imageWidgetHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Counted election chart</title><style>
*{box-sizing:border-box}body{margin:0;font:15px system-ui,sans-serif;color:#163a30;background:transparent}
figure{margin:0}img{display:block;width:100%;height:auto;border-radius:12px}nav{display:flex;gap:16px;flex-wrap:wrap;padding:12px 2px}a{color:inherit}p{margin:8px 2px}#error{color:#9b342d}
</style></head><body><p id="status" role="status">Loading Counted chart…</p>
<figure hidden id="figure"><img id="chart" alt=""><nav><a id="png" target="_blank" rel="noopener noreferrer">Open PNG</a><a id="data" target="_blank" rel="noopener noreferrer">Chart data</a></nav></figure><p id="error" hidden></p>
<script>
const figure=document.getElementById('figure'),img=document.getElementById('chart'),status=document.getElementById('status'),error=document.getElementById('error');
function validUrl(value,ext){try{const u=new URL(value);return u.origin==='https://counted.co.za'&&new RegExp('^/images/results/[a-f0-9]{64}\\\\.'+ext+'$').test(u.pathname)&&!u.search&&!u.hash}catch{return false}}
function notify(method,params){window.parent.postMessage({jsonrpc:'2.0',method,params},'*')}
function resize(){notify('ui/notifications/size-changed',{height:document.documentElement.scrollHeight})}
function show(result){const d=result?.structuredContent?.data;if(!d)return;
 if(!validUrl(d.image_url,'png')||!validUrl(result.data_url||result.structuredContent.data_url,'json')){status.textContent='This chart could not be loaded.';return}
 img.alt=d.alt_text||'Counted election chart';img.src=d.image_url;
 document.getElementById('png').href=d.image_url;document.getElementById('data').href=result.structuredContent.data_url;
 figure.hidden=false;status.hidden=true;resize();
}
img.onload=resize;img.onerror=()=>{error.textContent='The image could not be loaded. Use Open PNG to view it.';error.hidden=false;resize()};
window.addEventListener('message',e=>{if(e.source!==window.parent||e.data?.jsonrpc!=='2.0')return;const m=e.data;
 if(m.id==='counted-init'&&!m.error)notify('ui/notifications/initialized',{});
 if(m.method==='ui/notifications/tool-result')show(m.params);
});
window.parent.postMessage({jsonrpc:'2.0',id:'counted-init',method:'ui/initialize',params:{appInfo:{name:'counted-image',version:'1.0.0'},appCapabilities:{},protocolVersion:'2026-01-26'}},'*');
// Compatibility with hosts that still expose the ChatGPT bridge.
if(window.openai?.toolOutput)show({structuredContent:window.openai.toolOutput});
window.addEventListener('openai:set_globals',e=>{if(e.detail?.globals?.toolOutput)show({structuredContent:e.detail.globals.toolOutput})});
new ResizeObserver(resize).observe(document.body);
</script></body></html>`;
