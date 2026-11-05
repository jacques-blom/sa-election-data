import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';

// Exercise the shared Google handlers and canonical area resolution without network calls.
class ElementStub extends EventTarget {
  children: ElementStub[] = [];
  parent: ElementStub | undefined;
  queries = new Map<string, ElementStub>();
  attributes = new Map<string, string>();
  dataset: Record<string, string> = {};
  style = { minHeight: '', overflow: '', setProperty() {} };
  hidden = false; open = false; value = ''; textContent = ''; className = ''; id = ''; placeholder = '';
  action = 'http://localhost/#search-heading';
  submissions = 0;
  querySelector(selector: string) { return this.queries.get(selector); }
  setAttribute(name: string, value: string) { this.attributes.set(name,value); }
  getAttribute(name: string) { return name === 'data-key' ? this.dataset.key : this.attributes.get(name); }
  removeAttribute(name: string) { this.attributes.delete(name); }
  appendChild(child: ElementStub) {
    if (child.parent) child.parent.children = child.parent.children.filter(value => value !== child);
    child.parent = this; this.children.push(child); return child;
  }
  replaceChildren() { this.children = []; }
  contains(element: ElementStub): boolean { return element === this || this.children.some(child => child.contains(element)); }
  scrollIntoView() {}
  getBoundingClientRect() { return { height: 100 }; }
  focus() {}
  showModal() { this.open = true; }
  close() { this.open = false; }
  submit() { this.submissions++; }
}

let restore: (() => void)[] = [];
let version = 0;
afterEach(() => { restore.reverse().forEach(fn => fn()); restore = []; });
function global(name: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(globalThis,name);
  Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});
  restore.push(() => original ? Object.defineProperty(globalThis,name,original) : Reflect.deleteProperty(globalThis,name));
}
const settle = async () => { for (let i=0;i<4;i++) await setImmediate(); };
const event = (type: string, fields = {}) => Object.assign(new Event(type,{cancelable:true}),fields);

async function mount({ configured = true, mobile = false, resolution = async (_selection: object): Promise<object> => ({alternatives:[]}), predictions = async (_request: object) => [] as object[] } = {}) {
  const root = new ElementStub(), form = new ElementStub(), input = new ElementStub(), options = new ElementStub();
  root.dataset = { mode: 'all', configured: String(configured) };
  input.id = 'search';
  const panel = new ElementStub(), message = new ElementStub(), clear = new ElementStub(), home = new ElementStub(), dialog = new ElementStub(), mobileSlot = new ElementStub();
  root.queries = new Map([['form',form],['[data-search-panel]',panel],['[data-search-message]',message],['[data-search-clear]',clear],['[data-search-home]',home],['[data-search-mobile]',mobileSlot],['dialog',dialog],['[data-search-attribution]',new ElementStub()],['[data-search-close]',new ElementStub()]]);
  form.queries = new Map([['input',input],['[data-search-panel]',panel],['[data-search-message]',message],['[data-search-clear]',clear],['[data-search-announcement]',new ElementStub()],['[role=listbox]',options]]);
  home.appendChild(form);
  const timers = new Map<number, () => void>(); let timer = 0;
  const navigations: string[] = [], requests: {url:string;body:object}[] = [], googleRequests: object[] = [];
  const media = Object.assign(new EventTarget(),{matches:mobile});
  const body = new ElementStub();
  global('window',{matchMedia:()=>media,innerHeight:800,location:{assign:(url:string)=>navigations.push(url)},
    setTimeout:(fn:()=>void)=>{timers.set(++timer,fn);return timer;},clearTimeout:(id:number)=>timers.delete(id)});
  global('document',Object.assign(new EventTarget(),{querySelectorAll:()=>[root],createElement:()=>new ElementStub(),body,activeElement:input}));
  global('InputEvent',class extends Event { isComposing = false; });
  global('requestAnimationFrame',(fn:()=>void)=>fn());
  global('google',{maps:{importLibrary:async()=>({AutocompleteSessionToken:class {},AutocompleteSuggestion:{fetchAutocompleteSuggestions:async(request:object)=>{
    googleRequests.push(request);return {suggestions:(await predictions(request)).map(placePrediction=>({placePrediction}))};
  }}})}});
  global('fetch',async(url:string,init:RequestInit)=>{
    const body = JSON.parse(init.body as string); requests.push({url,body});
    return Response.json(await resolution(body));
  });
  await import(`../src/lib/address/autocomplete.ts?test=${++version}`);
  const type = async (value: string) => {
    input.value = value; input.dispatchEvent(event('input'));
    const pending = [...timers.values()]; timers.clear(); pending.forEach(fn=>fn());
    await settle();
  };
  const choose = async (steps = 1) => {
    for(let i=0;i<steps;i++)input.dispatchEvent(event('keydown',{key:'ArrowDown'}));
    input.dispatchEvent(event('keydown',{key:'Enter'})); await settle();
  };
  return {root,form,input,options,panel,message,home,dialog,mobileSlot,body,navigations,requests,googleRequests,type,choose};
}

test('Google outages show a recoverable message without silently changing search provider',async()=>{
  const ui = await mount({predictions:async()=>{throw new Error('Google unavailable');}});
  await ui.type('JHB');
  assert.equal(ui.options.children.length,0);
  assert.match(ui.message.textContent,/Google suggestions couldn’t load/);
  assert.deepEqual(ui.requests,[]);
  assert.equal(ui.form.submissions,0);
});

test('address selection hands the detailed Place to ward lookup without sending typed text to our server',async()=>{
  const fields: string[][] = [];
  const place = {id:'example-address',fetchFields:async(options:{fields:string[]})=>{fields.push(options.fields);}};
  const ui = await mount({predictions:async()=>[{placeId:'address',mainText:'12 Example Road',secondaryText:'Cape Town',types:['street_address'],toPlace:()=>place}]});
  let selected: unknown;
  ui.root.addEventListener('place-search:select',e=>{selected=(e as CustomEvent).detail;});
  await ui.type('12 Example Road, Cape Town'); await ui.choose();
  assert.equal(selected,place);
  assert.deepEqual(ui.navigations,[]); assert.equal(ui.form.submissions,0);
  assert.deepEqual(ui.requests,[]);
  assert.equal(fields.length,1,'complete the Google session once');
  assert.equal('includedPrimaryTypes' in ui.googleRequests[0]!,false);
});

test('Google area selections open canonical area results on every search mode',async()=>{
  const place = {displayName:'Gauteng',types:['administrative_area_level_1'],fetchFields:async()=>{}};
  const ui = await mount({predictions:async()=>[{placeId:'province',mainText:'Gauteng',types:['administrative_area_level_1'],toPlace:()=>place}],
    resolution:async()=>({area:{id:'3',name:'Gauteng',kind:'province',url:'/2026/provinces/gauteng'},alternatives:[]})});
  ui.root.dataset.mode='address';
  let selected = false; ui.root.addEventListener('place-search:select',()=>{selected=true;});
  await ui.type('Gauteng'); await ui.choose();
  assert.equal(selected,false);
  assert.deepEqual(ui.navigations,['/2026/provinces/gauteng']);
  assert.equal(ui.requests[0]?.url,'/api/resolve-area');
});

test('a slow Google response cannot replace suggestions for a newer query',async()=>{
  let resolveOld: (value:object[])=>void = ()=>{};
  const prediction = (name:string)=>({placeId:name,mainText:name,types:['locality'],toPlace:()=>({displayName:name,fetchFields:async()=>{}})});
  const ui = await mount({predictions:async(request)=>('input' in request && request.input==='Cape') ? new Promise(resolve=>{resolveOld=resolve;}) : [prediction('Calvinia')],
    resolution:async()=>({area:{name:'Calvinia',url:'/2026/places/calvinia'},alternatives:[]})});
  await ui.type('Cape'); await ui.type('Calvinia');
  resolveOld([prediction('Cape Town')]); await settle();
  await ui.choose();
  assert.deepEqual(ui.navigations,['/2026/places/calvinia']);
});

test('an unresolved area never dispatches an address selection or a centre-point lookup',async()=>{
  const place = {displayName:'Unknown suburb',fetchFields:async()=>{}};
  const ui = await mount({predictions:async()=>[{placeId:'unknown',mainText:'Unknown suburb',types:['sublocality'],toPlace:()=>place}]});
  let selected=false; ui.root.addEventListener('place-search:select',()=>{selected=true;});
  await ui.type('Unknown suburb'); await ui.choose();
  assert.equal(selected,false); assert.deepEqual(ui.navigations,[]);
  assert.match(ui.message.textContent,/don’t have a matching results area/);
});

test('mobile search restores the original form and scrolling after Escape',async()=>{
  const ui = await mount({configured:false,mobile:true});
  await ui.type('Example');
  assert.equal(ui.dialog.open,true); assert.equal(ui.form.parent,ui.mobileSlot); assert.equal(ui.body.style.overflow,'hidden');
  assert.equal(ui.input.placeholder,'Place or address');
  ui.input.dispatchEvent(event('keydown',{key:'Escape'}));
  assert.equal(ui.dialog.open,false); assert.equal(ui.form.parent,ui.home); assert.equal(ui.body.style.overflow,'');
});
