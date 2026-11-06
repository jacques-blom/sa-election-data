import { canShareImage, downloadImage, shareImage, sharePage } from './actions.ts';
import { drawShareImage } from './image.ts';
import { publicShareUrl, shareCaption, type ShareCard, type ShareFormat } from './model.ts';

let current: { card: ShareCard | null; url: string; title: string; text: string } | null = null;
let readyFile: File | null = null;
let renderVersion = 0;
let opener: HTMLElement | null = null;
const dialog = () => document.querySelector<HTMLDialogElement>('[data-share-dialog]')!;
const feedback = (message: string) => { dialog().querySelector<HTMLElement>('[data-share-feedback]')!.textContent = message; };
const caption = () => dialog().querySelector<HTMLTextAreaElement>('[data-share-caption]')!;
async function render() {
  if (!current?.card) return;
  const version = ++renderVersion;
  const { card } = current;
  const sheet = dialog(), canvas = sheet.querySelector<HTMLCanvasElement>('canvas')!;
  const loading = sheet.querySelector<HTMLElement>('[data-share-loading]')!;
  const help = sheet.querySelector<HTMLElement>('[data-share-help]')!;
  const actions = sheet.querySelectorAll<HTMLButtonElement>('[data-share-native], [data-share-save]');
  actions.forEach(button => { button.disabled = true; });
  readyFile = null; canvas.hidden = true; loading.hidden = false; loading.textContent = 'Creating your image…';
  help.hidden = true;
  feedback('');
  try {
    const format = sheet.querySelector<HTMLInputElement>('[name="share-format"]:checked')!.value as ShareFormat;
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
  }
}

function showShare() {
  if (!current) return;
  const sheet = dialog();
  const hasImage = !!current.card;
  sheet.classList.toggle('share-dialog--page', !hasImage);
  sheet.querySelector('h2')!.textContent = current.card?.kind === 'coalition' ? 'Share scenario' : hasImage ? 'Share results' : 'Share this page';
  sheet.querySelectorAll<HTMLElement>('.share-preview, .share-formats, [data-share-save]').forEach(el => { el.hidden = !hasImage; });
  sheet.querySelector<HTMLButtonElement>('[data-share-native]')!.disabled = hasImage;
  sheet.querySelector<HTMLElement>('[data-share-help]')!.hidden = true;
  feedback('');
  renderVersion++; readyFile = null;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  caption().value = current.card ? shareCaption(current.card, current.url) : `${current.text}\n\n${current.url}`;
  if (!sheet.open) sheet.showModal();
  if (hasImage) void render();
}

export function openShare(card: ShareCard, url: string) {
  current = { card: structuredClone(card), url, title: `${card.area} · Counted`, text: card.caption };
  showShare();
}

document.addEventListener('click', async event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button') : null;
  if (!button) return;
  if (button.hasAttribute('data-share-page')) {
    // Read the current result trigger on each click, including after live updates.
    const result = button.dataset.sharePage === 'result' ? document.querySelector<HTMLButtonElement>('main [data-share-result]') : null;
    if (result) {
      openShare(JSON.parse(result.dataset.shareResult!) as ShareCard, publicShareUrl(location.href, result.dataset.shareBallot as 'pr' | 'ward' | undefined));
    } else {
      const text = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content || document.title;
      current = { card: null, url: publicShareUrl(location.href), title: document.title, text };
      showShare();
    }
    return;
  }
  if (button.hasAttribute('data-share-result')) {
    openShare(JSON.parse(button.dataset.shareResult!) as ShareCard, publicShareUrl(location.href, button.dataset.shareBallot as 'pr' | 'ward' | undefined));
    return;
  }
  if (!button.closest('[data-share-dialog]')) return;
  try {
    if (button.hasAttribute('data-share-close')) { dialog().close(); return; }
    if (!current) return;
    if (button.hasAttribute('data-share-copy') || button.hasAttribute('data-share-copy-link')) {
      try {
        await navigator.clipboard.writeText(button.hasAttribute('data-share-copy-link') ? current.url : caption().value);
        feedback(button.hasAttribute('data-share-copy-link') ? 'Link copied.' : 'Caption copied.');
      } catch { caption().focus(); caption().select(); feedback('Select and copy the caption and link above.'); }
    } else if (readyFile && button.hasAttribute('data-share-save')) {
      downloadImage(readyFile); feedback('Image saved.');
    } else if (button.hasAttribute('data-share-native')) {
      if (readyFile) {
        const outcome = await shareImage(readyFile, caption().value, current.title);
        if (outcome === 'saved') feedback('Image saved. Use “Copy caption” to add the text to your post.');
      } else if (!current.card) {
        const outcome = await sharePage(current.title, current.text, current.url);
        if (outcome === 'copied') feedback('Link copied. Paste it into your message or post.');
      }
    }
  } catch (error) {
    if (!(error instanceof Error && error.name === 'AbortError')) feedback(current?.card ? 'Sharing is unavailable. Save the image and copy the caption instead.' : 'Sharing is unavailable. Use “Copy link” or copy the caption below.');
  }
});
document.addEventListener('change', event => {
  if (event.target instanceof Element && event.target.matches('[name="share-format"]')) void render();
});
dialog()?.addEventListener('close', () => {
  renderVersion++; current = null; readyFile = null;
  if (opener?.isConnected) opener.focus();
});
