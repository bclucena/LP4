import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { avatar } from '../components/avatar.js';
import { panel, sheetFooter } from '../components/panel.js';
import { pillMenu, radioMenu, filterDivider, singleGroup } from '../components/filters.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import {
  rankings, rounds, entries, listPoints, fmt, scopeOptions, typeOptions, orderOptions, defaultRankingFilters, filterRankings,
} from '../data/ranking.js';

/* Ranking (handoff 4.Ranking): lista de rankings (ativos e finalizados) em carrossel, período da rodada, regras,
   contagem regressiva, pódio e posições a partir do 4º lugar. A partir de 1180 os filtros viram pílulas (sem abas no cabeçalho)
   e o carrossel ganha as setas; abaixo disso os filtros ficam no bottom sheet aberto pelo botão "Filtro" do menu top. */

const DESKTOP = 1180;

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const activeCount = f => [f.scope !== 'todos', f.type !== 'todos', f.order !== 'recentes'].filter(Boolean).length;
const labelOf = (options, id) => options.find(o => o.id === id).label;
const initials = name => name.split(' ').map(p => p[0]).slice(0, 2).join('');

const filterOptions = { scope: scopeOptions, type: typeOptions, order: orderOptions };

/* ---------- Carrossel de rankings ---------- */
function rankingCard(r, on) {
  const status = r.active ? icon('check-circle', 14) + `Ativo · ${r.round}ª rodada` : icon('x-circle', 14) + 'Finalizado';
  return `<button type="button" class="${cx('c-rk-card', on && 'is-on')}" aria-pressed="${on}" data-action="selectRanking" data-id="${r.id}">
    <b class="c-rk-card__title">${esc(r.title)}</b>
    <span class="c-rk-card__info"><span>${icon('users', 14)}${esc(r.scope)}</span><span>${icon('calendar', 14)}${esc(r.period)}</span></span>
    <span class="c-rk-card__foot">
      <span class="c-rk-card__people"><span class="c-rk-card__faces">${[1, 2, 3].map(() => avatar({ size: 'small', use: 'illustration' })).join('')}</span><span>+1.999</span></span>
      <span class="c-rk-card__status">${status}</span>
    </span>
  </button>`;
}

/* ---------- Pódio ---------- */
/** Rosto de exemplo com as iniciais (no produto é a foto da pessoa). A coroa (ring amarelo) é do 1º lugar. */
const face = (name, size, crown) =>
  `<span class="${cx('c-rk-face', crown && 'is-crown')}" style="width:${size}px;height:${size}px;font-size:${size / 3}px" aria-hidden="true">${esc(initials(name))}</span>`;

function podium(desktop) {
  const slots = [
    { pos: 2, tone: 'silver', label: 'Segundo lugar', size: desktop ? 96 : 48 },
    { pos: 1, tone: 'gold', label: 'Primeiro lugar', size: desktop ? 112 : 56 },
    { pos: 3, tone: 'bronze', label: 'Terceiro lugar', size: desktop ? 96 : 48 },
  ];
  return `<ol class="${cx('c-rk-podium', desktop && 'c-rk-podium--desktop')}" aria-label="Pódio">${slots.map(s => {
    const e = entries[s.pos - 1];
    return `<li class="c-rk-slot">
      ${face(e.name, s.size, s.pos === 1)}
      <b class="c-rk-slot__name">${esc(e.name)}</b>
      <span class="c-rk-slot__label">${s.label}</span>
      <div class="c-rk-slot__base c-rk-slot__base--${s.tone} ${s.pos === 1 ? 'is-first' : ''}">
        <span class="c-rk-slot__place">${s.pos}</span>
        <b class="c-rk-slot__points">${fmt(e.points)}</b>
        <span class="c-rk-slot__unit">Pontos</span>
        ${s.pos === 1 ? `<span class="c-rk-slot__mine">${icon('award', 12)}Minha posição</span>` : ''}
      </div>
    </li>`;
  }).join('')}</ol>`;
}

/** Contagem regressiva em dias, horas e minutos a partir dos segundos restantes. */
function countdown(secs) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `<div class="c-rk-countdown">Encerra em <span>${d}<small> d</small> · ${h}<small> h</small> · ${m}<small> min</small></span></div>`;
}

/* ---------- Filtros ---------- */
/** Pílulas do desktop: escopo, tipo e ordem + "Limpar". */
function filterPills(state) {
  const f = state.filters;
  const defaults = defaultRankingFilters();
  const pills = Object.entries(filterOptions).map(([key, options]) =>
    pillMenu({ id: key, label: labelOf(options, f[key]), active: f[key] !== defaults[key], open: state.menu === key, content: radioMenu({ filter: key, options, value: f[key] }) }));
  return `${pills.join('')}<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaults) ? 'disabled' : ''}>Limpar</button>`;
}

/** Bottom sheet de filtros: um grupo de chips (escolha única) por filtro, com contagem de resultados. */
function filtersSheet(state) {
  const groups = [
    { key: 'scope', title: 'Rankings', options: scopeOptions },
    { key: 'type', title: 'Tipo', options: typeOptions },
    { key: 'order', title: 'Ordenar por', options: orderOptions },
  ];
  const body = groups.map((g, i) => `${i > 0 ? filterDivider() : ''}${singleGroup({ title: g.title, filter: g.key, options: g.options, value: state.draft[g.key] })}`).join('');
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count: filterRankings(state.tab, state.draft).length }), enter: state.fresh });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const visible = filterRankings(state.tab, state.filters);
  const tabs = [
    { id: 'todos', label: 'Todos', count: rankings.length },
    { id: 'ativos', label: 'Ativos', count: rankings.filter(r => r.active).length },
    { id: 'finalizados', label: 'Finalizados', count: rankings.filter(r => !r.active).length },
  ];
  const current = visible.find(r => r.id === state.sel) ?? visible[0];

  let content;
  if (state.loading) {
    content = '<div class="c-rk-skeleton"></div>';
  } else if (visible.length === 0) {
    content = '<div class="c-rk-empty">Nenhum ranking encontrado</div>';
  } else {
    const live = current.active && state.round === 0;
    content = `
      <section class="c-rk-section c-rk-section--list">
        <div class="c-rk-section__head">
          <h2>Rankings (${visible.length})</h2>
          ${desktop ? `<span class="c-rk-arrows"><button type="button" aria-label="Anterior" data-action="scrollRankings" data-value="-1">${icon('chevron-left', 18)}</button><button type="button" aria-label="Próximo" data-action="scrollRankings" data-value="1">${icon('chevron-right', 18)}</button></span>` : ''}
        </div>
        <div class="c-rk-track u-hide-scroll" data-scroll-key="rk-track">${visible.map(r => rankingCard(r, r.id === current.id)).join('')}</div>
      </section>
      <section class="c-rk-section c-rk-section--board">
        <div class="c-rk-toolbar">
          ${pillMenu({ id: 'round', label: rounds[state.round], active: true, open: state.menu === 'round', content: radioMenu({ filter: 'round', options: rounds.map((r, i) => ({ id: String(i), label: r })), value: String(state.round) }) })}
          <button type="button" class="c-rk-rules" aria-expanded="${state.rules}" data-action="toggleRules">${icon('edit-3', 16)}Regras</button>
          <span class="${cx('c-rk-state', live && 'is-live')}">${live ? 'Em andamento' : 'Finalizado'}</span>
        </div>
        ${state.rules ? '<div class="c-rk-rules-box">Pontuação somada de cursos concluídos e missões aprovadas na rodada. Empates são decididos pelo horário da última pontuação.</div>' : ''}
        ${live ? countdown(state.secs) : ''}
        ${podium(desktop)}
        <ol class="c-rk-list">${entries.slice(3).map((e, i) => `<li class="c-rk-row">
          <b class="c-rk-row__pos">${i + 4}</b>${avatar({ size: 'small', use: 'illustration' })}
          <span class="c-rk-row__main"><b>${esc(e.name)}</b><span><b>${fmt(listPoints(e))}</b> Pontos</span></span>
        </li>`).join('')}</ol>
      </section>`;
  }

  return `
    ${menuTop({ title: 'Ranking', tabs, tab: state.tab, filterCount: activeCount(state.filters) })}
    ${menuHeader({ tabs: [], tab: '', filters: filterPills(state) })}
    <div class="c-rk" data-reveal="content">${content}</div>
    ${state.sheet ? filtersSheet(state) : ''}`;
}

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  selectRanking: (ctx, el) => ctx.set({ sel: Number(el.dataset.id), round: 0 }),
  toggleRules: ctx => ctx.set({ rules: !ctx.state.rules }),
  scrollRankings: (ctx, el) => {
    const track = ctx.root.querySelector('[data-scroll-key="rk-track"]');
    track?.scrollBy({ left: Number(el.dataset.value) * track.clientWidth * 0.9, behavior: 'smooth' });
  },
  clearFilters: ctx => ctx.set({ filters: defaultRankingFilters() }),

  // Bottom sheet de filtros (rascunho até clicar em "Aplicar")
  openFilters: ctx => ctx.set({ sheet: true, draft: { ...ctx.state.filters }, fresh: true }),
  closePanel: ctx => ctx.set({ sheet: false }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => ctx.set({ draft: defaultRankingFilters() }),
  applyDraft: ctx => ctx.set({ filters: { ...ctx.state.draft }, sheet: false }),

  // Dropdowns do desktop e o seletor de rodada
  toggleMenu: (ctx, el) => ctx.set({ menu: ctx.state.menu === el.dataset.menu ? null : el.dataset.menu }),
  pick: (ctx, el) => {
    const { filter, value } = el.dataset;
    if (filter === 'round') ctx.set({ round: Number(value), menu: null });
    else ctx.set({ filters: { ...ctx.state.filters, [filter]: value }, menu: null });
  },
};

export function mountRanking(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, tab: 'todos', filters: defaultRankingFilters(), sel: 0, round: 0, rules: false,
      secs: 12 * 60 + 24 * 3600 + 15 * 86400, // exemplo: tempo restante da rodada
      menu: null, sheet: false, draft: null, fresh: false,
    },
    view,
    actions,
    breakpoints: [1024, 1180],
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => ctx.set({ menu: null }), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false }), () => ctx.state.sheet);
      // A contagem regressiva anda de minuto em minuto e para quando a tela é desmontada.
      const timer = setInterval(() => (ctx.destroyed ? clearInterval(timer) : ctx.set(s => ({ secs: s.secs - 60 }))), 60000);
    },
  });
}
