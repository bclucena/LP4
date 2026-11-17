import { attrs } from '../core/dom.js';
import { icon } from '../core/icons.js';

/** Botão de página (36x36). `active` usa o visual de pressed; `state` força hover, pressed ou disabled (catálogo). */
export const pageButton = ({ n, active = false, state, page } = {}) =>
  `<button ${attrs({
    type: 'button',
    class: `c-page-button ${active ? 'is-active' : ''}`,
    'aria-current': active ? 'page' : undefined,
    disabled: state === 'disabled',
    'data-state': state && state !== 'default' ? state : undefined,
    'data-action': page !== undefined ? 'goPage' : undefined,
    'data-page': page,
  })}>${n}</button>`;

/**
 * Paginação com a primeira, a última e a página atual (com as vizinhas); o resto vira "…".
 * Dispara `goPage` com data-page (número). O pai guarda `page`.
 */
export function pagination({ page, pages }) {
  const items = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) items.push(p);
    else if (items[items.length - 1] !== 'gap') items.push('gap');
  }
  const arrow = (name, label, target, disabled) =>
    `<button type="button" class="c-page-button c-page-button--arrow" aria-label="${label}" ${disabled ? 'disabled' : ''} data-action="goPage" data-page="${target}">${icon(name, 16)}</button>`;
  return `<nav class="c-pagination" aria-label="Paginação">
    ${arrow('arrow-left', 'Página anterior', page - 1, page === 1)}
    ${items.map(it => (it === 'gap' ? '<span class="c-pagination__gap">…</span>' : pageButton({ n: it, active: it === page, page: it }))).join('')}
    ${arrow('arrow-right', 'Próxima página', page + 1, page === pages)}
  </nav>`;
}
