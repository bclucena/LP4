import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { tag, pill } from '../components/badges.js';
import { panel, sheetFooter } from '../components/panel.js';
import { pillMenu, radioMenu, filterDivider, singleGroup } from '../components/filters.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import { INITIAL_BALANCE, items, categoryOptions, orderOptions, defaultStoreFilters, fmt, filterItems } from '../data/store.js';

/* Loja (handoff 7.Loja, Layout B): itens para trocar por moedas, com banner, saldo, filtros e fluxo de finalizar compra
   (confirmar, comprar, sucesso). O saldo é local da tela e começa em 2.500 moedas. Cards grandes e filtros em pílulas a
   partir de 1180; abaixo, cards compactos e filtros em bottom sheet. */

const DESKTOP = 1180;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const activeCount = f => [f.category !== 'todos', f.order !== 'recentes'].filter(Boolean).length;
const labelOf = (options, id) => options.find(o => o.id === id).label;

/* ---------- Cards ---------- */
const price = (value, small = false) =>
  `<span class="${cx('c-st-price', small && 'c-st-price--small')}">${icon('dollar-sign', small ? 14 : 18)}${fmt(value)}</span>`;

/** Botão "Trocar": desabilitado se o item esgotou ou o saldo não cobre o preço. */
function buyButton(item, balance, compact) {
  const short = !item.soldOut && balance < item.price;
  const title = item.soldOut ? 'Item esgotado' : short ? 'Saldo insuficiente' : 'Trocar por moedas';
  return `<button type="button" class="${cx('c-st-buy', compact && 'c-st-buy--compact')}" ${item.soldOut || short ? 'disabled' : ''} ${compact ? '' : `title="${title}"`} data-action="buy" data-id="${item.id}">Trocar</button>`;
}

function itemCard(item, balance) {
  return `<article class="c-st-card">
    <div class="c-st-card__cover c-cover">
      <div class="c-st-card__flags">
        <div>${item.novo ? pill({ label: 'Novo', color: 'blue', iconName: 'award' }) : ''}</div>
        ${item.soldOut ? pill({ label: 'Esgotado', color: 'red', iconName: 'alert-circle' }) : ''}
      </div>
      <span class="c-cover__title">${esc(item.title)}</span>
    </div>
    <div class="c-st-card__body">
      <span class="c-st-card__kind">${icon('box', 16)}Item único</span>
      <h3 class="c-st-card__title">${esc(item.title)}</h3>
      <div class="c-st-card__tags">${tag({ label: item.category, solid: false })}${tag({ label: '+3', outlined: true })}</div>
      <div class="c-st-card__foot">${price(item.price)}${buyButton(item, balance, false)}</div>
    </div>
  </article>`;
}

function itemCardCompact(item, balance) {
  return `<article class="c-st-card c-st-card--compact">
    <div class="c-st-card__cover c-cover">
      <span class="c-cover__title">${esc(item.title)}</span>
      ${item.soldOut ? '<span class="c-st-card__sold">Esgotado</span>' : ''}
    </div>
    <div class="c-st-card__body">
      <h3 class="c-st-card__title">${esc(item.title)}</h3>
      <span class="c-st-card__kind">${icon('box', 12)}Item único</span>
      <div class="c-st-card__foot">${price(item.price, true)}${buyButton(item, balance, true)}</div>
    </div>
  </article>`;
}

const skeleton = () => '<div class="c-st-skeleton"></div>';

/* ---------- Filtros ---------- */
function filterPills(state) {
  const f = state.filters;
  const open = id => state.menu === id;
  return [
    pillMenu({ id: 'category', label: labelOf(categoryOptions, f.category), active: f.category !== 'todos', open: open('category'), content: radioMenu({ filter: 'category', options: categoryOptions, value: f.category }) }),
    pillMenu({ id: 'order', label: labelOf(orderOptions, f.order), active: f.order !== 'recentes', open: open('order'), content: radioMenu({ filter: 'order', options: orderOptions, value: f.order }) }),
    `<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaultStoreFilters()) ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Bottom sheet de filtros (GroupsSheet do app antigo): um grupo de chips por filtro, contagem e Limpar/Aplicar. */
function filtersSheet(state) {
  const d = state.draft;
  const body = [
    singleGroup({ title: 'Categoria', filter: 'category', options: categoryOptions, value: d.category }),
    filterDivider(),
    singleGroup({ title: 'Ordenar por', filter: 'order', options: orderOptions, value: d.order }),
  ].join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterItems(d).length }), enter: state.fresh });
}

/* ---------- Finalizar compra ---------- */
/** Centralizado no desktop, bottom sheet abaixo de 1180. Confirmar debita as moedas e mostra o sucesso. */
function checkout(state, desktop) {
  const item = items.find(i => i.id === state.buying);
  const done = state.done;
  const body = done
    ? `<div class="c-st-done">
        ${icon('check-circle', 40, 'c-st-done__icon')}
        <b>${esc(item.title)}</b>
        <span>Item trocado. Seu novo saldo é de <b>${fmt(state.balance)}</b> moedas.</span>
      </div>`
    : `<div class="c-st-order">
        <div class="c-st-order__cover c-cover"></div>
        <div class="c-st-order__info"><b>${esc(item.title)}</b><span>${esc(item.category)} · Item único</span></div>
      </div>
      <dl class="c-st-sum">
        <div><dt>Seu saldo</dt><dd>${fmt(state.balance)}</dd></div>
        <div><dt>Preço</dt><dd>- ${fmt(item.price)}</dd></div>
        <div class="c-st-sum__total"><dt>Saldo após a troca</dt><dd>${fmt(state.balance - item.price)}</dd></div>
      </dl>`;
  const buttons = done
    ? '<button type="button" class="c-st-btn c-st-btn--primary" data-action="closeCheckout">Fechar</button>'
    : `<button type="button" class="c-st-btn c-st-btn--stroked" data-action="closeCheckout">Cancelar</button>
       <button type="button" class="c-st-btn c-st-btn--primary" data-action="confirmBuy">Confirmar troca</button>`;
  return `<div class="c-st-checkout" role="dialog" aria-modal="true" aria-label="Finalizar compra">
    <div class="c-st-checkout__scrim" data-action="closeCheckout"></div>
    <div class="${cx('c-st-checkout__box', desktop ? 'c-st-checkout__box--center' : 'c-st-checkout__box--sheet')}">
      <div class="c-st-checkout__head"><b>${done ? 'Compra realizada' : 'Finalizar compra'}</b><button type="button" class="c-st-checkout__close" aria-label="Fechar" data-action="closeCheckout">${icon('x', 18)}</button></div>
      ${body}
      <div class="c-st-checkout__buttons">${buttons}</div>
    </div>
  </div>`;
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const list = filterItems(state.filters);

  let content;
  if (!state.loading && list.length === 0) {
    content = '<div class="c-st-empty">Nenhum item encontrado</div>';
  } else {
    const cards = state.loading
      ? range(6, skeleton)
      : list.map(it => (desktop ? itemCard(it, state.balance) : itemCardCompact(it, state.balance))).join('');
    content = `<div class="${cx('c-st-grid', desktop ? 'c-st-grid--desktop' : 'c-st-grid--compact')}">${cards}</div>`;
  }

  return `
    ${menuTop({ title: 'Loja', filterCount: activeCount(state.filters) })}
    <div class="c-st-banner" data-reveal="menu"><h2>Troque suas moedas por recompensas</h2></div>
    <div class="c-st-balance" data-reveal="menu"><span>Seu saldo</span>${price(state.balance)}</div>
    <div class="c-st-filters">${menuHeader({ filters: filterPills(state) })}</div>
    <div data-reveal="content">${content}</div>
    ${state.buying !== null ? checkout(state, desktop) : ''}
    ${state.sheet ? filtersSheet(state) : ''}`;
}

const closeMenu = ctx => ctx.set({ menu: null });

const actions = {
  clearFilters: ctx => ctx.set({ filters: defaultStoreFilters() }),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => (ctx.state.menu === el.dataset.menu ? closeMenu(ctx) : ctx.set({ menu: el.dataset.menu })),
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),

  // Sheet de filtros (mobile e tablet)
  openFilters: ctx => ctx.set({ sheet: true, draft: { ...ctx.state.filters }, fresh: true }),
  closePanel: ctx => ctx.set({ sheet: false }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: defaultStoreFilters() }),
  applyDraft: ctx => ctx.set({ filters: ctx.state.draft, sheet: false }),

  // Finalizar compra
  buy: (ctx, el) => ctx.set({ buying: Number(el.dataset.id), done: false }),
  confirmBuy: ctx => {
    const item = items.find(i => i.id === ctx.state.buying);
    ctx.set({ balance: ctx.state.balance - item.price, done: true });
  },
  closeCheckout: ctx => ctx.set({ buying: null, done: false }),
};

export function mountStore(root, { loading = true } = {}) {
  return createView(root, {
    state: { loading, filters: defaultStoreFilters(), balance: INITIAL_BALANCE, buying: null, done: false, menu: null, sheet: false, draft: null, fresh: false },
    view,
    actions,
    breakpoints: [768, 1000, 1180],
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => closeMenu(ctx), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false, buying: null, done: false }), () => ctx.state.sheet || ctx.state.buying !== null);
    },
  });
}
