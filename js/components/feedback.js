import { attrs, cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';

/** Ícone padrão por tom. O erro usa x-circle (alert-triangle é aviso). Tempo esgotado e afins passam o próprio ícone (ex.: clock). */
const ICON = { success: 'check-circle', error: 'x-circle' };

/**
 * Feedback de resposta (acerto e erro) das mecânicas.
 * tone: 'success' ou 'error' (cores fixas de status, não derivam da primária).
 * variant: 'banner' (faixa do rodapé, sem moldura: quem posiciona pinta o fundo) ou 'inline' (caixa com borda dentro do card).
 * Ícone Feather de 24 numa caixa de 40 (radius xl), título subtitle 16/24 bold na cor do tom e texto body 14/20.
 * `title` e `text` são texto (escapados aqui). `className` e `attrs` vão no elemento raiz.
 */
export const feedback = ({ tone = 'success', title, text, iconName, variant = 'inline', className, attrs: extra = {} } = {}) =>
  `<div ${attrs({ class: cx('c-feedback', `c-feedback--${tone}`, `c-feedback--${variant}`, className), role: 'status', ...extra })}>
    <span class="c-feedback__icon" aria-hidden="true">${icon(iconName ?? ICON[tone] ?? 'info', 24)}</span>
    <span class="c-feedback__body">
      ${title ? `<span class="c-feedback__title">${esc(title)}</span>` : ''}
      ${text ? `<span class="c-feedback__text">${esc(text)}</span>` : ''}
    </span>
  </div>`;
