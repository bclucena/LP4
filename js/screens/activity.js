import { createView } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { cx } from '../core/dom.js';
import { buttonIcon } from '../components/button.js';
import { sfx, soundOn, setSound } from '../core/sound.js';
import { START, EXAM_ID, activityGroups, activityModules } from '../data/activity.js';
import { statusForState, firstOpen, nextOpen, defaultFooter, statusOf, ORDER, fx } from './activity/flow.js';
import { mobileHeader, trail, trailSheet, moreSheet, hud, footer, exitDialog, finalDialog, explainDialog, skeleton } from './activity/parts.js';
import { leavePanel } from '../components/panel.js';
import quiz, { quizSupportMech } from './activity/quiz.js';
import { slidesMech, trackScroll } from './activity/reading.js';
import wordSearch from './activity/word-search.js';
import hangman from './activity/hangman.js';
import memory from './activity/memory.js';
import mix from './activity/mix.js';
import place from './activity/place.js';
import order from './activity/order.js';
import puzzle from './activity/puzzle.js';
import spot from './activity/spot.js';
import thisOrThat from './activity/this-or-that.js';
import { pollMech, openMech } from './activity/poll.js';
import mosaic from './activity/mosaic.js';
import exam from './activity/exam.js';
import { hasIntro, introView, introClose, introFooter } from './activity/intro.js';

/* Atividades (fluxo ludos-pro-fluxo, Atividade-Quiz-v2.dc.html): menu de atividades com a capa do curso, barra de desempenho
   (progresso, tempo, sequência, vidas e pontos), a mecânica da vez e o rodapé "Continuar".
   - A partir de 1024 o menu fica fixo à esquerda (pode ser guardado); abaixo, vira um card recolhível acima da barra.
   - Abaixo de 768 a app bar da casca some e a tela traz o próprio cabeçalho (Voltar, logo e avatar).
   - Cada mecânica fica em ./activity/<mecânica>.js e expõe { id, key, init, view, actions, footer, pct, ... }.
   - Ao entrar na tela, a atividade abre pela apresentação (./activity/intro.js): app bar visível, sem menu e sem barra; "Iniciar"
     entra na mecânica. Trocar de atividade pelo menu vai direto para a mecânica.
   - Abrir uma atividade direto: #atividade?item=<id> (ids em js/data/activity.js). Avaliação já confirmada (diálogo do Curso
     e do Tabuleiro): #atividade?item=15&iniciar=1 abre com as questões.
   Tweaks (js/data/tweaks.js, no endereço): estado=andamento|concluido|liberado (estado
   da trilha; liberado = todas abrem; o antigo desbloquear=1 vale como liberado),
   tipografia=b (Versão B, tamanhos encaixados na escala do design system), e apoio=0 (Ordenadinho sem imagem de
   apoio). O conteúdo das mecânicas fica sem card (c-act--flat) por padrão; o tweak "Conteúdo em card" saiu. Ficam em state.tw; trocar um tweak não mexe no progresso. */

const SIDE = 1024;

const MECHS = [quiz, quizSupportMech, slidesMech, wordSearch, hangman, memory, mix, place, order, puzzle, spot, thisOrThat, pollMech, openMech, mosaic, exam];
const byId = Object.fromEntries(MECHS.map(m => [m.id, m]));

const hashParams = () => new URLSearchParams(location.hash.split('?')[1] ?? '');
const itemFromHash = () => Number(hashParams().get('item')) || null;

/** Tweaks lidos do endereço (sem parâmetro = padrão, que é a tela original). */
function tweaksFromHash() {
  const p = hashParams();
  return {
    // Estado da trilha (tweak): nao-iniciado (padrão), andamento, concluido ou liberado. desbloquear=1 (link antigo) = liberado.
    estado: ['andamento', 'concluido', 'liberado'].includes(p.get('estado')) ? p.get('estado') : p.get('desbloquear') === '1' ? 'liberado' : 'nao-iniciado',
    unlock: p.get('estado') === 'liberado' || p.get('desbloquear') === '1',
    type: ['b', 'c'].includes(p.get('tipografia')) ? p.get('tipografia') : 'a', // c = LP 4.0 (a B mais os ajustes do Figma)
    card: false, // padrão: conteúdo sem card (o tweak saiu)
    apoio: p.get('apoio') !== '0',
  };
}

/** Abre a atividade `id` vinda do link (#atividade?item=3), liberando-a mesmo que esteja bloqueada. */
function withItem(state, id) {
  if (!byId[id]) return state;
  const status = { ...state.status };
  for (const k of ORDER) if (status[k] === 'current') status[k] = 'available';
  if (status[id] !== 'done') status[id] = 'current';
  return { ...state, view: id, status, justDone: null };
}

function initialState(loading) {
  const tw = tweaksFromHash();
  const status = statusForState(tw.estado);
  const state = {
    loading, view: firstOpen(status), status, justDone: null,
    xp: START.xp, coins: START.coins, lives: START.lives, streak: 0, gain: null, gainFrom: null,
    hidden: false, trailOpen: false, closed: {}, search: { open: false, q: '' },
    exit: false, finalAsk: false, finalText: '', fx: {}, tw, intro: false, explain: null,
  };
  MECHS.forEach(m => { state[m.key] = m.init(); });
  const item = itemFromHash();
  state.intro = hasIntro(state.view);
  state.closed = closedExceptCurrent(state.view);
  if (!item) return state;
  const next = withItem(state, item);
  next.intro = hasIntro(next.view);
  next.closed = closedExceptCurrent(next.view);
  // Vindo do diálogo da avaliação do Curso ou do Tabuleiro (já confirmada): #atividade?item=15&iniciar=1 começa direto.
  if (item === EXAM_ID && hashParams().get('iniciar') === '1') next.exam = { ...next.exam, started: true, tries: next.exam.tries + 1 };
  return next;
}

/** Menu de atividades ao entrar na tela (25/11/2026; desktop e mobile): só a atividade atual aberta, as demais fechadas. A atual
    é a do link (?atv=n, vindo do Curso ou do Tabuleiro) ou, sem ele, a primeira atividade que tem a mecânica aberta. */
function closedExceptCurrent(view) {
  const atv = hashParams().get('atv');
  const current = (atv !== null && activityGroups[Number(atv)]) || activityGroups.find(g => g.ids.includes(view));
  // Módulos (cards do menu, chave "m<n>"): só o módulo da atividade atual aberto.
  const mods = activityModules.map((m, i) => [`m${i}`, !current || !m.groups.includes(current.key)]).filter(([, shut]) => shut);
  return Object.fromEntries([...activityGroups.filter(g => g !== current).map(g => [g.key, true]), ...mods]);
}

/** Percentual de cada atividade no menu (0–95 enquanto não conclui; 100 concluída). */
const pctFor = state => id => (state.status[id] === 'done' ? 100 : Math.max(0, Math.min(95, Math.round(byId[id].pct(state) * 100))));

/* ---------- Tela ---------- */
function view(state, ctx) {
  const side = minWidth(SIDE);
  if (state.loading) return skeleton(side);
  const mech = byId[state.view];
  if (state.intro) return introScreen(state, side);
  const base = mech.footer(state) ?? defaultFooter(state);
  // Ajudas da mecânica (Dica, Recomeçar, Limpar…) no rodapé, ao lado do Continuar.
  const aux = mech.aux?.(state);
  const f = aux?.length ? { ...base, aux } : base;
  // Explicação aberta só para a resposta da vez: a chave muda na próxima pergunta e o painel fecha sozinho.
  const explain = !!f.feedback?.text && state.explain === explainKey(state, f);
  const handle = side
    ? buttonIcon({ name: 'chevrons-left', label: state.hidden ? 'Mostrar trilha' : 'Guardar trilha', action: 'toggleSide', className: 'c-act-sidetoggle', attrs: { 'aria-expanded': String(!state.hidden) } })
    : '';
  const tw = state.tw;
  return `<div class="${cx('c-act', side && 'c-act--side', side && state.hidden && 'is-collapsed', tw.type !== 'a' && 'c-act--type-b', tw.type === 'c' && 'c-act--type-c', !tw.card && 'c-act--flat', fx(state, 'enter') && 'is-enter')}" data-reveal="content">
    ${mobileHeader()}
    ${side ? `<div class="c-act__side">${handle}<div class="c-act__side-clip">${trail(state, { side, pctOf: pctFor(state) })}</div></div>` : ''}
    <div class="c-act__main">
      <div class="c-act__body">
        ${hud(state, { side, elapsed: mech.elapsed?.(state) ?? null, timer: mech.timer?.(state) ?? null })}
        <div class="c-act__content" data-act="${mech.key}">${mech.view(state, ctx)}</div>
      </div>
      ${footer(f, { explain })}
    </div>
    ${state.exit ? exitDialog(state) : ''}
    ${state.finalAsk ? finalDialog(state) : ''}
    ${explain ? explainDialog(f, fx(state, 'dialog')) : ''}
    ${side ? '' : trailSheet(state, { pctOf: pctFor(state) })}
    ${side ? '' : moreSheet(state)}
  </div>`;
}

/** Chave da explicação da resposta atual (atividade + texto). */
const explainKey = (state, f) => `${state.view}|${f.feedback?.text ?? ''}`;

/** Apresentação da atividade: sem menu e sem barra de desempenho; o rodapé traz "Iniciar". */
function introScreen(state, side) {
  const tw = state.tw;
  return `<div class="${cx('c-act c-act--intro', side && 'c-act--side', tw.type !== 'a' && 'c-act--type-b', tw.type === 'c' && 'c-act--type-c', 'c-act--flat')}" data-reveal="content">
    ${mobileHeader()}
    <div class="c-act__main">
      <div class="c-act__body">
        ${introClose()}
        <div class="c-act__content" data-act="intro">${introView(state)}</div>
      </div>
      ${footer(introFooter)}
    </div>
  </div>`;
}

/* Abrir e fechar uma atividade do menu com animação (25/11/2026; desktop e mobile, no menu lateral e no bottom sheet). A tela é
   refeita a cada set, então a animação fica em volta do set (como os módulos da página Curso):
   - fechar: a lista da atividade encolhe até 0 e some e o chevron gira de volta (de "para cima" a "para baixo"); no fim, o set;
   - abrir: o set; a lista cresce de 0 até a altura dela, as linhas entram em sequência e o chevron gira meia volta.
   Um clique durante a animação é ignorado. Com movimento reduzido, troca direto. */
const GROUP_OPEN_MS = 300;
const GROUP_CLOSE_MS = 240;
const GROUP_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

function groupParts(ctx, key) {
  // Grupo (atividade) ou módulo: o conteúdo é o elemento logo depois do cabeçalho.
  const head = [...ctx.root.querySelectorAll('[data-action="toggleGroup"]')].find(h => h.dataset.id === key);
  return { items: head?.nextElementSibling, caret: head?.querySelector('.c-act-group__caret') };
}

function toggleGroup(ctx, key) {
  if (ctx.groupAnimating) return;
  const closing = !ctx.state.closed[key];
  const next = () => ctx.set({ closed: { ...ctx.state.closed, [key]: closing } });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { next(); return; }
  ctx.groupAnimating = true;
  if (closing) {
    const { items, caret } = groupParts(ctx, key);
    caret?.animate([{ transform: 'rotate(180deg)' }, { transform: 'rotate(0deg)' }], { duration: GROUP_CLOSE_MS, easing: GROUP_EASE, fill: 'forwards' });
    if (items) {
      items.style.overflow = 'hidden';
      items.animate([{ height: `${items.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: GROUP_CLOSE_MS, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
    }
    // Por timer: com a aba em segundo plano as animações param, mas a atividade fecha do mesmo jeito.
    setTimeout(() => { ctx.groupAnimating = false; if (!ctx.destroyed) next(); }, GROUP_CLOSE_MS);
    return;
  }
  next();
  const { items, caret } = groupParts(ctx, key);
  caret?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }], { duration: GROUP_OPEN_MS, easing: GROUP_EASE });
  if (items) {
    items.style.overflow = 'hidden';
    items.animate([{ height: '0px', opacity: 0 }, { height: `${items.scrollHeight}px`, opacity: 1 }], { duration: GROUP_OPEN_MS, easing: GROUP_EASE })
      .finished.then(() => { items.style.overflow = ''; }, () => {});
    [...items.children].forEach((row, j) => row.animate(
      [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
      { duration: 220, delay: 50 + Math.min(j, 10) * 25, easing: 'ease-out', fill: 'backwards' }));
  }
  setTimeout(() => { ctx.groupAnimating = false; }, GROUP_OPEN_MS);
}

/** Sai da apresentação para a mecânica, em dois tempos (25/11/2026):
    1. saída (START_LEAVE_MS): a app bar sobe e some (data-hide-topbar, 600ms em css/shell.css) e, ao mesmo tempo, as informações
       da apresentação somem subindo e o rodapé desce (.c-act--intro.is-leaving);
    2. entrada (is-enter, um render depois): o menu com as informações da atividade entra da esquerda e a barra desce; a mecânica
       é montada peça por peça (css/screens/activity.css).
    Com movimento reduzido, troca direto. */
const START_LEAVE_MS = 600;

function startAct(ctx) {
  if (!ctx.state.intro || ctx.starting) return;
  sfx('click');
  const screen = ctx.root.querySelector('.c-act--intro');
  const enter = () => {
    ctx.starting = false;
    if (ctx.destroyed) return;
    window.scrollTo({ top: 0 });
    ctx.set({ intro: false, fx: { enter: true } });
    requestAnimationFrame(() => trackScroll(ctx));
  };
  if (!screen || matchMedia('(prefers-reduced-motion: reduce)').matches) { enter(); return; }
  ctx.starting = true;
  screen.classList.add('is-leaving');
  const shell = document.getElementById('shell');
  if (shell) shell.dataset.hideTopbar = '';
  setTimeout(enter, START_LEAVE_MS);
}

/** Vai para a atividade `id` (se liberada), zerando o jogo quando ele já tinha sido concluído. */
function go(ctx, id) {
  const s = ctx.state;
  const mech = byId[id];
  if (!mech || statusOf(s, id) === 'locked') return;
  sfx('click');
  const patch = { view: id, trailOpen: false, justDone: null, gain: s.gain };
  const fresh = mech.reset?.(s);
  if (fresh) patch[mech.key] = fresh;
  ctx.set(patch);
  window.scrollTo({ top: 0 });
  requestAnimationFrame(() => trackScroll(ctx));
}

const actions = {
  openAct: (ctx, el) => go(ctx, Number(el.dataset.id)),
  startAct,
  leaveIntro: () => { sfx('click'); location.hash = '#curso'; },
  goNext: ctx => { const n = nextOpen(ctx.state); if (n) go(ctx, n); },
  // Rodapé: abre e fecha o painel com a explicação da resposta.
  toggleExplain: ctx => {
    const s = ctx.state;
    const f = byId[s.view].footer(s) ?? defaultFooter(s);
    const k = explainKey(s, f);
    sfx('click');
    const open = s.explain !== k;
    // Aberto: o foco vai para o botão do modal (efeito dialog); fechado, volta para o botão Explicação.
    ctx.set({ explain: open ? k : null, fx: open ? { dialog: true } : {} });
    if (!open) ctx.root.querySelector('.c-act-foot__explain')?.focus();
  },

  // Menu de atividades
  toggleTrail: ctx => ctx.set({ trailOpen: !ctx.state.trailOpen }),
  // Mobile e tablet: lista de atividades no bottom sheet (entra subindo; sai descendo, leavePanel).
  openTrail: ctx => { sfx('click'); ctx.set({ trailOpen: true, fx: { trailIn: true } }); },
  closeTrail: ctx => leavePanel(ctx.root, () => !ctx.destroyed && ctx.set({ trailOpen: false })),
  // Efeitos sonoros: a escolha fica no navegador (js/core/sound.js). Ao ligar, toca um clique para confirmar.
  toggleSound: ctx => {
    const on = !soundOn();
    setSound(on);
    if (on) sfx('click');
    ctx.render();
  },
  toggleSide: ctx => { sfx('click'); ctx.set({ hidden: !ctx.state.hidden }); },
  toggleGroup: (ctx, el) => toggleGroup(ctx, el.dataset.id),
  toggleSearch: ctx => {
    sfx('click');
    ctx.set({ search: { open: !ctx.state.search.open, q: '' }, trailOpen: true, fx: { searchOpen: !ctx.state.search.open } });
  },
  searchQ: (ctx, el) => ctx.set({ search: { open: true, q: el.value } }),

  // Sair e confirmação da avaliação
  openExit: ctx => ctx.set({ exit: true, fx: { dialog: true } }),
  // Botão "mais": desktop abre e fecha o menu suspenso; mobile e tablet abrem o bottom sheet (sai descendo, leavePanel).
  toggleMore: ctx => {
    sfx('click');
    if (minWidth(SIDE)) { ctx.set({ moreOpen: !ctx.state.moreOpen }); return; }
    ctx.set({ moreOpen: true, fx: { moreIn: true } });
  },
  closeMore: ctx => (minWidth(SIDE) ? ctx.set({ moreOpen: false }) : leavePanel(ctx.root, () => !ctx.destroyed && ctx.set({ moreOpen: false }))),
  moreTrail: ctx => ctx.set({ moreOpen: false, trailOpen: true, fx: { trailIn: true } }),
  moreExit: ctx => ctx.set({ moreOpen: false, exit: true, fx: { dialog: true } }),
  closeExit: ctx => ctx.set({ exit: false }),
  finalText: (ctx, el) => ctx.set({ finalText: el.value }),

  ...Object.assign({}, ...MECHS.map(m => m.actions)),
};

/* ---------- Teclado ---------- */
function onKey(ctx, e) {
  const s = ctx.state;
  if (s.loading) return;
  if (s.intro) {
    if (e.key === 'Enter' && !e.target.closest?.('button, a, input, textarea')) { e.preventDefault(); startAct(ctx); }
    return;
  }
  if (e.key === 'Escape') {
    if (s.moreOpen) actions.closeMore(ctx);
    else if (s.trailOpen && !minWidth(SIDE)) actions.closeTrail(ctx);
    else if (s.explain) ctx.set({ explain: null });
    else if (s.finalAsk) ctx.set({ finalAsk: false });
    else if (s.exit) ctx.set({ exit: false });
    else if (s.search.open) ctx.set({ search: { open: false, q: '' } });
    return;
  }
  if (s.finalAsk) { if (e.key === 'Enter' && e.target.matches?.('[data-input="finalText"]')) actions.startExam(ctx); return; }
  if (s.exit) return;
  const mech = byId[s.view];
  if (!mech.keys) return;
  const inField = e.target.closest?.('input, textarea, select, [contenteditable]');
  if ((inField || e.altKey) && !mech.keysInFields) return;
  if ((e.ctrlKey || e.metaKey) && !mech.keysInFields) return;
  // Enter num botão já dispara o clique do próprio botão.
  if (e.key === 'Enter' && e.target.closest?.('button, a')) return;
  if (mech.keys(ctx, e)) e.preventDefault();
}

export function mountActivity(root, { loading = true } = {}) {
  const ctx = createView(root, {
    state: initialState(loading),
    view,
    actions,
    breakpoints: [768, SIDE],
    onRender: c => {
      // App bar: visível no carregamento e na apresentação; some (sobe em 600ms, css/shell.css) quando a mecânica começa.
      const shell = document.getElementById('shell');
      if (shell) { if (c.state.loading || c.state.intro) delete shell.dataset.hideTopbar; else shell.dataset.hideTopbar = ''; }
      const fxs = c.state.fx;
      c.state.fx = {};
      if (fxs.dialog || fxs.searchOpen) c.root.querySelector(fxs.dialog ? '[data-autofocus]' : '[data-key="act-search"]')?.focus();
    },
    onMount: c => {
      MECHS.forEach(m => m.mount?.(c));
      c.listen('keydown', e => onKey(c, e));
      c.listen('scroll', () => trackScroll(c), window);
      // Menu "mais" do desktop: fecha com um clique fora dele (e fora do botão).
      c.listen('pointerdown', e => {
        if (!c.state.moreOpen || !minWidth(SIDE) || e.target.closest?.('.c-act-more, .c-act-hud__more')) return;
        c.set({ moreOpen: false });
      }, document);
      c.listen('hashchange', () => {
        const id = itemFromHash();
        if (id && id !== c.state.view && byId[id]) { c.set({ ...withItem(c.state, id), tw: tweaksFromHash() }); window.scrollTo({ top: 0 }); return; }
        // Tweak trocado: refaz a tela com o mesmo progresso (status, pontos, vidas e o jogo em andamento).
        const tw = tweaksFromHash();
        // Estado da trilha trocado: refaz o status (a atividade aberta continua a mesma e vira a atual, se não estiver concluída).
        if (tw.estado !== c.state.tw.estado) { c.set({ ...withItem({ ...c.state, status: statusForState(tw.estado) }, c.state.view), tw }); return; }
        if (Object.keys(tw).some(k => tw[k] !== c.state.tw[k])) c.set({ tw });
      }, window);
    },
  });

  // Relógios: um tique por segundo para a mecânica aberta (e para a avaliação, que conta mesmo fora da tela).
  const timer = setInterval(() => {
    if (ctx.destroyed || ctx.state.loading || ctx.state.intro || ctx.state.exit || ctx.state.finalAsk) return;
    for (const m of MECHS) if (m.tick && (m.id === ctx.state.view || m.tickAlways)) m.tick(ctx);
  }, 1000);

  const destroy = ctx.destroy;
  ctx.destroy = () => {
    clearInterval(timer);
    clearTimeout(ctx.gainTimer);
    clearTimeout(ctx.openTimer);
    destroy();
  };
  return ctx;
}
