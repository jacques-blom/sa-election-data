import type { ChatArtifact } from './contracts.ts';
import { artifactMarkup, markdownMarkup } from './markup.ts';
import { renderVisual } from './visuals/render.ts';

export function append(parent: Node, ...children: Node[]) { children.forEach(child => parent.appendChild(child)); }

/** Only HTML produced by our escaping renderer enters these templates. */
export function renderMarkdown(target: HTMLElement, text: string) {
  target.innerHTML = markdownMarkup(text);
}

export function renderArtifact(artifact: ChatArtifact): HTMLElement | DocumentFragment {
  if (artifact.kind === 'research') return document.createDocumentFragment();
  if (artifact.kind === 'visual') return renderVisual(artifact);
  const template = document.createElement('template');
  template.innerHTML = artifactMarkup(artifact);
  return template.content.firstElementChild as HTMLElement;
}

/** Keep the server's chart nodes and attach their controls in place. */
export function enhanceSavedVisuals(root: HTMLElement) {
  for (const saved of root.querySelectorAll<HTMLElement>('[data-saved-visual]')) {
    try {
      const artifact = JSON.parse(saved.dataset.savedVisual!);
      if (saved.hasAttribute('data-cv-node')) {
        renderVisual(artifact, { document: saved.ownerDocument, hydrateRoot: saved });
        saved.removeAttribute('data-saved-visual');
      } else saved.replaceWith(renderVisual(artifact)); // Older cached HTML.
    } catch { /* The fully rendered server view remains readable. */ }
  }
}
