// Conteúdo navegável do usuário: rota > curso > módulo > atividade. Tabela (a partir de 1024) e cards (abaixo).
// O estado fica na tela (state.cb): { tab, trail, q, by, dir }. Ações esperadas em `actions`:
// cbTab, cbDrill, cbBack, cbSearch, cbClearSearch e openSheet (ordenação).
import { esc, cx, norm } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { pill } from '../../components/badges.js';
import {
  kindLabel, kindIcon, plural, singular, childOf, children, rootItems, stat, requiredOf, dueDay, plays,
  defaultDir, optLabels, sortContent,
} from './data.js';
import { bar, searchField, sortButton } from './parts.js';

/** Estado inicial do conteúdo; `tab` é a aba (rota ou curso). */
export const newContent = (tab = 'rota') => ({ tab, trail: [], q: '', by: 'perf', dir: 'desc' });

/** Tudo que se deriva do estado: nível atual, itens ordenados e filtrados, critério de ordenação em uso. */
export function contentInfo(cb, memberProgress) {
  const current = cb.trail[cb.trail.length - 1];
  const kind = current ? (childOf[current.kind] ?? current.kind) : cb.tab;
  const items = current ? children(current.kind, current.path) : rootItems(cb.tab);
  const hasPrazo = kind === 'curso';
  const by = cb.by === 'prazo' && !hasPrazo ? 'perf' : cb.by; // sem prazo neste nível, volta para a performance
  const dir = by === cb.by ? cb.dir : defaultDir[by];
  const sorted = sortContent(items, { by, dir }, memberProgress);
  const term = cb.q.trim();
  const ranked = term ? sorted.filter(n => norm(n.title).includes(norm(term))) : sorted;
  return { current, kind, items, hasPrazo, by, dir, ranked, term };
}

/** Item do nível atual pelo caminho ("1.3.2"): usado pelo clique de abrir. */
export const findItem = (cb, memberProgress, id) => contentInfo(cb, memberProgress).items.find(n => n.path.join('.') === id);

const date = path => `${dueDay(path)} Out. 2027`;
const noResults = term => `<p class="c-tm-empty">Nenhum conteúdo encontrado para “${esc(term)}”.</p>`;
const itemIcon = kind => icon(kindIcon[kind], 16);

/** Abas "Rota de aprendizagem" e "Cursos". */
const typeTabs = (tab, cards) =>
  `<div role="group" aria-label="Tipo de conteúdo" class="${cx('c-tm-ctabs', cards && 'c-tm-ctabs--cards')}">${[['rota', 'Rota de aprendizagem'], ['curso', 'Cursos']].map(([id, label]) =>
    `<button type="button" class="${cx('c-tm-ctab', `c-tm-ctab--${id}`, tab === id && 'is-on')}" aria-pressed="${tab === id}" data-action="cbTab" data-value="${id}"><span class="c-tm-ctab__label">${label}</span><span class="c-tm-ctab__count">12</span></button>`).join('')}</div>`;

/* ---------- Tabela ---------- */
/** Colunas por nível. `w` é a largura em px; `compact` (1024 a 1179) estreita as colunas e tira Obrigatório e Prazo. */
function tableCols(kind, compact) {
  if (kind === 'atividade') return [['jog', 'Jogadas', 80], ['prog', 'Progressão', 128], ['perf', 'Performance', 112]];
  if (kind === 'modulo' || kind === 'rota') return [['prog', 'Progressão', 128], ['perf', 'Performance', 112]];
  if (compact) return [['prog', 'Progressão', 112], ['perf', 'Performance', 96]];
  return [['prog', 'Progressão', 128], ['perf', 'Performance', 112], ['obr', 'Obrigatório', 96], ...(kind === 'curso' ? [['prazo', 'Prazo', 112]] : [])];
}

function tableRow(n, i, { cols, compact, kind, memberProgress }) {
  const open = !!childOf[n.kind];
  const cell = {
    jog: `<span class="c-tm-ccell">${plays(n.path)}</span>`,
    prog: bar(stat(n.path, memberProgress)),
    perf: `<span class="c-tm-ccell">${stat(n.path, 5)}%</span>`,
    obr: `<span class="c-tm-ccell c-tm-ccell--emph">${icon('check-circle', 16)}</span>`,
    prazo: `<span class="c-tm-ccell">${date(n.path)}</span>`,
  };
  const sub = compact && kind === 'curso'
    ? `<span class="c-tm-crow__sub"><span class="c-tm-crow__req">${icon('check-circle', 12)}Obrigatório</span><span>Prazo ${date(n.path)}</span></span>`
    : '';
  const attrs = open ? `type="button" data-action="cbDrill" data-id="${n.path.join('.')}"` : '';
  return `${i > 0 ? '<div class="c-tm-rule c-tm-rule--inset"></div>' : ''}
  <${open ? 'button' : 'div'} ${attrs} class="${cx('c-tm-crow', compact && 'c-tm-crow--compact', open && 'is-link')}">
    <span class="c-tm-crow__main">
      <span class="${cx('c-tm-kind', n.kind === 'rota' && 'c-tm-kind--rota')}">${itemIcon(n.kind)}</span>
      <span class="c-tm-crow__text"><span class="c-tm-crow__title">${esc(n.title)}</span>${sub}</span>
    </span>
    ${cols.map(([key, , w]) => `<span class="c-tm-ccol" style="width:${w}px">${cell[key]}</span>`).join('')}
    ${kind !== 'atividade' ? `<span class="c-tm-chevron">${icon('chevron-right', 16)}</span>` : ''}
  </${open ? 'button' : 'div'}>`;
}

function contentTable(cb, info, { compact, memberProgress, slide }) {
  const { current, kind, ranked, term } = info;
  const cols = tableCols(kind, compact);
  const first = { atividade: 'Atividade', modulo: 'Módulo', curso: 'Curso', rota: 'Rota' }[kind];
  const head = label => `<span class="c-tm-chead">${label}${icon('arrow-down', 14)}</span>`;
  const crumbs = [kindLabel[cb.tab], ...cb.trail.slice(1).map(n => kindLabel[n.kind])];
  const back = current
    ? `<div class="c-tm-back">
        <span class="c-tm-back__crumbs">${crumbs.map((c, i) => `<span class="${cx(i === crumbs.length - 1 && 'is-last')}">${i > 0 ? '<span class="c-tm-back__sep">/</span>' : ''}${esc(c)}</span>`).join('')}</span>
        <button type="button" class="c-tm-back__btn" aria-label="Voltar um nível" data-action="cbBack">${icon('arrow-left', 18)}<span>${esc(current.title)}</span></button>
      </div>`
    : '';
  return `<div class="c-tm-content">
    ${typeTabs(cb.tab, false)}
    <div class="${cx('c-tm-slide', slide && `lp-slide-in-${slide === 'fwd' ? 'right' : 'left'}`)}">
      ${back}
      <div class="c-tm-ctable">
        <div class="c-tm-ctable__head">
          <div role="row" class="${cx('c-tm-ctable__cols', compact && 'is-compact')}">
            <span class="c-tm-ctable__first">${head(first)}</span>
            ${cols.map(([, label, w]) => `<span class="c-tm-ccol" style="width:${w}px">${head(label)}</span>`).join('')}
            ${kind !== 'atividade' ? '<span class="c-tm-chevron-space"></span>' : ''}
          </div>
        </div>
        <ul class="c-tm-ctable__list">${ranked.map((n, i) => `<li>${tableRow(n, i, { cols, compact, kind, memberProgress })}</li>`).join('')}</ul>
        ${term && ranked.length === 0 ? noResults(term) : ''}
      </div>
    </div>
  </div>`;
}

/* ---------- Cards ---------- */
/** Uma barra (Progressão) com o percentual, a Performance só como número e, em curso, prazo e obrigatoriedade. */
function leanMetrics(n, memberProgress) {
  const prog = stat(n.path, memberProgress);
  return `<span class="c-tm-lean">
    <span class="c-tm-meter"><span style="width:${prog}%"></span></span>
    <b class="c-tm-lean__pct">${prog}%</b>
    <span class="c-tm-lean__perf" aria-label="Performance">${icon('trending-up', 14, 'c-tm-icon')}${stat(n.path, 5)}%</span>
  </span>
  ${n.kind === 'curso' ? `<span class="c-tm-lean__meta">${requiredOf(n.path) ? pill({ label: 'Obrigatório', color: 'red', iconName: 'alert-circle' }) : ''}<span>até <b>${date(n.path)}</b></span></span>` : ''}`;
}

function contentCards(cb, info, { search, memberProgress, slide }) {
  const { current, kind, ranked, term, by, dir } = info;
  const sortLabel = optLabels[by][dir];
  const back = current
    ? `<div class="c-tm-cback">
        <span class="c-tm-cback__crumbs">${cb.trail.slice(0, -1).map(n => `${esc(n.title)} / `).join('')}<b>${singular[current.kind]}</b></span>
        <button type="button" class="c-tm-cback__btn" aria-label="Voltar um nível" data-action="cbBack">${icon('arrow-left', 16)}<span>${esc(current.title)}</span></button>
      </div>`
    : '';
  const heading = current
    ? `<h3 class="c-tm-chead3"><span>${plural[kind]}</span><span class="c-tm-chead3__count">${ranked.length}</span></h3>`
    : '<span class="c-tm-sortbar__label">Ordenar por</span>';
  return `<div class="c-tm-content c-tm-content--cards">
    ${typeTabs(cb.tab, true)}
    ${search ? searchField({ value: cb.q, label: 'Buscar conteúdo', input: 'cbSearch', clear: 'cbClearSearch', key: 'tm-content-search' }) : ''}
    <div class="${cx('c-tm-slide', slide && `lp-slide-in-${slide === 'fwd' ? 'right' : 'left'}`)}">
      ${back}
      <div class="c-tm-sortbar">${heading}${sortButton({ label: sortLabel, kind: 'contentSort', aria: `Ordenar por ${sortLabel}. Tocar para mudar.` })}</div>
      <ul class="c-tm-clist">${ranked.map(n => {
        const open = !!childOf[n.kind];
        const attrs = open ? `type="button" data-action="cbDrill" data-id="${n.path.join('.')}"` : '';
        return `<li><${open ? 'button' : 'div'} ${attrs} class="c-tm-ccard">
          <span class="c-tm-ccard__title"><span class="c-tm-ccard__icon">${itemIcon(n.kind)}</span><span class="c-tm-ccard__text">${esc(n.title)}</span>${open ? icon('chevron-right', 18, 'c-tm-ccard__go') : ''}</span>
          ${leanMetrics(n, memberProgress)}
          ${kind === 'atividade' ? `<span class="c-tm-ccard__plays">Jogadas <b>${plays(n.path)}</b></span>` : ''}
        </${open ? 'button' : 'div'}></li>`;
      }).join('')}</ul>
    </div>
    ${term && ranked.length === 0 ? noResults(term) : ''}
  </div>`;
}

/**
 * Conteúdo navegável. variant: 'table' (a partir de 1024) ou 'cards'. `compact` estreita a tabela (1024 a 1179),
 * `search` mostra a busca (cards no perfil do mobile), `slide` ('fwd' | 'back' | '') anima a troca de nível.
 */
export function contentBrowser(cb, { variant, memberProgress, compact = false, search = false, slide = '' }) {
  const info = contentInfo(cb, memberProgress);
  return variant === 'table'
    ? contentTable(cb, info, { compact, memberProgress, slide })
    : contentCards(cb, info, { search, memberProgress, slide });
}
