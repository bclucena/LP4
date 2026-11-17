import { cx, esc } from '../core/dom.js';

/** Donut com o progresso. Padrão 14 (cards compactos do mobile); `size` escala o desenho (o traço acompanha).
    O preenchimento usa pathLength 100, então stroke-dashoffset = 100 - valor. `ringId` vira data-ring no preenchimento, para a tela
    atualizar o valor sem refazer a marcação. Em 0% o preenchimento some (a ponta arredondada deixaria um ponto). */
export function progressDonut(value = 0, { size = 14, ringId } = {}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return `<svg class="c-donut" width="${size}" height="${size}" viewBox="0 0 14 14" role="img" aria-label="${v}%">
    <circle class="c-donut__track" cx="7" cy="7" r="5.5" fill="none" stroke-width="1.5"/>
    <circle class="${cx('c-donut__fill', v <= 0 && 'is-empty')}" cx="7" cy="7" r="5.5" fill="none" stroke-width="1.5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${100 - v}"${ringId != null ? ` data-ring="${esc(ringId)}"` : ''}/>
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

/** Só a barra (sem rótulo), com papel de progressbar. `label` é o nome acessível; `valueText` o texto lido (ex.: "3 de 12"). */
export function progressBar({ value = 0, label, valueText, className } = {}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return `<div class="${cx('c-progress__track', className)}" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"${valueText ? ` aria-valuetext="${esc(valueText)}" title="${esc(valueText)}"` : ''}><div class="${cx('c-progress__fill', pct >= 100 && 'is-done')}" style="width:${pct}%"></div></div>`;
}

/** Linha de informação do mobile: ícone de 8 e textos empilhados em 10px. */
export const infoLine = (iconHtml, ...lines) =>
  `<div class="c-info-line">${iconHtml ? `<span class="c-info-line__icon">${iconHtml}</span>` : ''}<span class="c-info-line__text">${lines.map(l => `<span>${l}</span>`).join('')}</span></div>`;
