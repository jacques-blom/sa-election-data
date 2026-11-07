import { coalitionSelection, type CoalitionData } from './coalition.ts';
import { coalitionDeal, coalitionFingerprint, drawCoalitionRoll, gamePartyLabel, type CoalitionTwist } from './game.ts';
import { drawSpeakerComment, type SpeakerMemory } from './commentary.ts';
import { coalitionLesson } from './learning.ts';
import { coalitionShareCard } from './share-image.ts';
import { openShare } from '../sharing/client.ts';
import { publicShareUrl } from '../sharing/model.ts';
import { matchingPoliticalHistory, type PoliticalBackstory } from './political-history.ts';
import { coalitionLeader } from './leaders.ts';
import { syncGameSprites, stopGameSprites } from './sprite-animation.ts';
import { playWalkout, preloadWalkout, stopWalkout } from './walkout-animation.ts';

let selected = new Set((new URL(location.href).searchParams.get('parties') ?? '').split(',').filter(Boolean));
let previousSnapshot: string | undefined;
let fingerprint: string | undefined;
let currentTwist: CoalitionTwist | null = null;
let rollPhase: 'loading' | 'result' | null = null;
let rollTimers: number[] = [];
let rollVersion = 0, rollNumber = 0, loadingStep = 0;
let loadingLines: string[] = [];
let seenCards: string[] = [];
let choosingCouncil = false;
let speakerMemory: SpeakerMemory | undefined;
let majorityReached = false;
let attemptedWithoutMajority = false;
let dealTested = false;
const root = () => document.querySelector<HTMLElement>('[data-coalition]');
function model(): CoalitionData | null {
  const value = root()?.dataset.coalition;
  return value ? JSON.parse(value) as CoalitionData : null;
}
function shareUrl(data: CoalitionData) {
  const url = new URL(location.href);
  const ids = coalitionSelection(data, selected).parties.map(p => p.id);
  url.search = ''; url.hash = '';
  if (ids.length) url.searchParams.set('parties', ids.join(','));
  return url.href;
}
function clearRollTimers() {
  rollVersion++;
  for (const timer of rollTimers) window.clearTimeout(timer);
  rollTimers = [];
}
function closeTwist(edit = false) {
  stopWalkout();
  clearRollTimers();
  rollPhase = null;
  currentTwist = null;
  const screen = root();
  screen?.querySelector<HTMLDialogElement>('[data-chaos-dialog]')?.close();
  if (screen) syncGameSprites(screen);
  const target = edit ? screen?.querySelector<HTMLButtonElement>('[data-coalition-party][aria-pressed="true"]')
    : screen?.querySelector<HTMLButtonElement>('[data-chaos-test]');
  if (target && !target.disabled) {
    if (edit) target.scrollIntoView({ block: 'center', behavior: 'instant' });
    target.focus({ preventScroll: true });
  }
}
function renderHistory(details: HTMLDetailsElement, history?: PoliticalBackstory) {
  const changed = !!details.dataset.historyId && details.dataset.historyId !== history?.id;
  details.hidden = !history;
  if (!history) { details.removeAttribute('data-history-id'); details.open = false; return; }
  details.dataset.historyId = history.id;
  const summary = details.querySelector('summary');
  if (summary) summary.textContent = `Historical context · ${history.period}`;
  if (changed) details.open = false;
  const content = details.querySelector('[data-history-content]')!;
  const period = document.createElement('strong'); period.textContent = history.period;
  const fact = document.createElement('p'); fact.textContent = history.fact;
  const sources = document.createElement('div'); sources.className = 'chaos-history-sources';
  for (const source of history.sources) {
    const link = document.createElement('a'); link.href = source.url; link.textContent = `${source.label} ↗`;
    link.target = '_blank'; link.rel = 'noopener noreferrer'; sources.appendChild(link);
  }
  content.replaceChildren(period, fact, sources);
}
const negotiationLines = [
  ['Muting the coalition group chat…', 'Comparing the parties’ priorities…', 'Counting who is still in the room…'],
  ['Finding a bigger bargaining table…', 'Agreeing who gets the microphone…', 'Checking the fine print…'],
  ['Calling an urgent party meeting…', 'Reading the proposed agreement…', 'Asking Madam Speaker to count again…'],
];
function renderTestAction(screen: HTMLElement, deal: ReturnType<typeof coalitionDeal>) {
  const state = deal.majority ? 'ready' : attemptedWithoutMajority ? 'short' : 'waiting';
  screen.querySelector<HTMLElement>('.chaos-action-bar')!.dataset.testState = state;
  const feedback = screen.querySelector<HTMLElement>('[data-test-feedback]')!;
  feedback.textContent = deal.majority ? 'Majority reached. See if your deal holds.'
    : attemptedWithoutMajority ? `Not yet — add ${deal.shortfall} more ${deal.shortfall === 1 ? 'seat' : 'seats'} for a majority.` : '';
  feedback.hidden = state === 'waiting';
}
function nudgeTestAction(screen: HTMLElement, motion: 'ready' | 'short') {
  const button = screen.querySelector<HTMLElement>('[data-chaos-test]')!;
  delete button.dataset.testMotion;
  // Restart the brief feedback even when someone taps twice. CSS respects reduced motion.
  void button.offsetWidth;
  button.dataset.testMotion = motion;
}
function startRoll() {
  if (rollPhase === 'loading') return;
  const data = model(), screen = root();
  if (!data || !screen) return;
  const deal = coalitionDeal(data, selected);
  if (!deal.majority) {
    attemptedWithoutMajority = true;
    renderTestAction(screen, deal);
    nudgeTestAction(screen, 'short');
    screen.querySelector('[data-coalition-announcement]')!.replaceChildren(
      document.createTextNode(screen.querySelector('[data-test-feedback]')!.textContent!),
    );
    return;
  }
  const draw = drawCoalitionRoll(data, selected, seenCards);
  if (!draw.twist) return;
  dealTested = true;
  delete screen.querySelector<HTMLElement>('[data-chaos-test]')!.dataset.testMotion;
  stopWalkout();
  clearRollTimers();
  currentTwist = draw.twist; seenCards = draw.seen;
  if (currentTwist.affected?.some(a => a.kind === 'exit')) preloadWalkout();
  rollPhase = 'loading'; loadingStep = 0;
  loadingLines = negotiationLines[rollNumber++ % negotiationLines.length]!;
  showLoading(true);
  const version = rollVersion;
  const schedule = (delay: number, work: () => void) => rollTimers.push(window.setTimeout(() => {
    if (version === rollVersion && rollPhase === 'loading') work();
  }, delay));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) schedule(200, revealRoll);
  else {
    schedule(500, () => { loadingStep = 1; showLoading(); });
    schedule(1000, () => { loadingStep = 2; showLoading(); });
    schedule(1500, revealRoll);
  }
}
function showLoading(focus = false) {
  const screen = root(), twist = currentTwist;
  if (!screen || !twist || rollPhase !== 'loading') return;
  const dialog = screen.querySelector<HTMLDialogElement>('[data-chaos-dialog]')!;
  dialog.dataset.phase = 'loading';
  dialog.setAttribute('aria-labelledby', 'chaos-loading-title');
  dialog.setAttribute('aria-describedby', 'chaos-scenario-notice chaos-loading-baseline');
  dialog.querySelector<HTMLElement>('[data-chaos-loading]')!.hidden = false;
  dialog.querySelector<HTMLElement>('[data-chaos-outcome]')!.hidden = true;
  dialog.querySelector('[data-loading-message]')!.textContent = loadingLines[loadingStep]!;
  dialog.querySelector('[data-loading-baseline]')!.textContent = `Fresh roll · starting with all ${twist.original} seats`;
  dialog.querySelector<HTMLElement>('[data-chaos-loading]')!.dataset.step = String(loadingStep);
  if (!dialog.open) dialog.showModal();
  if (focus) { (dialog.querySelector<HTMLElement>('[data-chaos-scroll]') ?? dialog).scrollTop = 0; dialog.querySelector<HTMLElement>('#chaos-loading-title')!.focus({ preventScroll: true }); }
}
function revealRoll() {
  if (rollPhase !== 'loading' || !currentTwist) return;
  clearRollTimers();
  rollPhase = 'result';
  showTwist();
}
function renderCast(screen: HTMLElement, twist: CoalitionTwist, animate: boolean) {
  const data = model()!, parties = coalitionSelection(data, selected).parties;
  const cast = screen.querySelector<HTMLElement>('[data-twist-cast]')!;
  const affected = new Map(twist.affected?.map(a => [a.partyId, a]));
  const ordered = [...parties].sort((a, b) => Number(affected.has(b.id)) - Number(affected.has(a.id)));
  const tiles = ordered.slice(0, 4).map(p => {
    const loss = affected.get(p.id), effect = loss?.kind ?? 'stay';
    const tile = document.createElement('div'); tile.className = 'chaos-cast-party'; tile.dataset.effect = effect;
    tile.style.setProperty('--party', p.color); tile.setAttribute('aria-hidden', 'true');
    const visual = document.createElement('div'); visual.className = 'chaos-cast-portrait';
    const original = [...screen.querySelectorAll<HTMLElement>('[data-coalition-party]')].find(el => el.dataset.coalitionParty === p.id)?.querySelector('[data-party-portrait]');
    if (original) {
      const portrait = original.cloneNode(true) as HTMLElement;
      portrait.removeAttribute('data-party-portrait');
      portrait.dataset.mood = loss ? 'sad' : twist.survived ? 'happy' : 'neutral';
      portrait.style.setProperty('--frame-x', loss ? '100%' : twist.survived ? `${200 / 3}%` : '0%');
      visual.appendChild(portrait);
    }
    const name = document.createElement('strong'); name.textContent = gamePartyLabel(p);
    const status = document.createElement('span'); status.textContent = effect === 'exit' ? `OUT · −${loss!.lost}` : loss ? `−${loss.lost} support` : twist.lost && !twist.affected?.length ? 'In original deal' : 'Stays';
    tile.appendChild(visual); tile.appendChild(name); tile.appendChild(status); return tile;
  });
  cast.replaceChildren(...tiles);
  if (parties.length > 4) {
    const more = document.createElement('small'); more.className = 'chaos-cast-more';
    more.textContent = `+ ${parties.length - 4} more ${parties.length === 5 ? 'party' : 'parties'} in your deal`; cast.appendChild(more);
  }
  cast.dataset.animate = String(animate);
  const exiting = parties.filter(p => affected.get(p.id)?.kind === 'exit');
  const scene = screen.querySelector<HTMLElement>('[data-twist-scene]')!;
  scene.hidden = exiting.length === 0;
  if (exiting.length) {
    scene.querySelector('[data-walkout-caption]')!.textContent = `${exiting.map(gamePartyLabel).join(' + ')} ${exiting.length === 1 ? 'walks' : 'walk'} out`;
    void playWalkout(scene.querySelector<HTMLCanvasElement>('canvas')!, exiting.map(p => ({ name: gamePartyLabel(p), cell: coalitionLeader(p.short, data.municipalityId)?.cell })), animate);
  } else stopWalkout();
  cast.setAttribute('aria-label', twist.affected?.length ? twist.affected.map(a => {
    const p = parties.find(p => p.id === a.partyId)!;
    return `${gamePartyLabel(p)}: ${a.kind === 'exit' ? 'leaves the deal' : 'withholds support'}, support from ${a.lost} seats withdrawn.`;
  }).join(' ') : twist.lost ? `Support from ${twist.lost} seats unavailable. The scenario does not identify a party.` : 'All selected parties stay in the deal.');
}
function showTwist(focusTitle = true) {
  const screen = root(), twist = currentTwist, data = model();
  if (!screen || !twist || !data || rollPhase !== 'result') return;
  const dialog = screen.querySelector<HTMLDialogElement>('[data-chaos-dialog]')!;
  dialog.dataset.phase = 'result';
  dialog.setAttribute('aria-labelledby', 'chaos-twist-title');
  dialog.setAttribute('aria-describedby', 'chaos-scenario-notice chaos-twist-story');
  dialog.querySelector<HTMLElement>('[data-chaos-loading]')!.hidden = true;
  dialog.querySelector<HTMLElement>('[data-chaos-outcome]')!.hidden = false;
  const set = (name: string, value: string) => { dialog.querySelector(`[data-twist-${name}]`)!.textContent = value; };
  set('title', twist.title); set('story', twist.story);
  const lesson = coalitionLesson(data, twist);
  const lessonCard = dialog.querySelector<HTMLElement>('[data-twist-lesson]');
  if (lessonCard) {
    lessonCard.dataset.lessonId = lesson.id;
    lessonCard.querySelector('[data-lesson-title]')!.textContent = lesson.title;
    lessonCard.querySelector('[data-lesson-text]')!.textContent = lesson.text;
    const link = lessonCard.querySelector<HTMLAnchorElement>('[data-lesson-link]')!;
    link.href = lesson.href;
    link.textContent = `${lesson.linkLabel} ↗`;
  }
  set('verdict', twist.survived ? 'You still have a majority.' : 'You lose your majority.');
  set('maths', `${twist.original} − ${twist.lost} = ${twist.remaining}`);
  set('rule', twist.rule);
  const margin = twist.survived ? twist.spare === 0 ? 'just enough. No seats to spare.'
    : `${twist.spare} ${twist.spare === 1 ? 'seat' : 'seats'} to spare.`
    : `${twist.shortfall} ${twist.shortfall === 1 ? 'seat' : 'seats'} short.`;
  set('margin', `${twist.target} needed · ${margin}`);
  set('baseline', `This roll started with all ${twist.original} seats`);
  dialog.querySelector('[data-roll-restart]')!.textContent = `Restart with ${twist.original} seats`;
  dialog.querySelector<HTMLElement>('[data-twist-result]')!.dataset.survived = String(twist.survived);
  dialog.querySelector<HTMLElement>('[data-twist-meter-remaining]')!.style.width = `${twist.remaining / data.total * 100}%`;
  dialog.querySelector<HTMLElement>('[data-twist-meter-lost]')!.style.width = `${twist.lost / data.total * 100}%`;
  dialog.querySelector<HTMLElement>('[data-twist-meter-target]')!.style.left = `${twist.target / data.total * 100}%`;
  dialog.querySelector('[data-twist-meter]')!.setAttribute('aria-label', `${twist.remaining} of ${data.total} council seats support your deal; support from ${twist.lost} seats withdrawn or unavailable. Majority line: ${twist.target}.`);
  renderCast(screen, twist, focusTitle);
  renderHistory(dialog.querySelector<HTMLDetailsElement>('[data-twist-history]')!, twist.history ?? matchingPoliticalHistory(data, coalitionSelection(data, selected).parties)[0]);
  if (!dialog.open) dialog.showModal();
  if (focusTitle) {
    (dialog.querySelector<HTMLElement>('[data-chaos-scroll]') ?? dialog).scrollTop = 0; dialog.querySelector<HTMLElement>('[data-twist-title]')!.focus({ preventScroll: true });
    screen.querySelector('[data-coalition-announcement]')!.textContent = `New fictional scenario. ${twist.title} ${twist.rule} ${twist.remaining} seats still support your deal. ${twist.target} needed: ${margin}`;
  }
  syncGameSprites(screen);
}
function update(announce = false, reactTo?: string) {
  const data = model(), screen = root();
  if (!data || !screen) { closeTwist(); stopGameSprites(); return; }
  const deal = coalitionDeal(data, selected);
  selected = new Set(deal.parties.map(p => p.id));
  const nextFingerprint = coalitionFingerprint(data, selected);
  const changedDeal = fingerprint !== undefined && fingerprint !== nextFingerprint;
  const wasOpen = rollPhase !== null;
  if (changedDeal) closeTwist();
  fingerprint = nextFingerprint;
  const set = (name: string, value: string) => { screen.querySelector(`[data-${name}]`)!.textContent = value; };
  set('coalition-total', String(deal.total));
  set('coalition-status', deal.majority ? deal.spare === 0 ? 'Just enough!' : `+${deal.spare} to spare` : `${deal.shortfall} to go`);
  const gainedMajority = !majorityReached && deal.majority;
  const lostMajority = majorityReached && !deal.majority;
  majorityReached = deal.majority;
  screen.dataset.majorityReached = String(deal.majority);
  screen.querySelector<HTMLElement>('[data-deal-title]')!.hidden = !deal.majority;
  screen.querySelector<HTMLElement>('[data-speaker]')!.dataset.pose = deal.majority ? '1' : lostMajority ? '2' : '0';
  // Keep the server's randomly chosen line on first mount. Later deals still draw anew.
  const savedSpeaker = screen.querySelector<HTMLElement>('[data-speaker-memory]')?.dataset.speakerMemory;
  speakerMemory = drawSpeakerComment(data, selected, speakerMemory ?? (savedSpeaker ? JSON.parse(savedSpeaker) as SpeakerMemory : undefined));
  const backstory = speakerMemory.history ?? matchingPoliticalHistory(data, deal.parties)[0];
  set('speaker-quote', speakerMemory.quote);
  renderHistory(screen.querySelector<HTMLDetailsElement>('[data-coalition-history]')!, backstory);
  set('deal-title', deal.title);
  screen.querySelector<HTMLElement>('[data-coalition-share]')!.hidden = !deal.majority;
  if (changedDeal) {
    attemptedWithoutMajority = false;
    dealTested = false;
    delete screen.querySelector<HTMLElement>('[data-chaos-test]')!.dataset.testMotion;
  }
  renderTestAction(screen, deal);
  if (deal.majority && !dealTested) {
    if (gainedMajority || changedDeal) nudgeTestAction(screen, 'ready');
    else screen.querySelector<HTMLElement>('[data-chaos-test]')!.dataset.testMotion = 'ready';
  }
  for (const button of screen.querySelectorAll<HTMLButtonElement>('[data-coalition-party]')) {
    const p = data.parties.find(p => p.id === button.dataset.coalitionParty)!;
    const active = selected.has(p.id);
    const pivotal = deal.pivotal.some(partner => partner.id === p.id);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', `${p.name}, ${p.seats} ${data.status === 'estimated' ? 'estimated ' : ''}seats. ${active ? 'Remove from' : 'Add to'} your deal.${pivotal ? ' Key partner: your majority depends on them.' : ''}`);
    button.querySelector('.coalition-toggle-symbol')!.textContent = active ? '✓' : '+';
    button.querySelector('[data-party-role]')!.textContent = pivotal ? 'Key partner' : '';
    button.dataset.pivotal = String(pivotal);
  }
  for (const segment of screen.querySelectorAll<HTMLElement>('[data-coalition-segment]')) {
    const p = data.parties.find(p => p.id === segment.dataset.coalitionSegment)!;
    segment.style.width = `${selected.has(p.id) ? p.seats / data.total * 100 : 0}%`;
  }
  syncGameSprites(screen, reactTo);
  const description = `${deal.total} of ${data.total} seats selected. ${deal.status}. ${data.status === 'estimated' ? 'Estimated seats based on the current count.' : 'Provisional IEC-reported seats.'}`;
  screen.querySelector('.coalition-meter')!.setAttribute('aria-label', `${description} Majority marker at ${data.majority} seats.`);
  screen.querySelectorAll<HTMLButtonElement>('[data-coalition-reset], [data-coalition-share]').forEach(b => { b.disabled = !deal.parties.length; });
  const snapshotChanged = previousSnapshot !== undefined && previousSnapshot !== data.source.snapshotId;
  if (announce || snapshotChanged || changedDeal && wasOpen) set('coalition-announcement', `${snapshotChanged ? 'Seat figures updated. ' : ''}${wasOpen && changedDeal ? 'Plot twist cleared because the underlying deal changed. ' : ''}${description}${gainedMajority ? ' Test the deal to see if it holds.' : ''}`);
  previousSnapshot = data.source.snapshotId;
  history.replaceState(null, '', shareUrl(data));
  if (wasOpen && !changedDeal) { if (rollPhase === 'loading') showLoading(); else showTwist(false); }
  if (wasOpen && changedDeal) screen.querySelector<HTMLButtonElement>('[data-coalition-party]')?.focus();
}
// Delegation survives live result patches. Persist party IDs, never stale seat totals.
async function chooseRandomCouncil(button: HTMLButtonElement) {
  if (choosingCouncil) return;
  choosingCouncil = true;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.querySelector('[data-random-label]')!.textContent = 'Picking…';
  const feedback = document.querySelector<HTMLElement>('[data-random-feedback]')!;
  feedback.hidden = true;
  try {
    const params = new URLSearchParams({ exclude: button.dataset.currentCouncil ?? '' });
    const response = await fetch(`/api/coalition/random?${params}`, { signal: AbortSignal.timeout(12000) });
    const data = await response.json() as { href?: string; error?: string };
    if (!response.ok || !data.href) throw new Error(data.error ?? 'Couldn’t pick a council. Try again.');
    const destination = new URL(data.href, location.origin);
    if (destination.origin !== location.origin || !/^\/2026\/places\/[^/]+\/coalition$/.test(destination.pathname)) throw new Error('Couldn’t pick a council. Try again.');
    location.assign(destination.href);
  } catch (error) {
    feedback.textContent = error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The dice got stuck. Try again.';
    feedback.hidden = false;
  } finally {
    choosingCouncil = false;
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.querySelector('[data-random-label]')!.textContent = 'Random';
  }
}
document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, [data-chaos-involved]') : null;
  if (!target) return;
  if (target.hasAttribute('data-chaos-involved')) {
    event.preventDefault();
    closeTwist();
    const panel = document.getElementById('get-involved');
    panel?.scrollIntoView({ block: 'start', behavior: 'instant' });
    panel?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    return;
  }
  if (target instanceof HTMLButtonElement && target.hasAttribute('data-coalition-random')) { void chooseRandomCouncil(target); }
  else if (target.hasAttribute('data-coalition-party')) {
    const id = target.dataset.coalitionParty!;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    update(true, id);
  } else if (target.hasAttribute('data-coalition-reset')) { selected.clear(); update(true); }
  else if (target.hasAttribute('data-chaos-test') || target.hasAttribute('data-chaos-roll')) startRoll();
  else if (target.hasAttribute('data-chaos-skip')) revealRoll();
  else if (target.hasAttribute('data-chaos-edit')) closeTwist(true);
  else if (target.hasAttribute('data-chaos-close')) closeTwist();
  else if (target.hasAttribute('data-coalition-share')) {
    const data = model();
    if (data) {
      const deal = coalitionDeal(data, selected), card = coalitionShareCard(data, selected);
      card.headline = deal.title;
      openShare(card, publicShareUrl(shareUrl(data)), 'coalition');
    }
  }
});
document.addEventListener('cancel', event => {
  if (event.target instanceof Element && event.target.matches('[data-chaos-dialog]')) {
    event.preventDefault(); closeTwist();
  }
}, true);
document.addEventListener('results:updated', () => update());
window.addEventListener('popstate', () => { selected = new Set((new URL(location.href).searchParams.get('parties') ?? '').split(',')); update(); });
update();
