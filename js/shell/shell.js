import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { avatar } from '../components/avatar.js';

/* Casca do produto (handoff): app bar (44 no mobile, 64 a partir de 768), menu lateral a partir de 1180 (lg) e
   navigation bar abaixo de 1180. A troca entre elas é só CSS (css/shell.css); aqui só há marcação.
   Larguras do menu lateral: 240 (lg), 272 (xl) e 306 (2xl). */

/** Logo nas duas versões; o CSS (base.css) mostra a do tema atual (texto escuro no claro, texto claro no escuro). */
export const logo = (className = '') =>
  `<img class="${cx('c-logo c-logo--on-light', className)}" src="assets/brand/logo-lp.svg" alt="Ludos Pro" /><img class="${cx('c-logo c-logo--on-dark', className)}" src="assets/brand/logo-lp-dark.svg" alt="Ludos Pro" />`;

/* ---------- App bar ---------- */
/** Lugar da pílula do perfil: o menu (js/components/profile-menu.js) é montado aqui pela casca (js/app.js), com estado próprio. */
const profileSlot = small => `<div class="c-profile-slot" data-profile-slot="${small ? 'mobile' : 'desk'}"></div>`;

const topbarIcon = (name, label, small) =>
  `<button type="button" class="${cx('c-icon-button', small && 'c-icon-button--small')}" aria-label="${label}">${icon(name, small ? 16 : 18)}</button>`;

export const topbar = () => `<header class="c-topbar" data-reveal="appbar">
  <div class="c-topbar__mobile">
    <button type="button" aria-label="Home" data-action="navigate" data-id="home">${logo('c-logo--mobile')}</button>
    <div class="c-topbar__actions">${topbarIcon('bell', 'Notificações', true)}${profileSlot(true)}</div>
  </div>
  <div class="c-topbar__desk">
    <button type="button" aria-label="Home" data-action="navigate" data-id="home">${logo('c-logo--desk')}</button>
    <div class="c-topbar__tools">
      <label class="c-search">${icon('search', 18)}<input placeholder="Buscar cursos, trilhas, missões…" /></label>
      <div class="c-topbar__actions">${topbarIcon('bell', 'Notificações')}${topbarIcon('message-square', 'Mensagens')}</div>
      ${profileSlot(false)}
    </div>
  </div>
</header>`;

/** Busca do mobile: fica no fluxo, abaixo da app bar; ao rolar passa por baixo dela. */
export const mobileSearch = () => `<div class="c-mobile-search" data-reveal="search"><label class="c-mobile-search__field">${icon('search', 16)}<input placeholder="Buscar cursos, trilhas, missões…" /></label></div>`;

/* ---------- Menu lateral (a partir de 1180) ---------- */
/** Seções do menu: as mesmas no menu lateral (desktop) e no card do "Mais" no tablet (Figma "side menu mobile"). */
export const menuSections = [
  { items: [{ id: 'home', label: 'Home', icon: 'home' }, { id: 'time', label: 'Meu time', icon: 'users' }] },
  { title: 'Aprendizado', items: [{ id: 'cursos', label: 'Cursos', icon: 'book-open' }, { id: 'biblioteca', label: 'Biblioteca', icon: 'file-text' }] },
  { title: 'Engajamento', items: [{ id: 'missoes', label: 'Missões', icon: 'target' }, { id: 'ranking', label: 'Rankings', icon: 'bar-chart-2' }] },
  { title: 'Recompensas', items: [{ id: 'conquistas', label: 'Conquistas', icon: 'award' }, { id: 'certificados', label: 'Certificados', icon: 'check-circle' }, { id: 'loja', label: 'Loja', icon: 'shopping-bag' }] },
  { title: 'Social', items: [{ id: 'feed', label: 'Feed', icon: 'globe' }, { id: 'eventos', label: 'Eventos', icon: 'calendar' }] },
  { items: [{ id: 'faq', label: 'Perguntas frequentes', icon: 'help-circle' }] },
];

export const sideMenu = active => `<nav class="c-side-menu" aria-label="Menu principal" data-reveal="menu">
  <div class="c-side-menu__hero">
    <div class="c-side-menu__avatar">
      <span class="c-side-menu__avatar-ring">${avatar({ size: 'large', use: 'illustration', px: 96 })}</span>
      <span class="c-side-menu__level">Nv.2</span>
    </div>
    <div class="c-side-menu__who"><span class="c-side-menu__name">Mariana Santana</span><span class="c-side-menu__role">Consultora de Vendas Sênior</span></div>
  </div>
  <div class="c-side-menu__progress-wrap">
    <div class="c-side-menu__progress">
      <div class="c-side-menu__points"><span>1.435 pts</span><span>3.000 pts</span></div>
      <div class="c-side-menu__bar"><div class="c-side-menu__bar-fill"></div><span class="c-side-menu__bar-badge">50%</span></div>
      <div class="c-side-menu__level-line"><b>Nível 2</b><span class="c-dot"></span><span>Especialista II</span></div>
    </div>
  </div>
  <div class="c-side-menu__body">
    <div class="c-side-menu__wallet">
      <div class="c-side-menu__wallet-row">
        <span class="c-wallet c-wallet--points">${icon('star', 18, 'c-wallet__icon')}100</span>
        <span class="c-wallet c-wallet--coins">${icon('dollar-sign', 18, 'c-wallet__icon')}100</span>
      </div>
      <a href="#" class="c-link" data-action="navigate" data-id="extrato">Ver extrato ${icon('arrow-right', 18)}</a>
    </div>
    <div class="c-side-menu__sections">
      ${menuSections.map((s, i) => `<div class="c-side-menu__section">
        ${s.title ? `<div class="c-side-menu__heading"><span>${s.title}</span><span class="c-side-menu__rule"></span></div>` : i > 0 ? '<div class="c-side-menu__heading"><span class="c-side-menu__rule"></span></div>' : ''}
        ${s.items.map(it => `<button type="button" class="${cx('c-side-menu__item', it.id === active && 'is-active')}" ${it.id === active ? 'aria-current="page"' : ''} data-action="navigate" data-id="${it.id}">${icon(it.icon, 18)}${esc(it.label)}</button>`).join('')}
      </div>`).join('')}
    </div>
  </div>
</nav>`;

/* ---------- Navigation bar (abaixo de 1180) ---------- */
const navItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'cursos', label: 'Cursos', icon: 'book-open' },
  { id: 'biblioteca', label: 'Biblioteca', icon: 'file-text' },
  { id: 'feed', label: 'Feed', icon: 'globe' },
  { id: 'mais', label: 'Mais', icon: 'list' },
];

export const navigationBar = active => `<div class="c-nav" data-reveal="nav">
  <nav class="c-nav__bar" aria-label="Navegação">
    ${navItems.map(it => `<button type="button" class="${cx('c-nav__item', it.id === active && 'is-active')}" ${it.id === active ? 'aria-current="page"' : ''} data-action="navigate" data-id="${it.id}">
      <span class="c-nav__icon">${icon(it.icon, 16)}${it.id === 'mais' ? '<span class="c-nav__dot"></span>' : ''}</span>${it.label}
    </button>`).join('')}
  </nav>
</div>`;

/* ---------- Menu top (mobile e tablet) e menu header (desktop) ---------- */

const tabBadge = (n, active) => `<span class="${cx('c-tab-badge', active && 'is-active')}">${n}</span>`;

/** Aba de filtro rápido (Todos, Favoritos...). Dispara `setTab` com data-id. */
export const tabButton = (t, active) =>
  `<button type="button" class="${cx('c-tab', active && 'is-active')}" aria-pressed="${active}" data-action="setTab" data-id="${t.id}">${esc(t.label)}${tabBadge(t.count, active)}</button>`;

/**
 * Barra do mobile e do tablet (some a partir de 1180): título, botão de filtro (abre o sheet) e abas.
 * Dispara `openFilters` no botão; `filterLabel` e `filterCount` mostram o que está ativo.
 */
export const menuTop = ({ title, tabs = [], tab, filterLabel = 'Filtro', filterCount = 0, withFilter = true }) => `<div class="c-menu-top" data-reveal="menu">
  <h1 class="c-menu-top__title">${esc(title)}</h1>
  ${!withFilter && !tabs.length ? '' : `<div class="c-menu-top__row u-hide-scroll" data-scroll-key="menu-top">
    ${withFilter ? `<button type="button" class="c-menu-top__filter" aria-haspopup="dialog" data-action="openFilters">${icon('filter', 16)} ${esc(filterLabel)}${filterCount > 0 ? tabBadge(filterCount, true) : ''}</button>${tabs.length ? '<span class="c-menu-top__sep"></span>' : ''}` : ''}
    ${tabs.map(t => tabButton(t, t.id === tab)).join('')}
  </div>`}
</div>`;

/** Cartão de filtros do desktop (a partir de 1180): abas e, abaixo, "FILTROS" com os dropdowns. */
export const menuHeader = ({ tabs = [], tab, filters }) => `<div class="c-menu-header" data-reveal="menu">
  ${tabs.length ? `<div class="c-menu-header__tabs">${tabs.map(t => tabButton(t, t.id === tab)).join('')}</div><div class="c-menu-header__rule"></div>` : ''}
  <div class="c-menu-header__filters"><span class="c-menu-header__label">FILTROS</span>${filters}</div>
</div>`;
