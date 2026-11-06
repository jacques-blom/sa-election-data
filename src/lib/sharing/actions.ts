export function downloadImage(file: File) {
  const url = URL.createObjectURL(file), link = document.createElement('a');
  link.href = url; link.download = file.name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function canShareImage(file: File) {
  return typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] }) === true;
}

/** The PNG is ready before the click so the device share menu keeps user activation. */
export async function shareImage(file: File, text: string, title: string) {
  if (canShareImage(file)) {
    await navigator.share({ files: [file], title, text });
    return 'native';
  }
  if (navigator.share) await navigator.share({ title, text });
  downloadImage(file);
  return 'saved';
}

export async function sharePage(title: string, text: string, url: string) {
  if (navigator.share) {
    await navigator.share({ title, text, url });
    return 'native';
  }
  await navigator.clipboard.writeText(url);
  return 'copied';
}
