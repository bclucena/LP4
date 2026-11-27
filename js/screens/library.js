import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { tag, pill, mobilePill } from '../components/badges.js';
import { panel, leavePanel, sheetFooter } from '../components/panel.js';
import { pagination } from '../components/pagination.js';
import { pillMenu, radioMenu, categoryMenu, filterDivider, filterGroup, singleGroup, chip, layoutSubStrip } from '../components/filters.js';
import { categoryMenuActions } from '../components/category-actions.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import { categoryLabel } from '../data/filters.js';
import {
  materialInfo, materialOptions, orderOptions, sections, mobileSections, items, about, aboutTitle, mainAction,
  defaultLibraryFilters, filterItems,
} from '../data/library.js';

/* Biblioteca (handoff 2.Biblioteca, Layout B): materiais de apoio com abas Todos/Favoritos, filtros, seções (pastas com
   subnível) e cards de material. Clicar em um card abre o detalhe: navdrawer de 400 a partir de 1179 e bottom sheet abaixo. */

const DESKTOP = 1180; // cards grandes, filtros em pílulas e painel de seções
const DRAWER = 1179; // detalhe em navdrawer

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const activeCount = f => [!!f.category.cat, f.material !== 'todos', !!f.section, f.order !== 'recentes'].filter(Boolean).length;

/* ---------- Cards ---------- */
const bookmark = (item, fav, small = false) =>
  `<button type="button" class="${cx('c-bookmark', small && 'c-bookmark--small')}" aria-pressed="${fav}" aria-label="${fav ? 'Remover dos favoritos' : 'Favoritar'}" data-action="toggleFav" data-id="${item.id}">${icon('bookmark', small ? 12 : 16).replace('fill="none"', fav ? 'fill="currentColor"' : 'fill="none"')}</button>`;

const openCard = item => `<button type="button" class="c-lib-card__open" aria-haspopup="dialog" aria-label="Abrir ${esc(item.title)}" data-action="openItem" data-id="${item.id}"></button>`;

function libraryCard(item, fav) {
  const m = materialInfo[item.kind];
  return `<article class="c-lib-card">
    ${openCard(item)}
    <div class="c-lib-card__cover c-cover">
      <div class="c-lib-card__badge">${item.novo ? pill({ label: 'Novo', color: 'blue', iconName: 'award' }) : ''}</div>
      <span class="c-cover__title">${esc(item.title)}</span>
      <div class="c-lib-card__fav">${bookmark(item, fav)}</div>
    </div>
    <div class="c-lib-card__body">
      <div class="c-lib-card__meta">
        <span class="c-lib-card__type">${icon(m.icon, 16)}${m.label}</span>
        <span class="c-lib-card__date">${icon('calendar', 16)}${item.date}</span>
      </div>
      <h3 class="c-lib-card__title">${esc(item.title)}</h3>
      <div class="c-lib-card__foot">
        ${tag({ label: item.category, solid: false })}${tag({ label: '+3', outlined: true })}
        <span class="c-lib-card__stats">${icon('thumbs-up', 16)}${item.likes}<span aria-hidden="true">·</span>${icon('eye', 16)}${item.views}</span>
      </div>
    </div>
  </article>`;
}

function libraryCardCompact(item, fav) {
  const m = materialInfo[item.kind];
  return `<article class="c-lib-card c-lib-card--compact">
    ${openCard(item)}
    <div class="c-lib-card__cover c-cover">
      <span class="c-cover__title">${esc(item.title)}</span>
      ${item.novo ? `<span class="c-lib-card__new">${mobilePill({ tone: 'info', iconName: 'award' })}</span>` : ''}
    </div>
    <div class="c-lib-card__body">
      <div class="c-lib-card__head"><h3 class="c-lib-card__title">${esc(item.title)}</h3>${bookmark(item, fav, true)}</div>
      <span class="c-lib-card__kind">${icon(m.icon, 12)}${m.label}</span>
      <span class="c-lib-card__tags">${tag({ label: 'RH', size: 'mobile' })}${tag({ label: 'CEO', size: 'mobile' })}${tag({ label: '+9', size: 'mobile', outlined: true })}</span>
    </div>
  </article>`;
}

const skeleton = compact =>
  `<div class="${cx('c-lib-skeleton', compact && 'c-lib-skeleton--compact')}"><div class="c-lib-skeleton__cover"></div><div class="c-lib-skeleton__body"><span style="width:100%"></span><span style="width:100%"></span><span style="width:75%"></span></div></div>`;

/* ---------- Seções (pastas) ---------- */
const sectionBreadcrumb = value =>
  `<div class="c-sections__crumb">${value
    ? `<button type="button" data-action="setSection" data-value="">Seções</button>${icon('chevron-right', 16)}<b>${esc(value)}</b>`
    : '<b>Seções</b>'}</div>`;

function sectionsPanel(state) {
  const shown = state.allSections ? sections : sections.slice(0, 11);
  return `<div class="c-sections c-sections--panel" data-reveal="menu">
    ${sectionBreadcrumb(state.filters.section)}
    <div class="c-sections__chips">${shown.map(s => `<button type="button" class="${cx('c-section-chip', s.name === state.filters.section && 'is-on')}" aria-pressed="${s.name === state.filters.section}" data-action="setSection" data-value="${s.name === state.filters.section ? '' : esc(s.name)}">
      <span class="c-section-chip__icon">${icon('star', 16)}</span>${esc(s.name)}<span class="c-section-chip__count">${s.count}</span></button>`).join('')}</div>
    <button type="button" class="c-sections__more" aria-expanded="${state.allSections}" data-action="toggleSections">${state.allSections ? 'Ver menos' : 'Ver mais'} ${icon('chevron-down', 16, cx(state.allSections && 'is-open'))}</button>
  </div>`;
}

/** Mobile e tablet: linha de chips rolável, abaixo do menu top. */
const sectionsBar = state =>
  `<div class="c-sections c-sections--bar" data-reveal="menu">
    ${sectionBreadcrumb(state.filters.section)}
    <div class="c-sections__row u-hide-scroll" data-scroll-key="sections-row">${[...mobileSections, ...sections.map(s => s.name)].map(n =>
      `<button type="button" class="${cx('c-section-bar-chip', n === state.filters.section && 'is-on')}" aria-pressed="${n === state.filters.section}" data-action="setSection" data-value="${n === state.filters.section ? '' : esc(n)}">${esc(n)}</button>`).join('')}</div>
  </div>`;

/* ---------- Filtros ---------- */
function filterPills(state) {
  const f = state.filters;
  const open = id => state.menu === id;
  return [
    pillMenu({ id: 'category', label: categoryLabel(f.category), active: !!f.category.cat, open: open('category'), content: categoryMenu({ value: f.category, view: state.categoryView, q: state.categoryQ, slide: state.slide }) }),
    pillMenu({ id: 'material', label: materialOptions.find(o => o.id === f.material).label, active: f.material !== 'todos', open: open('material'), content: radioMenu({ filter: 'material', options: materialOptions, value: f.material }) }),
    pillMenu({ id: 'section', label: f.section ?? 'Seção atual', active: !!f.section, open: open('section'), content: radioMenu({ filter: 'section', options: [{ id: '', label: 'Todas as seções' }, ...sections.map(s => ({ id: s.name, label: s.name }))], value: f.section ?? '' }) }),
    pillMenu({ id: 'order', label: orderOptions.find(o => o.id === f.order).label, active: f.order !== 'recentes', open: open('order'), content: radioMenu({ filter: 'order', options: orderOptions, value: f.order }) }),
    `<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaultLibraryFilters()) ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

function filtersSheet(state) {
  const d = state.draft;
  const body = [
    singleGroup({ title: 'Tipo de material', filter: 'material', options: materialOptions, value: d.material }),
    filterDivider(),
    filterGroup('Seção', `<div class="c-chips">${[{ id: '', label: 'Todas' }, ...sections.map(s => ({ id: s.name, label: s.name }))].map(o =>
      chip({ label: o.label, on: (d.section ?? '') === o.id, action: 'pickDraft', data: { filter: 'section', value: o.id } })).join('')}</div>`),
    filterDivider(),
    singleGroup({ title: 'Ordenar por', filter: 'order', options: orderOptions, value: d.order }),
  ].join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterItems(d, 'todos', []).length }), enter: state.fresh });
}

/* ---------- Detalhe do material ---------- */
function detailBody(item, fav, drawer) {
  const media = item.kind === 'audio' || item.kind === 'video';
  const action = mainAction[item.kind];
  return `<div class="${cx('c-detail', !drawer && 'c-detail--sheet')}">
    <div class="${cx('c-cover', 'c-detail__cover', media && 'c-detail__cover--wide', !drawer && !media && 'c-detail__cover--small')}"><span class="c-cover__title">${esc(item.title)}</span></div>
    <div class="c-detail__title-row">
      <h2 class="c-detail__title">${esc(item.title)}</h2>
      <button type="button" class="c-detail__fav" aria-pressed="${fav}" aria-label="${fav ? 'Remover dos favoritos' : 'Favoritar'}" data-action="toggleFav" data-id="${item.id}">${icon('bookmark', 16).replace('fill="none"', fav ? 'fill="currentColor"' : 'fill="none"')}</button>
    </div>
    <div class="c-detail__tags">${tag({ label: item.category, size: drawer ? 'md' : 'mobile' })}${tag({ label: 'RH', size: drawer ? 'md' : 'mobile' })}${tag({ label: 'CEO', size: drawer ? 'md' : 'mobile' })}${drawer ? '' : tag({ label: '+3', size: 'mobile', outlined: true })}</div>
    ${drawer && action ? `<button type="button" class="c-button c-button--primary c-button--block"><span>${action.drawer}</span>${icon(action.icon, 16)}</button>` : ''}
    ${media ? '<hr class="c-detail__divider" />' : ''}
    <div class="c-detail__about"><h3>${aboutTitle[item.kind][drawer ? 0 : 1]}</h3><p>${esc(about)}</p></div>
    ${media ? `<div class="c-detail__meta"><span class="c-detail__date">${icon('calendar', 16)}${item.date}</span><span>${icon('thumbs-up', 16)}${item.likes}</span><span aria-hidden="true">·</span><span>${icon('thumbs-down', 16)}15</span><span class="c-detail__sep" aria-hidden="true"></span><span>${icon('eye', 16)}${item.views}</span></div>` : ''}
  </div>`;
}

function detailPanel(state) {
  const item = items.find(i => i.id === state.open);
  const fav = state.favs.includes(item.id);
  const drawer = minWidth(DRAWER);
  const m = materialInfo[item.kind];
  const action = mainAction[item.kind];
  return panel({
    mode: drawer ? 'drawer' : 'sheet',
    label: item.title,
    title: `${icon(m.icon, 20)}${m.label}`,
    body: detailBody(item, fav, drawer),
    footer: !drawer && action ? `<div class="c-detail-footer"><button type="button" class="c-button c-button--primary c-button--block"><span>${action.sheet}</span>${icon(action.icon, 16)}</button></div>` : '',
    className: drawer ? '' : 'c-panel__box--detail',
    enter: state.fresh,
  });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const list = filterItems(state.filters, state.tab, state.favs);
  const tabs = [
    { id: 'todos', label: 'Todos', count: filterItems(state.filters, 'todos', state.favs).length },
    { id: 'favoritos', label: 'Favoritos', count: filterItems(state.filters, 'favoritos', state.favs).length },
  ];
  const dirty = !same(state.filters, defaultLibraryFilters());

  let content;
  if (!state.loading && list.length === 0) {
    content = `<div class="c-lib-empty"><b>${state.tab === 'favoritos' ? 'Nenhum favorito ainda' : 'Nenhum material encontrado'}</b>
      <span>${state.tab === 'favoritos' ? 'Toque no marcador de um material para favoritar.' : 'Tente mudar ou limpar os filtros.'}</span>
      ${dirty ? '<button type="button" data-action="clearFilters">Limpar filtros</button>' : ''}</div>`;
  } else {
    const cards = state.loading
      ? range(desktop ? 8 : 6, () => skeleton(!desktop))
      : list.map(it => (desktop ? libraryCard(it, state.favs.includes(it.id)) : libraryCardCompact(it, state.favs.includes(it.id)))).join('');
    content = `<div class="${cx('c-lib-grid', desktop ? 'c-lib-grid--desktop' : 'c-lib-grid--compact')}">${cards}</div>`;
  }

  return `
    ${menuTop({ title: 'Biblioteca', tabs, tab: state.tab, filterCount: activeCount(state.filters) })}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    ${sectionsBar(state)}
    ${sectionsPanel(state)}
    <div data-reveal="content">
      ${content}
      ${desktop && !state.loading && list.length > 0 ? `<div class="c-lib-footer"><span>Mostrando <b>${list.length}</b> de 120</span>${pagination({ page: state.page, pages: 5 })}<span class="c-lib-footer__size">Exibir 24</span></div>` : ''}
    </div>
    ${state.sheet ? filtersSheet(state) : ''}
    ${state.open !== null ? detailPanel(state) : ''}`;
}

const closeMenu = ctx => ctx.set({ menu: null, categoryView: null, categoryQ: '', slide: '' });

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  goPage: (ctx, el) => ctx.set({ page: Number(el.dataset.page) }),
  toggleSections: ctx => ctx.set({ allSections: !ctx.state.allSections }),
  setSection: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, section: el.dataset.value || null } }),
  toggleFav: (ctx, el) => {
    const id = Number(el.dataset.id);
    const favs = ctx.state.favs;
    ctx.set({ favs: favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id] });
  },
  openItem: (ctx, el) => ctx.set({ open: Number(el.dataset.id), fresh: true }),
  clearFilters: ctx => ctx.set({ filters: defaultLibraryFilters() }),

  // Painéis (sheet de filtros e detalhe)
  openFilters: ctx => ctx.set({ sheet: true, draft: structuredClone(ctx.state.filters), fresh: true }),
  closePanel: ctx => leavePanel(ctx.root, () => !ctx.destroyed && ctx.set({ sheet: false, open: null })), // sai com a animação
  pickDraft: (ctx, el) => {
    const { filter, value } = el.dataset;
    ctx.set({ draft: { ...ctx.state.draft, [filter]: filter === 'section' ? value || null : value } });
  },
  clearDraft: ctx => ctx.set({ draft: defaultLibraryFilters() }),
  applyDraft: ctx => ctx.set({ filters: ctx.state.draft, sheet: false }),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => {
    const id = el.dataset.menu;
    if (ctx.state.menu === id) closeMenu(ctx);
    else ctx.set({ menu: id, categoryView: null, categoryQ: '', slide: '' });
  },
  pick: (ctx, el) => {
    const { filter, value } = el.dataset;
    ctx.set({ filters: { ...ctx.state.filters, [filter]: filter === 'section' ? value || null : value }, menu: null });
  },
  ...categoryMenuActions(),
};

export function mountLibrary(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, tab: 'todos', page: 1, filters: defaultLibraryFilters(), favs: [2, 5], allSections: false,
      menu: null, categoryView: null, categoryQ: '', slide: '', sheet: false, draft: null, draftOpen: null, open: null, fresh: false,
    },
    view,
    actions,
    breakpoints: [768, 1000, 1179, 1180],
    onRender: ctx => layoutSubStrip(ctx.root),
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => closeMenu(ctx), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false, open: null }), () => ctx.state.sheet || ctx.state.open !== null);
    },
  });
}
