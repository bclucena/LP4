// Lista "Usuários" da tela Gestores: tabela a partir de 1024, cards abaixo (com busca e ordenação em sheet) e rodapé com paginação.
import { esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { minWidth } from '../../core/media.js';
import { avatar } from '../../components/avatar.js';
import { pagination } from '../../components/pagination.js';
import { pillMenu, radioMenu } from '../../components/filters.js';
import { menuTop, menuHeader } from '../../shell/shell.js';
import { courseOptions, userOrderOptions } from './data.js';
import { bar, searchField, sortButton } from './parts.js';

const WIDE = 1024; // a partir daqui a lista vira tabela e o usuário abre na página completa

const courseLabel = id => courseOptions.find(o => o.id === id).label;

/* ---------- Menus (filtro por curso) ---------- */
export function listMenus(state) {
  const dirty = state.course !== 'todos';
  const filters = `${pillMenu({
    id: 'course', label: courseLabel(state.course), active: dirty, open: state.menu === 'course',
    content: radioMenu({ filter: 'course', options: courseOptions, value: state.course }),
  })}<button type="button" class="c-clear" data-action="clearCourse" ${dirty ? '' : 'disabled'}>Limpar</button>`;
  return `${menuTop({ title: 'Meu time', tabs: [], tab: '', filterLabel: courseLabel(state.course) })}${menuHeader({ tabs: [], tab: '', filters })}`;
}

/* ---------- Tabela (a partir de 1024) ---------- */
const sortHead = (label, key, sort, extra = '') => {
  const on = sort.key === key;
  const aria = on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none';
  return `<button type="button" class="c-tm-sort-head ${extra}" aria-sort="${aria}" data-action="sortBy" data-id="${key}">${label}${icon(on && sort.dir === 'asc' ? 'arrow-up' : 'arrow-down', 14)}</button>`;
};

const nameCell = m =>
  `${avatar({ size: 'small', use: 'illustration' })}<span class="c-tm-person"><b>${esc(m.name)}</b><span>${esc(m.email)}</span></span>`;

function table(state, list) {
  const s = state.sort;
  return `<div class="c-tm-table-scroll u-thin-scroll" data-scroll-key="tm-table">
    <div role="table" class="c-tm-table">
      <div class="c-tm-table__head">
        <div role="row" class="c-tm-table__cols">
          ${sortHead('Nome', 'name', s, 'c-tm-col-name')}
          ${sortHead('Progressão', 'progress', s, 'c-tm-col-progress')}
          ${sortHead('Performance', 'performance', s, 'c-tm-col-perf')}
          ${sortHead('Curso', 'courses', s, 'c-tm-col-small')}
          ${sortHead('Certificados', 'certs', s, 'c-tm-col-small')}
          ${sortHead('Último acesso', 'last', s, 'c-tm-col-last')}
        </div>
        <div class="c-tm-rule"></div>
      </div>
      <div class="c-tm-table__body">
        ${list.map((m, i) => `${i > 0 ? '<div class="c-tm-rule c-tm-rule--inset"></div>' : ''}
        <button type="button" role="row" class="c-tm-row" data-action="openProfile" data-id="${m.id}">
          <span class="c-tm-col-name c-tm-row__name">${nameCell(m)}</span>
          <span class="c-tm-col-progress">${bar(m.progress)}</span>
          <span class="c-tm-col-perf c-tm-cell">${icon('trending-up', 14, 'c-tm-icon')}${m.performance}%</span>
          <span class="c-tm-col-small c-tm-cell">${m.courses}/128</span>
          <span class="c-tm-col-small c-tm-cell">${m.certs}/128</span>
          <span class="c-tm-col-last c-tm-cell">${esc(m.last)}</span>
        </button>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------- Cards (abaixo de 1024) ---------- */
const userCard = m => `<li class="c-tm-user-item">
  <button type="button" class="c-tm-user-card" data-action="openProfile" data-id="${m.id}">
    <span class="c-tm-user-card__who">${avatar({ size: 'small', use: 'illustration' })}<span class="c-tm-person c-tm-person--card"><b>${esc(m.name)}</b><span>${esc(m.email)}</span></span></span>
    <span class="c-tm-user-card__metrics">
      <span class="c-tm-meter" role="img" aria-label="Progressão ${m.progress}%"><span style="width:${m.progress}%"></span></span>
      <b class="c-tm-user-card__pct">${m.progress}%</b>
      <span class="c-tm-user-card__perf" aria-label="Performance ${m.performance}%">${icon('trending-up', 14, 'c-tm-icon')}${m.performance}%</span>
    </span>
    <span class="c-tm-user-card__facts">
      <span>${icon('book', 14, 'c-tm-icon')}Cursos <b>${m.courses}/128</b></span>
      <span>${icon('award', 14, 'c-tm-icon')}Certificados <b>${m.certs}/128</b></span>
      <span>${icon('log-in', 14, 'c-tm-icon')}Último acesso <b>${esc(m.last)}</b></span>
    </span>
  </button>
</li>`;

function cards(state, list) {
  const id = `${state.sort.key}-${state.sort.dir}`;
  const label = userOrderOptions.find(o => o.id === id)?.label ?? 'Maior performance';
  return `<div class="c-tm-cards">
    ${state.searching ? searchField({ value: state.q, label: 'Buscar usuário', input: 'userSearch', clear: 'clearUserSearch', key: 'tm-user-search' }) : ''}
    <div class="c-tm-sortbar">
      <span>Ordenar por</span>
      ${sortButton({ label, kind: 'userSort', aria: `Ordenar por ${label}. Tocar para mudar.` })}
    </div>
    <ul class="c-tm-user-list">${list.map(userCard).join('')}</ul>
  </div>`;
}

/* ---------- Conteúdo da lista ---------- */
export function listContent(state, list) {
  if (state.loading) return '<div class="c-tm-skeleton"></div>';
  const wide = minWidth(WIDE);
  return `<div class="c-tm-page">
    <section class="c-tm-card c-tm-users">
      <header class="c-tm-users__head">
        <span class="c-tm-users__title"><h2>Usuários</h2><p>Informação do desempenho nas rotas e cursos</p></span>
        ${wide ? '' : `<button type="button" class="c-tm-icon-btn" aria-label="Buscar usuário" aria-pressed="${state.searching}" data-action="toggleUserSearch">${icon('search', 16)}</button>`}
      </header>
      ${wide ? table(state, list) : cards(state, list)}
    </section>
    <div class="c-tm-footer">
      <span>Mostrando <b>${list.length}</b> de 31</span>
      <span class="c-tm-footer__pages">${pagination({ page: state.page, pages: 4 })}</span>
      <span class="c-tm-footer__size">Exibir 12</span>
    </div>
  </div>`;
}
