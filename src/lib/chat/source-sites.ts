import { safeLink } from './contracts.ts';

const publishers: Record<string, string> = {
  'businessday.co.za': 'Business Day', 'businesslive.co.za': 'BusinessLIVE',
  'dailymaverick.co.za': 'Daily Maverick', 'timeslive.co.za': 'TimesLIVE',
  'sowetan.co.za': 'Sowetan', 'sowetanlive.co.za': 'Sowetan',
  'news24.com': 'News24', 'mg.co.za': 'Mail & Guardian', 'moneyweb.co.za': 'Moneyweb',
  'citizen.co.za': 'The Citizen', 'iol.co.za': 'IOL', 'ewn.co.za': 'EWN',
  'sabcnews.com': 'SABC News', 'enca.com': 'eNCA', 'reuters.com': 'Reuters',
  'apnews.com': 'AP News', 'bbc.com': 'BBC', 'bbc.co.uk': 'BBC',
  'elections.org.za': 'IEC', 'gov.za': 'SA Government',
};

/** Labels identify the actual destination, never a publisher invented by the model. */
export function sourceSite(href: string) {
  const safe = safeLink(href);
  if (!safe) return null;
  const url = new URL(safe), host = url.hostname.replace(/^www\./, '');
  if (host === 'counted.co.za' || host.endsWith('.counted.co.za')) return null;
  // Send only DNS hostnames to the icon service, never credentials, paths or IPs.
  if (host.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)
    || /\.(?:localhost|local|internal|test|invalid)$/.test(host)) return null;
  const publisher = Object.entries(publishers).find(([domain]) => host === domain || host.endsWith(`.${domain}`));
  return { name: publisher?.[1] ?? host, host,
    favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32` };
}
