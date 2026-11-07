import { parseHTML } from 'linkedom/worker';
import { artifactMarkup as baseArtifactMarkup, turnMarkup as baseTurnMarkup, escapeHtml } from './markup.ts';
import type { ChatArtifact, SavedThreadTurn } from './contracts.ts';
import type { VisualArtifact } from './visuals/model.ts';
import { renderVisual } from './visuals/render.ts';
export { markdownMarkup } from './markup.ts';

const voidTags = new Set(['input', 'br', 'hr', 'img', 'wbr']);
/** Escape attribute ampersands as well as quotes, including literal entities in data. */
function serialize(node: Node): string {
  if (node.nodeType === 3) return escapeHtml(node.textContent ?? '');
  if (node.nodeType !== 1) return '';
  const element = node as HTMLElement | SVGElement;
  const tag = element.localName;
  const attributes = [...element.attributes].map(a => ` ${a.name}="${escapeHtml(a.value)}"`).join('');
  return `<${tag}${attributes}>${voidTags.has(tag) ? '' : [...element.childNodes].map(serialize).join('') + `</${tag}>`}`;
}

export function visualMarkup(artifact: VisualArtifact): string {
  // A document per render; never install DOM globals in the shared Worker.
  const { document } = parseHTML('<!doctype html><html><body></body></html>');
  const visual = renderVisual(artifact, { document, interactive: false, serialize: true });
  visual.setAttribute('data-saved-visual', JSON.stringify(artifact));
  return serialize(visual);
}
export function artifactMarkup(artifact: ChatArtifact) { return baseArtifactMarkup(artifact, visualMarkup); }
export function turnMarkup(turn: SavedThreadTurn) { return baseTurnMarkup(turn, artifactMarkup); }
