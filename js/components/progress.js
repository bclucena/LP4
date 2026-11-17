import { cx } from '../core/dom.js';

/** Donut de 14 com o progresso (cards compactos do mobile). */
export function progressDonut(value = 0) {
  const r = 5.5;
  const c = 2 * Math.PI * r;
  return `<svg class="c-donut" width="14" height="14" viewBox="0 0 14 14" role="img" aria-label="${value}%">
    <circle class="c-donut__track" cx="7" cy="7" r="${r}" fill="none" stroke-width="1.5"/>
    <circle class="c-donut__fill" cx="7" cy="7" r="${r}" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - value / 100)}"/>
  </svg>`;
}

/** Barra de progresso com o rótulo e o percentual acima ("Progresso 60%" ou "Concluído! 100%"). */
export function progressLabeled({ value = 0, done = false }) {
  const pct = done ? 100 : value;
  return `<div class="c-progress">
    <div class="c-progress__head"><span>${done ? 'Concluído!' : 'Progresso'}</span><span>${pct}%</span></div>
    <div class="c-progress__track"><div class="${cx('c-progress__fill', done && 'is-done')}" style="width:${pct}%"></div></div>
  </div>`;
}

/** Linha de informação do mobile: ícone de 8 e textos empilhados em 10px. */
export const infoLine = (iconHtml, ...lines) =>
  `<div class="c-info-line">${iconHtml ? `<span class="c-info-line__icon">${iconHtml}</span>` : ''}<span class="c-info-line__text">${lines.map(l => `<span>${l}</span>`).join('')}</span></div>`;
