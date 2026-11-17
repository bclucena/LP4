import { createView, onEscape } from './core/view.js';
import { icon } from './core/icons.js';
import { cx, esc } from './core/dom.js';
import { panel } from './components/panel.js';
import { topbar, mobileSearch, sideMenu, navigationBar, menuSections } from './shell/shell.js';
import { stickySide } from './shell/sticky-side.js';
import { bootSkeleton, runBoot } from './shell/boot.js';
import { loadSavedTheme } from './core/theme.js';
import { loadAppearance } from './core/appearance.js';
import { mountProfiles } from './shell/profile.js';
import { mountTweaks } from './shell/tweaks.js';
import { mountCourses } from './screens/courses.js';
import { mountLibrary } from './screens/library.js';
import { mountTeam } from './screens/team/team.js';
import { mountMissions } from './screens/missions.js';
import { mountRanking } from './screens/ranking.js';
import { mountAchievements } from './screens/achievements.js';
import { mountCertificates } from './screens/certificates.js';
import { mountFaq, mountRegulation } from './screens/faq.js';
import { mountStore } from './screens/store.js';
import { mountFeed } from './screens/feed.js';
import { mountEvents } from './screens/events.js';
import { mountExtract } from './screens/extract.js';
import { mountInstallGuide } from './screens/install-guide.js';
import { mountHandoff } from './screens/handoff.js';
import { mountCourseDetail } from './screens/course-detail.js';
import { mountBoard } from './screens/board.js';
import { mountLearningPath } from './screens/learning-path.js';
import { mountActivity } from './screens/activity.js';

/* Mockup navegável: casca do produto (app bar, menu lateral, navigation bar) e a tela da área.
   Endereço: app.html#biblioteca (a página fica no hash, para compartilhar o link). */

/** Telas já portadas para HTML e JS puros. As demais mostram a captura do handoff. */
const screens = {
  cursos: mountCourses,
  biblioteca: mountLibrary,
  time: mountTeam,
  missoes: mountMissions,
  ranking: mountRanking,
  conquistas: mountAchievements,
  certificados: mountCertificates,
  faq: mountFaq,
  regulamento: mountRegulation,
  loja: mountStore,
  feed: mountFeed,
  eventos: mountEvents,
  extrato: mountExtract,
  'instalar-pwa': mountInstallGuide,
  curso: mountCourseDetail,
  tabuleiro: mountBoard,
  rota: mountLearningPath,
  atividade: mountActivity,
};

/** Páginas internas do fluxo de curso: sem menu lateral, busca mobile e navigation bar (a tela traz o próprio cabeçalho no mobile). */
const focusPages = new Set(['curso', 'rota', 'tabuleiro', 'atividade']);
/** Dessas, as que mantêm a app bar e a navigation bar (Curso e Tabuleiro, como no Figma "Curso Classica" e "Curso Ludica"). */
const focusNavPages = new Set(['curso', 'rota', 'tabuleiro']);

const labels = {
  home: 'Home', time: 'Meu time', cursos: 'Cursos', biblioteca: 'Biblioteca', missoes: 'Missões', ranking: 'Rankings',
  conquistas: 'Conquistas', certificados: 'Certificados', loja: 'Loja', feed: 'Feed', eventos: 'Eventos', faq: 'Perguntas frequentes', regulamento: 'Regulamentos', extrato: 'Extrato', 'instalar-pwa': 'Instalar no iPhone',
  curso: 'Curso', rota: 'Rota de aprendizagem', tabuleiro: 'Tabuleiro', atividade: 'Atividades',
};


loadSavedTheme(); // a cor primária escolhida no catálogo vale também aqui
loadAppearance(); // tema (claro, escuro, sistema) e contraste escolhidos no menu do perfil

const shellRoot = document.getElementById('shell');
const overlayRoot = document.getElementById('overlay');
const pageFromHash = () => location.hash.slice(1).split('?')[0] || 'cursos';

let screen = null;
let stopSticky = () => {};
let stopProfiles = () => {};
let loadingTimer = 0;

/* ---------- Casca ---------- */
function shellView(state) {
  // Na navigation bar, as páginas fora de Home, Cursos, Biblioteca e Feed ficam marcadas em "Mais".
  const navActive = focusNavPages.has(state.page) ? 'cursos' : ['home', 'cursos', 'biblioteca', 'feed'].includes(state.page) ? state.page : 'mais';
  return `
    ${topbar()}
    ${mobileSearch()}
    <div class="c-layout">
      <aside class="c-layout__side" data-reveal="menu"><div class="c-sticky-side"><div class="c-sticky-side__inner">${sideMenu(state.page === 'extrato' ? '' : state.page)}</div></div></aside>
      <main class="c-layout__main"><div class="c-layout__inner" id="screen"></div></main>
    </div>
    ${navigationBar(navActive)}`;
}

function mountScreen(ctx) {
  screen?.destroy();
  stopSticky();
  stopSticky = stickySide(ctx.root.querySelector('.c-sticky-side')) ?? (() => {});
  stopProfiles();
  stopProfiles = mountProfiles(ctx.root);
  const { page } = ctx.state;
  if (focusPages.has(page)) shellRoot.dataset.layout = 'focus';
  else delete shellRoot.dataset.layout;
  if (focusNavPages.has(page)) shellRoot.dataset.focusNav = '';
  else delete shellRoot.dataset.focusNav;
  // Atividades: a app bar sobe e some (600ms, css/shell.css). Liga depois de um quadro para animar também na 1ª carga.
  if (page === 'atividade') requestAnimationFrame(() => requestAnimationFrame(() => { if (shell.state.page === 'atividade') shellRoot.dataset.hideTopbar = ''; }));
  else delete shellRoot.dataset.hideTopbar;
  const target = ctx.root.querySelector('#screen');
  const loading = ctx.state.loading;
  const mount = screens[page];
  screen = mount ? mount(target, { loading }) : mountHandoff(target, { id: page, label: labels[page] ?? page, loading });
}

const shell = createView(shellRoot, {
  state: { page: pageFromHash(), loading: true },
  view: shellView,
  breakpoints: [], // a troca entre menu lateral e navigation bar é só CSS
  actions: {
    navigate: (ctx, el) => go(el.dataset.id),
  },
  onRender: mountScreen,
});

/** Troca de tela. O esqueleto aparece só nos componentes da área; app bar, busca, menu e navigation bar ficam fixos. */
function go(id) {
  if (id === 'mais') return openMore();
  closeMore();
  if (id === shell.state.page) return;
  // Links como <a href="#atividade?item=3"> já trocam o hash; só reescreve quando a troca veio de um botão.
  if (pageFromHash() !== id) history.replaceState(null, '', `#${id}`);
  window.scrollTo({ top: 0 });
  shell.state.loading = true;
  shell.set({ page: id });
  clearTimeout(loadingTimer);
  loadingTimer = setTimeout(() => screen?.set({ loading: false }), 900);
}

window.addEventListener('hashchange', () => {
  if (pageFromHash() !== shell.state.page) go(pageFromHash());
});

/* ---------- "Mais" (navigation bar) ----------
   Figma "side menu mobile" (360: 5126:39076; 768: 5106:127140): card flutuante sobre a navigation bar, 8 acima da base,
   8 de margem lateral no mobile e 532 de largura no tablet, raio 24, com o menu inteiro em seções (as mesmas do menu
   lateral) e a página atual em destaque. */
const moreActive = () => (focusNavPages.has(shell.state.page) ? 'cursos' : shell.state.page);

const moreMenu = active => `<nav class="c-more-menu" aria-label="Menu principal">${menuSections.map((s, i) => `<div class="c-more-menu__section">
    ${s.title ? `<div class="c-more-menu__heading"><span>${esc(s.title)}</span><span class="c-more-menu__rule"></span></div>` : i > 0 ? '<div class="c-more-menu__heading"><span class="c-more-menu__rule"></span></div>' : ''}
    ${s.items.map(it => `<button type="button" class="${cx('c-more-menu__item', it.id === active && 'is-active')}" ${it.id === active ? 'aria-current="page"' : ''} data-action="pick" data-id="${it.id}">${icon(it.icon, 16)}${esc(it.label)}</button>`).join('')}
  </div>`).join('')}</nav>`;

const more = createView(overlayRoot, {
  state: { open: false, fresh: false },
  breakpoints: [],
  view: state => (state.open
    ? panel({ mode: 'sheet', label: 'Mais', closeAction: 'closeMore', enter: state.fresh, header: '', body: moreMenu(moreActive()), className: 'c-more-panel' })
    : ''),
  actions: {
    closeMore: () => closeMore(),
    pick: (ctx, el) => go(el.dataset.id),
  },
  onMount: ctx => onEscape(ctx, () => closeMore(), () => ctx.state.open),
});

function openMore() {
  more.set({ open: true, fresh: true });
}

function closeMore() {
  if (more.state.open) more.set({ open: false });
}

/* ---------- Navigation bar: esconde ao rolar para baixo e volta ao rolar para cima ---------- */
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const d = y - lastY;
  if (y <= 0) { delete shellRoot.dataset.nav; lastY = y; }
  else if (d > 6) { shellRoot.dataset.nav = 'hidden'; lastY = y; }
  else if (d < -6) { delete shellRoot.dataset.nav; lastY = y; }
}, { passive: true });

/* ---------- Montagem inicial ---------- */
mountTweaks(document.getElementById('tweaks'));
document.body.insertAdjacentHTML('beforeend', bootSkeleton());
runBoot(shellRoot, () => screen?.set({ loading: false }));
