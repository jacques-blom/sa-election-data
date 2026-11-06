import test from 'node:test';
import assert from 'node:assert/strict';
import { Window, type HTMLElement, type HTMLInputElement } from 'happy-dom';

test('one private search filters councils, national totals stay stable, parties highlight, and scrolling reveals more', async () => {
  const window = new Window({url:'https://counted.co.za/'});
  const {document} = window;
  let intersect=()=>{}, observers=0;
  const observed: unknown[]=[];
  Object.defineProperty(window,'IntersectionObserver',{configurable:true,value:class {
    constructor(callback:(entries:{isIntersecting:boolean}[])=>void){observers++;intersect=()=>callback([{isIntersecting:true}]);}
    observe(element:unknown){observed.push(element);}
    disconnect(){}
  }});
  for(const name of ['window','document','location','history','HTMLElement','Element','MouseEvent','Node','Event'] as const)
    Object.defineProperty(globalThis,name,{configurable:true,value:name==='window'?window:window[name]});
  document.body.innerHTML=`<main id="main">
    <div data-place-search><input id="dashboard-place-search"></div>
    <a href="#councils" data-search-councils><span data-search-councils-label></span></a>
    <div data-outcome-ring aria-label="National picture"><strong data-reported-count>2</strong></div>
    ${[['majority',1],['no-majority',1],['pending',27]].map(([s,n])=>`<a href="/?status=${s}" data-council-status="${s}"><strong data-status-count="${s}">${n}</strong></a>`).join('')}
    <a href="/?changed=1" data-council-changed-total><strong data-changed-count>1</strong></a>
    <section id="councils"><form id="council-filters">
    ${['q','province','status','party','changed'].map(name=>`<input type="hidden" name="${name}">`).join('')}
    <details data-province-picker><summary><span data-province-label>All provinces</span></summary>
      <div>${[['','All provinces'],['9','Western Cape'],['1','Eastern Cape']].map(([id,name])=>`<a href="/?province=${id}" data-council-province="${id}"><span>${name}</span></a>`).join('')}</div>
    </details>
    ${['','majority','no-majority','pending'].map(s=>`<a href="/?status=${s}" data-council-outcome="${s}">${s||'All'}</a>`).join('')}
    <a href="/?changed=1" data-council-changed role="switch" aria-checked="false">Changed since 2021</a></form>
    <a data-party-filter="" href="/">All parties</a><a data-party-filter="1" href="/?party=1&status=majority"><abbr>ANC</abbr><strong data-party-count></strong></a>
    <a data-party-filter="2" href="/?party=2&status=majority"><abbr>DA</abbr><strong data-party-count></strong></a>
    <div class="dashboard-list-meta"><p data-council-count></p><a href="/" data-council-clear>Clear filters</a></div>
    <div data-party-change hidden><span data-party-change-name></span><span data-party-change-scope></span><span data-party-change-gained></span><span data-party-change-lost></span><p data-party-change-empty hidden>No comparable reported results yet.</p></div>
    <div data-council-empty></div>
    <div id="council-scroll-sentinel" data-council-sentinel></div>
    ${Array.from({length:30},(_,i)=>`<article data-council-row data-search="${i===0?'cape town cpt':'example '+i}" data-province="${i<10?'9':'1'}" data-status="${i===0?'majority':i===1?'no-majority':i===2?'unavailable':'pending'}" data-party="${i===0?'1':''}" data-changed="${i===0}" data-comparable="${i<2}" data-previous-party="${i===0?'2':'1'}"><span data-council-indicator></span></article>`).join('')}
    </section></main>`;
  try {
    await import('../src/lib/overview/dashboard-client.ts');
    const visible=()=>document.querySelectorAll('[data-council-row]:not([hidden])');
    const click=(selector:string)=>document.querySelector(selector)!.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true}));
    const q=document.querySelector<HTMLInputElement>('#dashboard-place-search')!;
    const search=(text:string)=>{q.value=text;q.parentElement!.dispatchEvent(new window.Event('place-search:input'));};
    const partyCount=(id:string)=>document.querySelector(`[data-party-filter="${id}"] [data-party-count]`)!.textContent;
    const changed=document.querySelector<HTMLElement>('[data-council-changed]')!;
    const partyChange=document.querySelector<HTMLElement>('[data-party-change]')!;
    const changeText=(key:string)=>partyChange.querySelector(`[data-party-change-${key}]`)!.textContent;
    assert(partyChange.hidden);
    assert.equal(changed.getAttribute('aria-checked'),'false');
    assert.equal(document.querySelectorAll('[data-council-indicator][hidden]').length,0);
    assert.equal(visible().length,24);intersect();assert.equal(visible().length,30);
    assert.equal(partyCount('1'),'1');assert.equal(partyCount('2'),'0');
    assert.equal(document.querySelector('[data-council-count]')!.textContent,'30 councils');
    const picker=document.querySelector('details')!, trigger=picker.querySelector('summary')!;
    const key=(target:HTMLElement,key:string)=>target.dispatchEvent(new window.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
    trigger.focus();key(trigger,'ArrowDown');assert(picker.open);
    key(document.activeElement as HTMLElement,'ArrowDown');assert.equal(document.activeElement?.getAttribute('data-council-province'),'9');
    click('[data-council-province="9"]');assert.equal(visible().length,10);assert(!picker.open);assert.equal(document.activeElement,trigger);
    key(trigger,'ArrowDown');key(document.activeElement as HTMLElement,'End');assert.equal(document.activeElement?.getAttribute('data-council-province'),'1');
    key(document.activeElement as HTMLElement,'Escape');assert(!picker.open);
    click('[data-council-outcome="majority"]');assert.equal(visible().length,1);assert.equal(window.location.search,'?province=9&status=majority');
    assert.equal(document.querySelectorAll('[data-council-indicator]:not([hidden])').length,0);
    search('CPT');assert.equal(visible().length,1);
    window.history.pushState(null,'',`${window.location.pathname}${window.location.search}#councils`);
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    assert.equal(q.value,'CPT');assert.equal(visible().length,1,'jumping to matching councils retains the private search');
    assert(!new URLSearchParams(window.location.search).has('q'));
    assert.equal(document.querySelector('[data-status-count="pending"]')!.textContent,'27');
    assert.equal(document.querySelector('[data-reported-count]')!.textContent,'2');
    assert.equal(document.querySelector('[data-outcome-ring]')!.getAttribute('aria-label'),'National picture');
    const row=document.querySelector<HTMLElement>('[data-council-row]')!;
    row.dataset.status='no-majority';row.dataset.party='';
    const sentinel=document.querySelector('[data-council-sentinel]')!;sentinel.replaceWith(sentinel.cloneNode());
    document.dispatchEvent(new window.Event('results:updated'));
    assert.equal(observers,1);assert.equal(observed.length,2);assert.equal(q.value,'CPT');assert.equal(visible().length,0);
    assert.equal(partyCount('1'),'0','counts refresh when live results change');
    click('[data-council-outcome="no-majority"]');assert.equal(visible().length,1);
    click('[data-council-clear]');assert.equal(visible().length,24);assert.equal(q.value,'');
    assert.equal(document.querySelectorAll('[data-council-indicator]:not([hidden])').length,30);
    row.dataset.status='majority';row.dataset.party='1';
    click('[data-party-filter="1"]');assert.equal(visible().length,1);
    assert(!partyChange.hidden);assert.equal(changeText('name'),'ANC');
    assert.equal(changeText('gained'),'1');assert.equal(changeText('lost'),'1','losses include councils outside the visible party grid');
    assert.equal(document.querySelector('[data-party-filter="1"]')!.getAttribute('aria-current'),'true');
    assert(document.querySelector('[data-party-filter="1"]')!.classList.contains('is-active'));
    assert.equal(document.querySelector('[data-council-remove="party"]'),null);
    click('[data-party-filter="1"]');assert(!new URLSearchParams(window.location.search).has('party'));
    assert(partyChange.hidden);
    assert.equal(document.querySelector('[data-party-filter=""]')!.getAttribute('aria-current'),'true');
    click('[data-party-filter="1"]');click('[data-council-outcome="pending"]');assert(!new URLSearchParams(window.location.search).has('party'));
    window.history.pushState(null,'','/?province=9&changed=1');window.dispatchEvent(new window.PopStateEvent('popstate'));
    assert.equal(changed.getAttribute('aria-checked'),'true');
    assert.equal(visible().length,1);click('[data-council-changed]');assert.equal(visible().length,10);
    assert.equal(changed.getAttribute('aria-checked'),'false');
    search('12 Private Street');assert.equal(visible().length,0);
    assert(!window.location.href.includes('Private'));assert(!window.location.href.includes('12'));
    assert(![...document.querySelectorAll('[data-council-province], [data-party-filter]')].some(a=>a.getAttribute('href')!.includes('Private')));
    q.parentElement!.dispatchEvent(new window.Event('place-search:select'));assert.equal(visible().length,10);assert.equal(q.value,'12 Private Street');
    // National totals navigate to the whole-country outcome, clearing local filters.
    click('[data-council-status="pending"]');assert.equal(window.location.search,'?status=pending');assert.equal(q.value,'');
    assert.equal(visible().length,24);intersect();assert.equal(visible().length,27);
    // Counts cover all majorities in the province, even outside the visible cards.
    for (const i of [20,29]) {
      const council=document.querySelectorAll<HTMLElement>('[data-council-row]')[i]!;
      council.dataset.status='majority';council.dataset.party='2';
    }
    click('[data-council-clear]');assert.equal(visible().length,24);
    assert.equal(partyCount('1'),'1');assert.equal(partyCount('2'),'2');
    click('[data-council-province="9"]');assert.equal(partyCount('1'),'1');assert.equal(partyCount('2'),'0');
    click('[data-council-province="1"]');assert.equal(partyCount('1'),'0');assert.equal(partyCount('2'),'2');
    click('[data-party-filter="2"]');search('does not match');
    assert.equal(visible().length,0);assert.equal(partyCount('2'),'2','party and search do not narrow province counts');
    click('[data-council-outcome="pending"]');assert.equal(partyCount('2'),'2');
    click('[data-council-clear]');assert.equal(partyCount('1'),'1');assert.equal(partyCount('2'),'2');
    // The toggle combines with province and party, and supports the Space key.
    click('[data-council-province="9"]');click('[data-party-filter="1"]');click('[data-council-changed]');
    assert.equal(window.location.search,'?province=9&status=majority&party=1&changed=1');
    assert.equal(changed.getAttribute('aria-checked'),'true');assert.equal(visible().length,1);
    assert.equal(document.querySelector('[data-status-count="pending"]')!.textContent,'27');
    assert.equal(document.querySelector('[data-reported-count]')!.textContent,'2');
    document.dispatchEvent(new window.Event('results:updated'));
    assert.equal(changed.getAttribute('aria-checked'),'true');assert.equal(visible().length,1);
    changed.focus();key(changed,' ');
    assert.equal(changed.getAttribute('aria-checked'),'false');assert.equal(document.activeElement,changed);
    assert.equal(window.location.search,'?province=9&status=majority&party=1');
    click('[data-council-changed]');click('[data-council-clear]');
    assert.equal(changed.getAttribute('aria-checked'),'false');assert.equal(visible().length,24);
    // The changed headline is nationwide and enables the toggle from any selection.
    click('[data-council-province="1"]');click('[data-party-filter="2"]');search('private search');
    assert.equal(document.querySelector('[data-changed-count]')!.textContent,'1');
    click('[data-council-changed-total]');
    assert.equal(window.location.search,'?changed=1');assert.equal(q.value,'');
    assert.equal(changed.getAttribute('aria-checked'),'true');assert.equal(visible().length,1);
    assert.equal(document.querySelectorAll('[data-council-indicator][hidden]').length,0);
    click('[data-council-clear]');click('[data-party-filter="1"]');
    assert.equal(changeText('scope'),'Nationwide');assert.equal(changeText('gained'),'1');assert.equal(changeText('lost'),'1');
    search('CPT');click('[data-council-changed]');
    assert.equal(changeText('lost'),'1','search and changed-only never remove losses from the summary');
    click('[data-council-province="9"]');assert.equal(changeText('scope'),'Western Cape');
    click('[data-council-province="1"]');
    assert.equal(changeText('scope'),'Eastern Cape');assert.equal(changeText('gained'),'—');assert.equal(changeText('lost'),'—');
    assert(!partyChange.querySelector<HTMLElement>('[data-party-change-empty]')!.hidden);
    const newReport=document.querySelectorAll<HTMLElement>('[data-council-row]')[20]!;
    newReport.dataset.comparable='true';newReport.dataset.previousParty='1';
    document.dispatchEvent(new window.Event('results:updated'));
    assert.equal(changeText('gained'),'0');assert.equal(changeText('lost'),'1');
    assert(partyChange.querySelector<HTMLElement>('[data-party-change-empty]')!.hidden);
    click('[data-party-filter="2"]');assert.equal(changeText('name'),'DA');
    assert.equal(changeText('gained'),'1');assert.equal(changeText('lost'),'0');
    click('[data-council-clear]');assert(partyChange.hidden);
  } finally {await window.happyDOM.close();}
});
