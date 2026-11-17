import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { pill } from '../components/badges.js';
import { panel, sheetFooter } from '../components/panel.js';
import { pagination } from '../components/pagination.js';
import { pillMenu, radioMenu, filterDivider, singleGroup } from '../components/filters.js';
import { datePicker, maskDate, mpill } from '../components/mobile.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import {
  kinds, kindOptions, orderOptions, tabs as tabList, defaultExtractFilters, filterEntries, groupByMonth, formatDate, parseDate,
} from '../data/extract.js';

/* Extrato (handoff A.Extrato): histórico de pontos e moedas com abas Todos/Pontos/Moedas, filtros de categoria e ordem e filtro
   por período (datas inicial e final). Desktop: cartão de filtros + lista; mobile e tablet: menu top + folhas (sheets). */

const DESKTOP = 1180; // menu lateral, filtros em pílulas e popover de período

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hasPeriod = f => !!(parseDate(f.from) || parseDate(f.to));
const activeCount = f => [f.kind !== 'todos', f.order !== 'recentes', hasPeriod(f)].filter(Boolean).length;

/** Texto do botão de período: "Período" ou as datas escolhidas. */
function periodLabel(f) {
  if (!hasPeriod(f)) return 'Período';
  return `${parseDate(f.from) ? f.from : '…'} - ${parseDate(f.to) ? f.to : '…'}`;
}

/* ---------- Linha do extrato ---------- */
const money = (n, symbol) => `${n < 0 ? '-' : '+'}${symbol === 'pts' ? `${Math.abs(n)}pts` : `$${Math.abs(n)}`}`;

/** Valor em pontos (estrela) ou moedas (cifrão): verde quando ganha, vermelho quando gasta. */
const amount = (n, kind) =>
  `<span class="${cx('c-ex-amount', n < 0 && 'is-negative')}">${icon(kind === 'pts' ? 'star' : 'dollar-sign', 16)}${money(n, kind)}</span>`;

function row(e, tab, desktop) {
  const k = kinds[e.kind];
  const showPoints = e.points !== 0 && tab !== 'moedas';
  const showCoins = e.coins !== 0 && tab !== 'pontos';
  const removed = e.removed
    ? (desktop ? pill({ label: 'Conteúdo removido pelo administrador', color: 'yellow' }) : mpill({ tone: 'warning', iconName: 'info', label: 'Conteúdo removido pelo administrador' }))
    : '';
  return `<li class="c-ex-row">
    <span class="c-ex-row__icon" aria-hidden="true">${icon(k.icon, 16)}</span>
    <div class="c-ex-row__main">
      <p class="c-ex-row__title"><b>${k.action}</b><span class="c-ex-row__sep" aria-hidden="true"> · </span><span class="c-ex-row__name">${esc(e.name)}</span></p>
      <div class="c-ex-row__meta"><time datetime="${e.date}">${formatDate(e.date, desktop)}</time>${removed}</div>
    </div>
    <div class="c-ex-row__values">${showPoints ? amount(e.points, 'pts') : ''}${showCoins ? amount(e.coins, 'coins') : ''}</div>
  </li>`;
}

const skeletonRow = () => `<li class="c-ex-row c-ex-row--skeleton"><span class="c-ex-skel c-ex-skel--icon"></span><div class="c-ex-row__main"><span class="c-ex-skel" style="width:60%"></span><span class="c-ex-skel" style="width:30%"></span></div><span class="c-ex-skel" style="width:72px"></span></li>`;

/* ---------- Filtros ---------- */
function filterPills(state) {
  const f = state.filters;
  const open = id => state.menu === id;
  return [
    pillMenu({ id: 'kind', label: kindOptions.find(o => o.id === f.kind).label, active: f.kind !== 'todos', open: open('kind'), content: radioMenu({ filter: 'kind', options: kindOptions, value: f.kind }) }),
    pillMenu({ id: 'order', label: orderOptions.find(o => o.id === f.order).label, active: f.order !== 'recentes', open: open('order'), content: radioMenu({ filter: 'order', options: orderOptions, value: f.order }) }),
    `<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaultExtractFilters()) ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Campos de data + "Limpar período" (no popover do desktop e na folha do mobile). */
const periodFields = f => `${datePicker({ title: 'Período', a: f.from, b: f.to })}
  <button type="button" class="c-ex-period__clear" data-action="clearPeriod" ${hasPeriod(f) || f.from || f.to ? '' : 'disabled'}>Limpar período</button>`;

/** Botão "Período": popover no desktop; abre uma folha no mobile e no tablet. */
function periodButton(state, desktop) {
  const f = state.filters;
  const open = state.menu === 'period';
  const button = `<button type="button" class="${cx('c-ex-period', hasPeriod(f) && 'is-active')}" aria-haspopup="${desktop ? 'true' : 'dialog'}" aria-expanded="${desktop ? open : state.sheet === 'period'}" data-action="${desktop ? 'toggleMenu' : 'openPeriod'}" data-menu="period">
    ${icon(desktop ? 'calendar' : 'filter', 16)}<span>${esc(periodLabel(f))}</span>${desktop ? icon('chevron-down', 12, cx('c-ex-period__caret', open && 'is-open')) : icon('chevron-down', 12, 'c-ex-period__caret')}
  </button>`;
  return `<span class="c-ex-period-wrap" data-popover>${button}${desktop && open ? `<div class="c-ex-period-pop">${periodFields(f)}</div>` : ''}</span>`;
}

function filtersSheet(state) {
  const d = state.draft;
  const body = [
    singleGroup({ title: 'Categoria', filter: 'kind', options: kindOptions, value: d.kind }),
    filterDivider(),
    singleGroup({ title: 'Ordenar por', filter: 'order', options: orderOptions, value: d.order }),
  ].join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterEntries(d, 'todos').length }), enter: state.fresh });
}

function periodSheet(state) {
  return panel({
    mode: 'sheet', label: 'Período', body: `<div class="c-ex-sheet">${periodFields(state.filters)}</div>`,
    footer: sheetFooter({ count: filterEntries(state.filters, 'todos').length, clearAction: 'clearPeriod', applyAction: 'closePanel' }), enter: state.fresh,
  });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const f = state.filters;
  const list = filterEntries(f, state.tab);
  const tabs = tabList.map(t => ({ ...t, count: filterEntries(f, t.id).length }));
  const dirty = !same(f, defaultExtractFilters());

  let content;
  if (state.loading) {
    content = `<ul class="c-ex-list">${range(6, skeletonRow)}</ul>`;
  } else if (list.length === 0) {
    content = `<div class="c-ex-empty"><b>Nenhum lançamento encontrado</b><span>Tente mudar ou limpar os filtros.</span>
      ${dirty ? '<button type="button" data-action="clearFilters">Limpar filtros</button>' : ''}</div>`;
  } else {
    content = groupByMonth(list).map(g => `<section class="c-ex-group">
      <h2 class="c-ex-month"><span>${g.label}</span><span class="c-ex-month__rule" aria-hidden="true"></span></h2>
      <ul class="c-ex-list">${g.items.map(e => row(e, state.tab, desktop)).join('')}</ul>
    </section>`).join('');
  }

  return `
    ${menuTop({ title: 'Extrato', tabs, tab: state.tab, filterCount: activeCount(f) })}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    <div class="c-ex-card" data-reveal="content">
      ${periodButton(state, desktop)}
      ${content}
      ${desktop && !state.loading && list.length > 0 ? `<div class="c-ex-footer"><span>Mostrando <b>${list.length}</b> lançamentos</span>${pagination({ page: state.page, pages: 3 })}</div>` : ''}
    </div>
    ${state.sheet === 'filters' ? filtersSheet(state) : ''}
    ${state.sheet === 'period' ? periodSheet(state) : ''}`;
}

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  goPage: (ctx, el) => ctx.set({ page: Number(el.dataset.page) }),
  clearFilters: ctx => ctx.set({ filters: defaultExtractFilters() }),

  // Folhas do mobile (filtros e período)
  openFilters: ctx => ctx.set({ sheet: 'filters', draft: structuredClone(ctx.state.filters), fresh: true }),
  openPeriod: ctx => ctx.set({ sheet: 'period', fresh: true }),
  closePanel: ctx => ctx.set({ sheet: null }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: { ...defaultExtractFilters(), from: ctx.state.filters.from, to: ctx.state.filters.to } }),
  applyDraft: ctx => ctx.set({ filters: { ...ctx.state.draft, from: ctx.state.filters.from, to: ctx.state.filters.to }, sheet: null }),

  // Dropdowns do desktop (categoria, ordem e período)
  toggleMenu: (ctx, el) => ctx.set({ menu: ctx.state.menu === el.dataset.menu ? null : el.dataset.menu }),
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),

  // Período: as datas filtram a lista conforme são digitadas
  mDateA: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, from: maskDate(el.value) } }),
  mDateB: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, to: maskDate(el.value) } }),
  clearPeriod: ctx => ctx.set({ filters: { ...ctx.state.filters, from: '', to: '' } }),
};

export function mountExtract(root, { loading = true } = {}) {
  return createView(root, {
    state: { loading, tab: 'todos', page: 1, filters: defaultExtractFilters(), draft: null, menu: null, sheet: null, fresh: false },
    view,
    actions,
    breakpoints: [768, 1179, 1180],
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => ctx.set({ menu: null }), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: null }), () => ctx.state.sheet !== null);
    },
  });
}
