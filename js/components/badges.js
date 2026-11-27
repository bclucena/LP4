import { attrs, cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';

/**
 * Tag (rótulo de categoria). solid: fundo claro com borda; solid=false: escura (sobre imagem); outlined: contorno forte (ex.: "+3").
 * size: 'md' ou 'mobile'. `iconName` opcional (Feather; 16, ou 12 na mobile).
 */
export const tag = ({ label, solid = true, outlined = false, size = 'md', iconName } = {}) =>
  `<span class="${cx('c-tag', size === 'mobile' && 'c-tag--mobile', !solid && 'c-tag--dark', solid && outlined && 'c-tag--outlined')}">${iconName ? icon(iconName, size === 'mobile' ? 12 : 16) : ''}${esc(label)}</span>`;

/** Pill (selo). color: system, blue, red, green, yellow, grey, white, disabled. `iconName` opcional (Feather) ou `iconHtml`
    (outro ícone já montado, ex.: lpIcon('bulb', 16)); `iconOnly` mostra só o ícone.
    `html` troca o rótulo por marcação já montada (quem chama escapa os dados), para conteúdo que muda sem refazer a tela
    (ex.: um número com data-*). `className` e `attrs` (title, aria-*, data-*) vão no elemento raiz. */
export const pill = ({ label, html, color = 'system', iconName, iconHtml, iconOnly = false, outline = false, className, attrs: extra = {} } = {}) => {
  const ic = iconHtml ?? (iconName ? icon(iconName, 16) : '');
  return `<span ${attrs({ class: cx('c-pill', `c-pill--${color}`, iconOnly && 'c-pill--icon-only', !ic && 'c-pill--text-only', outline && 'c-pill--outline', className), ...extra })}>${ic}${iconOnly ? '' : html ?? esc(label)}</span>`;
};

/** Selo pequeno do mobile (só ícone de 12, círculo de 20). tone: info, warning, error. `iconHtml` troca o ícone Feather por
    outro já montado (ex.: lpIcon('bulb', 12)). */
export const mobilePill = ({ tone, iconName, iconHtml }) => `<span class="c-mobile-pill c-mobile-pill--${tone}">${iconHtml ?? icon(iconName, 12)}</span>`;
