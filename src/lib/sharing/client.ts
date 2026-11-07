import { canShareImage, downloadImage, shareImage, sharePage } from './actions.ts';
import { drawShareImage } from './image.ts';
import { publicShareUrl, shareCaption, type ShareCard, type ShareFormat } from './model.ts';
import { trackShare, type ShareContext } from './analytics.ts';
import { resultsUrl } from '../history/view.ts';
import { selectHistoryShareCard } from './history.ts';

type Selection = { card: ShareCard | null; url: string; title: string; text: string; kind: ShareContext['kind']; source: ShareContext['source'] };
let current: Selection | null = null;
let readyFile: File | null = null;
let renderVersion = 0;
let opener: HTMLElement | null = null;
const dialog = () => document.querySelector<HTMLDialogElement>('[data-share-dialog]')!;
const feedback = (message: string) => { dialog().querySelector<HTMLElement>('[data-share-feedback]')!.textContent = message; };
const caption = () => dialog().querySelector<HTMLTextAreaElement>('[data-share-caption]')!;
const selectedFormat = () => dialog().querySelector<HTMLInputElement>('[name="share-format"]:checked')!.value as ShareFormat;
const analyticsContext = (selection: Selection): ShareContext => ({
  url: selection.url, kind: selection.kind, source: selection.source, format: selection.card ? selectedFormat() : 'link',
});
async function render() {
  if (!current?.card) return;
  const version = ++renderVersion;
  const { card } = current;
  const context = analyticsContext(current);
  const sheet = dialog(), canvas = sheet.querySelector<HTMLCanvasElement>('canvas')!;
  const loading = sheet.querySelector<HTMLElement>('[data-share-loading]')!;
  const help = sheet.querySelector<HTMLElement>('[data-share-help]')!;
  const actions = sheet.querySelectorAll<HTMLButtonElement>('[data-share-native], [data-share-save]');
  actions.forEach(button => { button.disabled = true; });
  readyFile = null; canvas.hidden = true; loading.hidden = false; loading.textContent = 'Creating your image…';
  help.hidden = true;
  feedback('');
  try {
    const format = selectedFormat();
    // Each render owns its canvas, so a late font/image load cannot overwrite a newer preview.
    const rendered = document.createElement('canvas');
    await drawShareImage(rendered, card, format);
    const blob = await new Promise<Blob>((resolve, reject) => rendered.toBlob(b => b ? resolve(b) : reject(new Error('Could not create image')), 'image/png'));
    if (version !== renderVersion) return;
    canvas.width = rendered.width; canvas.height = rendered.height;
    canvas.getContext('2d')!.drawImage(rendered, 0, 0);
    canvas.setAttribute('aria-label', rendered.getAttribute('aria-label')!);
    const slug = card.area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    readyFile = new File([blob], `counted-${slug}-${format}.png`, { type: 'image/png' });
    canvas.hidden = false; loading.hidden = true;
    actions.forEach(button => { button.disabled = false; });
    help.hidden = canShareImage(readyFile);
    help.textContent = help.hidden ? '' : 'Your browser will save the image so you can attach it to your post.';
  } catch {
    if (version !== renderVersion) return;
    loading.textContent = 'The image couldn’t be created. Try another format or copy the caption below.';
    trackShare('share_error', context, 'render');
  }
}

function showShare() {
  if (!current) return;
  const sheet = dialog();
  const hasImage = !!current.card;
  sheet.classList.toggle('share-dialog--page', !hasImage);
  sheet.querySelector('h2')!.textContent = current.card?.kind === 'history' ? current.card.history?.metric==='seats'?'Share council history':'Share vote history' : current.card?.kind === 'coalition' ? 'Share scenario' : hasImage ? 'Share results' : 'Share this page';
  sheet.querySelectorAll<HTMLElement>('.share-preview, .share-formats, [data-share-save]').forEach(el => { el.hidden = !hasImage; });
  sheet.querySelector<HTMLButtonElement>('[data-share-native]')!.disabled = hasImage;
  sheet.querySelector<HTMLElement>('[data-share-help]')!.hidden = true;
  feedback('');
  renderVersion++; readyFile = null;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  caption().value = current.card ? shareCaption(current.card, current.url) : `${current.text}\n\n${current.url}`;
  if (!sheet.open) sheet.showModal();
  trackShare('share_open', analyticsContext(current));
  if (hasImage) void render();
}

export function openShare(card: ShareCard, url: string, source: ShareContext['source'] = 'chart') {
  current = { card: structuredClone(card), url, title: `${card.area} · Counted`, text: card.caption, kind: card.kind, source };
  showShare();
}

document.addEventListener('click', async event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button') : null;
  if (!button || button.disabled) return;
  if (button.hasAttribute('data-share-history')) {
    const chart=button.closest<HTMLElement>('[data-vote-history]');
    if (!chart) return;
    const cards=JSON.parse(button.dataset.shareHistory!) as Record<string,ShareCard>;
    const metric=chart.dataset.selectedMetric??chart.dataset.defaultMetric??'votes';
    const base=cards[metric]??cards.votes;
    if (!base) return;
    const card=selectHistoryShareCard(base,{year:Number(chart.dataset.selectedYear??chart.dataset.defaultYear),party:chart.dataset.selectedParty||null});
    const url=resultsUrl();
    url.searchParams.set('metric',metric);
    url.searchParams.set('history-year',String(card.history!.year));
    if(card.history!.party)url.searchParams.set('party',card.history!.party);else url.searchParams.delete('party');
    openShare(card,`${publicShareUrl(url.href)}#vote-history`,'history');
    return;
  }
  if (button.hasAttribute('data-share-page')) {
    // Read the current result trigger on each click, including after live updates.
    const result = button.dataset.sharePage === 'result' ? document.querySelector<HTMLButtonElement>('main [data-share-result]') : null;
    if (result) {
      openShare(JSON.parse(result.dataset.shareResult!) as ShareCard, publicShareUrl(resultsUrl().href, result.dataset.shareBallot as 'pr' | 'ward' | undefined), 'page');
    } else {
      const text = button.dataset.shareText || document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content || document.title;
      const kind = button.dataset.shareType === 'update' ? 'update' : 'page';
      current = { card: null, url: publicShareUrl(new URL(button.dataset.shareUrl || resultsUrl().href, location.href).href),
        title: button.dataset.shareTitle || document.title, text, kind, source: kind };
      showShare();
    }
    return;
  }
  if (button.hasAttribute('data-share-result')) {
    const card=JSON.parse(button.dataset.shareResult!) as ShareCard;
    const url=resultsUrl();
    if(card.council){url.searchParams.delete('ballot');url.searchParams.delete('history-year');}
    openShare(card, publicShareUrl(url.href, button.dataset.shareBallot as 'pr' | 'ward' | undefined));
    return;
  }
  if (!button.closest('[data-share-dialog]')) return;
  if (button.hasAttribute('data-share-close')) { dialog().close(); return; }
  if (!current) return;
  // Native sharing/clipboard may finish after the dialog closes or another card opens.
  const selection = current, context = analyticsContext(selection);
  const report = (message: string) => { if (current === selection) feedback(message); };
  const action = button.hasAttribute('data-share-save') ? 'download' : 'share';
  try {
    if (button.hasAttribute('data-share-copy') || button.hasAttribute('data-share-copy-link')) {
      const link = button.hasAttribute('data-share-copy-link');
      try {
        await navigator.clipboard.writeText(link ? selection.url : caption().value);
        trackShare(link ? 'share_copy_link' : 'share_copy_caption', context, 'clipboard');
        report(link ? 'Link copied.' : 'Caption copied.');
      } catch {
        trackShare('share_error', context, link ? 'copy_link' : 'copy_caption');
        if (current === selection) { caption().focus(); caption().select(); report('Select and copy the caption and link above.'); }
      }
    } else if (readyFile && button.hasAttribute('data-share-save')) {
      downloadImage(readyFile, context); report('Image saved.');
    } else if (button.hasAttribute('data-share-native')) {
      trackShare('share_attempt', context, 'share');
      if (readyFile) {
        const outcome = await shareImage(readyFile, caption().value, selection.title, context);
        if (outcome === 'saved') report('Image saved. Use “Copy caption” to add the text to your post.');
      } else if (!selection.card) {
        const outcome = await sharePage(selection.title, selection.text, selection.url, context);
        if (outcome === 'copied') report('Link copied. Paste it into your message or post.');
      }
    }
  } catch (error) {
    const cancelled = error instanceof Error && error.name === 'AbortError';
    trackShare(cancelled ? 'share_cancel' : 'share_error', context, action);
    if (!cancelled) report(selection.card ? 'Sharing is unavailable. Save the image and copy the caption instead.' : 'Sharing is unavailable. Use “Copy link” or copy the caption below.');
  }
});
document.addEventListener('change', event => {
  if (current?.card && event.target instanceof Element && event.target.matches('[name="share-format"]')) {
    trackShare('share_format_change', analyticsContext(current));
    void render();
  }
});
dialog()?.addEventListener('close', () => {
  renderVersion++; current = null; readyFile = null;
  if (opener?.isConnected) opener.focus();
});
