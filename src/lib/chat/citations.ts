import { safeLink, type WebResearch } from './contracts.ts';

/** Use annotation URLs, never model-generated citation marker IDs, for links. */
export function researchMarkdown(research: WebResearch): string {
  let text = research.text;
  const numbers = new Map<string, number>();
  const insertions = new Map<number, string[]>();
  for (const citation of research.citations) {
    const url = safeLink(citation.url);
    if (!url || !Number.isInteger(citation.end) || citation.end < 0 || citation.end > text.length) continue;
    if (!numbers.has(url)) numbers.set(url, numbers.size + 1);
    // Native search often already includes Markdown links at the annotated span.
    if (text.slice(citation.start, citation.end).includes(`](${url})`)) continue;
    const href = url.replaceAll('(', '%28').replaceAll(')', '%29');
    const links = insertions.get(citation.end) ?? [];
    const label = `[${numbers.get(url)}](${href})`;
    if (!links.includes(label)) links.push(label);
    insertions.set(citation.end, links);
  }
  for (const [offset, links] of [...insertions].sort(([a], [b]) => b - a)) {
    text = text.slice(0, offset) + ' ' + links.join(' ') + text.slice(offset);
  }
  return text.replace(/cite[^]*/g, '');
}
