import type { ShareFormat } from './model.ts';

export type ShareContext = {
  url: string;
  kind: 'page' | 'result' | 'coalition' | 'update';
  source: 'page' | 'chart' | 'coalition' | 'update';
  format: ShareFormat | 'link';
};
type ShareEvent = 'share_open' | 'share_attempt' | 'share' | 'share_save_image'
  | 'share_copy_link' | 'share_copy_caption' | 'share_format_change' | 'share_cancel' | 'share_error';
type ShareMethod = 'native_image' | 'native_text' | 'download' | 'fallback_download'
  | 'clipboard' | 'fallback_clipboard' | 'copy_link' | 'copy_caption' | 'share' | 'render';

/** Only send action metadata. Captions, selections and URL parameters stay on the device. */
export function trackShare(event: ShareEvent, context: ShareContext, method?: ShareMethod) {
  try {
    if (typeof window === 'undefined' || window.location.hostname !== 'counted.co.za') return;
    const gtag = (window as Window & { gtag?: (command: string, event: string, params: Record<string, string>) => void }).gtag;
    if (!gtag) return;
    const page = new URL(window.location.href);
    const shared = new URL(context.url, page);
    const referrer = document.referrer ? new URL(document.referrer) : null;
    gtag('event', event, {
      content_type: context.kind,
      item_id: shared.pathname,
      share_source: context.source,
      share_format: context.format,
      ...(method ? { method } : {}),
      // Override automatic URL values for every event, including after map history changes.
      page_location: page.origin + page.pathname,
      page_referrer: referrer ? referrer.origin + referrer.pathname : '',
    });
  } catch {
    // Analytics must never prevent sharing, even when blocked or unavailable.
  }
}
