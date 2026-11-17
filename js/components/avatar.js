import { cx, esc } from '../core/dom.js';

const sizes = { small: 24, medium: 32, large: 92, profile: 76 };

/** Avatar. size: small (24), medium (32), large (92) ou profile (76); `px` força outro tamanho. use: initial, illustration ou image. */
export function avatar({ size = 'large', use = 'initial', src, initial = 'F', px, reaction = false, className = '' } = {}) {
  const d = px ?? sizes[size];
  const big = size === 'large' || size === 'profile';
  const inner =
    use === 'initial'
      ? esc(initial)
      : src
        ? `<img class="c-avatar__img" src="${esc(src)}" alt="" />`
        : `<svg class="c-avatar__silhouette" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8.5" r="4.5"/><path d="M3.5 22c.7-4.6 4.2-7 8.5-7s7.8 2.4 8.5 7z"/></svg>`;
  return `<span class="${cx('c-avatar', className)}" style="width:${d}px;height:${d}px"><span class="${cx('c-avatar__inner', `c-avatar__inner--${use}`, big && 'c-avatar__inner--big')}">${inner}</span>${reaction ? '<span class="c-avatar__reaction"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.4l-1.4 7a2 2 0 0 1-2 1.6H7V10l4.4-8a2.4 2.4 0 0 1 3.6 3.9z"/></svg></span>' : ''}</span>`;
}

/** Grupo de avatares com inicial: sobrepostos (padrão) ou espaçados. */
export const avatarGroup = ({ names, spaced = false }) =>
  `<span class="c-avatar-group ${spaced ? 'c-avatar-group--spaced' : ''}">${names.map(n => avatar({ size: 'small', initial: n, className: 'c-avatar--ring' })).join('')}</span>`;
