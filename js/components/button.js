import { attrs, cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';

/**
 * Botão do design system.
 * variant: 'primary' (preenchido), 'stroked' (contorno) ou 'basic' (sem contorno). No protótipo antigo: filled, outlined e ghost.
 * size: 'md' ou 'mobile'. `action` liga o clique ao handler da tela (data-action); `data` vira data-* (ex.: { id: 3 }).
 */
export function button({ label, variant = 'primary', size = 'md', iconStart, iconEnd, disabled = false, state, action, data = {}, block = false, ariaLabel, className = '' }) {
  const dataAttrs = Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]));
  return `<button ${attrs({
    type: 'button',
    class: cx('c-button', `c-button--${variant}`, size === 'mobile' && 'c-button--mobile', block && 'c-button--block', className),
    disabled: disabled || state === 'disabled',
    'data-state': state && state !== 'default' ? state : undefined,
    'data-action': action,
    'aria-label': ariaLabel,
    ...dataAttrs,
  })}>${iconStart ? icon(iconStart, 16) : ''}<span>${esc(label)}</span>${iconEnd ? icon(iconEnd, 16) : ''}</button>`;
}

/** Botão só com ícone (barra do topo, fechar, voltar...). */
export function iconButton({ name, label, size = 18, action, data = {}, small = false, className = '' }) {
  const dataAttrs = Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]));
  return `<button ${attrs({
    type: 'button',
    class: cx('c-icon-button', small && 'c-icon-button--small', className),
    'aria-label': label,
    'data-action': action,
    ...dataAttrs,
  })}>${icon(name, size)}</button>`;
}

/** Estado forçado (catálogo): 'hover', 'pressed' ou 'disabled'; sem ele, valem os estados reais do navegador. */
const stateAttrs = state => ({ 'data-state': state && state !== 'default' ? state : undefined, disabled: state === 'disabled' });

/** Botão de filtro com contador; o contador muda de cor em pressed e disabled. */
export const buttonBadge = ({ label = 'Button', count, state } = {}) =>
  `<button ${attrs({ type: 'button', class: 'c-button-badge', ...stateAttrs(state) })}><span>${esc(label)}</span>${count !== undefined ? `<span class="c-button-badge__count">${count}</span>` : ''}</button>`;

/** Botão de ícone. style: large, small, filled ou ghost; `outlined` vale para large e small. */
export const buttonIcon = ({ style = 'large', outlined = true, state, name = 'chevron-left', label = 'Voltar' } = {}) =>
  `<button ${attrs({ type: 'button', class: cx('c-button-icon', `c-button-icon--${style}`, (style === 'large' || style === 'small') && outlined && 'c-button-icon--outlined'), 'aria-label': label, ...stateAttrs(state) })}>${icon(name, 16)}</button>`;
