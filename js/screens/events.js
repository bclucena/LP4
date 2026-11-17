import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { tag, pill } from '../components/badges.js';
import { panel, sheetFooter } from '../components/panel.js';
import { pillMenu, radioMenu, filterDivider, singleGroup } from '../components/filters.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import { modeInfo, categoryOptions, modeOptions, orderOptions, defaultEventFilters, isFull, filterEvents } from '../data/events.js';

/* Eventos (handoff 9.Eventos, Layout A): eventos online, presenciais e híbridos, com data, local, vagas, inscrição e
   adição à agenda. Cards grandes e filtros em pílulas a partir de 1180; abaixo, cards compactos e filtros em bottom sheet. */

const DESKTOP = 1180;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const activeCount = f => Object.keys(defaultEventFilters()).filter(k => f[k] !== defaultEventFilters()[k]).length;
const labelOf = (options, id) => options.find(o => o.id === id).label;
const flip = (list, id) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

/* ---------- Cards ---------- */
const slots = e => {
  if (e.slots === null) return '<span class="c-ev-slots c-ev-slots--free">Vagas ilimitadas</span>';
  return `<span class="${cx('c-ev-slots', isFull(e) && 'c-ev-slots--full')}"><b>${e.taken}/${e.slots}</b> Vagas disponíveis</span>`;
};

const bookmark = (e, fav, size) =>
  `<button type="button" class="${cx('c-ev-fav', size === 12 && 'c-ev-fav--small')}" aria-pressed="${fav}" aria-label="${fav ? 'Remover dos favoritos' : 'Favoritar'}" data-action="toggleFav" data-id="${e.id}">${icon('bookmark', size).replace('fill="none"', fav ? 'fill="currentColor"' : 'fill="none"')}</button>`;

/** Inscrever-se / Cancelar inscrição / Esgotado / Encerrado, e (só no card grande) Adicionar à agenda. */
function actionsRow(e, joined, compact) {
  const blocked = e.ended || (isFull(e) && !joined);
  const label = e.ended ? 'Encerrado' : joined ? 'Cancelar inscrição' : isFull(e) ? 'Esgotado' : 'Inscrever-se';
  const join = cx('c-ev-btn', 'c-ev-btn--join', compact && 'c-ev-btn--compact', joined && !blocked && 'is-joined');
  return `<div class="c-ev-actions">
    <button type="button" class="${join}" ${blocked ? 'disabled' : ''} aria-pressed="${joined}" data-action="toggleJoin" data-id="${e.id}">${label}</button>
    ${compact ? '' : `<button type="button" class="c-ev-btn c-ev-btn--agenda" ${e.ended ? 'disabled' : ''} data-action="addAgenda" data-id="${e.id}">Adicionar à agenda</button>`}
  </div>`;
}

function eventCard(e, state) {
  const joined = state.joined.includes(e.id);
  return `<article class="c-ev-card">
    <div class="c-ev-card__cover c-cover">
      <div class="c-ev-card__flags">
        <div>${e.novo ? pill({ label: 'Novo', color: 'blue', iconName: 'award' }) : ''}</div>
        ${e.ended ? pill({ label: 'Encerrado', color: 'red', iconName: 'x-circle' }) : ''}
      </div>
      <span class="c-cover__title">${esc(e.title)}</span>
      <span class="c-ev-card__fav">${bookmark(e, state.favs.includes(e.id), 16)}</span>
    </div>
    <div class="c-ev-card__body">
      <span class="c-ev-card__date">${icon('calendar', 16)}${esc(e.date)}</span>
      <h3 class="c-ev-card__title">${esc(e.title)}</h3>
      <div class="c-ev-card__row">${tag({ label: e.category, solid: false })}<span class="c-ev-card__place">${icon(modeInfo[e.mode].icon, 16)}${esc(e.place)}</span></div>
      ${slots(e)}
      ${actionsRow(e, joined, false)}
    </div>
  </article>`;
}

function eventCardCompact(e, state) {
  const joined = state.joined.includes(e.id);
  return `<article class="c-ev-card c-ev-card--compact">
    <div class="c-ev-card__cover c-cover"><span class="c-cover__title">${esc(e.title)}</span></div>
    <div class="c-ev-card__body">
      <div class="c-ev-card__head"><h3 class="c-ev-card__title">${esc(e.title)}</h3>${bookmark(e, state.favs.includes(e.id), 12)}</div>
      <span class="c-ev-card__date">${icon('calendar', 10)}30 dez 2026 - 02 jan 2027 · 14:00 - 18:00</span>
      <div class="c-ev-card__bottom">
        <span class="c-ev-card__row">${tag({ label: e.category, size: 'mobile' })}${e.slots === null ? '<span class="c-ev-card__count c-ev-card__count--free">Ilimitadas</span>' : `<b class="c-ev-card__count">${e.taken}/${e.slots}</b>`}</span>
        ${actionsRow(e, joined, true)}
      </div>
    </div>
  </article>`;
}

const skeleton = () => '<div class="c-ev-skeleton"></div>';

/* ---------- Filtros ---------- */
const filterGroups = [
  { key: 'category', title: 'Categoria', options: categoryOptions },
  { key: 'mode', title: 'Tipo de evento', options: modeOptions },
  { key: 'order', title: 'Ordenar por', options: orderOptions },
];

function filterPills(state) {
  const f = state.filters;
  const defaults = defaultEventFilters();
  return [
    ...filterGroups.map(g => pillMenu({ id: g.key, label: labelOf(g.options, f[g.key]), active: f[g.key] !== defaults[g.key], open: state.menu === g.key, content: radioMenu({ filter: g.key, options: g.options, value: f[g.key] }) })),
    `<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaults) ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Bottom sheet de filtros (GroupsSheet do app antigo): um grupo de chips por filtro, contagem e Limpar/Aplicar. */
function filtersSheet(state) {
  const body = filterGroups.map((g, i) => (i ? filterDivider() : '') + singleGroup({ title: g.title, filter: g.key, options: g.options, value: state.draft[g.key] })).join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterEvents(state.tab, state.draft, state.favs).length }), enter: state.fresh });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const list = filterEvents(state.tab, state.filters, state.favs);
  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'favoritos', label: 'Favoritos' },
    { id: 'embreve', label: 'Em breve' },
    { id: 'encerrados', label: 'Encerrados' },
  ].map(t => ({ ...t, count: filterEvents(t.id, state.filters, state.favs).length }));

  let content;
  if (!state.loading && list.length === 0) {
    content = '<div class="c-ev-empty">Nenhum evento encontrado</div>';
  } else {
    const cards = state.loading
      ? range(6, skeleton)
      : list.map(e => (desktop ? eventCard(e, state) : eventCardCompact(e, state))).join('');
    content = `<div class="${cx('c-ev-grid', desktop ? 'c-ev-grid--desktop' : 'c-ev-grid--compact')}">${cards}</div>`;
  }

  return `
    ${menuTop({ title: 'Eventos', tabs, tab: state.tab, filterCount: activeCount(state.filters) })}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    <div data-reveal="content">${content}</div>
    ${state.toast ? `<div class="c-ev-toast" role="status">${esc(state.toast)}</div>` : ''}
    ${state.sheet ? filtersSheet(state) : ''}`;
}

const closeMenu = ctx => ctx.set({ menu: null });

/** Mensagem rápida que some depois de 2,5 s. */
function say(ctx, text) {
  clearTimeout(ctx.toastTimer);
  ctx.set({ toast: text });
  ctx.toastTimer = setTimeout(() => !ctx.destroyed && ctx.set({ toast: null }), 2500);
}

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  toggleFav: (ctx, el) => ctx.set({ favs: flip(ctx.state.favs, Number(el.dataset.id)) }),
  toggleJoin: (ctx, el) => {
    const id = Number(el.dataset.id);
    const was = ctx.state.joined.includes(id);
    ctx.set({ joined: flip(ctx.state.joined, id) });
    say(ctx, was ? 'Inscrição cancelada.' : 'Inscrição confirmada!');
  },
  addAgenda: ctx => say(ctx, 'Evento adicionado à sua agenda (simulação).'),
  clearFilters: ctx => ctx.set({ filters: defaultEventFilters() }),

  // Sheet de filtros (mobile e tablet)
  openFilters: ctx => ctx.set({ sheet: true, draft: { ...ctx.state.filters }, fresh: true }),
  closePanel: ctx => ctx.set({ sheet: false }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: defaultEventFilters() }),
  applyDraft: ctx => ctx.set({ filters: ctx.state.draft, sheet: false }),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => (ctx.state.menu === el.dataset.menu ? closeMenu(ctx) : ctx.set({ menu: el.dataset.menu })),
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),
};

export function mountEvents(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, tab: 'todos', filters: defaultEventFilters(), favs: [1, 5], joined: [], toast: null,
      menu: null, sheet: false, draft: null, fresh: false,
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
