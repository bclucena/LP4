/* Peças da casca da tela Atividades: cabeçalho mobile, menu de atividades (capa + grupos), barra de desempenho (HUD),
   rodapé "Continuar", diálogos (sair e iniciar avaliação) e skeleton. */

import { cx, esc, norm, range } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { avatar } from '../../components/avatar.js';
import { logo } from '../../shell/shell.js';
import { activities, activityCourse, activityGroups, activityModules, searchText, EXAM_ID, exam } from '../../data/activity.js';
import { ORDER, actById, fx, clock2, statusOf } from './flow.js';
import { examConfirm } from '../../components/exam-dialog.js';
import { fmtMinutes } from '../../data/course-detail.js';

const STATUS_LABEL = { done: 'Concluída', current: 'Em andamento', available: 'Disponível', locked: 'Bloqueada' };

/** Anel de progresso de 24px (percentual da atividade). `data-ring` permite atualizar sem refazer a tela. */
export const ring = (pct, id) => `<svg class="c-act-ring" width="24" height="24" viewBox="0 0 26 26" aria-hidden="true">
  <circle class="c-act-ring__track" cx="13" cy="13" r="11"/>
  <circle class="${cx('c-act-ring__fill', pct <= 0 && 'is-empty')}" cx="13" cy="13" r="11" pathLength="100" stroke-dasharray="${pct} ${100 - pct}" data-ring="${id}"/>
</svg>`;

/** Percentual geral da trilha (atividades concluídas). */
export const trailPct = state => Math.round((ORDER.filter(id => state.status[id] === 'done').length / ORDER.length) * 100);

/* ---------- Cabeçalho mobile (abaixo de 768 a app bar da casca some) ---------- */
export const mobileHeader = () => `<header class="c-act-mhead">
  <a class="c-act-mhead__back" href="#curso">${icon('arrow-left', 16)}Voltar</a>
  ${logo('c-logo--mobile')}
  ${avatar({ use: 'image', src: activityCourse.avatar, px: 28, className: 'c-act-mhead__avatar' })}
</header>`;

/* ---------- Menu de atividades ---------- */
function cover(state, side) {
  const pct = trailPct(state);
  const s = state.search;
  const tools = `<div class="c-act-cover__tools">
      ${side ? '' : `<button type="button" class="c-act-cover__tool" data-action="toggleTrail" aria-expanded="${state.trailOpen}" aria-label="${state.trailOpen ? 'Ocultar atividades' : 'Mostrar atividades'}">${icon(state.trailOpen ? 'chevron-up' : 'chevron-down', 18)}</button>`}
      <button type="button" class="c-act-cover__tool" data-action="toggleSearch" aria-pressed="false" aria-label="Buscar atividade">${icon('search', 18)}</button>
    </div>`;
  const info = `<div class="c-act-cover__info">
      <span class="c-act-cover__kicker">Curso</span>
      <span class="c-act-cover__title">${esc(activityCourse.title)}</span>
      <span class="c-act-cover__bar"><span style="width:${pct}%"></span></span>
      <span class="c-act-cover__pct" aria-label="${pct}% concluído">${pct}%</span>
    </div>`;
  const search = `<label class="c-act-search">${icon('search', 18)}
      <input type="search" data-input="searchQ" data-key="act-search" value="${esc(s.q)}" placeholder="Buscar" aria-label="Buscar nas atividades" />
      <button type="button" class="c-act-search__close" data-action="toggleSearch" aria-label="Fechar busca">${icon('x', 18)}</button>
    </label>`;
  return `<div class="${cx('c-act-cover', s.open && 'c-act-cover--search', fx(state, 'searchOpen') && 'is-searching')}">
    <div class="c-act-cover__img" style="background-image:url('${esc(activityCourse.cover)}')" aria-hidden="true"></div>
    <div class="c-act-cover__shade" aria-hidden="true"></div>
    ${s.open ? search : tools + info}
  </div>`;
}

function itemButton(state, a, { meta, statusHtml, className = '' }) {
  const st = statusOf(state, a.id);
  const cur = state.view === a.id;
  return `<button type="button" class="${cx('c-act-item', className, cur && 'is-current', st === 'locked' && 'is-locked')}" data-action="openAct" data-id="${a.id}" ${cur ? 'aria-current="step"' : ''} ${st === 'locked' ? 'aria-disabled="true"' : ''}>
    ${icon(a.icon, 20, 'c-act-item__icon')}
    <span class="c-act-item__text"><span class="c-act-item__title" title="${esc(a.title)}">${esc(a.title)}</span><span class="c-act-item__meta">${meta}</span></span>
    ${statusHtml}
  </button>`;
}

function statusIcon(state, id, pctOf) {
  const st = statusOf(state, id);
  if (st === 'done') return `<span class="c-act-item__status is-done" title="Concluída">${icon('check-circle', 22)}</span>`;
  if (st === 'locked') return `<span class="c-act-item__status" title="Bloqueada">${icon('lock', 16)}</span>`;
  const pct = pctOf(id);
  return `<span class="c-act-item__status" title="${STATUS_LABEL[st]} · ${pct}%">${ring(pct, id)}</span>`;
}

function groups(state, pctOf) {
  // `n`: número da atividade dentro do módulo (a contagem recomeça em 1 a cada módulo); sem módulo, vale o rótulo dos dados.
  const group = (g, n) => {
    const label = n ? `Atividade ${n}` : g.label;
    const done = g.ids.filter(id => state.status[id] === 'done').length;
    const open = !state.closed[g.key];
    const items = g.ids.map(id => {
      const a = actById(id);
      return itemButton(state, a, { meta: `${esc(a.mech)} · ${a.xp}pts`, statusHtml: statusIcon(state, id, pctOf) });
    }).join('');
    return `<div class="c-act-group">
      <button type="button" class="c-act-group__head" data-action="toggleGroup" data-id="${g.key}" aria-expanded="${open}">
        ${icon('chevron-down', 16, cx('c-act-group__caret', !open && 'is-closed'))}
        <span class="c-act-group__names"><span class="c-act-group__label">${esc(label)}</span><span class="c-act-group__name" title="${esc(g.name)}">${esc(g.name)}</span></span>
        <span class="c-act-group__count">${done}/${g.ids.length}</span>
      </button>
      ${open ? `<div class="c-act-group__items">${items}</div>` : ''}
    </div>`;
  };
  // Divisor de módulo antes dos grupos de cada módulo: em cima "MÓDULO 1 • 1h 25min", embaixo o título do módulo (até 2 linhas).
  // Grupos sem módulo (não listados em activityModules) vão no fim, sem divisor.
  const used = new Set(activityModules.flatMap(m => m.groups));
  const byKey = key => activityGroups.find(g => g.key === key);
  return activityModules.map(m => `<div class="c-act-module" role="group" aria-label="${esc(`${m.label}: ${m.name}`)}">
      <div class="c-act-module__divider">
        <span class="c-act-module__top"><span class="c-act-module__label">${esc(m.label)}</span><span class="c-cd-bullet c-act-module__bullet" aria-hidden="true"></span><span class="c-act-module__time">${esc(fmtMinutes(m.min))}</span></span>
        <span class="c-act-module__title" title="${esc(m.name)}">${esc(m.name)}</span>
      </div>
      ${m.groups.map(byKey).filter(Boolean).map((g, i) => group(g, i + 1)).join('')}
    </div>`).join('') + activityGroups.filter(g => !used.has(g.key)).map(g => group(g)).join('');
}

function examCard(state) {
  const a = actById(EXAM_ID);
  const left = Math.max(0, exam.attempts - state.exam.tries);
  const st = statusOf(state, EXAM_ID);
  const status = st === 'done' ? `<span class="c-act-item__status is-done" title="Concluída">${icon('check-circle', 22)}</span>`
    : st === 'locked' ? `<span class="c-act-item__status" title="Bloqueada">${icon('lock', 16)}</span>` : '';
  return `<div class="c-act-trail__exam">${itemButton(state, a, { meta: `${left} ${left === 1 ? 'tentativa' : 'tentativas'} · ${a.xp}pts`, statusHtml: status, className: 'c-act-item--exam' })}</div>`;
}

/** Busca: conta as ocorrências do termo no título e no conteúdo de cada atividade. */
function searchResults(state) {
  const q = norm(state.search.q.trim());
  if (!q) return '<p class="c-act-trail__note">Digite para buscar no conteúdo de todas as atividades.</p>';
  const hits = activities.map(a => {
    const text = norm(`${a.title} ${searchText[a.id] ?? ''}`);
    let n = 0;
    for (let i = text.indexOf(q); i >= 0; i = text.indexOf(q, i + q.length)) n++;
    return { a, n };
  }).filter(h => h.n);
  if (!hits.length) return '<p class="c-act-trail__note c-act-trail__note--center">Nenhuma atividade encontrada</p>';
  return hits.map(({ a, n }) => itemButton(state, a, { meta: `<i>${n} ${n === 1 ? 'resultado' : 'resultados'}</i>`, statusHtml: '', className: 'c-act-item--result' })).join('');
}

/* Estilo "Cards" do menu (tweak trilha=cards; estiloTrilha "Cards" no protótipo): cabeçalho "Trilha de estudos", barra de
   conclusão e todas as atividades em lista plana de cards (status, título e pontos), sem capa, grupos nem busca. */
const CARD_ICON = { done: 'check', locked: 'lock' };

function trailCards(state, side) {
  const pct = trailPct(state);
  const listOpen = side || state.trailOpen;
  const toggle = side ? '' : `<button type="button" class="c-act-tcards__toggle" data-action="toggleTrail" aria-expanded="${state.trailOpen}" aria-label="${state.trailOpen ? 'Ocultar atividades' : 'Mostrar atividades'}">${icon(state.trailOpen ? 'chevron-up' : 'chevron-down', 18)}</button>`;
  const cards = activities.map(a => {
    const st = statusOf(state, a.id);
    const cur = state.view === a.id;
    return `<button type="button" class="${cx('c-act-tcard', `c-act-tcard--${st}`, cur && 'is-current')}" data-action="openAct" data-id="${a.id}" ${cur ? 'aria-current="step"' : ''} ${st === 'locked' ? 'aria-disabled="true"' : ''}>
      <span class="c-act-tcard__icon">${icon(CARD_ICON[st] ?? a.icon, 16)}</span>
      <span class="c-act-tcard__text"><span class="c-act-tcard__status">${STATUS_LABEL[st]}</span><span class="c-act-tcard__title" title="${esc(a.title)}">${esc(a.title)}</span></span>
      <span class="c-act-tcard__xp">${a.xp}pts</span>
    </button>`;
  }).join('');
  return `<aside class="c-act-trail c-act-trail--cards" aria-label="Atividades do curso">
    <div class="c-act-tcards__head">
      <span class="c-act-tcards__badge" aria-hidden="true">${icon('book-open', 20)}</span>
      <span class="c-act-tcards__names"><span class="c-act-tcards__title">Trilha de estudos</span><span class="c-act-tcards__sub">${esc(activityCourse.title)}</span></span>
      ${toggle}
    </div>
    <div class="c-act-tcards__progress">
      <span class="c-act-tcards__row"><span>Conclusão do módulo</span><b>${pct}%</b></span>
      <span class="c-act-tcards__bar"><span style="width:${pct}%"></span></span>
    </div>
    ${listOpen ? `<nav class="c-act-tcards__list" aria-label="Lista de atividades" data-scroll-key="act-trail">${cards}</nav>` : ''}
  </aside>`;
}

/** Menu de atividades: capa do curso, grupos recolhíveis e avaliação final (ou o estilo "Cards"). No desktop fica fixo ao lado. */
export function trail(state, { side, pctOf }) {
  if (state.tw?.trilha === 'cards') return trailCards(state, side);
  const listOpen = side || state.trailOpen || state.search.open;
  const list = state.search.open ? searchResults(state) : groups(state, pctOf) + examCard(state);
  return `<aside class="c-act-trail" aria-label="Atividades do curso">
    ${cover(state, side)}
    ${listOpen ? `<nav class="c-act-trail__list" aria-label="Lista de atividades" data-scroll-key="act-trail">${list}</nav>` : ''}
  </aside>`;
}

/* ---------- Barra de desempenho (HUD) ---------- */
const closeButton = className => `<button type="button" class="${cx('c-act-close', className)}" data-action="openExit" aria-label="Fechar atividade" title="Fechar atividade">${icon('x', 18)}</button>`;

/* Os sons de feedback ligam e desligam no menu do perfil, em "Sons da plataforma" (js/components/profile-menu.js). */

export function hud(state, { side, elapsed, timer }) {
  const pct = trailPct(state);
  const done = ORDER.filter(id => state.status[id] === 'done').length;
  const hearts = range(3, i => `<span class="${cx('c-act-heart', i < state.lives && 'is-on')}">${icon('heart', 16)}</span>`);
  const timerChip = timer == null ? '' : `<span class="${cx('c-act-chip c-act-chip--timer', timer <= 5 && 'is-low')}" title="Tempo restante" data-tick-box="quiz">${icon('clock', 16)}<span data-tick="quiz">${clock2(Math.max(0, timer))}</span></span>`;
  const elapsedChip = elapsed == null ? '' : `<span class="c-act-chip" title="Tempo decorrido">${icon('clock', 16)}<span data-tick="elapsed">${clock2(elapsed)}</span></span>`;
  const gain = state.gain ? `<span class="${cx('c-act-chip c-act-chip--gain', fx(state, 'gain') && 'is-in')}" aria-live="polite">${icon('zap', 16)}+ ${state.gain}pts</span>` : '';
  return `<div class="c-act-hudrow">
    <section class="c-act-hud" aria-label="Seu desempenho">
      <div class="c-act-hud__track" role="progressbar" aria-label="Progresso na trilha" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-valuetext="${done} de ${ORDER.length} atividades concluídas" title="${done} de ${ORDER.length} atividades concluídas"><span style="width:${pct}%"></span></div>
      <div class="c-act-hud__chips">
        ${elapsedChip}${timerChip}
        <span class="${cx('c-act-chip c-act-chip--streak', state.streak > 1 && 'is-hot')}" title="Sequência de acertos">${icon('trending-up', 16)}${state.streak}</span>
        <span class="c-act-chip c-act-chip--lives" title="Vidas" aria-label="${state.lives} de 3 vidas">${hearts}</span>
        <span class="c-act-chip c-act-chip--pts" title="Pontos">${icon('zap', 16)}<span data-pts>${state.gainFrom ?? state.xp}</span> pts</span>
        ${gain}
      </div>
      ${side ? '' : closeButton('c-act-close--inline')}
    </section>
    ${side ? closeButton('c-act-close--side') : ''}
  </div>`;
}

/* ---------- Rodapé ---------- */
/** f = { label, action, disabled, tone: 'default'|'success'|'error', feedback: { tone, title, text, icon }, secondary: { label, icon, action } } */
export function footer(f) {
  const tone = f.tone ?? 'default';
  const fb = f.feedback
    ? `${icon(f.feedback.icon, 28, `c-act-foot__icon c-act-foot__icon--${f.feedback.tone}`)}<span class="c-act-foot__msg"><b class="c-act-foot__title c-act-foot__title--${f.feedback.tone}">${esc(f.feedback.title)}</b><span>${esc(f.feedback.text)}</span></span>`
    : '';
  const sec = f.secondary
    ? `<button type="button" class="c-act-btn c-act-btn--stroked" data-action="${f.secondary.action}">${icon(f.secondary.icon, 18)}${esc(f.secondary.label)}</button>`
    : '';
  return `<div class="${cx('c-act-foot', `c-act-foot--${tone}`)}">
    <div class="c-act-foot__inner">
      <div class="c-act-foot__fb" role="status">${fb}</div>
      <div class="c-act-foot__actions">
        ${sec}
        <button type="button" class="${cx('c-act-btn', `c-act-btn--${tone}`)}" data-action="${f.action ?? ''}" data-key="act-continue" ${f.disabled ? 'disabled' : ''}>${esc(f.label)}</button>
      </div>
    </div>
  </div>`;
}

/* ---------- Diálogos ---------- */
const dialog = ({ label, close, body, enter = false }) => `<div class="c-act-dialog" data-dialog>
  <div class="c-act-dialog__scrim" data-action="${close}"></div>
  <div class="${cx('c-act-dialog__box', enter && 'is-in')}" role="alertdialog" aria-modal="true" aria-labelledby="${label}-title" aria-describedby="${label}-desc">${body}</div>
</div>`;

export const exitDialog = state => dialog({
  enter: fx(state, 'dialog'),
  label: 'act-exit',
  close: 'closeExit',
  body: `<span class="c-act-dialog__badge c-act-dialog__badge--error">${icon('log-out', 24)}</span>
    <div class="c-act-dialog__text">
      <h2 class="c-act-dialog__title" id="act-exit-title">Sair da atividade?</h2>
      <p id="act-exit-desc">Seu progresso nesta atividade não será salvo e você não receberá pontos. Você poderá refazê-la depois.</p>
    </div>
    <div class="c-act-dialog__actions">
      <a class="c-act-btn c-act-btn--danger-ghost" href="#curso">Sair sem pontuar</a>
      <button type="button" class="c-act-btn c-act-btn--default" data-action="closeExit" data-autofocus>Continuar atividade</button>
    </div>`,
});

/** Confirmação da avaliação (digitar "Iniciar"): a mesma do diálogo do Curso e do Tabuleiro (js/components/exam-dialog.js). */
export const finalDialog = state => dialog({
  enter: fx(state, 'dialog'),
  label: 'act-final',
  close: 'closeFinal',
  body: examConfirm({ text: state.finalText, attempt: state.exam.tries + 1, input: 'finalText', cancel: 'closeFinal', start: 'startExam', label: 'act-final' }),
});

/* ---------- Skeleton ---------- */
export const skeleton = side => `<div class="${cx('c-act', side && 'c-act--side')} c-act--loading" data-reveal="content" aria-busy="true">
  <div class="c-act-mhead c-act-mhead--bone"><span class="c-bone"></span><span class="c-bone"></span><span class="c-bone c-bone--pill"></span></div>
  <div class="c-act__side"><div class="c-act-trail c-act-trail--bone"><span class="c-bone c-act-bone-cover"></span>${side ? range(8, () => '<span class="c-bone c-act-bone-item"></span>') : ''}</div></div>
  <div class="c-act__main">
    <div class="c-act__body">
      <span class="c-bone c-bone--pill c-act-bone-hud"></span>
      <div class="c-act-bone-content"><span class="c-bone" style="width:60%"></span><span class="c-bone" style="width:40%"></span>${range(4, () => '<span class="c-bone c-act-bone-option"></span>')}</div>
    </div>
  </div>
</div>`;


