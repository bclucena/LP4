/* Peças da casca da tela Atividades: cabeçalho mobile, menu de atividades (capa + grupos), barra de desempenho (HUD),
   rodapé "Continuar", diálogos (sair e iniciar avaliação) e skeleton. */

import { cx, esc, norm, range } from '../../core/dom.js';
import { icon, hasIcon } from '../../core/icons.js';
import { lpIcon } from '../../core/lp-icons.js';
import { avatar } from '../../components/avatar.js';
import { pill } from '../../components/badges.js';
import { searchField } from '../../components/search.js';
import { feedback } from '../../components/feedback.js';
import { button, buttonIcon } from '../../components/button.js';
import { progressBar, progressDonut } from '../../components/progress.js';
import { logo } from '../../shell/shell.js';
import { activities, activityCourse, activityGroups, activityModules, searchText, EXAM_ID, exam } from '../../data/activity.js';
import { ORDER, actById, fx, clock2, statusOf } from './flow.js';
import { examConfirm } from '../../components/exam-dialog.js';
import { panel } from '../../components/panel.js';
import { soundOn } from '../../core/sound.js';
import { fmtMinutes } from '../../data/course-detail.js';

/** Ícone da atividade: Feather quando existir; senão o LP-Icon de mesmo nome (ex.: challenge na avaliação). */
const glyph = (name, px, cls = '') => (hasIcon(name) ? icon(name, px, cls) : lpIcon(name, px, cls));


/** Andamento da atividade = progressDonut do design system em 24px. `data-ring` permite atualizar sem refazer a tela. */
export const ring = (pct, id) => progressDonut(pct, { size: 24, ringId: id });

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
  // A busca saiu da capa (25/11/2026). No mobile fica só o botão de mostrar/ocultar a lista; no menu lateral, nenhum botão.
  const tools = side ? '' : `<div class="c-act-cover__tools">
      ${buttonIcon({ style: 'ghost', name: state.trailOpen ? 'chevron-up' : 'chevron-down', label: state.trailOpen ? 'Ocultar atividades' : 'Mostrar atividades', action: 'toggleTrail', className: 'c-act-cover__tool', attrs: { 'aria-expanded': String(state.trailOpen) } })}
    </div>`;
  const info = `<div class="c-act-cover__info">
      <span class="c-act-cover__kicker">Curso</span>
      <span class="c-act-cover__title">${esc(activityCourse.title)}</span>
      ${progressBar({ value: pct, label: 'Progresso do curso', valueText: `${pct}% concluído`, className: 'c-act-cover__bar' })}
      <span class="c-act-cover__pct" aria-hidden="true">${pct}%</span>
    </div>`;
  const search = searchField({ placeholder: 'Buscar', label: 'Buscar nas atividades', value: s.q, input: 'searchQ', key: 'act-search',
    clear: { action: 'toggleSearch', label: 'Fechar busca' }, className: 'c-act-search' });
  return `<div class="${cx('c-act-cover', side && 'c-act-cover--side', s.open && 'c-act-cover--search', fx(state, 'searchOpen') && 'is-searching')}">
    <div class="c-act-cover__img" style="background-image:url('${esc(activityCourse.cover)}')" aria-hidden="true"></div>
    <div class="c-act-cover__shade" aria-hidden="true"></div>
    ${s.open ? search : tools + info}
  </div>`;
}

function itemButton(state, a, { meta, statusHtml, className = '' }) {
  const st = statusOf(state, a.id);
  const cur = state.view === a.id;
  return `<button type="button" class="${cx('c-act-item', className, cur && 'is-current', st === 'locked' && 'is-locked')}" data-action="openAct" data-id="${a.id}" ${cur ? 'aria-current="step"' : ''} ${st === 'locked' ? 'aria-disabled="true"' : ''}>
    ${glyph(a.icon, 20, 'c-act-item__icon')}
    <span class="c-act-item__text"><span class="c-act-item__title" title="${esc(a.title)}">${esc(a.title)}</span><span class="c-act-item__meta">${meta}</span></span>
    ${statusHtml}
  </button>`;
}

/** Acesso ao card de atividade pelo estado da trilha (tweak "Estado da trilha"; mi = módulo, i = posição no módulo, 0…):
    - não iniciado: só a 1ª atividade do módulo 1 liberada; as demais bloqueadas (não abrem para mostrar as mecânicas);
    - em andamento: até a 5ª atividade do módulo 1 liberadas; as demais bloqueadas;
    - concluído: todas liberadas;
    - todas liberadas: todas clicáveis (abrem a atividade), mas sem abrir a lista de mecânicas.
    Devolve 'open' (liberada), 'locked' (bloqueada) ou 'link' (só clicável). */
export function groupAccess(state, mi, i) {
  const e = state.tw?.estado;
  if (e === 'concluido') return 'open';
  if (e === 'liberado') return 'link';
  if (e === 'andamento') return mi === 0 && i < 5 ? 'open' : 'locked';
  return mi === 0 && i === 0 ? 'open' : 'locked';
}

function groups(state, pctOf) {
  // `n`: número da atividade dentro do módulo (a contagem recomeça em 1 a cada módulo); sem módulo, vale o rótulo dos dados.
  const group = (g, n, mi) => {
    const label = n ? `Atividade ${n}` : g.label;
    const access = mi === undefined ? 'open' : groupAccess(state, mi, n - 1);
    const done = access === 'locked' ? 0 : g.ids.filter(id => state.status[id] === 'done').length;
    const open = access === 'open' && !state.closed[g.key];
    // Mecânicas em lista simples (25/11/2026): sem o andamento de cada uma (o anel na atividade também saiu).
    const items = g.ids.map(id => {
      const a = actById(id);
      return itemButton(state, a, { meta: `${esc(a.mech)} · ${a.xp}pts`, statusHtml: '' });
    }).join('');
    const names = `<span class="c-act-group__names"><span class="c-act-group__label">${esc(label)}<span class="c-cd-bullet c-act-group__bullet" aria-hidden="true"></span><span class="c-act-group__count" title="${done} de ${g.ids.length} concluídas">${done}/${g.ids.length}</span></span><span class="c-act-group__name" title="${esc(g.name)}">${esc(g.name)}</span></span>`;
    // Bloqueada: não abre (cadeado no lugar do chevron). Só clicável ("Todas liberadas"): abre a 1ª mecânica da atividade, sem
    // mostrar a lista de mecânicas (seta para a direita). Liberada: abre e fecha a lista, como antes.
    const head = access === 'locked'
      ? `<div class="c-act-group__head is-locked" aria-disabled="true" title="Conclua as atividades anteriores para desbloquear">${names}<span class="c-act-group__lock">${icon('lock', 16)}</span><span class="u-sr-only">Bloqueada</span></div>`
      : access === 'link'
        ? `<button type="button" class="c-act-group__head is-link" data-action="openAct" data-id="${g.ids[0]}">${names}${icon('chevron-right', 16, 'c-act-group__go')}</button>`
        : `<button type="button" class="c-act-group__head" data-action="toggleGroup" data-id="${g.key}" aria-expanded="${open}">${names}${icon('chevron-down', 16, cx('c-act-group__caret', open && 'is-open'))}</button>`;
    return `<div class="${cx('c-act-group', access !== 'open' && `c-act-group--${access}`)}">
      ${head}
      ${open ? `<div class="c-act-group__items">${items}</div>` : ''}
    </div>`;
  };
  // Módulo em card recolhível (rascunho de 25/11/2026; desktop e mobile): o cabeçalho é o botão, com "MÓDULO 1 • 1h 25min" em
  // cima, o título do módulo (até 2 linhas) embaixo e o chevron à direita. Aberto, mostra as atividades (cada mecânica num card)
  // e a missão do módulo; fechado, só o cabeçalho. Usa o mesmo mapa `closed` e a mesma animação dos grupos (chave "m<n>").
  // Grupos sem módulo (não listados em activityModules) vão no fim, fora dos cards.
  const used = new Set(activityModules.flatMap(m => m.groups));
  const byKey = key => activityGroups.find(g => g.key === key);
  return activityModules.map((m, mi) => {
    const key = `m${mi}`;
    const open = !state.closed[key];
    return `<div class="${cx('c-act-module', open && 'is-open')}" role="group" aria-label="${esc(`${m.label}: ${m.name}`)}">
      <button type="button" class="c-act-module__head" data-action="toggleGroup" data-id="${key}" aria-expanded="${open}">
        <span class="c-act-module__names">
          <span class="c-act-module__top"><span class="c-act-module__label">${esc(m.label)}</span><span class="c-cd-bullet c-act-module__bullet" aria-hidden="true"></span><span class="c-act-module__time">${esc(fmtMinutes(m.min))}</span></span>
          <span class="c-act-module__title" title="${esc(m.name)}">${esc(m.name)}</span>
        </span>
        ${icon('chevron-down', 16, cx('c-act-group__caret c-act-module__caret', open && 'is-open'))}
      </button>
      ${open ? `<div class="c-act-module__body">${m.groups.map(byKey).filter(Boolean).map((g, i) => group(g, i + 1, mi)).join('')}${missionCard(state, m, mi)}</div>` : ''}
    </div>`;
  }).join('') + activityGroups.filter(g => !used.has(g.key)).map(g => group(g)).join('');
}

/** Card da missão no fim de cada módulo (a mesma "Missão do módulo N" do Tabuleiro, com o ícone target). Libera quando todas
    as atividades do módulo terminam e então abre a tela Missões; antes disso fica bloqueado. */
function missionCard(state, m, mi) {
  const ids = m.groups.flatMap(key => activityGroups.find(g => g.key === key)?.ids ?? []);
  const open = ids.length > 0 && ids.every(id => state.status[id] === 'done');
  const title = `Missão do módulo ${mi + 1}`;
  const inner = `${icon('target', 20, 'c-act-item__icon')}
    <span class="c-act-item__text"><span class="c-act-item__title" title="${esc(title)}">${esc(title)}</span><span class="c-act-item__meta">${open ? 'Disponível' : 'Conclua o módulo'}</span></span>
    <span class="c-act-item__status" title="${open ? 'Disponível' : 'Bloqueada'}">${icon(open ? 'chevron-right' : 'lock', 16)}</span>`;
  const cls = cx('c-act-item c-act-item--exam c-act-item--mission', !open && 'is-locked');
  return `<div class="c-act-module__mission">${open
    ? `<a class="${cls}" href="#missoes">${inner}</a>`
    : `<div class="${cls}" aria-disabled="true">${inner}<span class="u-sr-only">Bloqueada</span></div>`}</div>`;
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

/** Menu de atividades: capa do curso, grupos recolhíveis e avaliação final. No desktop fica fixo ao lado. */
export function trail(state, { side, pctOf }) {
  const listOpen = side || state.trailOpen || state.search.open;
  const list = state.search.open ? searchResults(state) : groups(state, pctOf) + examCard(state);
  return `<aside class="c-act-trail" aria-label="Atividades do curso">
    ${cover(state, side)}
    ${listOpen ? `<nav class="c-act-trail__list" aria-label="Lista de atividades" data-scroll-key="act-trail">${list}</nav>` : ''}
  </aside>`;
}

/** Mobile e tablet (abaixo de 1024; 25/11/2026): sem a capa do curso; a lista de atividades abre num bottom sheet pelo botão de
    menu da barra (toggleTrail) — os mesmos grupos e a avaliação final do menu lateral. */
export function trailSheet(state, { pctOf }) {
  if (!state.trailOpen) return '';
  const body = `<div class="c-act-trail c-act-sheet">
      <h2 class="c-act-sheet__title">Atividades do curso</h2>
      <nav class="c-act-trail__list" aria-label="Lista de atividades" data-scroll-key="act-trail">${groups(state, pctOf)}${examCard(state)}</nav>
    </div>`;
  return panel({ mode: 'sheet', label: 'Atividades do curso', body, closeAction: 'closeTrail', enter: fx(state, 'trailIn'), className: 'c-act-sheet__box' });
}

/* ---------- Barra de desempenho (HUD) ---------- */
/* Montada só com componentes do design system: progressBar (progress.js), pill com contorno (badges.js) e buttonIcon large
   com contorno (button.js). As classes c-act-hud__* são só ganchos de posição e de animação. */
/* Botão "mais" (25/11/2026; no lugar do X): abre as opções da atividade. Desktop: menu suspenso embaixo do botão, com
   Preferências → Efeitos sonoros (chave) e Sair da atividade. Mobile e tablet: as mesmas opções num bottom sheet, mais
   "Ver atividades do curso" (o botão de menu da barra saiu). Sair abre a confirmação de sempre (openExit). */
const moreButton = (state, side, className) => buttonIcon({ name: 'more-vertical', label: 'Mais opções', action: 'toggleMore', className: cx('c-act-hud__close', 'c-act-hud__more', className), attrs: { 'aria-haspopup': side ? 'true' : 'dialog', 'aria-expanded': String(!!state.moreOpen), 'aria-controls': side ? 'act-more' : undefined } });

function moreItems(side) {
  const on = soundOn();
  return `<span class="c-act-more__kicker" id="act-more-prefs">Preferências</span>
    <button type="button" role="switch" aria-checked="${on}" class="c-act-more__item" data-action="toggleSound">
      ${icon(on ? 'volume-2' : 'volume-x', 20)}<span class="c-act-more__label">Efeitos sonoros</span>
      <span class="c-switch" aria-hidden="true"><span class="c-switch__knob"></span></span>
    </button>
    <hr class="c-act-more__rule" />
    ${side ? '' : `<button type="button" class="c-act-more__item" data-action="moreTrail">${icon('list', 20)}<span class="c-act-more__label">Ver atividades do curso</span>${icon('chevron-right', 16, 'c-act-more__go')}</button>`}
    <button type="button" class="c-act-more__item c-act-more__item--exit" data-action="moreExit">${icon('log-out', 20)}<span class="c-act-more__label">Sair da atividade</span></button>`;
}

/** Desktop: menu suspenso (dentro da barra, ancorado no botão). */
export const moreMenu = state => (state.moreOpen ? `<div class="c-act-more" id="act-more" role="group" aria-label="Mais opções">${moreItems(true)}</div>` : '');

/** Mobile e tablet: bottom sheet com as opções. */
export const moreSheet = state => (state.moreOpen
  ? panel({ mode: 'sheet', label: 'Mais opções', body: `<div class="c-act-more c-act-more--sheet">${moreItems(false)}</div>`, closeAction: 'closeMore', enter: fx(state, 'moreIn'), className: 'c-act-more__box' })
  : '');

/* Os sons de feedback ligam e desligam no menu do perfil, em "Sons da plataforma" (js/components/profile-menu.js). */

export function hud(state, { side, elapsed, timer }) {
  const pct = trailPct(state);
  const done = ORDER.filter(id => state.status[id] === 'done').length;
  const hearts = range(3, i => `<span class="${cx('c-act-heart', i < state.lives && 'is-on')}">${icon('heart', 16)}</span>`);
  const low = timer != null && timer <= 5;
  const timerPill = timer == null ? '' : pill({ color: low ? 'red' : 'grey', outline: true, iconName: 'clock', className: 'c-act-hud__timer',
    html: `<span data-tick="quiz">${clock2(Math.max(0, timer))}</span>`, attrs: { title: 'Tempo restante', 'data-tick-box': 'quiz' } });
  const elapsedPill = elapsed == null ? '' : pill({ color: 'grey', outline: true, iconName: 'clock',
    html: `<span data-tick="elapsed">${clock2(elapsed)}</span>`, attrs: { title: 'Tempo decorrido' } });
  const gain = state.gain ? pill({ color: 'green', outline: true, iconName: 'star', label: `+ ${state.gain} pts`,
    className: cx('c-act-hud__gain', fx(state, 'gain') && 'is-in'), attrs: { 'aria-live': 'polite' } }) : '';
  // Mobile e tablet: o botão de menu (abre a lista de atividades no bottom sheet) à esquerda da barra e o fechar à direita, no
  // mesmo modelo do « e do X do desktop.
  return `<div class="${cx('c-act-hudrow', !side && 'c-act-hudrow--row')}">
    <section class="c-act-hud" aria-label="Seu desempenho">
      ${progressBar({ value: pct, label: 'Progresso na trilha', valueText: `${done} de ${ORDER.length} atividades concluídas`, className: 'c-act-hud__track' })}
      <div class="c-act-hud__chips">
        ${elapsedPill}${timerPill}
        ${pill({ color: state.streak > 1 ? 'yellow' : 'grey', outline: true, iconHtml: lpIcon('flame', 16), className: 'c-act-hud__streak', label: String(state.streak), attrs: { title: 'Sequência de acertos' } })}
        ${side
          ? pill({ color: 'grey', outline: true, iconOnly: false, className: 'c-act-hud__lives', html: hearts, attrs: { title: 'Vidas', role: 'img', 'aria-label': `${state.lives} de 3 vidas` } })
          // Mobile e tablet (25/11/2026): uma pílula só, com o coração e o número de vidas ("♥ 3").
          : pill({ color: 'grey', outline: true, className: cx('c-act-hud__lives-count', state.lives <= 1 && 'is-low'), html: `${icon('heart', 16)}<span>${state.lives}</span>`, attrs: { title: 'Vidas', role: 'img', 'aria-label': `${state.lives} de 3 vidas` } })}
        ${pill({ color: 'system', outline: true, iconName: 'star', html: `<span data-pts>${state.gainFrom ?? state.xp}</span> pts`, attrs: { title: 'Pontos' } })}
        ${gain}
      </div>
    </section>
    ${side ? `${moreButton(state, true, 'c-act-hud__close--side')}${moreMenu(state)}` : moreButton(state, false, 'c-act-hud__close--row')}
  </div>`;
}

/* ---------- Rodapé ---------- */
/** f = { label, action, disabled, tone: 'default'|'success'|'error', feedback: { tone, title, text, icon }, secondary: { label, icon, action },
    aux: [{ label, icon, action, disabled, title, data }] } — aux: as ajudas da mecânica (Dica, Recomeçar, Limpar, Encaixar uma,
    Mostrar onde…), stroked, ao lado do Continuar (25/11/2026); no mobile só com o ícone (o nome vai no aria-label e no title).
    Depois da resposta a barra pinta o fundo do tom e mostra, à esquerda, o resultado: área do ícone (40, radius xl, ícone
    na cor do tom) e o título ("Correto!", "Incorreto!", "Emparedado!", "Concluído!"…). O texto complementar
    (feedback.text) abre no modal "Explicação" (explainDialog), pelo botão outlined "Explicação", sem ícone. "Continuar"
    é sempre o botão cheio, na cor do tom. */
export function footer(f, { explain = false } = {}) {
  const tone = f.tone ?? 'default';
  const fbk = f.feedback;
  const why = fbk?.text ?? '';
  const status = fbk
    ? `<span class="${cx('c-act-foot__status', `c-act-foot__status--${fbk.tone}`)}">
        <span class="c-act-foot__status-icon" aria-hidden="true">${icon(fbk.icon ?? (fbk.tone === 'success' ? 'check-circle' : 'x-circle'), 24)}</span>
        <span class="c-act-foot__status-title">${esc(fbk.title)}</span>
      </span>`
    : '';
  const explainBtn = why
    ? button({ variant: 'stroked', label: 'Explicação', action: 'toggleExplain', className: 'c-act-foot__explain' })
      .replace('<button ', `<button aria-haspopup="dialog" aria-expanded="${explain}" `)
    : '';
  const aux = (f.aux ?? []).map(a => button({ variant: 'stroked', label: a.label, iconStart: a.icon, action: a.action, disabled: a.disabled, title: a.title ?? a.label, ariaLabel: a.label, data: a.data, className: 'c-act-foot__aux' })).join('');
  const sec = f.secondary
    ? button({ variant: 'stroked', label: f.secondary.label, iconStart: f.secondary.icon, action: f.secondary.action })
    : '';
  return `<div class="${cx('c-act-foot', `c-act-foot--${tone}`)}">
    <div class="c-act-foot__inner">
      <div class="c-act-foot__fb" role="status">${status}</div>
      <div class="c-act-foot__actions">
        ${aux}
        ${sec}
        ${explainBtn}
        ${button({ label: f.label, action: f.action || undefined, disabled: f.disabled, className: fbk ? `c-act-foot__btn--${fbk.tone}` : '', data: { key: 'act-continue' } })}
      </div>
    </div>
  </div>`;
}

/* ---------- Diálogos ---------- */
const dialog = ({ label, close, body, enter = false }) => `<div class="c-act-dialog" data-dialog>
  <div class="c-act-dialog__scrim" data-action="${close}"></div>
  <div class="${cx('c-act-dialog__box', enter && 'is-in')}" role="alertdialog" aria-modal="true" aria-labelledby="${label}-title" aria-describedby="${label}-desc">${body}</div>
</div>`;

/** Modal "Explicação": o resultado (ícone e título no tom) e o texto complementar da resposta; fecha no botão, no fundo ou
    com Esc. */
export const explainDialog = (f, enter = false) => {
  const fbk = f.feedback;
  return dialog({
    enter,
    label: 'act-explain',
    close: 'toggleExplain',
    body: `<span class="c-act-dialog__badge c-act-dialog__badge--${fbk.tone}">${icon(fbk.icon ?? (fbk.tone === 'success' ? 'check-circle' : 'x-circle'), 24)}</span>
      <div class="c-act-dialog__text">
        <span class="c-act-explain__kicker">Explicação</span>
        <h2 class="c-act-dialog__title" id="act-explain-title">${esc(fbk.title)}</h2>
        <p id="act-explain-desc">${esc(fbk.text)}</p>
      </div>
      <div class="c-act-dialog__actions c-act-explain__actions">
        ${button({ variant: 'stroked', label: 'Fechar explicação', action: 'toggleExplain', data: { autofocus: '' } })}
      </div>`,
  });
};

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
      ${button({ variant: 'stroked', label: 'Sair sem pontuar', href: '#curso' })}
      ${button({ label: 'Continuar atividade', action: 'closeExit', data: { autofocus: '' } })}
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


