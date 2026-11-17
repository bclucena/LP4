// Peças pequenas da tela Gestores usadas em mais de um lugar: barra de progresso, busca, ícone de filtro e sheets.
import { esc, cx } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { panel, sheetFooter } from '../../components/panel.js';
import { singleGroup, filterGroup, chip } from '../../components/filters.js';
import {
  courseOptions, userOrderOptions, contentSortOptions, certOrderOptions, certs, missionStates, filterMissions, listMembers,
} from './data.js';

/** Ícone de filtro em três linhas que diminuem (o mesmo do botão Filtro do handoff). */
export const filterLines = (size = 14, className = '') =>
  `<svg class="${cx('c-tm-filter-lines', className)}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>`;

/** Barra fina com o percentual ao lado (linhas da tabela). */
export const bar = value =>
  `<span class="c-tm-bar"><span class="c-tm-bar__track"><span class="c-tm-bar__fill" style="width:${value}%"></span></span><span class="c-tm-bar__value">${value}%</span></span>`;

/** Campo de busca: filtra na hora, sem acento nem maiúsculas, com botão para limpar. `input` é a ação de digitação. */
export const searchField = ({ value, label, input, clear, key }) =>
  `<label class="c-tm-search">${icon('search', 16, 'c-tm-search__icon')}
    <input type="search" class="c-tm-search__input" data-key="${key}" data-input="${input}" value="${esc(value)}" placeholder="${esc(label)}" aria-label="${esc(label)}" />
    ${value ? `<button type="button" class="c-tm-search__clear" aria-label="Limpar busca" data-action="${clear}">${icon('x', 16)}</button>` : ''}
  </label>`;

/** Botão "Ordenar por X" (ou "Status") que abre um sheet. */
export const sortButton = ({ label, kind, aria }) =>
  `<button type="button" class="c-tm-sort-btn" aria-haspopup="dialog" aria-label="${esc(aria)}" data-action="openSheet" data-id="${kind}">${esc(label)} ${filterLines(14)}</button>`;

/* ---------- Sheets (um só aberto por vez: state.sheet = { kind, draft }) ----------
   Os grupos de escolha única usam `pickDraft` (data-value) e os de status usam `toggleDraft`. */

/** Valor inicial de cada sheet quando se clica em "Limpar filtro". */
export const sheetDefaults = { userSort: 'name-asc', course: 'todos', contentSort: 'perf-desc', certs: 'recent', status: [] };

const sheetTitles = { userSort: 'Ordenar por', course: 'Filtros', contentSort: 'Ordenar por', certs: 'Filtros', status: 'Filtrar por status' };

/** Resultados encontrados com o rascunho atual. `counts` = { members, content }: tamanho das listas visíveis agora. */
function sheetCount(sheet, state, counts) {
  const d = sheet.draft;
  if (sheet.kind === 'userSort') return counts.members;
  if (sheet.kind === 'course') return listMembers(d, state.sort).length;
  if (sheet.kind === 'contentSort') return counts.content;
  if (sheet.kind === 'certs') return certs.length;
  return filterMissions(d).length;
}

/** Bottom sheet de ordenação ou filtro. `counts` = { members, content, hasPrazo }. */
export function teamSheet(state, counts) {
  const { kind, draft } = state.sheet;
  let body;
  if (kind === 'status') {
    body = filterGroup('Status', `<div class="c-chips">${missionStates.map(o => chip({ label: o.label, on: draft.includes(o.id), action: 'toggleDraft', data: { value: o.id } })).join('')}</div>`);
  } else {
    const groups = {
      userSort: ['Ordenar por', userOrderOptions],
      course: ['Curso', courseOptions],
      contentSort: ['Ordenar por', contentSortOptions(counts.hasPrazo)],
      certs: ['Ordenar por', certOrderOptions],
    };
    const [title, options] = groups[kind];
    body = singleGroup({ title, filter: kind, options, value: draft });
  }
  return panel({
    mode: 'sheet',
    label: sheetTitles[kind],
    body,
    footer: sheetFooter({ count: sheetCount(state.sheet, state, counts) }),
    enter: state.fresh,
  });
}
