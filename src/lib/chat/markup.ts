import { safeLink, type ChatArtifact, type SavedThreadTurn } from './contracts.ts';
import { sourceSite } from './source-sites.ts';
import type { VisualArtifact } from './visuals/model.ts';

/** Escape all model/user strings, including attribute values. No raw model HTML. */
export const escapeHtml = (text: string) => text.replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const tag = (name: string, text: string, className?: string) =>
  `<${name}${className ? ` class="${className}"` : ''}>${escapeHtml(text)}</${name}>`;
function link(title: string, href: string, presentation: 'plain' | 'citation' = 'plain') {
  const safe = safeLink(href);
  const site = safe && presentation !== 'plain' ? sourceSite(safe) : null;
  if (site) {
    const icon = `<img class="chat-source-icon" src="${escapeHtml(site.favicon)}" width="16" height="16" alt="" loading="lazy" referrerpolicy="no-referrer">`;
    return `<a class="chat-citation" href="${escapeHtml(safe!)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(title)}">${icon}<span>${escapeHtml(site.name)}</span></a>`;
  }
  return `<a${safe ? ` href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer"` : ''}>${escapeHtml(title)}</a>`;
}
function inline(text: string) {
  const tokens = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\*\*([^*\n]+)\*\*|`([^`\n]+)`/g;
  let index = 0, result = '';
  for (const match of text.matchAll(tokens)) {
    result += escapeHtml(text.slice(index, match.index));
    result += match[1] ? link(match[1], match[2]!, 'citation') : match[3] ? tag('strong', match[3]) : tag('code', match[4]!);
    index = match.index! + match[0].length;
  }
  return result + escapeHtml(text.slice(index));
}

/** Shared by the initial server HTML and subsequent browser updates. */
export function markdownMarkup(text: string): string {
  return text.split(/\n\s*\n/).filter(block => block.trim()).map(block => {
    const lines = block.split('\n');
    if (lines.every(line => /^\s*(?:[-*]|\d+\.)\s/.test(line))) {
      const name = /^\s*\d/.test(lines[0]!) ? 'ol' : 'ul';
      return `<${name}>${lines.map(line => `<li>${inline(line.replace(/^\s*(?:[-*]|\d+\.)\s+/, ''))}</li>`).join('')}</${name}>`;
    }
    const name = /^#{1,3} /.test(block) ? 'h3' : 'p';
    return `<${name}>${inline(block.replace(/^#{1,3} /, ''))}</${name}>`;
  }).join('');
}

export function artifactMarkup(artifact: ChatArtifact, visualMarkup?: (artifact: VisualArtifact) => string): string {
  // Research remains saved evidence, but its intermediate summary is not a UI card.
  if (artifact.kind === 'research') return '';
  let content = '';
  if (artifact.kind === 'visual') {
    if (!visualMarkup) throw new Error('Visual HTML requires the server renderer; use markup.server.ts.');
    return visualMarkup(artifact);
  } else if (artifact.kind === 'image') {
    const url = safeLink(artifact.url), dataUrl = safeLink(artifact.dataUrl);
    if (url && /^https:\/\/counted\.co\.za\/images\/results\/[a-f0-9]{64}\.png$/.test(url)) {
      content = `<img src="${new URL(url).pathname}" alt="${escapeHtml(artifact.alt)}" loading="lazy"><div class="chat-artifact-links">${link('Open chart ↗', url)}${dataUrl ? link('Source data ↗', dataUrl) : ''}</div>`;
    }
  } else if (artifact.kind === 'analysis') {
    content = `<details><summary>View calculation &amp; data</summary>${tag('pre', artifact.code)}${tag('pre', JSON.stringify(artifact.result, null, 2) ?? '')}</details>`;
  } else if (artifact.kind === 'chart') {
    const { chart } = artifact;
    const min = Math.min(0, ...chart.rows.map(row => row.value)), max = Math.max(0, ...chart.rows.map(row => row.value));
    const span = max - min || 1, zero = -min / span * 100;
    const label = `${chart.title}. ${chart.rows.map(row => `${row.label}: ${row.value} ${chart.unit}`).join('. ')}`;
    const rows = chart.rows.map(row => {
      const width = Math.abs(row.value) / span * 100, left = row.value < 0 ? (row.value - min) / span * 100 : zero;
      const color = row.color && /^#[a-f\d]{6}$/i.test(row.color) ? `;background-color:${row.color}` : '';
      const value = `${new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 2 }).format(row.value)}${chart.unit === 'percent' ? '%' : chart.unit === 'percentage points' ? ' pp' : ''}`;
      return `<div class="chat-chart-row">${tag('span', row.label)}<div class="chat-chart-track" style="--zero:${zero}%"><span style="width:${width}%;left:${left}%${color}"></span></div>${tag('strong', value)}</div>`;
    }).join('');
    content = tag('p', 'FROM THE DATA', 'eyebrow') + tag('h3', chart.title) + tag('p', chart.description, 'chat-chart-description') +
      `<div class="chat-chart-rows" role="img" aria-label="${escapeHtml(label)}">${rows}</div>` +
      tag('p', chart.unit === 'percent' ? 'Vote share (%)' : chart.unit, 'chat-chart-unit') + tag('p', chart.note, 'chat-chart-note') +
      `<div class="chat-artifact-links">${artifact.sources.map(source => link(source.title, source.url)).join('')}</div>`;
  }
  return `<section class="chat-artifact chat-artifact-${escapeHtml(artifact.kind)}">${content}</section>`;
}

export function turnMarkup(turn: SavedThreadTurn, renderArtifact: (artifact: ChatArtifact) => string = artifactMarkup): string {
  // Only an unfinished answer needs its original Markdown to append future text.
  const continuation = turn.status === 'running' ? ` data-answer="${escapeHtml(turn.answer)}"` : '';
  return `<article class="chat-message chat-message-user"><p class="chat-message-label">You</p><div class="chat-message-text">${escapeHtml(turn.question)}</div></article>` +
    `<article class="chat-message chat-message-assistant" data-turn-id="${escapeHtml(turn.id)}"${continuation}><p class="chat-message-label">Counted</p>` +
    `<div class="chat-message-text">${markdownMarkup(turn.answer)}</div><div data-artifacts>${turn.artifacts.map(artifact => renderArtifact(artifact)).join('')}</div>` +
    (turn.status === 'error' ? tag('p', turn.error ?? 'This answer was interrupted.', 'chat-error') : '') + '</article>';
}
