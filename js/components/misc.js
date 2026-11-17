import { attrs, cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';

/* Chip de categoria, link e tooltip. `state` ('hover', 'pressed', 'disabled') força um estado visual (catálogo);
   sem ele valem os estados reais do navegador. */

const stateAttrs = state => ({ 'data-state': state && state !== 'default' ? state : undefined });

/** Chip de categoria (24 de altura, radius lg). Dispara `action` (data-action) com data-id quando clicado. */
export const categoryChip = ({ label = 'Categorias', state, action, id } = {}) =>
  `<button ${attrs({ type: 'button', class: 'c-category-chip', disabled: state === 'disabled', 'data-action': action, 'data-id': id, ...stateAttrs(state) })}>${esc(label)}</button>`;

/** Link de texto com seta. font: large (14/20 extrabold) ou small (12/16 bold). */
export const link = ({ label = 'Ver extrato', font = 'large', state, iconLeft = false, iconRight = true, href = '#' } = {}) =>
  `<a ${attrs({ class: cx('c-text-link', font === 'small' && 'c-text-link--small'), href: state === 'disabled' ? undefined : href, 'aria-disabled': state === 'disabled' || undefined, ...stateAttrs(state) })}>${iconLeft ? icon('arrow-left', 18) : ''}${esc(label)}${iconRight ? icon('arrow-right', 18) : ''}</a>`;

/** Tooltip. placement: top, bottom, left ou right (posição da seta). */
export const tooltip = ({ placement = 'top', title = 'Título', text = 'Lorem ipsum' } = {}) =>
  `<div class="c-tooltip"><span class="c-tooltip__title">${esc(title)}</span><span>${esc(text)}</span><span class="c-tooltip__beak c-tooltip__beak--${placement}"></span></div>`;
