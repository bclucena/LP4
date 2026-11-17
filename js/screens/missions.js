import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { tag, pill } from '../components/badges.js';
import { panel, sheetFooter } from '../components/panel.js';
import { pagination } from '../components/pagination.js';
import { progressDonut, progressLabeled } from '../components/progress.js';
import { mpill } from '../components/mobile.js';
import { pillMenu, radioMenu, categoryMenu, filterDivider, singleGroup } from '../components/filters.js';
import { categoryMenuActions } from '../components/category-actions.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import { categoryLabel } from '../data/filters.js';
import {
  statusInfo, periodLabel, kindLabel, scopeOptions, kindOptions, statusOptions, orderOptions, categories,
  defaultMissionFilters, toDraft, fromDraft, filterMissions,
} from '../data/missions.js';

/* Missões (handoff 3.Missões, Layout A): missões do tipo meta e evidência, com período (abas) e status
   (novo, devolvido, aprovado, reprovado, em correção). A partir de 1180 são cards grandes com filtros em pílulas;
   abaixo disso, cards compactos e o bottom sheet de filtros (aberto pelo botão "Filtro" do menu top). */

const DESKTOP = 1180;

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const activeCount = f => [!!f.category.cat, f.scope !== 'todos', f.kind !== 'todos', f.status !== 'todos', f.order !== 'recentes'].filter(Boolean).length;
const labelOf = (options, id) => options.find(o => o.id === id).label;
const scopeText = m => (m.scope === 'individual' ? 'Individual' : 'Equipe');

/* ---------- Cards ---------- */
const favButton = (m, on, small = false) =>
  `<button type="button" class="${cx('c-mi-fav', small && 'c-mi-fav--small')}" aria-pressed="${on}" aria-label="${on ? 'Remover dos favoritos' : 'Favoritar'}" data-action="toggleFav" data-id="${m.id}">${icon('bookmark', small ? 12 : 16).replace('fill="none"', on ? 'fill="currentColor"' : 'fill="none"')}</button>`;

/** Card grande (desktop): capa com selos, tipo e período, tags, progresso e recompensas. */
function missionCard(m, fav) {
  const s = statusInfo[m.status];
  return `<article class="c-mi-card">
    <div class="c-mi-card__cover c-cover">
      <div class="c-mi-card__pills">${pill({ color: 'blue', label: 'Novo', iconName: 'award' })}${pill({ color: s.color, label: s.label, iconName: s.icon })}</div>
      <div class="c-mi-card__cover-text"><span>${esc(m.title)}</span><small>Encerra em ${esc(m.ends)}</small></div>
      <div class="c-mi-card__fav">${favButton(m, fav)}</div>
    </div>
    <div class="c-mi-card__body">
      <div class="c-mi-card__meta">
        <span class="c-mi-card__kind">${icon('flag', 16)}${kindLabel[m.kind]} · ${scopeText(m)}</span>
        <span class="c-mi-card__period">${icon('calendar', 16)}${periodLabel[m.period]}</span>
      </div>
      <h3 class="c-mi-card__title">${esc(m.title)}</h3>
      <div class="c-mi-card__tags">${tag({ label: m.category, solid: false })}${tag({ label: 'Marketing', solid: false })}${tag({ label: '+3', outlined: true })}</div>
      ${progressLabeled({ value: m.progress })}
      <div class="c-mi-card__rewards">${pill({ color: 'grey', label: 'Pontos', iconName: 'star' })}${pill({ color: 'grey', label: 'Moedas', iconName: 'dollar-sign' })}${pill({ color: 'grey', label: 'Certificado', iconName: 'award' })}</div>
    </div>
  </article>`;
}

/** Card compacto (mobile e tablet): meta mostra o donut de progresso, evidência mostra "n/100". */
function missionCardCompact(m, fav) {
  const s = statusInfo[m.status];
  return `<article class="c-mi-card c-mi-card--compact">
    <div class="c-mi-card__cover c-cover">
      <span class="c-mi-card__cover-title">${esc(m.title)}</span>
      <span class="c-mi-card__badges">${mpill({ tone: 'info', iconName: 'award' })}${mpill({ tone: s.tone, iconName: s.icon })}</span>
    </div>
    <div class="c-mi-card__body">
      <div class="c-mi-card__head"><h3 class="c-mi-card__title">${esc(m.title)}</h3>${favButton(m, fav, true)}</div>
      <span class="c-mi-card__info">
        <span class="c-mi-card__info-kind">${icon(m.kind === 'meta' ? 'flag' : 'upload', 10)}${kindLabel[m.kind]}</span>
        <span>${scopeText(m)} · ${periodLabel[m.period]}</span>
      </span>
      <div class="c-mi-card__foot">
        <span class="c-mi-card__tags-mobile">${tag({ label: 'RH', size: 'mobile' })}${tag({ label: 'CEO', size: 'mobile' })}${tag({ label: '+9', size: 'mobile', outlined: true })}</span>
        ${m.kind === 'meta' ? progressDonut(m.progress) : `<span class="c-mi-card__count">${m.progress}/100</span>`}
      </div>
    </div>
  </article>`;
}

const skeleton = compact =>
  `<div class="${cx('c-mi-skeleton', compact && 'c-mi-skeleton--compact')}"><div class="c-mi-skeleton__cover"></div><div class="c-mi-skeleton__body"><span style="width:100%"></span><span style="width:100%"></span><span style="width:75%"></span></div></div>`;

/* ---------- Filtros ---------- */
const filterOptions = { scope: scopeOptions, kind: kindOptions, status: statusOptions, order: orderOptions };

/** Pílulas do desktop: categoria (com subníveis), tipo de missão, tipo, status e ordem + "Limpar". */
function filterPills(state) {
  const f = state.filters;
  const open = id => state.menu === id;
  const radios = Object.entries(filterOptions).map(([key, options]) =>
    pillMenu({ id: key, label: labelOf(options, f[key]), active: f[key] !== defaultMissionFilters()[key], open: open(key), content: radioMenu({ filter: key, options, value: f[key] }) }));
  return [
    pillMenu({ id: 'category', label: categoryLabel(f.category), active: !!f.category.cat, open: open('category'), content: categoryMenu({ value: f.category, view: state.categoryView, q: state.categoryQ, slide: state.slide }) }),
    ...radios,
    `<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaultMissionFilters()) ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Bottom sheet de filtros: um grupo de chips (escolha única) por filtro, com contagem de resultados. */
function filtersSheet(state) {
  const d = state.draft;
  const groups = [
    { key: 'category', title: 'Categoria', options: [{ id: 'todos', label: 'Todas as categorias' }, ...categories.map(c => ({ id: c, label: c }))] },
    { key: 'scope', title: 'Missões', options: scopeOptions },
    { key: 'kind', title: 'Tipo', options: kindOptions },
    { key: 'status', title: 'Status', options: statusOptions },
    { key: 'order', title: 'Ordenar por', options: orderOptions },
  ];
  const body = groups.map((g, i) => `${i > 0 ? filterDivider() : ''}${singleGroup({ title: g.title, filter: g.key, options: g.options, value: d[g.key] })}`).join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterMissions(state.tab, fromDraft(d), state.favs).length }), enter: state.fresh });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const f = state.filters;
  const list = filterMissions(state.tab, f, state.favs);
  const dirty = !same(f, defaultMissionFilters());
  const tabs = [
    { id: 'todos', label: 'Todos', count: filterMissions('todos', f, state.favs).length },
    { id: 'favoritos', label: 'Favoritos', count: filterMissions('favoritos', f, state.favs).length },
    ...Object.keys(periodLabel).map(p => ({ id: p, label: periodLabel[p], count: filterMissions(p, f, state.favs).length })),
  ];

  let content;
  if (!state.loading && list.length === 0) {
    content = `<div class="c-mi-empty"><b>Nenhuma missão encontrada</b><span>Tente mudar ou limpar os filtros.</span>
      ${dirty ? '<button type="button" data-action="clearFilters">Limpar filtros</button>' : ''}</div>`;
  } else {
    const cards = state.loading
      ? range(6, () => skeleton(!desktop))
      : list.map(m => (desktop ? missionCard(m, state.favs.includes(m.id)) : missionCardCompact(m, state.favs.includes(m.id)))).join('');
    content = `<div class="${cx('c-mi-grid', desktop ? 'c-mi-grid--desktop' : 'c-mi-grid--compact')}">${cards}</div>`;
  }

  return `
    ${menuTop({ title: 'Missões', tabs, tab: state.tab, filterCount: activeCount(f) })}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    <div data-reveal="content">
      ${content}
      ${desktop && !state.loading && list.length > 0 ? `<div class="c-mi-footer"><span>Mostrando <b>${list.length}</b> de 48</span>${pagination({ page: state.page, pages: 4 })}<span class="c-mi-footer__size">Exibir 24</span></div>` : ''}
    </div>
    ${state.sheet ? filtersSheet(state) : ''}`;
}

const closeMenu = ctx => ctx.set({ menu: null, categoryView: null, categoryQ: '', slide: '' });

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  goPage: (ctx, el) => ctx.set({ page: Number(el.dataset.page) }),
  toggleFav: (ctx, el) => {
    const id = Number(el.dataset.id);
    const favs = ctx.state.favs;
    ctx.set({ favs: favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id] });
  },
  clearFilters: ctx => ctx.set({ filters: defaultMissionFilters() }),

  // Bottom sheet de filtros (rascunho até clicar em "Aplicar")
  openFilters: ctx => ctx.set({ sheet: true, draft: toDraft(ctx.state.filters), fresh: true }),
  closePanel: ctx => ctx.set({ sheet: false }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: toDraft(defaultMissionFilters()) }),
  applyDraft: ctx => ctx.set({ filters: fromDraft(ctx.state.draft), sheet: false }),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => {
    const id = el.dataset.menu;
    if (ctx.state.menu === id) closeMenu(ctx);
    else ctx.set({ menu: id, categoryView: null, categoryQ: '', slide: '' });
  },
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),
  ...categoryMenuActions(),
};

export function mountMissions(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, tab: 'todos', page: 1, filters: defaultMissionFilters(), favs: [1, 4],
      menu: null, categoryView: null, categoryQ: '', slide: '', sheet: false, draft: null, fresh: false,
    },
    view,
    actions,
    breakpoints: [768, 1000, 1180],
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => closeMenu(ctx), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false }), () => ctx.state.sheet);
    },
  });
}
