import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { tag, pill, mobilePill } from '../components/badges.js';
import { avatar } from '../components/avatar.js';
import { panel, sheetFooter } from '../components/panel.js';
import { pagination } from '../components/pagination.js';
import { progressDonut, progressLabeled, infoLine } from '../components/progress.js';
import { pillMenu, radioMenu, categoryMenu, categoryGroup, filterDivider, singleGroup, layoutSubStrip } from '../components/filters.js';
import { categoryMenuActions, categoryDraftActions } from '../components/category-actions.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import { categoryLabel, contentOptions, progressOptions, courseOrderOptions } from '../data/filters.js';
import { courses, defaultCourseFilters, applyFilters } from '../data/courses.js';

/* Cursos (handoff 1.Cursos, Layout A): abas Todos, Obrigatórios e Sugeridos, filtros, cards e paginação.
   Cards grandes e filtros em pílulas a partir de 1180; abaixo, cards compactos e filtros em bottom sheet. */

const DESKTOP = 1180;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const activeCount = f => [!!f.category.cat, f.content !== 'todos', f.progress !== 'todos', f.order !== 'recentes'].filter(Boolean).length;

/* ---------- Cards ---------- */
const cover = (title, className = '') => `<div class="${cx('c-cover', className)}"><span class="c-cover__title">${esc(title)}</span></div>`;

/** Destino do card: rota de aprendizagem abre a página da Rota; curso com progresso abre o Curso; sem progresso, o Tabuleiro. */
const courseHref = c => (c.kind === 'rota' ? '#rota' : c.done || c.progress > 0 ? '#curso' : '#tabuleiro');

/** Card do desktop (cardCourse, a partir de 1180). */
function courseCard(c) {
  return `<a class="c-course-card" href="${courseHref(c)}">
    <div class="c-course-card__top">
      <div class="c-course-card__flags">
        <div>${c.novo ? pill({ label: 'Novo', color: 'blue', iconName: 'award' }) : ''}</div>
        <div class="c-course-card__flags-right">
          ${c.sugerido ? pill({ label: 'Sugerido', color: 'yellow', iconName: 'zap' }) : ''}
          ${c.obrigatorio ? pill({ label: 'Obrigatório', color: 'red', iconName: 'alert-circle' }) : ''}
        </div>
      </div>
      <div class="c-course-card__ends">${tag({ label: 'Encerra em 50min', solid: false })}</div>
      ${cover('LGPD descomplicada: Tudo o que você precisa saber', 'c-course-card__cover')}
    </div>
    <div class="c-course-card__body">
      <div class="c-course-card__info">
        <div class="c-course-card__meta">
          <span class="c-course-card__kind">${icon(c.kind === 'curso' ? 'book' : 'compass', 16)}${c.kind === 'curso' ? 'Curso' : 'Rota de aprendizagem'}</span>
          <span class="c-course-card__time">${icon('clock', 16)}${c.meta}</span>
        </div>
        <h3 class="c-course-card__title">${esc(c.title)}</h3>
        <div class="c-course-card__tags">
          <div class="c-course-card__tag-row">${tag({ label: c.category })}${tag({ label: '+3', outlined: true })}</div>
          <span class="c-course-card__author">${avatar({ size: 'small', use: 'illustration' })}Carla Silva</span>
        </div>
      </div>
      ${progressLabeled({ value: c.progress, done: c.done })}
      <div class="c-course-card__rewards">
        ${pill({ label: 'Pontos', color: 'grey', iconName: 'star' })}${pill({ label: 'Moedas', color: 'grey', iconName: 'dollar-sign' })}${pill({ label: 'Certificado', color: 'grey', iconName: 'award' })}
      </div>
    </div>
  </a>`;
}

/** Card compacto (mobile e tablet, abaixo de 1180). */
function courseCardCompact(c) {
  return `<a class="c-course-compact" href="${courseHref(c)}">
    <div class="c-course-compact__top">
      <div class="c-course-compact__pills">
        ${c.novo ? mobilePill({ tone: 'info', iconName: 'award' }) : ''}${c.sugerido ? mobilePill({ tone: 'warning', iconName: 'zap' }) : ''}${c.obrigatorio ? mobilePill({ tone: 'error', iconName: 'alert-circle' }) : ''}
      </div>
      <div class="c-course-compact__cover-wrap">
        ${cover('LGPD descomplicada', 'c-course-compact__cover')}
        <span class="c-course-compact__time">${icon('clock', 8)}50min</span>
      </div>
    </div>
    <div class="c-course-compact__body">
      <h3 class="c-course-compact__title">${esc(c.title)}</h3>
      ${infoLine(icon(c.kind === 'curso' ? 'book' : 'compass', 8), c.kind === 'curso' ? 'Curso' : 'Rota de aprendizagem', c.kind === 'curso' ? '4 Módulos' : '8 Cursos')}
      <div class="c-course-compact__foot">
        <span class="c-course-compact__tags">${tag({ label: 'RH', size: 'mobile' })}${tag({ label: 'CEO', size: 'mobile' })}${tag({ label: '+9', size: 'mobile', outlined: true })}</span>
        ${c.done ? icon('check-circle', 14, 'c-course-compact__done') : progressDonut(c.progress)}
      </div>
    </div>
  </a>`;
}

const skeletonCompact = () => `<div class="c-course-skeleton c-course-skeleton--compact"><div class="c-course-skeleton__cover"></div><div class="c-course-skeleton__body"><span style="width:100%"></span><span style="width:80%"></span></div></div>`;
const skeletonDesktop = () => `<div class="c-course-skeleton"><div class="c-course-skeleton__cover"></div><div class="c-course-skeleton__body"><span style="width:100%"></span><span style="width:100%"></span><span style="width:75%"></span></div></div>`;

/* ---------- Filtros ---------- */
function filterPills(state) {
  const f = state.filters;
  const open = id => state.menu === id;
  const label = (options, id) => options.find(o => o.id === id).label;
  return [
    pillMenu({ id: 'category', label: categoryLabel(f.category), active: !!f.category.cat, open: open('category'), content: categoryMenu({ value: f.category, view: state.categoryView, q: state.categoryQ, slide: state.slide }) }),
    pillMenu({ id: 'content', label: label(contentOptions, f.content), active: f.content !== 'todos', open: open('content'), content: radioMenu({ filter: 'content', options: contentOptions, value: f.content }) }),
    pillMenu({ id: 'progress', label: label(progressOptions, f.progress), active: f.progress !== 'todos', open: open('progress'), content: radioMenu({ filter: 'progress', options: progressOptions, value: f.progress }) }),
    pillMenu({ id: 'order', label: label(courseOrderOptions, f.order), active: f.order !== 'recentes', open: open('order'), content: radioMenu({ filter: 'order', options: courseOrderOptions, value: f.order }) }),
    `<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaultCourseFilters()) ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Bottom sheet de filtros (360 x 494; tela cheia ao tocar na alça). */
function filtersSheet(state, tab) {
  const d = state.draft;
  const handle = `<button type="button" class="c-panel__handle-button" aria-label="${state.full ? 'Recolher filtros' : 'Expandir filtros em tela cheia'}" aria-expanded="${state.full}" data-action="toggleFull"><span class="c-panel__handle"></span></button>`;
  const body = [
    categoryGroup({ value: d.category, open: state.draftOpen }),
    filterDivider(),
    singleGroup({ title: 'Tipo de conteúdo', filter: 'content', options: contentOptions, value: d.content }),
    filterDivider(),
    singleGroup({ title: 'Progresso', filter: 'progress', options: progressOptions, value: d.progress }),
    filterDivider(),
    singleGroup({ title: 'Ordenar por', filter: 'order', options: courseOrderOptions, value: d.order }),
  ].join('');
  return panel({
    mode: 'sheet',
    label: 'Filtros',
    header: handle,
    body,
    footer: sheetFooter({ count: applyFilters(courses, tab, d).length }),
    enter: state.fresh,
    className: state.full ? 'c-panel__box--full' : 'c-panel__box--filters',
  });
}

/* ---------- Tela ---------- */
const tabsOf = () => [
  { id: 'todos', label: 'Todos', count: courses.length },
  { id: 'obrigatorios', label: 'Obrigatórios', count: courses.filter(c => c.obrigatorio).length },
  { id: 'sugeridos', label: 'Sugeridos', count: courses.filter(c => c.sugerido).length },
];

function view(state) {
  const desktop = minWidth(DESKTOP);
  const tabs = tabsOf();
  const list = applyFilters(courses, state.tab, state.filters);
  const dirty = !same(state.filters, defaultCourseFilters());

  let content;
  if (!state.loading && list.length === 0) {
    content = `<div class="c-lib-empty"><b>Nenhum curso encontrado</b><span>Tente mudar ou limpar os filtros.</span><button type="button" data-action="clearFilters">Limpar filtros</button></div>`;
  } else {
    const cards = state.loading
      ? range(desktop ? 6 : 8, () => (desktop ? skeletonDesktop() : skeletonCompact()))
      : list.map(c => (desktop ? courseCard(c) : courseCardCompact(c))).join('');
    content = `<div class="${cx('c-course-grid', desktop ? 'c-course-grid--desktop' : 'c-course-grid--compact')}">${cards}</div>`;
  }

  return `
    ${menuTop({ title: 'Cursos', tabs, tab: state.tab, filterCount: activeCount(state.filters) })}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    <div class="c-courses-swipe" data-reveal="content">
      ${content}
      ${desktop && !state.loading && list.length > 0 ? `<div class="c-lib-footer"><span>Mostrando <b>${list.length}</b> de 31</span>${pagination({ page: state.page, pages: 4 })}<span class="c-lib-footer__size">Exibir 12</span></div>` : ''}
    </div>
    ${state.sheet ? filtersSheet(state, state.tab) : ''}`;
}

const closeMenu = ctx => ctx.set({ menu: null, categoryView: null, categoryQ: '', slide: '' });

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  goPage: (ctx, el) => ctx.set({ page: Number(el.dataset.page) }),
  clearFilters: ctx => ctx.set({ filters: defaultCourseFilters() }),

  // Sheet de filtros (mobile e tablet)
  openFilters: ctx => ctx.set({ sheet: true, full: false, draft: structuredClone(ctx.state.filters), draftOpen: ctx.state.filters.category.cat, fresh: true }),
  closePanel: ctx => ctx.set({ sheet: false }),
  toggleFull: ctx => ctx.set({ full: !ctx.state.full }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: defaultCourseFilters(), draftOpen: null }),
  applyDraft: ctx => ctx.set({ filters: ctx.state.draft, sheet: false }),
  ...categoryDraftActions(),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => {
    const id = el.dataset.menu;
    if (ctx.state.menu === id) closeMenu(ctx);
    else ctx.set({ menu: id, categoryView: null, categoryQ: '', slide: '' });
  },
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),
  ...categoryMenuActions(),
};

/** Swipe horizontal no conteúdo troca de aba: só toque, predominantemente horizontal (60px e mais que 1,5x o vertical). */
function swipe(ctx) {
  let start = null;
  const inContent = event => event.target.closest('.c-courses-swipe');
  ctx.listen('touchstart', event => {
    start = inContent(event) ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, ctx.root);
  ctx.listen('touchend', event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const tabs = tabsOf();
    const i = tabs.findIndex(t => t.id === ctx.state.tab);
    const next = tabs[Math.min(tabs.length - 1, Math.max(0, i + (dx < 0 ? 1 : -1)))];
    ctx.set({ tab: next.id });
  }, ctx.root);
}

export function mountCourses(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, tab: 'todos', page: 1, filters: defaultCourseFilters(), menu: null, categoryView: null, categoryQ: '', slide: '',
      sheet: false, full: false, draft: null, draftOpen: null, fresh: false,
    },
    view,
    actions,
    breakpoints: [768, 1000, 1180],
    onRender: ctx => layoutSubStrip(ctx.root),
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => closeMenu(ctx), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false }), () => ctx.state.sheet);
      swipe(ctx);
    },
  });
}
