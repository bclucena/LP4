import { cx, esc, norm } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { categories, subcategories } from '../data/filters.js';

/* Filtros das listas: pílula com popover (desktop) e chips do bottom sheet (mobile).
   Tudo é marcação; o estado (menu aberto, categoria, rascunho do sheet) fica na tela que usa. Handlers esperados na tela:
   toggleMenu (data-menu), pick (data-filter, data-value), pickCategory, pickSubcategory, toggleDraftChip etc. */

/* ---------- Dropdowns do desktop (248 de largura, radius 2xl) ---------- */

const radioMark = on => `<span class="c-mark c-mark--radio ${on ? 'is-on' : ''}">${on ? '<span class="c-mark__dot"></span>' : ''}</span>`;
const checkMark = on => `<span class="c-mark c-mark--check ${on ? 'is-on' : ''}">${on ? '<span class="c-mark__dot"></span>' : ''}</span>`;

function menuRow({ label, on, kind, chevron = false, action, data = {} }) {
  const dataAttrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  return `<button type="button" role="${kind === 'radio' ? 'menuitemradio' : 'menuitemcheckbox'}" aria-checked="${on}" class="${cx('c-menu-row', on && 'is-on')}" data-action="${action}" ${dataAttrs}>
    ${kind === 'radio' ? radioMark(on) : checkMark(on)}
    <span class="c-menu-row__label">${esc(label)}</span>
    ${chevron ? icon('chevron-right', 18, 'c-menu-row__chevron') : ''}
  </button>`;
}

/** Pílula com seta que abre um popover. `open` vem do estado da tela; `content` é o HTML do menu (só usado quando aberto). */
export function pillMenu({ id, label, active = false, open = false, content = '' }) {
  return `<span class="c-pill-menu" data-popover>
    <span class="${cx('c-pill-menu__split', active && 'is-active')}">
      <button type="button" class="c-pill-menu__label" aria-haspopup="menu" aria-expanded="${open}" data-action="toggleMenu" data-menu="${id}">${esc(label)}</button>
      <span class="c-pill-menu__divider"></span>
      <button type="button" class="c-pill-menu__caret" aria-label="Abrir ${esc(label)}" aria-expanded="${open}" data-action="toggleMenu" data-menu="${id}">${icon('chevron-down', 18, cx(open && 'is-open'))}</button>
    </span>
    ${open ? `<div class="c-pill-menu__popover">${content}</div>` : ''}
  </span>`;
}

/** Lista de escolha única. Cada linha dispara o handler `pick` com data-filter e data-value. */
export const radioMenu = ({ filter, options, value }) =>
  `<div role="menu" class="c-menu c-menu--padded">${options.map(o => menuRow({ label: o.label, on: o.id === value, kind: 'radio', action: 'pick', data: { filter, value: o.id } })).join('')}</div>`;

/**
 * Categorias com subcategorias em um painel que desliza.
 * value: { cat, subs }; view: null (categorias) ou o nome da categoria aberta; q: texto da busca; slide: 'in' | 'out' | '' (animação, só na troca de painel).
 */
export function categoryMenu({ value, view = null, q = '', slide = '' }) {
  const list = categories.filter(c => norm(c).includes(norm(q.trim())));
  const subs = view ? subcategories[view] ?? [] : [];
  const root = `<div class="c-category__panel" ${view ? 'aria-hidden="true"' : ''}>
    <div class="c-category__search"><input class="c-category__input" data-key="category-search" data-input="categorySearch" value="${esc(q)}" placeholder="Buscar categoria..." ${view ? 'tabindex="-1"' : ''} /></div>
    <div role="menu" class="c-category__list u-thin-scroll">
      ${q ? '' : menuRow({ label: 'Todas as categorias', on: !value.cat, kind: 'radio', chevron: true, action: 'pickCategory', data: { value: '' } })}
      ${list.map(c => menuRow({ label: c, on: value.cat === c, kind: 'radio', chevron: !!subcategories[c], action: 'pickCategory', data: { value: c } })).join('')}
      ${list.length === 0 ? '<p class="c-category__empty">Nenhuma categoria encontrada.</p>' : ''}
    </div>
  </div>`;
  const sub = `<div class="c-category__panel c-category__panel--sub" ${view ? '' : 'aria-hidden="true"'}>
    <button type="button" class="c-category__back" ${view ? '' : 'tabindex="-1"'} data-action="categoryBack">${icon('chevron-left', 18)}${esc(view ?? '')}</button>
    <div role="menu" class="c-category__subs">
      ${menuRow({ label: 'Todas as subcategorias', on: value.cat === view && value.subs.length === 0, kind: 'check', action: 'pickSubcategory', data: { value: '' } })}
      ${subs.map(s => menuRow({ label: s, on: value.cat === view && value.subs.includes(s), kind: 'check', action: 'pickSubcategory', data: { value: s } })).join('')}
    </div>
  </div>`;
  return `<div class="c-menu c-category"><div class="${cx('c-category__track', view && 'is-sub', slide && `is-sliding-${slide}`)}">${root}${sub}</div></div>`;
}

/* ---------- Chips do bottom sheet de filtros (mobile) ---------- */

/** Chip de filtro. `check` mostra o visto quando marcado; `badge` é o contador; `caret` indica subnível. */
export function chip({ label, on = false, check = false, badge, caret = false, action, data = {} }) {
  const dataAttrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  return `<button type="button" class="${cx('c-chip', on && 'is-on')}" aria-pressed="${on}" data-action="${action}" ${dataAttrs}>
    ${check && on ? icon('check', 16, 'c-chip__check') : ''}
    <span class="c-chip__label">${esc(label)}${badge ? `<span class="c-chip__badge">${badge}</span>` : ''}</span>
    ${caret ? icon('chevron-down', 16, 'c-chip__caret') : ''}
  </button>`;
}

export const filterGroup = (title, body) => `<section class="c-filter-group"><h3 class="c-filter-group__title">${esc(title)}</h3>${body}</section>`;

export const filterDivider = () => '<div class="c-filter-divider"></div>';

/** Grupo de chips de escolha única. Cada chip dispara `pickDraft` com data-filter e data-value. */
export const singleGroup = ({ title, filter, options, value }) =>
  filterGroup(title, `<div class="c-chips">${options.map(o => chip({ label: o.label, on: o.id === value, action: 'pickDraft', data: { filter, value: o.id } })).join('')}</div>`);

/** Categorias em chips; a categoria aberta ganha uma faixa de subcategorias logo abaixo da linha dela, com uma seta no chip. */
export function categoryGroup({ value, open }) {
  const all = ['Todas as categorias', ...categories];
  const chips = all.map(c => {
    const on = c === 'Todas as categorias' ? !value.cat : value.cat === c;
    const hasSubs = !!subcategories[c];
    return chip({ label: c, on, badge: on && hasSubs ? value.subs.length : undefined, caret: on && hasSubs, action: 'pickDraftCategory', data: { value: c === 'Todas as categorias' ? '' : c } });
  });
  const strip = open && subcategories[open]
    ? `<div class="c-subchips" data-sub-strip="${esc(open)}"><span class="c-subchips__beak" aria-hidden="true"></span><div class="c-subchips__list">${subcategories[open].map(s => chip({ label: s, on: value.subs.includes(s), check: true, action: 'pickDraftSub', data: { value: s } })).join('')}</div></div>`
    : '';
  return filterGroup('Categoria', `<div class="c-chips c-chips--categories" data-chips="categories">${chips.join('')}${strip}</div>`);
}

/**
 * Encaixa a faixa de subcategorias depois do último chip da linha da categoria aberta e aponta a seta para esse chip.
 * Precisa de medidas do navegador, por isso roda depois de cada renderização (passe em `onRender`).
 */
export function layoutSubStrip(root) {
  const strip = root.querySelector('[data-sub-strip]');
  if (!strip) return;
  const box = strip.parentElement;
  const open = strip.dataset.subStrip;
  const chips = [...box.querySelectorAll(':scope > .c-chip')];
  const current = chips.find(el => el.dataset.value === open);
  if (!current) return;
  const row = chips.filter(el => el.offsetTop === current.offsetTop);
  row[row.length - 1].after(strip);
  strip.querySelector('.c-subchips__beak').style.left = `${current.offsetLeft + current.offsetWidth / 2 - 5}px`;
}
