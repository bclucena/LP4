import { createView } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { cx } from '../core/dom.js';
import { buttonIcon } from '../components/button.js';
import { sfx, soundOn, setSound } from '../core/sound.js';
import { START, EXAM_ID } from '../data/activity.js';
import { initialStatus, nextOpen, defaultFooter, statusOf, ORDER, fx } from './activity/flow.js';
import { mobileHeader, trail, hud, footer, exitDialog, finalDialog, skeleton } from './activity/parts.js';
import quiz, { quizSupportMech } from './activity/quiz.js';
import { readingMech, slidesMech, trackScroll } from './activity/reading.js';
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
   Tweaks (js/data/tweaks.js, no endereço): trilha=cards (estilo "Cards" do menu), desbloquear=1 (todas abrem),
   tipografia=b (Versão B, tamanhos encaixados na escala do design system), e apoio=0 (Ordenadinho sem imagem de
   apoio). O conteúdo das mecânicas fica sem card (c-act--flat) por padrão; o tweak "Conteúdo em card" saiu. Ficam em state.tw; trocar um tweak não mexe no progresso. */

const SIDE = 1024;

const MECHS = [quiz, quizSupportMech, readingMech, slidesMech, wordSearch, hangman, memory, mix, place, order, puzzle, spot, thisOrThat, pollMech, openMech, mosaic, exam];
const byId = Object.fromEntries(MECHS.map(m => [m.id, m]));

const hashParams = () => new URLSearchParams(location.hash.split('?')[1] ?? '');
const itemFromHash = () => Number(hashParams().get('item')) || null;

/** Tweaks lidos do endereço (sem parâmetro = padrão, que é a tela original). */
function tweaksFromHash() {
  const p = hashParams();
  return {
    trilha: p.get('trilha') === 'cards' ? 'cards' : 'capa',
    unlock: p.get('desbloquear') === '1',
    type: p.get('tipografia') === 'b' ? 'b' : 'a',
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
  const state = {
    loading, view: ORDER[0], status: initialStatus(), justDone: null,
    xp: START.xp, coins: START.coins, lives: START.lives, streak: 0, gain: null, gainFrom: null,
    hidden: false, trailOpen: false, closed: {}, search: { open: false, q: '' },
    exit: false, finalAsk: false, finalText: '', fx: {}, tw: tweaksFromHash(), intro: false,
  };
  MECHS.forEach(m => { state[m.key] = m.init(); });
  const item = itemFromHash();
  state.intro = hasIntro(state.view);
  if (!item) return state;
  const next = withItem(state, item);
  next.intro = hasIntro(next.view);
  // Vindo do diálogo da avaliação do Curso ou do Tabuleiro (já confirmada): #atividade?item=15&iniciar=1 começa direto.
  if (item === EXAM_ID && hashParams().get('iniciar') === '1') next.exam = { ...next.exam, started: true, tries: next.exam.tries + 1 };
  return next;
}

/** Percentual de cada atividade no menu (0–95 enquanto não conclui; 100 concluída). */
const pctFor = state => id => (state.status[id] === 'done' ? 100 : Math.max(0, Math.min(95, Math.round(byId[id].pct(state) * 100))));

/* ---------- Tela ---------- */
function view(state, ctx) {
  const side = minWidth(SIDE);
  if (state.loading) return skeleton(side);
  const mech = byId[state.view];
  if (state.intro) return introScreen(state, side);
  const f = mech.footer(state) ?? defaultFooter(state);
  const handle = side
    ? buttonIcon({ name: 'chevrons-left', label: state.hidden ? 'Mostrar trilha' : 'Guardar trilha', action: 'toggleSide', className: 'c-act-sidetoggle', attrs: { 'aria-expanded': String(!state.hidden) } })
    : '';
  const tw = state.tw;
  return `<div class="${cx('c-act', side && 'c-act--side', side && state.hidden && 'is-collapsed', tw.type === 'b' && 'c-act--type-b', !tw.card && 'c-act--flat', fx(state, 'enter') && 'is-enter')}" data-reveal="content">
    ${mobileHeader()}
    <div class="c-act__side">${handle}<div class="c-act__side-clip">${trail(state, { side, pctOf: pctFor(state) })}</div></div>
    <div class="c-act__main">
      <div class="c-act__body">
        ${hud(state, { side, elapsed: mech.elapsed?.(state) ?? null, timer: mech.timer?.(state) ?? null })}
        <div class="c-act__content" data-act="${mech.key}">${mech.view(state, ctx)}</div>
      </div>
      ${footer(f)}
    </div>
    ${state.exit ? exitDialog(state) : ''}
    ${state.finalAsk ? finalDialog(state) : ''}
  </div>`;
}

/** Apresentação da atividade: sem menu e sem barra de desempenho; o rodapé traz "Iniciar". */
function introScreen(state, side) {
  const tw = state.tw;
  return `<div class="${cx('c-act c-act--intro', side && 'c-act--side', tw.type === 'b' && 'c-act--type-b', 'c-act--flat')}" data-reveal="content">
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

/** Sai da apresentação para a mecânica: a app bar sobe e o menu e a barra entram (is-enter, 600ms). */
function startAct(ctx) {
  if (!ctx.state.intro) return;
  sfx('click');
  window.scrollTo({ top: 0 });
  ctx.set({ intro: false, fx: { enter: true } });
  requestAnimationFrame(() => trackScroll(ctx));
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

  // Menu de atividades
  toggleTrail: ctx => ctx.set({ trailOpen: !ctx.state.trailOpen }),
  // Efeitos sonoros: a escolha fica no navegador (js/core/sound.js). Ao ligar, toca um clique para confirmar.
  toggleSound: ctx => {
    const on = !soundOn();
    setSound(on);
    if (on) sfx('click');
    ctx.render();
  },
  toggleSide: ctx => { sfx('click'); ctx.set({ hidden: !ctx.state.hidden }); },
  toggleGroup: (ctx, el) => ctx.set({ closed: { ...ctx.state.closed, [el.dataset.id]: !ctx.state.closed[el.dataset.id] } }),
  toggleSearch: ctx => {
    sfx('click');
    ctx.set({ search: { open: !ctx.state.search.open, q: '' }, trailOpen: true, fx: { searchOpen: !ctx.state.search.open } });
  },
  searchQ: (ctx, el) => ctx.set({ search: { open: true, q: el.value } }),

  // Sair e confirmação da avaliação
  openExit: ctx => ctx.set({ exit: true, fx: { dialog: true } }),
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
    if (s.finalAsk) ctx.set({ finalAsk: false });
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
      c.listen('hashchange', () => {
        const id = itemFromHash();
        if (id && id !== c.state.view && byId[id]) { c.set({ ...withItem(c.state, id), tw: tweaksFromHash() }); window.scrollTo({ top: 0 }); return; }
        // Tweak trocado: refaz a tela com o mesmo progresso (status, pontos, vidas e o jogo em andamento).
        const tw = tweaksFromHash();
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
