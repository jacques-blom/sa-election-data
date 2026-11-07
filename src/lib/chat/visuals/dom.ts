import { safeLink } from '../contracts.ts';
import type { VisualMeta } from './model.ts';
export function append(parent: Node, ...children: Node[]) { children.forEach(child => parent.appendChild(child)); }
export const number = (n: number) => new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 1 }).format(n);
export const value = (n: number | string | null | undefined, unit: string) => n == null ? 'Unavailable' : typeof n === 'string' ? n : `${number(n)}${unit === 'percent' ? '%' : unit === 'pp' ? ' pp' : ''}`;
export const paint = (color?: string) => color && /^#[a-f0-9]{6}$/i.test(color) ? color : '#557c71';
export function badge(meta: VisualMeta) {
  return meta.status === 'hypothetical' ? 'Hypothetical' : meta.status === 'unavailable' ? 'Unavailable'
    : `${meta.status === 'estimated' ? 'Estimated' : 'Reported'}${meta.provisional ? ' · provisional' : ''}`;
}
export type VisualDOM = ReturnType<typeof createDOM>;
/** One DOM builder for Worker SSR, streamed charts and in-place hydration. */
export function createDOM(document: Document, options: { interactive?: boolean; serialize?: boolean; hydrateRoot?: HTMLElement } = {}) {
  const interactive = options.interactive !== false;
  const cached = new Map<string, Element>();
  if (options.hydrateRoot) for (const node of [options.hydrateRoot, ...options.hydrateRoot.querySelectorAll('[data-cv-node]')]) {
    const id = node.getAttribute('data-cv-node'); if (id !== null) cached.set(id, node);
  }
  let index = 0, building = true;
  function create(tag: string, namespace?: string) {
    const id = String(index++), existing = building ? cached.get(id) : undefined;
    if (building && options.hydrateRoot && (!existing || existing.localName !== tag)) throw new Error('Visual HTML does not match its saved specification.');
    const node = existing ?? (namespace ? document.createElementNS(namespace, tag) : document.createElement(tag));
    if (building && options.serialize) node.setAttribute('data-cv-node', id);
    if (['input', 'select'].includes(tag)) (node as HTMLInputElement).disabled = !interactive;
    return node;
  }
  function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string) {
    const node = create(tag) as HTMLElementTagNameMap[K]; if (text !== undefined) node.textContent = text; if (className) node.className = className; return node;
  }
  function button(text: string, fn: () => void, className = 'cv-action') {
    const node = el('button', text, className); node.type = 'button'; if (interactive) { node.removeAttribute('aria-disabled'); node.addEventListener('click', fn); } else node.setAttribute('aria-disabled', 'true'); return node;
  }

  function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
    const node = create(tag, 'http://www.w3.org/2000/svg') as SVGElementTagNameMap[K];
    Object.entries(attrs).forEach(([key, val]) => node.setAttribute(key, String(val))); return node;
  }
  function heading(title: string, meta: VisualMeta, size: string, component: string) {
    const card = el('section', undefined, 'cv-chart'); card.dataset.size = size; card.dataset.component = component;
    const header = el('header'); append(header, el('h3', title), el('p', `${meta.scope} · ${meta.label}`, 'cv-scope'));
    append(header, el('p', `${component === 'GovernmentTimeline' && meta.status !== 'hypothetical' ? 'Dated records' : badge(meta)}${meta.notes.some(n => /delay|stale|refresh failed/i.test(n)) ? ' · Updates delayed' : ''}`, 'cv-badge'));
    append(card, header); return card;
  }
  function areaLink(label: string, url?: string) {
    if (!url) return el('span', label);
    const href = url?.startsWith('/') && !url.startsWith('//') ? url : safeLink(url ?? '');
    if (!href) return el('span', label);
    const a = el('a', label); a.href = href; return a;
  }
  function select(label: string, choices: { id: string; label: string }[], current: string, onChange: (id: string) => void) {
    const wrap = el('label', undefined, 'cv-select'), node = el('select');
    append(wrap, el('span', label), node);
    choices.forEach(c => { const option = el('option', c.label); option.value = c.id; option.selected = c.id === current; append(node, option); });
    if (interactive) node.addEventListener('change', () => onChange(node.value)); return wrap;
  }

  return { document, interactive, el, svg, button, heading, areaLink, select, finish() {
    building = false;
    for (const node of cached.values()) node.removeAttribute('data-cv-node');
    cached.clear();
  } };
}
