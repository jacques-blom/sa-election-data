export function downloadImage(file: File) {
  const url = URL.createObjectURL(file), link = document.createElement('a');
  link.href = url; link.download = file.name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function canShareImage(file: File) {
  return typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] }) === true;
}

/** The PNG is ready before the click so the device share menu keeps user activation. */
export async function shareImage(file: File, text: string, title: string, whatsapp: boolean) {
  if (canShareImage(file)) {
    await navigator.share({ files: [file], title, text });
    return 'native';
  }
  downloadImage(file);
  if (whatsapp) {
    // wa.me can prefill text, but cannot attach an image. The UI explains that step.
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    return 'whatsapp';
  }
  if (navigator.share) await navigator.share({ title, text });
  return 'saved';
}
