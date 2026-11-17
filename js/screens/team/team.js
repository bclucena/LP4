import { createView, closeOnOutside, onEscape } from '../../core/view.js';
import { minWidth, reducedMotion } from '../../core/media.js';
import { norm } from '../../core/dom.js';
import { listMembers, memberById, toSort } from './data.js';
import { listMenus, listContent } from './list.js';
import { profileWide, profileNarrow } from './profile.js';
import { newContent, contentInfo, findItem } from './content.js';
import { teamSheet, sheetDefaults } from './parts.js';

/* Gestores / Meu time (handoff B.Gestores): lista "Usuários" (tabela a partir de 1024, cards abaixo) e página do usuário
   (indicadores, conteúdo rota > curso > módulo > atividade, horas, certificados, conquistas e missões; abaixo de 1024 vira
   abas Resumo, Conteúdo, Certificados e Missões). Dados de exemplo em ./data.js. Id da tela no menu: `time`.
   Arquivos: list.js (lista), profile.js (usuário), content.js (conteúdo navegável), parts.js (peças e sheets). */

const WIDE = 1024; // tabela na lista e página completa do usuário
const DESKTOP = 1180; // filtro em pílulas e dropdowns (abaixo disso, sheets)

/** Usuários da lista: ordenados e filtrados pela busca (nome ou e-mail). */
function visibleMembers(state) {
  const sorted = listMembers(state.course, state.sort);
  const term = state.q.trim();
  return term ? sorted.filter(m => norm(`${m.name} ${m.email}`).includes(norm(term))) : sorted;
}

const currentMember = state => (state.member === null ? null : memberById(state.member));

/* ---------- Tela ---------- */
function view(state) {
  const member = currentMember(state);
  const list = visibleMembers(state);

  let body;
  if (member) body = minWidth(WIDE) ? profileWide(state, member) : profileNarrow(state, member);
  else body = listContent(state, list);

  let sheet = '';
  if (state.sheet) {
    const info = member ? contentInfo(state.cb, member.progress) : null;
    sheet = teamSheet(state, { members: list.length, content: info?.ranked.length ?? 0, hasPrazo: info?.hasPrazo ?? false });
  }

  return `
    ${member ? '' : listMenus(state)}
    <div data-reveal="content" class="${member ? 'c-tm-body c-tm-body--profile' : 'c-tm-body'}">${body}</div>
    ${sheet}`;
}

/* ---------- Ações ---------- */
const scrollTop = () => window.scrollTo?.({ top: 0 });
const closeMenus = ctx => ctx.set({ menu: null, statusMenu: false });

/** Valor com que o sheet abre (o "rascunho" só vale depois do Aplicar). */
function draftFor(kind, state) {
  if (kind === 'userSort') return `${state.sort.key}-${state.sort.dir}`;
  if (kind === 'course') return state.course;
  if (kind === 'certs') return state.certOrder;
  if (kind === 'status') return [...state.statusSel];
  const info = contentInfo(state.cb, currentMember(state).progress);
  return `${info.by}-${info.dir}`;
}

const actions = {
  /* Lista */
  openProfile: (ctx, el) => {
    ctx.set({ member: Number(el.dataset.id), cb: newContent('rota'), sec: 'resumo', statusSel: [], statusMenu: false, certOrder: 'recent', slide: '' });
    scrollTop();
  },
  closeProfile: ctx => ctx.set({ member: null, sheet: null, statusMenu: false, slide: '' }),
  sortBy: (ctx, el) => {
    const key = el.dataset.id;
    const { sort } = ctx.state;
    ctx.set({ sort: sort.key === key ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' } });
  },
  toggleUserSearch: ctx => ctx.set({ searching: !ctx.state.searching, q: '' }),
  userSearch: (ctx, el) => ctx.set({ q: el.value }),
  clearUserSearch: ctx => ctx.set({ q: '' }),
  goPage: (ctx, el) => ctx.set({ page: Number(el.dataset.page) }),

  /* Filtro por curso (pílula no desktop) */
  toggleMenu: (ctx, el) => ctx.set({ menu: ctx.state.menu === el.dataset.menu ? null : el.dataset.menu }),
  pick: (ctx, el) => ctx.set({ course: el.dataset.value, menu: null }),
  clearCourse: ctx => ctx.set({ course: 'todos' }),

  /* Sheets: abrir, escolher, limpar e aplicar */
  openFilters: ctx => ctx.set({ sheet: { kind: 'course', draft: ctx.state.course }, fresh: true }),
  openSheet: (ctx, el) => ctx.set({ sheet: { kind: el.dataset.id, draft: draftFor(el.dataset.id, ctx.state) }, fresh: true }),
  closePanel: ctx => ctx.set({ sheet: null }),
  pickDraft: (ctx, el) => ctx.set({ sheet: { ...ctx.state.sheet, draft: el.dataset.value } }),
  toggleDraft: (ctx, el) => {
    const { sheet } = ctx.state;
    const id = el.dataset.value;
    ctx.set({ sheet: { ...sheet, draft: sheet.draft.includes(id) ? sheet.draft.filter(x => x !== id) : [...sheet.draft, id] } });
  },
  clearDraft: ctx => {
    const { sheet } = ctx.state;
    ctx.set({ sheet: { ...sheet, draft: structuredClone(sheetDefaults[sheet.kind]) } });
  },
  applyDraft: ctx => {
    const { sheet, cb } = ctx.state;
    const { kind, draft } = sheet;
    const patch = { sheet: null, slide: '' };
    if (kind === 'userSort') patch.sort = toSort(draft);
    else if (kind === 'course') patch.course = draft;
    else if (kind === 'certs') patch.certOrder = draft;
    else if (kind === 'status') patch.statusSel = draft;
    else {
      const [by, dir] = draft.split('-');
      patch.cb = { ...cb, by, dir };
    }
    ctx.set(patch);
  },

  /* Conteúdo navegável */
  cbTab: (ctx, el) => ctx.set({ cb: { ...ctx.state.cb, tab: el.dataset.value, trail: [], q: '' }, slide: '' }),
  cbDrill: (ctx, el) => {
    const { cb } = ctx.state;
    const node = findItem(cb, currentMember(ctx.state).progress, el.dataset.id);
    if (node) ctx.set({ cb: { ...cb, trail: [...cb.trail, node], q: '' }, slide: 'fwd' });
  },
  cbBack: ctx => ctx.set({ cb: { ...ctx.state.cb, trail: ctx.state.cb.trail.slice(0, -1), q: '' }, slide: 'back' }),
  cbSearch: (ctx, el) => ctx.set({ cb: { ...ctx.state.cb, q: el.value } }),
  cbClearSearch: ctx => ctx.set({ cb: { ...ctx.state.cb, q: '' } }),

  /* Página do usuário abaixo de 1024: abas e atalhos do Resumo */
  goSection: (ctx, el) => {
    const { id, kind } = el.dataset;
    ctx.set({ sec: id, cb: id === 'conteudo' ? newContent(kind || 'rota') : ctx.state.cb, statusMenu: false, slide: '', centerTab: true });
    scrollTop();
  },

  /* Filtro de status das missões: menu no desktop, sheet abaixo de 1180 */
  toggleStatus: (ctx, el) => {
    if (minWidth(DESKTOP)) ctx.set({ statusMenu: !ctx.state.statusMenu });
    else actions.openSheet(ctx, { dataset: { id: 'status' } });
  },
  toggleStatusItem: (ctx, el) => {
    const id = el.dataset.value;
    const sel = ctx.state.statusSel;
    ctx.set({ statusSel: sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id] });
  },
  clearStatus: ctx => ctx.set({ statusSel: [] }),
};

/* ---------- Dica de rolagem da tabela ----------
   Na primeira vez que a tabela aparece entre 1024 e 1179, ela desliza um pouco para a direita e volta, avisando que há mais
   colunas. Tocar ou girar a roda do mouse na tabela cancela. */
let peeked = false;

function glide(el, to, ms, done) {
  const from = el.scrollLeft;
  const t0 = performance.now();
  let raf = 0;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tick = now => {
    const t = Math.min(1, (now - t0) / ms);
    el.scrollLeft = from + (to - from) * ease(t);
    if (t < 1) raf = requestAnimationFrame(tick);
    else done?.();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

function peekTable(ctx) {
  const el = ctx.root.querySelector('.c-tm-table-scroll');
  if (peeked || !el || ctx.state.loading || reducedMotion() || el.scrollWidth <= el.clientWidth + 8) return;
  peeked = true;
  let cancel = () => {};
  const stop = () => cancel();
  el.addEventListener('touchstart', stop, { passive: true });
  el.addEventListener('wheel', stop, { passive: true });
  setTimeout(() => {
    cancel = glide(el, 64, 550, () => setTimeout(() => { cancel = glide(el, 0, 700); }, 150));
  }, 600);
}

export function mountTeam(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, member: null, course: 'todos', sort: { key: 'performance', dir: 'desc' }, page: 1, searching: false, q: '',
      menu: null, sheet: null, fresh: false, slide: '',
      // página do usuário
      cb: newContent('rota'), sec: 'resumo', statusSel: [], statusMenu: false, certOrder: 'recent', centerTab: false,
    },
    view,
    actions,
    breakpoints: [768, 1024, 1180],
    onRender: ctx => {
      ctx.state.slide = ''; // a animação de troca de nível vale só para a renderização que a pediu
      if (ctx.state.centerTab) {
        ctx.state.centerTab = false;
        ctx.root.querySelector('.c-tm-tab.is-on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
      }
      if (ctx.state.member === null && minWidth(WIDE) && !minWidth(DESKTOP)) peekTable(ctx);
    },
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => closeMenus(ctx), () => ctx.state.menu !== null || ctx.state.statusMenu);
      onEscape(ctx, () => ctx.set({ sheet: null }), () => ctx.state.sheet !== null);
    },
  });
}
