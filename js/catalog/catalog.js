import { createView } from '../core/view.js';
import { loadSavedTheme } from '../core/theme.js';
import { esc } from '../core/dom.js';
import { soonPage } from './layout.js';
import { colors, typography, spacingPage, effects, fillSwatches } from './pages/foundations.js';
import { buttons, chips, tags, pills, avatars, links, paginations, tooltips, searches, feedbacks, componentActions } from './pages/components.js';
import { icons, iconActions } from './pages/icons.js';
import { themePicker, themeActions, themePage, figmaVsGenerator } from './pages/theme.js';
import { bottomSheets, homeCards, tabsPage, textFields, dropdowns, rankings, mobileInventory, mobileActions } from './pages/mobile.js';
import { productMap, screensPage, layoutPage, coursesPreview, productActions, fitFrames } from './pages/product.js';

/* Catálogo do design system: menu lateral + uma página por item. A página fica no hash (#cores, #buttons,
   #produto-telas?area=cursos), como no catálogo antigo. `soon: true` marca o que ainda não foi portado. */

const groups = [
  {
    title: 'Fundamentos',
    items: [
      { id: 'cores', label: 'Cores', page: colors },
      { id: 'tipografia', label: 'Tipografia', page: typography },
      { id: 'espacamento', label: 'Espaçamento e raio', page: spacingPage },
      { id: 'efeitos', label: 'Efeitos', page: effects },
    ],
  },
  {
    title: 'Produto',
    items: [
      { id: 'produto', label: 'Mapa de produto', page: productMap },
      { id: 'produto-telas', label: 'Telas por área', page: screensPage },
      { id: 'produto-layout', label: 'Layout e responsividade', page: layoutPage },
      { id: 'produto-cursos', label: 'Tela de Cursos (exemplo)', page: coursesPreview },
    ],
  },
  {
    title: 'Tema',
    items: [
      { id: 'tema', label: 'Cor primária', page: themePage },
      { id: 'figma-vs-gerador', label: 'Figma vs gerador', page: figmaVsGenerator },
    ],
  },
  {
    title: 'Componentes',
    items: [
      { id: 'buttons', label: 'Buttons', page: buttons },
      { id: 'chips', label: 'Chips', page: chips },
      { id: 'tags', label: 'Tags', page: tags },
      { id: 'pills', label: 'Pills', page: pills },
      { id: 'avatar', label: 'Avatar', page: avatars },
      { id: 'link', label: 'Link', page: links },
      { id: 'pagination', label: 'Pagination', page: paginations },
      { id: 'tooltips', label: 'Tooltips', page: tooltips },
      { id: 'search', label: 'Search', page: searches },
      { id: 'feedback', label: 'Feedback', page: feedbacks },
      { id: 'icones', label: 'Ícones', page: icons },
    ],
  },
  {
    title: 'Mobile',
    items: [
      { id: 'm-cards', label: 'Cards da home', page: homeCards },
      { id: 'm-sheets', label: 'Bottom sheets', page: bottomSheets },
      { id: 'm-tabs', label: 'Tabs', page: tabsPage },
      { id: 'm-textfield', label: 'Text field', page: textFields },
      { id: 'm-dropdown', label: 'Dropdown', page: dropdowns },
      { id: 'm-ranking', label: 'Ranking', page: rankings },
      { id: 'mobile', label: 'Inventário mobile', page: mobileInventory },
    ],
  },
];

const all = groups.flatMap(g => g.items);
const parse = () => {
  const [id, query = ''] = location.hash.slice(1).split('?');
  return { id: all.some(i => i.id === id) ? id : 'cores', area: new URLSearchParams(query).get('area') };
};

const sideMenu = (current, state) => `<aside class="cat__side">
  <div class="cat__brand"><b>Ludos Pro</b><span>Design System · Figma LP 4.0</span></div>
  ${groups.map(g => `<nav class="cat-nav"><div class="cat-nav__title">${g.title}</div>${g.items.map(i =>
    `<a class="cat-nav__link ${i.id === current ? 'is-active' : ''}" href="#${i.id}">${esc(i.label)}${i.soon ? '<span class="cat-nav__soon">em breve</span>' : ''}</a>`).join('')}</nav>`).join('')}
  <div class="cat-nav"><div class="cat-nav__title">Mockup</div><a class="cat-nav__link" href="app.html#cursos">Telas navegáveis</a></div>
  ${themePicker(state)}
</aside>`;

function view(state) {
  const item = all.find(i => i.id === state.id);
  const body = item.soon ? soonPage(item.label, item.soon) : item.page(state);
  return `<div class="cat">${sideMenu(state.id, state)}<main class="cat__main"><div class="cat__content">${body}</div></main></div>`;
}

const { id, area } = parse();
const primary = loadSavedTheme();

const ctx = createView(document.getElementById('catalog'), {
  state: {
    id, themeHex: primary, themeText: primary, chip: 'Todos', page: 3, iconQ: '', areaId: area ?? 'instalar-pwa', areaFilter: 'todas',
    mfav: {}, mTabA: 'todas', mTabB: 'curtidas', mText: '', mDateA: '', mDateB: '', mDd: {}, mRankPressed: 0, mRankSel: 0,
    sMissionOpen: 'v2', sManagerTab: 'rotas', sReactionTab: 'todas', sComment: '', sCommentEmpty: '',
    previewI: 5, previewCompare: true, previewRun: 0, previewSlow: false,
  },
  view,
  actions: { ...componentActions, ...iconActions, ...productActions, ...themeActions, ...mobileActions },
  breakpoints: [900],
  onRender: c => {
    fillSwatches(c.root);
    fitFrames(c.root);
  },
});

window.addEventListener('hashchange', () => {
  const next = parse();
  const changed = next.id !== ctx.state.id;
  ctx.set({ id: next.id, ...(next.area ? { areaId: next.area } : {}) });
  if (changed) window.scrollTo(0, 0);
});
window.addEventListener('resize', () => fitFrames(ctx.root));
