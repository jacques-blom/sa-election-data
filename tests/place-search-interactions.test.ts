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
  getBoundingClientRect() { return { height: 100, bottom: 100 }; }
  focus() { Object.assign(document, { activeElement: this }); }
  blur() { if (document.activeElement === (this as unknown)) Object.assign(document, { activeElement: document.body }); }
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

async function mount({ configured = true, mobile = false, mobileInline = false, presentation = 'inline', resolution = async (_selection: object): Promise<object> => ({alternatives:[]}), electionAreas = async (_query: string): Promise<object[]> => [], predictions = async (_request: object) => [] as object[] } = {}) {
  const root = new ElementStub(), form = new ElementStub(), input = new ElementStub(), options = new ElementStub();
  root.dataset = { mode: 'all', configured: String(configured), presentation, mobileInline: String(mobileInline) };
  input.id = 'search';
  const panel = new ElementStub(), message = new ElementStub(), clear = new ElementStub(), home = new ElementStub(), dialog = new ElementStub(), mobileSlot = new ElementStub();
  root.queries = new Map([['form',form],['[data-search-panel]',panel],['[data-search-message]',message],['[data-search-clear]',clear],['[data-search-home]',home],['[data-search-mobile]',mobileSlot],['dialog',dialog],['[data-search-attribution]',new ElementStub()],['[data-search-close]',new ElementStub()]]);
  const trigger = new ElementStub();
  if (presentation === 'dialog') root.queries.set('[data-search-open]',trigger);
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
    return Response.json(url === '/api/search' ? {suggestions:await electionAreas(body.query)} : await resolution(body));
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
  return {root,form,input,options,panel,message,home,dialog,mobileSlot,body,trigger,navigations,requests,googleRequests,type,choose};
}

test('Google outages keep labelled election-area suggestions available',async()=>{
  const ui = await mount({predictions:async()=>{throw new Error('Google unavailable');}, electionAreas:async()=>[{id:'knysna',name:'Knysna',kind:'municipality',url:'/2026/places/knysna',description:'Local municipality'}]});
  await ui.type('JHB');
  assert.equal(ui.options.children.length,1);
  assert.equal(ui.options.children[0]?.dataset.source,'election');
  assert.match(ui.message.textContent,/Some suggestions are unavailable/);
  await ui.choose();
  assert.deepEqual(ui.navigations,['/2026/places/knysna']);
  assert.equal(ui.form.submissions,0);
});

test('homepage search stays inline on mobile and external resets cancel stale suggestions',async()=>{
  let resolveOld: (areas:object[])=>void = ()=>{};
  const ui=await mount({configured:false,mobile:true,mobileInline:true,electionAreas:()=>new Promise(resolve=>{resolveOld=resolve;})});
  await ui.type('Cape');assert.equal(ui.dialog.open,false);assert.equal(ui.form.parent,ui.home);
  const requests=ui.requests.length;
  ui.input.value='';ui.root.dispatchEvent(event('place-search:sync-query'));
  resolveOld([{id:'cpt',name:'Cape Town',description:'Metro',url:'/2026/places/cape-town'}]);await settle();
  assert.equal(ui.panel.hidden,true);assert.equal(ui.options.children.length,0);assert.equal(ui.dialog.open,false);
  assert.equal(ui.requests.length,requests,'clearing council filters does not issue a search or open a dialog');
});

test('addresses use Google details once and typed text stays in POST bodies',async()=>{
  const fields: string[][] = [];
  const place = {id:'example-address',fetchFields:async(options:{fields:string[]})=>{fields.push(options.fields);}};
  const ui = await mount({predictions:async()=>[{placeId:'address',mainText:'12 Example Road',secondaryText:'Cape Town',types:['street_address'],toPlace:()=>place}]});
  let selected: unknown;
  ui.root.addEventListener('place-search:select',e=>{selected=(e as CustomEvent).detail;});
  await ui.type('12 Example Road, Cape Town'); await ui.choose();
  assert.equal(selected,place);
  assert.deepEqual(ui.navigations,[]); assert.equal(ui.form.submissions,0);
  assert.deepEqual(ui.requests,[{url:'/api/search',body:{query:'12 Example Road, Cape Town'}}]);
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
  assert.equal(ui.requests.at(-1)?.url,'/api/resolve-area');
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

test('Newlands opens its Google area view when the suburb is absent from the results directory', async () => {
  const place = { id: 'newlands-cape-town', displayName: 'Newlands', types: ['sublocality_level_2'], fetchFields: async () => {},
    viewport: { toJSON: () => ({ west: 18.40, south: -34.01, east: 18.48, north: -33.95 }) } };
  const ui = await mount({ predictions: async () => [{ placeId: place.id, mainText: 'Newlands', types: place.types, toPlace: () => place }] });
  let addressSelected = false;
  ui.root.addEventListener('place-search:select', () => { addressSelected = true; });
  await ui.type('Newlands'); await ui.choose();
  assert.deepEqual(ui.navigations, ['/map?google-place=newlands-cape-town']);
  assert.equal(addressSelected, false);
  assert.equal(ui.panel.hidden, true);
});

test('an unlisted suburb selection closes mobile search and dispatches its extent to the map', async () => {
  const place = { id: 'newlands-cape-town', displayName: 'Newlands', types: ['sublocality_level_2'], fetchFields: async () => {},
    viewport: { toJSON: () => ({ west: 18.40, south: -34.01, east: 18.48, north: -33.95 }) } };
  const ui = await mount({ mobile: true, predictions: async () => [{ placeId: place.id, mainText: 'Newlands', types: place.types, toPlace: () => place }] });
  let selected: unknown;
  ui.root.addEventListener('place-search:area', event => { event.preventDefault(); selected = (event as CustomEvent).detail; });
  await ui.type('Newlands'); await ui.choose();
  assert.deepEqual((selected as { bbox: number[] }).bbox, [18.40, -34.01, 18.48, -33.95]);
  assert.equal(ui.dialog.open, false);
  assert.deepEqual(ui.navigations, []);
});

test('mobile search restores the original form and scrolling after Escape',async()=>{
  const ui = await mount({configured:false,mobile:true});
  await ui.type('Example');
  assert.equal(ui.dialog.open,true); assert.equal(ui.form.parent,ui.mobileSlot); assert.equal(ui.body.style.overflow,'hidden');
  assert.equal(ui.input.placeholder,'Place or address');
  ui.input.dispatchEvent(event('keydown',{key:'Escape'}));
  assert.equal(ui.dialog.open,false); assert.equal(ui.form.parent,ui.home); assert.equal(ui.body.style.overflow,'');
  assert.notEqual(document.activeElement,ui.input);
});

test('selecting a mobile area dismisses the keyboard before dispatching the result',async()=>{
  const ui = await mount({configured:false,mobile:true,electionAreas:async()=>[{id:'knysna',name:'Knysna',description:'Municipality',url:'/2026/places/knysna'}]});
  ui.root.addEventListener('place-search:area',event=>{
    event.preventDefault();
    assert.notEqual(document.activeElement,ui.input);
    assert.equal(ui.dialog.open,false);
  });
  await ui.type('Knysna'); await ui.choose();
  assert.equal(ui.form.parent,ui.home);
  assert.equal(ui.body.style.overflow,'');
});

test('the ward header stays inline and blurs immediately while address details load',async()=>{
  let finish: ()=>void = ()=>{};
  const place = {fetchFields:()=>new Promise<void>(resolve=>{finish=resolve;})};
  const ui = await mount({mobile:true,presentation:'header',predictions:async()=>[{placeId:'address',mainText:'12 Example Road',types:['street_address'],toPlace:()=>place}]});
  await ui.type('12 Example Road');
  assert.equal(ui.dialog.open,false);
  assert.equal(ui.form.parent,ui.home);
  await ui.choose();
  assert.notEqual(document.activeElement,ui.input);
  finish(); await settle();
  assert.notEqual(document.activeElement,ui.input);
});

test('the header launcher opens on desktop and keeps address results visible without input focus',async()=>{
  const place = {fetchFields:async()=>{}};
  const ui = await mount({presentation:'dialog',predictions:async()=>[{placeId:'address',mainText:'12 Example Road',types:['street_address'],toPlace:()=>place}]});
  ui.trigger.dispatchEvent(event('click'));
  assert.equal(ui.dialog.open,true);
  assert.equal(document.activeElement,ui.input);
  await ui.type('12 Example Road'); await ui.choose();
  assert.equal(ui.dialog.open,true);
  assert.notEqual(document.activeElement,ui.input);
  ui.dialog.dispatchEvent(event('cancel'));
  assert.equal(ui.dialog.open,false);
  assert.equal(document.activeElement,ui.trigger);
  assert.equal(ui.body.style.overflow,'');
});

test('Enter waits for the official municipality when Google responds before the election search',async()=>{
  let resolveAreas: (areas:object[])=>void = ()=>{};
  let fetched = false;
  const ui = await mount({electionAreas:()=>new Promise(resolve=>{resolveAreas=resolve;}),
    predictions:async()=>[{placeId:'knysna-google',mainText:'Knysna',types:['locality'],toPlace:()=>({fetchFields:async()=>{fetched=true;}})}]});
  await ui.type('Knysna');
  assert.equal(ui.options.children.length,1);
  ui.form.dispatchEvent(event('submit')); await settle();
  assert.deepEqual(ui.navigations,[]);
  resolveAreas([{id:'9928',name:'Knysna',kind:'municipality',description:'Local municipality · WC048',url:'/2026/places/knysna'}]); await settle();
  assert.deepEqual(ui.navigations,['/2026/places/knysna']);
  assert.equal(fetched,false);
});

test('a ward suggestion navigates directly without Google details or a coordinate lookup',async()=>{
  const ui = await mount({configured:false,electionAreas:async()=>[{id:'10408005',name:'Ward 5, Knysna',kind:'ward',description:'Ward · WC048',url:'/2026/wards/10408005'}]});
  let selected=false;ui.root.addEventListener('place-search:select',()=>{selected=true;});
  await ui.type('Knysna ward 5');await ui.choose();
  assert.deepEqual(ui.navigations,['/2026/wards/10408005']);
  assert.equal(selected,false);
  assert(ui.requests.every(request=>request.url==='/api/search'));
});

test('a stale official-area response cannot replace the newer municipality suggestions',async()=>{
  let resolveOld: (areas:object[])=>void = ()=>{};
  const ui = await mount({configured:false,electionAreas:async query=>query==='Cape' ? new Promise(resolve=>{resolveOld=resolve;}) : [{id:'knysna',name:'Knysna',description:'Local municipality',url:'/2026/places/knysna'}]});
  await ui.type('Cape');await ui.type('Knysna');
  resolveOld([{id:'cpt',name:'Cape Town',description:'Metro',url:'/2026/places/cape-town'}]);await settle();
  await ui.choose();assert.deepEqual(ui.navigations,['/2026/places/knysna']);
});

test('historical search disables pending suggestions and resumes with the retained query', async () => {
  let resolveOld: (areas: object[]) => void = () => {};
  const area = {id:'knysna',name:'Knysna',description:'Local municipality',url:'/2026/places/knysna'};
  const ui = await mount({configured:false,electionAreas:query => query === 'Cape' ? new Promise(resolve => {resolveOld=resolve;}) : Promise.resolve([area])});
  await ui.type('Cape');
  ui.root.dataset.searchDisabled = 'true';
  ui.root.dispatchEvent(event('place-search:disabled'));
  resolveOld([area]); await settle();
  assert.equal(ui.input.value, 'Cape');
  assert.equal(ui.panel.hidden, true);
  assert.equal(ui.options.children.length, 0);
  const requests = ui.requests.length;
  ui.form.dispatchEvent(event('submit')); await settle();
  await ui.type('Knysna'); await ui.choose();
  assert.equal(ui.requests.length, requests);
  assert.deepEqual(ui.navigations, []);
  ui.root.dataset.searchDisabled = 'false';
  await ui.type('Knysna'); await ui.choose();
  assert.deepEqual(ui.navigations, ['/2026/places/knysna']);
});
