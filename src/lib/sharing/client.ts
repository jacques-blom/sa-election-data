import { canShareImage, downloadImage, shareImage } from './actions.ts';
import { drawShareImage } from './image.ts';
import { publicShareUrl, shareCaption, type ShareCard, type ShareFormat } from './model.ts';

let current: { card: ShareCard; url: string } | null = null;
let readyFile: File | null = null;
let renderVersion = 0;
let opener: HTMLElement | null = null;
const dialog = () => document.querySelector<HTMLDialogElement>('[data-share-dialog]')!;
const feedback = (message: string) => { dialog().querySelector<HTMLElement>('[data-share-feedback]')!.textContent = message; };
const caption = () => dialog().querySelector<HTMLTextAreaElement>('[data-share-caption]')!;
async function render() {
  if (!current) return;
  const version = ++renderVersion;
  const { card } = current;
  const sheet = dialog(), canvas = sheet.querySelector<HTMLCanvasElement>('canvas')!;
  const loading = sheet.querySelector<HTMLElement>('[data-share-loading]')!;
  const actions = sheet.querySelectorAll<HTMLButtonElement>('[data-share-whatsapp], [data-share-native], [data-share-save]');
  actions.forEach(button => { button.disabled = true; });
  readyFile = null; canvas.hidden = true; loading.hidden = false; loading.textContent = 'Creating your image…';
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
    sheet.querySelector<HTMLElement>('[data-share-help]')!.textContent = canShareImage(readyFile)
      ? 'Choose WhatsApp in your device’s share menu to send the image.'
      : 'We’ll save the image and open WhatsApp. Attach the saved image before sending.';
  } catch {
    if (version !== renderVersion) return;
    loading.textContent = 'The image couldn’t be created. Try another format or copy the caption below.';
  }
}

export function openShare(card: ShareCard, url: string) {
  current = { card: structuredClone(card), url };
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  caption().value = shareCaption(card, url);
  if (!dialog().open) dialog().showModal();
  void render();
}

document.addEventListener('click', async event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button') : null;
  if (!button) return;
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
      downloadImage(readyFile); feedback('Image saved. Ready to attach to your post.');
    } else if (readyFile && (button.hasAttribute('data-share-whatsapp') || button.hasAttribute('data-share-native'))) {
      const outcome = await shareImage(readyFile, caption().value, `${current.card.area} · Counted`, button.hasAttribute('data-share-whatsapp'));
      if (outcome === 'whatsapp') feedback('Image saved. Attach it in WhatsApp before sending.');
      if (outcome === 'saved') feedback('Image saved. Use “Copy caption” to add the text to your post.');
    }
  } catch (error) {
    if (!(error instanceof Error && error.name === 'AbortError')) feedback('Sharing is unavailable. Save the image and copy the caption instead.');
  }
});
document.addEventListener('change', event => {
  if (event.target instanceof Element && event.target.matches('[name="share-format"]')) void render();
});
dialog()?.addEventListener('close', () => {
  renderVersion++; current = null; readyFile = null;
  if (opener?.isConnected) opener.focus();
});
