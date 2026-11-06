import { trackShare, type ShareContext } from './analytics.ts';

export function downloadImage(file: File, context?: ShareContext, fallback = false) {
  const url = URL.createObjectURL(file), link = document.createElement('a');
  link.href = url; link.download = file.name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  if (context) trackShare('share_save_image', context, fallback ? 'fallback_download' : 'download');
}

export function canShareImage(file: File) {
  return typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] }) === true;
}

/** The PNG is ready before the click so the device share menu keeps user activation. */
export async function shareImage(file: File, text: string, title: string, context?: ShareContext) {
  if (canShareImage(file)) {
    await navigator.share({ files: [file], title, text });
    if (context) trackShare('share', context, 'native_image');
    return 'native';
  }
  if (navigator.share) {
    await navigator.share({ title, text });
    if (context) trackShare('share', context, 'native_text');
  }
  downloadImage(file, context, true);
  return 'saved';
}

export async function sharePage(title: string, text: string, url: string, context?: ShareContext) {
  if (navigator.share) {
    await navigator.share({ title, text, url });
    if (context) trackShare('share', context, 'native_text');
    return 'native';
  }
  await navigator.clipboard.writeText(url);
  if (context) trackShare('share_copy_link', context, 'fallback_clipboard');
  return 'copied';
}
