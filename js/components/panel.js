import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';

/**
 * Painel sobre um fundo escuro: bottom sheet (mobile e tablet) ou navdrawer de 400 à direita (desktop).
 * - mode: 'sheet' ou 'drawer'. `closeAction` é o handler da tela chamado ao clicar no fundo e no X (o Esc é da tela).
 * - title: HTML do cabeçalho do drawer (no sheet o lugar é da alça, a menos que `header` seja informado).
 * - body, footer: HTML. `enter` anima a entrada; passe `state.fresh` para o painel não animar de novo a cada re-render.
 * - className/style: ajustes do painel (ex.: altura do sheet de filtros).
 * - bare (só drawer): sem a moldura do navdrawer — os cards do body flutuam soltos à direita e o X fica num botão quadrado
 *   à esquerda deles. Mantém o fundo escuro, o Esc e as animações de entrada e saída.
 */
export function panel({ mode = 'sheet', label, title = '', body, footer = '', header, enter = false, closeAction = 'closePanel', className = '', style = '', bare = false }) {
  const isDrawer = mode === 'drawer';
  const top = isDrawer && bare
    ? `<button type="button" class="c-panel__float-close" data-action="${closeAction}" aria-label="Fechar">${icon('x', 16)}</button>`
    : isDrawer
    ? `<header class="c-panel__header"><div class="c-panel__title">${title}</div><button type="button" class="c-panel__close" data-action="${closeAction}" aria-label="Fechar">${icon('x', 20)}</button></header>`
    : (header ?? '<div class="c-panel__handle" aria-hidden="true"></div>');
  return `<div class="c-panel" role="dialog" aria-modal="true" aria-label="${esc(label)}">
    <div class="c-panel__scrim" data-action="${closeAction}"></div>
    <div class="${cx('c-panel__box', isDrawer ? 'c-panel__box--drawer' : 'c-panel__box--sheet', bare && isDrawer && 'c-panel__box--bare', enter && 'is-entering', className)}" style="${style}">
      ${top}
      <div class="c-panel__body">${body}</div>
      ${footer}
    </div>
  </div>`;
}

/**
 * Fecha o painel com a animação de saída (o inverso da entrada: o drawer volta para a direita, o sheet desce e o fundo some) e
 * só então chama `done` (que tira o painel do estado). Sem painel na tela ou com movimento reduzido, chama na hora.
 */
export function leavePanel(root, done) {
  const el = (root ?? document).querySelector('.c-panel');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el || reduced || el.classList.contains('is-leaving')) { if (!el || reduced) done(); return; }
  el.classList.add('is-leaving');
  setTimeout(done, 200);
}

/** Rodapé dos sheets de filtro: contagem de resultados, "Limpar filtro" e "Aplicar". */
export const sheetFooter = ({ count, clearAction = 'clearDraft', applyAction = 'applyDraft' }) =>
  `<div class="c-sheet-footer">
    <span class="c-sheet-footer__count"><b>${count}</b><span>resultados encontrados</span></span>
    <button type="button" class="c-sheet-footer__clear" data-action="${clearAction}">Limpar filtro</button>
    <button type="button" class="c-sheet-footer__apply" data-action="${applyAction}">Aplicar</button>
  </div>`;
