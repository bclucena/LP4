import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { pill } from '../components/badges.js';
import { panel, sheetFooter } from '../components/panel.js';
import { progressDonut, progressLabeled } from '../components/progress.js';
import { pillMenu, radioMenu, filterDivider, singleGroup } from '../components/filters.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import {
  certificates, kindInfo, kindOptions, orderOptions, defaultCertificateFilters, filterCertificates,
} from '../data/certificates.js';

/* Certificados (handoff 6.Certificados, Layout A): certificados de cursos, eventos e trilhas híbridas.
   O botão de baixar só habilita com 100% de progresso; baixar só mostra um aviso (simulação).
   Cards grandes e filtros em pílulas a partir de 1180; abaixo, cards compactos e filtros em bottom sheet. */

const DESKTOP = 1180;

const activeCount = f => Number(f.kind !== 'todos') + Number(f.order !== 'recentes');
const labelOf = (options, id) => options.find(o => o.id === id).label;

/* ---------- Cards ---------- */
/** Botão de baixar: habilitado só com 100% de progresso. */
function downloadButton(c, compact = false) {
  const ok = c.progress >= 100;
  return `<button type="button" class="${cx('c-ce-download', compact && 'c-ce-download--compact')}" ${ok ? '' : 'disabled'} title="${ok ? 'Baixar certificado' : 'Disponível com 100% de progresso'}" data-action="download" data-id="${c.id}">${icon('download', compact ? 12 : 16)} Baixar</button>`;
}

/** Card do desktop (a partir de 1180). */
function certCard(c) {
  const k = kindInfo[c.kind];
  return `<article class="c-ce-card">
    <div class="c-cover c-ce-card__cover">
      <div class="c-ce-card__badge">${c.novo ? pill({ label: 'Novo', color: 'blue', iconName: 'award' }) : ''}</div>
      <span class="c-cover__title c-ce-card__cover-title">${esc(c.title)}</span>
    </div>
    <div class="c-ce-card__body">
      <div class="c-ce-card__meta"><span class="c-ce-card__kind">${icon(k.icon, 16)}${k.label}</span><span>${esc(c.meta)}</span></div>
      <h3 class="c-ce-card__title">${esc(c.title)}</h3>
      ${progressLabeled({ value: c.progress, done: c.progress >= 100 })}
      ${downloadButton(c)}
    </div>
  </article>`;
}

/** Card compacto (mobile e tablet). */
function certCardCompact(c) {
  const k = kindInfo[c.kind];
  return `<article class="c-ce-card c-ce-card--compact">
    <div class="c-cover c-ce-card__cover">
      <span class="c-cover__title c-ce-card__cover-title">${esc(c.title)}</span>
    </div>
    <div class="c-ce-card__body">
      <h3 class="c-ce-card__title">${esc(c.title)}</h3>
      <span class="c-ce-card__info">${icon(k.icon, 10)}${esc(c.meta)}</span>
      <div class="c-ce-card__foot">
        ${downloadButton(c, true)}
        ${c.progress >= 100 ? '<span class="c-ce-card__done">100%</span>' : progressDonut(c.progress)}
      </div>
    </div>
  </article>`;
}

/* ---------- Filtros ---------- */
function filterPills(state) {
  const f = state.filters;
  const open = id => state.menu === id;
  return [
    pillMenu({ id: 'kind', label: labelOf(kindOptions, f.kind), active: f.kind !== 'todos', open: open('kind'), content: radioMenu({ filter: 'kind', options: kindOptions, value: f.kind }) }),
    pillMenu({ id: 'order', label: labelOf(orderOptions, f.order), active: f.order !== 'recentes', open: open('order'), content: radioMenu({ filter: 'order', options: orderOptions, value: f.order }) }),
    `<button type="button" class="c-clear" data-action="clearFilters" ${activeCount(f) === 0 ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Bottom sheet de filtros (GroupsSheet do app antigo): um grupo de chips por filtro, contagem e Limpar/Aplicar. */
function filtersSheet(state) {
  const d = state.draft;
  const body = [
    singleGroup({ title: 'Tipo de certificado', filter: 'kind', options: kindOptions, value: d.kind }),
    filterDivider(),
    singleGroup({ title: 'Ordenar por', filter: 'order', options: orderOptions, value: d.order }),
  ].join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterCertificates(state.tab, d).length }), enter: state.fresh });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const list = filterCertificates(state.tab, state.filters);
  const tabs = [
    { id: 'todos', label: 'Todos', count: filterCertificates('todos', state.filters).length },
    { id: 'andamento', label: 'Em andamento', count: filterCertificates('andamento', state.filters).length },
    { id: 'conquistados', label: 'Conquistados', count: filterCertificates('conquistados', state.filters).length },
  ];

  let content;
  if (!state.loading && list.length === 0) {
    content = '<div class="c-ce-empty">Nenhum certificado encontrado</div>';
  } else {
    const cards = state.loading ? range(6, () => '<div class="c-ce-skeleton"></div>') : list.map(c => (desktop ? certCard(c) : certCardCompact(c))).join('');
    content = `<div class="${cx('c-ce-grid', desktop ? 'c-ce-grid--desktop' : 'c-ce-grid--compact')}">${cards}</div>`;
  }

  return `
    ${menuTop({ title: 'Certificados', tabs, tab: state.tab, filterCount: activeCount(state.filters) })}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    <div data-reveal="content">${content}</div>
    ${state.toast ? `<div class="c-ce-toast" role="status">${esc(state.toast)}</div>` : ''}
    ${state.sheet ? filtersSheet(state) : ''}`;
}

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  clearFilters: ctx => ctx.set({ filters: defaultCertificateFilters() }),

  // Baixar só mostra um aviso por 2,5 segundos.
  download: (ctx, el) => {
    const c = certificates.find(x => x.id === Number(el.dataset.id));
    clearTimeout(ctx.toastTimer);
    ctx.set({ toast: `Certificado de "${c.title}" baixado (simulação).` });
    ctx.toastTimer = setTimeout(() => { if (!ctx.destroyed) ctx.set({ toast: null }); }, 2500);
  },

  // Sheet de filtros
  openFilters: ctx => ctx.set({ sheet: true, draft: { ...ctx.state.filters }, fresh: true }),
  closePanel: ctx => ctx.set({ sheet: false }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: defaultCertificateFilters() }),
  applyDraft: ctx => ctx.set({ filters: ctx.state.draft, sheet: false }),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => ctx.set({ menu: ctx.state.menu === el.dataset.menu ? null : el.dataset.menu }),
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),
};

export function mountCertificates(root, { loading = true } = {}) {
  return createView(root, {
    state: { loading, tab: 'todos', filters: defaultCertificateFilters(), menu: null, sheet: false, draft: null, toast: null, fresh: false },
    view,
    actions,
    breakpoints: [768, 1000, 1180],
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => ctx.set({ menu: null }), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false }), () => ctx.state.sheet);
    },
  });
}
