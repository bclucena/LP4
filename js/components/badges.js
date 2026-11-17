import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';

/**
 * Tag (rótulo de categoria). solid: fundo claro com borda; solid=false: escura (sobre imagem); outlined: contorno forte (ex.: "+3").
 * size: 'md' ou 'mobile'. `iconName` opcional (Feather).
 */
export const tag = ({ label, solid = true, outlined = false, size = 'md', iconName } = {}) =>
  `<span class="${cx('c-tag', size === 'mobile' && 'c-tag--mobile', !solid && 'c-tag--dark', solid && outlined && 'c-tag--outlined')}">${iconName ? icon(iconName, 16) : ''}${esc(label)}</span>`;

/** Pill (selo). color: system, blue, red, green, yellow, grey, white, disabled. `iconName` opcional (Feather) ou `iconHtml`
    (outro ícone já montado, ex.: lpIcon('bulb', 16)); `iconOnly` mostra só o ícone. */
export const pill = ({ label, color = 'system', iconName, iconHtml, iconOnly = false, outline = false } = {}) => {
  const ic = iconHtml ?? (iconName ? icon(iconName, 16) : '');
  return `<span class="${cx('c-pill', `c-pill--${color}`, iconOnly && 'c-pill--icon-only', !ic && 'c-pill--text-only', outline && 'c-pill--outline')}">${ic}${iconOnly ? '' : esc(label)}</span>`;
};

/** Selo pequeno do mobile (só ícone, 14 de altura). tone: info, warning, error. */
export const mobilePill = ({ tone, iconName }) => `<span class="c-mobile-pill c-mobile-pill--${tone}">${icon(iconName, 8)}</span>`;
