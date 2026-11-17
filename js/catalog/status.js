import { areas as base, statusInfo, statusOrder } from '../data/product.js';
import { esc } from '../core/dom.js';

/* Estado de design de cada área, escolhido no próprio catálogo. Fica no localStorage do navegador e sobrepõe os valores de
   js/data/product.js (que são o ponto de partida). Vale só para este navegador: para virar padrão do time, copie para product.js. */

const KEY = 'lp-area-status';

const readSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {}; // valor antigo inválido: recomeça
  }
};

export function setAreaStatus(id, status) {
  const saved = readSaved();
  saved[id] = { status, updated: new Date().toISOString().slice(0, 10) };
  localStorage.setItem(KEY, JSON.stringify(saved));
}

/** Áreas com os estados escolhidos no catálogo aplicados por cima dos dados originais. */
export const getAreas = () => {
  const saved = readSaved();
  return base.map(a => (saved[a.id] ? { ...a, ...saved[a.id] } : a));
};

export const formatDate = iso => iso.split('-').reverse().slice(0, 2).join('/');

export function statusBadge(status, updated, small = false) {
  const s = statusInfo[status];
  return `<span class="status status--${s.tone}${small ? ' status--small' : ''}" title="${esc(s.hint)}">${esc(s.label)}${updated ? ` <small>· ${formatDate(updated)}</small>` : ''}</span>`;
}

export const countBy = list => Object.fromEntries(statusOrder.map(k => [k, list.filter(a => a.status === k).length]));

/** Barra curta em três cores com o resumo de estados de uma lista de áreas. */
export function statusSummary(list) {
  const c = countBy(list);
  const title = statusOrder.map(k => `${statusInfo[k].label}: ${c[k]}`).join(' · ');
  return `<div class="summary" title="${esc(title)}">
    <span class="summary__bar">${statusOrder.map(k => (c[k] ? `<span class="seg--${k}" style="width:${(c[k] / list.length) * 100}%"></span>` : '')).join('')}</span>
    <span><b>${c.finalizada}</b> de ${list.length} prontas para dev</span>
  </div>`;
}
