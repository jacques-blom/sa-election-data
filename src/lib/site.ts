export const SITE_ORIGIN = 'https://counted.co.za';

/** Public links always use Counted's domain, including on local and preview hosts. */
export function publicUrl(value: string | URL) {
  const source = new URL(value, SITE_ORIGIN);
  const url = new URL(SITE_ORIGIN);
  url.pathname = source.pathname;
  url.search = source.search;
  url.hash = source.hash;
  return url.href;
}
