import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { pill } from '../components/badges.js';
import { panel, leavePanel, sheetFooter } from '../components/panel.js';
import { pillMenu, radioMenu, filterDivider, singleGroup } from '../components/filters.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import {
  achievements, kindLabel, progressOptions, orderOptions, defaultAchievementFilters, filterAchievements,
} from '../data/achievements.js';

/* Conquistas (handoff 5.Conquistas, Layout B): conquistas de mérito e épicas, com progresso e recompensas.
   O detalhe abre em drawer lateral a partir de 1180 e em bottom sheet abaixo disso. */

const DESKTOP = 1180;

const activeCount = f => Number(f.progress !== 'todos') + Number(f.order !== 'recentes');
const labelOf = (options, id) => options.find(o => o.id === id).label;

/* ---------- Selo e card ---------- */
/** Selo hexagonal; fica apagado enquanto a conquista não foi concluída. */
const badge = (done, size) =>
  `<span class="${cx('c-ac-badge', done && 'is-done')}" aria-hidden="true" style="width:${size}px;height:${size}px;font-size:${size / 7}px"><span class="c-ac-badge__text"><span>★★★</span><span>OFFICIAL</span></span></span>`;

function card(a, compact) {
  const done = a.progress >= 100;
  return `<button type="button" class="c-ac-card" aria-haspopup="dialog" data-action="openItem" data-id="${a.id}">
    <span class="c-ac-card__top">
      ${a.novo ? pill({ label: 'Novo', color: 'blue', iconName: 'award' }) : '<span></span>'}
      <span class="c-ac-card__kind">${icon('award', 14)}${kindLabel[a.kind]}</span>
    </span>
    ${badge(done, compact ? 112 : 190)}
    <b class="c-ac-card__title">${esc(a.title)}</b>
    ${done
      ? '<span class="c-ac-card__done">Concluído!</span>'
      : `<span class="c-ac-card__progress">
          <span class="c-ac-card__progress-head"><span>Progresso</span><span>${a.progress}%</span></span>
          <span class="c-ac-card__track"><span style="width:${a.progress}%"></span></span>
        </span>`}
  </button>`;
}

/* ---------- Detalhe ---------- */
function detailBody(a, drawer) {
  const done = a.progress >= 100;
  return `<div class="c-ac-detail">
    ${drawer ? '' : `<span class="c-ac-detail__kind">${icon('award', 14)}${kindLabel[a.kind]}</span>`}
    <div class="c-ac-detail__badge">${badge(done, drawer ? 200 : 140)}</div>
    <div class="c-ac-detail__text"><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p></div>
    <div class="c-ac-detail__progress">
      <div class="c-ac-detail__progress-head"><span>${done ? 'Concluído!' : 'Progresso'}</span><span>${a.progress}%</span></div>
      <div class="c-ac-detail__track"><div class="${cx(done && 'is-done')}" style="width:${a.progress}%"></div></div>
    </div>
    <div class="c-ac-detail__rewards">
      <b>Recompensas</b>
      <div class="c-ac-detail__pills">${pill({ label: `${a.points} pontos`, color: 'grey', iconName: 'star' })}${pill({ label: `${a.coins} moedas`, color: 'grey', iconName: 'dollar-sign' })}</div>
    </div>
  </div>`;
}

function detailPanel(state) {
  const a = achievements.find(x => x.id === state.open);
  const drawer = minWidth(DESKTOP);
  return panel({
    mode: drawer ? 'drawer' : 'sheet',
    label: a.title,
    title: `<span class="c-ac-detail__kind">${icon('award', 14)}${kindLabel[a.kind]}</span>`,
    body: detailBody(a, drawer),
    enter: state.fresh,
  });
}

/* ---------- Filtros ---------- */
function filterPills(state) {
  const f = state.filters;
  const open = id => state.menu === id;
  return [
    pillMenu({ id: 'progress', label: labelOf(progressOptions, f.progress), active: f.progress !== 'todos', open: open('progress'), content: radioMenu({ filter: 'progress', options: progressOptions, value: f.progress }) }),
    pillMenu({ id: 'order', label: labelOf(orderOptions, f.order), active: f.order !== 'recentes', open: open('order'), content: radioMenu({ filter: 'order', options: orderOptions, value: f.order }) }),
    `<button type="button" class="c-clear" data-action="clearFilters" ${activeCount(f) === 0 ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Bottom sheet de filtros (GroupsSheet do app antigo): um grupo de chips por filtro, contagem e Limpar/Aplicar. */
function filtersSheet(state) {
  const d = state.draft;
  const body = [
    singleGroup({ title: 'Progresso', filter: 'progress', options: progressOptions, value: d.progress }),
    filterDivider(),
    singleGroup({ title: 'Ordenar por', filter: 'order', options: orderOptions, value: d.order }),
  ].join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterAchievements(state.tab, d).length }), enter: state.fresh });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const list = filterAchievements(state.tab, state.filters);
  const tabs = [
    { id: 'todos', label: 'Todos', count: filterAchievements('todos', state.filters).length },
    { id: 'merito', label: 'Mérito', count: filterAchievements('merito', state.filters).length },
    { id: 'epica', label: 'Épicas', count: filterAchievements('epica', state.filters).length },
  ];

  let content;
  if (!state.loading && list.length === 0) {
    content = '<div class="c-ac-empty">Nenhuma conquista encontrada</div>';
  } else {
    const cards = state.loading ? range(6, () => '<div class="c-ac-skeleton"></div>') : list.map(a => card(a, !desktop)).join('');
    content = `<div class="${cx('c-ac-grid', desktop ? 'c-ac-grid--desktop' : 'c-ac-grid--compact')}">${cards}</div>`;
  }

  return `
    ${menuTop({ title: 'Conquistas', tabs, tab: state.tab, filterCount: activeCount(state.filters) })}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    <div data-reveal="content">${content}</div>
    ${state.sheet ? filtersSheet(state) : ''}
    ${state.open !== null ? detailPanel(state) : ''}`;
}

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  openItem: (ctx, el) => ctx.set({ open: Number(el.dataset.id), fresh: true }),
  clearFilters: ctx => ctx.set({ filters: defaultAchievementFilters() }),

  // Painéis (sheet de filtros e detalhe)
  openFilters: ctx => ctx.set({ sheet: true, draft: { ...ctx.state.filters }, fresh: true }),
  closePanel: ctx => leavePanel(ctx.root, () => !ctx.destroyed && ctx.set({ sheet: false, open: null })), // sai com a animação
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: defaultAchievementFilters() }),
  applyDraft: ctx => ctx.set({ filters: ctx.state.draft, sheet: false }),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => ctx.set({ menu: ctx.state.menu === el.dataset.menu ? null : el.dataset.menu }),
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),
};

export function mountAchievements(root, { loading = true } = {}) {
  return createView(root, {
    state: { loading, tab: 'todos', filters: defaultAchievementFilters(), menu: null, sheet: false, draft: null, open: null, fresh: false },
    view,
    actions,
    breakpoints: [768, 1000, 1180],
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => ctx.set({ menu: null }), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false, open: null }), () => ctx.state.sheet || ctx.state.open !== null);
    },
  });
}
