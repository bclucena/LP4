// Página do usuário da tela Gestores. A partir de 1024: indicadores, conteúdo em tabela, horas, certificados, conquistas e missões.
// Abaixo de 1024 (versão "B"): cabeçalho enxuto, abas Resumo, Conteúdo, Certificados e Missões e um único painel por vez.
import { esc, cx } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { minWidth } from '../../core/media.js';
import { avatar } from '../../components/avatar.js';
import { contentBrowser } from './content.js';
import { filterLines, sortButton } from './parts.js';
import {
  badgeTones, certOrderLabel, certs, fmtDate, sortCerts, missionStates, missionTitle, filterMissions,
} from './data.js';

/* ---------- Cabeçalho do usuário ---------- */
function profileHeader(m) {
  return `<section class="c-tm-card c-tm-head">
    <span class="c-tm-head__avatar-m"><span class="c-tm-head__ring">${avatar({ size: 'large', use: 'illustration', px: 60 })}</span><span class="c-tm-level">Nv.2</span></span>
    <span class="c-tm-head__avatar-d"><span class="c-tm-head__ring c-tm-head__ring--lg">${avatar({ size: 'large', use: 'illustration' })}</span><span class="c-tm-level c-tm-level--lg">Nv.2</span></span>
    <span class="c-tm-head__who">
      <b class="c-tm-head__name">${esc(m.name)}</b>
      <span class="c-tm-head__email">${esc(m.email)}</span>
      <span class="c-tm-head__level"><b>Nível 2</b><span class="c-tm-dot"></span><span>Especialista II</span></span>
    </span>
    <span class="c-tm-head__side">
      <span class="c-tm-head__wallet">
        <span class="c-tm-wallet c-tm-wallet--points">${icon('star', 14)}100</span>
        <span class="c-tm-wallet c-tm-wallet--coins">${icon('dollar-sign', 14)}100</span>
      </span>
      <span class="c-tm-head__last">${icon('log-in', 16)}<b>Último acesso</b><span>31 Dez. 2027</span></span>
    </span>
  </section>`;
}

/* ---------- Cartão genérico ---------- */
const card = ({ id = '', title, subtitle = '', action = '', body, className = '' }) =>
  `<section ${id ? `id="${id}"` : ''} class="${cx('c-tm-card c-tm-section', className)}">
    <header class="c-tm-section__head">
      <div class="c-tm-section__title"><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div>
      ${action ? `<span class="c-tm-section__action">${action}</span>` : ''}
    </header>
    ${body}
  </section>`;

/* ---------- Horas e conquistas ---------- */
const hoursBody = () => `<div class="c-tm-hours">
  <span class="c-tm-hours__donut-wrap">
    <span class="c-tm-donut"><span class="c-tm-donut__inner"><b>18h</b><span>Concluídas</span></span></span>
  </span>
  <span class="c-tm-hours__side">
    <span class="c-tm-hours__spacer"></span>
    <span class="c-tm-legend">${[['Realizadas', '56%', 'strong'], ['Disponíveis', '32h', 'light']].map(([k, v, tone]) =>
      `<span class="c-tm-legend__item"><span class="c-tm-legend__swatch c-tm-legend__swatch--${tone}"></span><span class="c-tm-legend__text"><b>${k}</b><b>${v}</b></span></span>`).join('')}</span>
    <span class="c-tm-hours__left">${icon('clock', 16, 'c-tm-icon')}<span>Faltam</span><b>14h</b><span>para completar</span></span>
  </span>
</div>`;

const achievementsBody = (limit = 6) =>
  `<div class="c-tm-badges">${[...badgeTones, ...badgeTones].slice(0, limit).map(([a, b]) =>
    `<span class="c-tm-badge" style="background:linear-gradient(to bottom, ${a}, ${b})">${icon('award', 32)}</span>`).join('')}</div>`;

/* ---------- Filtro de status das missões ---------- */
/** O cabeçalho "Status" abre um menu no desktop (1180+) ou o sheet "Filtrar por status" abaixo. */
function statusFilter(state, className = '') {
  const sel = state.statusSel;
  const wide = minWidth(1180);
  const open = state.statusMenu && wide;
  const menu = open
    ? `<div role="menu" aria-label="Filtrar por status" class="c-tm-status__menu">
        ${missionStates.map(o => {
          const on = sel.includes(o.id);
          return `<button type="button" role="menuitemcheckbox" aria-checked="${on}" class="c-tm-status__item" data-action="toggleStatusItem" data-value="${o.id}">
            <span class="${cx('c-tm-check', on && 'is-on')}">${on ? '<span></span>' : ''}</span><span class="c-tm-status__label">${o.label}</span><span class="c-tm-state-dot c-tm-state--${o.id}"></span>
          </button>`;
        }).join('')}
        ${sel.length > 0 ? '<button type="button" class="c-tm-status__clear" data-action="clearStatus">Limpar seleção</button>' : ''}
      </div>`
    : '';
  return `<span class="${cx('c-tm-status', className)}" data-popover>
    <button type="button" class="c-tm-status__btn" aria-haspopup="menu" aria-expanded="${open}" data-action="toggleStatus">Status${sel.length > 0 ? `<span class="c-tm-status__badge">${sel.length}</span>` : ''}${filterLines(14, open ? 'is-open' : '')}</button>
    ${menu}
  </span>`;
}

const statePill = (s, cls = '') => `<span class="${cx('c-tm-state', `c-tm-state--${s.id}`, cls)}">${s.label}</span>`;

/* ---------- Certificados e missões: tablet e desktop (listas roláveis) ---------- */
const scrollList = (head, rows) =>
  `<div class="c-tm-scroll"><div class="c-tm-scroll__top"><div class="c-tm-scroll__head">${head}</div><div class="c-tm-rule"></div></div><div class="c-tm-scroll__body u-thin-scroll">${rows}</div></div>`;
const headText = (label, cls = '') => `<span class="${cx('c-tm-htext', cls)}">${label}${icon('arrow-down', 14)}</span>`;
const rowIcon = name => `<span class="c-tm-row-icon">${icon(name, 18)}</span>`;
const rowRule = i => (i > 0 ? '<div class="c-tm-rule c-tm-rule--inset"></div>' : '');

const certsCard = () => card({
  title: 'Certificados', subtitle: 'Últimos certificados recebidos', action: icon('search', 16),
  body: scrollList(headText('Título'), Array.from({ length: 6 }, (_, i) => `<div>${rowRule(i)}
    <div class="c-tm-lrow">${rowIcon('award')}
      <span class="c-tm-lrow__text"><b>${esc(certs[0].title)}</b><span>${fmtDate(certs[0].date)}</span></span>
      <button type="button" class="c-tm-download" aria-label="Baixar certificado">${icon('download', 16)}</button>
    </div></div>`).join('')),
});

const missionsCard = state => {
  const rows = filterMissions(state.statusSel).map((x, i) => `<div>${rowRule(i)}
    <div class="c-tm-lrow">${rowIcon('target')}
      <span class="c-tm-lrow__text"><b>${esc(missionTitle)}</b><span class="c-tm-lrow__meta">${icon('flag', 12)}Meta · Individual</span></span>
      ${statePill(x.state, 'c-tm-state--lg')}
    </div></div>`).join('');
  return card({
    title: 'Missões', subtitle: 'Missões disponíveis', action: icon('search', 16),
    body: scrollList(`${headText('Título', 'c-tm-htext--grow')}${statusFilter(state, 'c-tm-status--head')}`, rows),
  });
};

/* ---------- Certificados e missões: mobile (listas simples, em cartão próprio) ---------- */
function certsMobile(state) {
  const label = certOrderLabel(state.certOrder);
  return `<section id="sec-certs" class="c-tm-card c-tm-section c-tm-section--flat">
    <header class="c-tm-section__head c-tm-section__head--between">
      <div class="c-tm-section__title"><h2>Certificados do usuário</h2><p>Certificados recebidos pelo usuário</p></div>
      ${sortButton({ label, kind: 'certs', aria: `Ordenar por ${label}. Tocar para mudar.` })}
    </header>
    <ul class="c-tm-mlist">${sortCerts(state.certOrder).map((c, i) => `<li>${rowRule(i)}
      <div class="c-tm-mrow"><span class="c-tm-mrow__icon">${icon('award', 20)}</span>
        <span class="c-tm-mrow__body"><b>${esc(c.title)}</b>
          <span class="c-tm-mrow__foot"><span class="c-tm-mrow__meta">${icon('calendar', 12)}${fmtDate(c.date)}</span>
            <button type="button" class="c-tm-mrow__download" aria-label="Baixar certificado">${icon('download', 16)}</button></span>
        </span>
      </div></li>`).join('')}</ul>
  </section>`;
}

function missionsMobile(state) {
  const all = filterMissions(state.statusSel);
  return `<section id="sec-missoes" class="c-tm-card c-tm-section c-tm-section--flat">
    <header class="c-tm-section__head c-tm-section__head--between">
      <div class="c-tm-section__title"><h2>Missões do usuário</h2><p>Missões para o usuário participar</p></div>
      ${statusFilter(state, 'c-tm-status--corner')}
    </header>
    ${all.length === 0 ? '<p class="c-tm-empty">Nenhuma missão com esse status.</p>' : ''}
    <ul class="c-tm-mlist">${all.map((m, i) => `<li>${rowRule(i)}
      <div class="c-tm-mrow"><span class="c-tm-mrow__icon">${icon('target', 20)}</span>
        <span class="c-tm-mrow__body"><b>${esc(missionTitle)}</b>
          <span class="c-tm-mrow__foot"><span class="c-tm-mrow__meta">${icon('flag', 12)}Meta · Individual</span>${statePill(m.state)}</span>
        </span>
      </div></li>`).join('')}</ul>
  </section>`;
}

/* ---------- Resumo (abaixo de 1024) ---------- */
function summaryBlock(m) {
  const hero = [['Progressão', m.progress, 'pie-chart'], ['Performance', m.performance, 'trending-up']];
  const shortcuts = [
    ['conteudo', '<span class="c-tm-only-m">Rotas</span><span class="c-tm-only-md">Rotas de aprendizagem</span>', m.courses, 'layers', 'rota'],
    ['conteudo', 'Cursos', m.courses, 'book', 'curso'],
    ['certs', 'Certificados', m.certs, 'award', ''],
    ['missoes', 'Missões', m.missions, 'target', ''],
  ];
  return `<div class="c-tm-summary">
    ${hero.map(([k, v, ic]) => `<div class="c-tm-hero">
      <span class="c-tm-hero__label"><span class="c-tm-ibox">${icon(ic, 16)}</span>${k}</span>
      <b>${v}%</b>
      <span class="c-tm-meter"><span style="width:${v}%"></span></span>
    </div>`).join('')}
    ${shortcuts.map(([id, label, value, ic, kind]) => `<button type="button" class="c-tm-shortcut" data-action="goSection" data-id="${id}" data-kind="${kind}">
      <span class="c-tm-shortcut__body">
        <span class="c-tm-shortcut__label"><span class="c-tm-ibox">${icon(ic, 16)}</span><span class="c-tm-shortcut__text">${label}</span></span>
        <b>${value}<small>/128</small></b>
      </span>
      ${icon('chevron-right', 18, 'c-tm-shortcut__go')}
    </button>`).join('')}
  </div>
  <div class="c-tm-pair">
    ${card({ title: 'Conquistas', subtitle: 'Últimas conquistas recebidas', body: achievementsBody(6) })}
    ${card({ title: 'Horas de treinamento', subtitle: 'Quantidade de horas treinadas vs. disponíveis', body: hoursBody() })}
  </div>`;
}

/* ---------- Página completa (a partir de 1024) ---------- */
export function profileWide(state, m) {
  const stats = [
    ['Progressão', `${m.progress}%`, '', 'pie-chart'],
    ['Performance', `${m.performance}%`, '', 'trending-up'],
    ['Cursos', m.courses, '/128', 'book'],
    ['Certificados', m.certs, '/128', 'award'],
    ['Missões', m.missions, '/128', 'target'],
  ];
  return `<div class="c-tm-profile">
    <button type="button" class="c-tm-back-link" data-action="closeProfile">${icon('arrow-left', 14)}Voltar</button>
    ${profileHeader(m)}
    <div class="c-tm-stats">${stats.map(([k, v, total, ic]) => `<div class="c-tm-stat">
      <span class="c-tm-stat__label"><span class="c-tm-ibox">${icon(ic, 16)}</span>${k}</span>
      <b>${v}${total ? `<small>${total}</small>` : ''}</b>
    </div>`).join('')}</div>
    ${card({
      id: 'sec-conteudo', title: 'Conteúdo', subtitle: 'Informação do desempenho nas rotas de aprendizagem e cursos', action: icon('search', 16), className: 'c-tm-section--content',
      body: contentBrowser(state.cb, { variant: 'table', compact: !minWidth(1180), memberProgress: m.progress, slide: state.slide }),
    })}
    <div class="c-tm-grid">
      ${card({ id: 'sec-horas', title: 'Horas de treinamento', subtitle: 'Quantidade de horas treinadas vs. disponíveis', body: hoursBody() })}
      ${certsCard()}
      ${card({ id: 'sec-conquistas', title: 'Conquistas', subtitle: 'Últimas conquistas recebidas', body: achievementsBody() })}
      ${missionsCard(state)}
    </div>
  </div>`;
}

/* ---------- Versão B (abaixo de 1024) ---------- */
export const profileTabs = [
  { id: 'resumo', label: 'Resumo' }, { id: 'conteudo', label: 'Conteúdo' }, { id: 'certs', label: 'Certificados' }, { id: 'missoes', label: 'Missões' },
];

export function profileNarrow(state, m) {
  const sec = state.sec;
  let panel = '';
  if (sec === 'resumo') panel = summaryBlock(m);
  else if (sec === 'conteudo') {
    panel = card({
      title: 'Conteúdo', subtitle: 'Informação do desempenho nas rotas e cursos',
      body: contentBrowser(state.cb, { variant: 'cards', compact: true, search: true, memberProgress: m.progress, slide: state.slide }),
    });
  } else if (sec === 'missoes') panel = missionsMobile(state);
  else if (sec === 'certs') panel = certsMobile(state);
  return `<div class="c-tm-profile c-tm-profile--b">
    <div class="c-tm-topbar"><button type="button" class="c-tm-topbar__back" data-action="closeProfile">${icon('arrow-left', 14)}Voltar</button></div>
    ${profileHeader(m)}
    <div role="tablist" aria-label="Seções do usuário" class="c-tm-tabs u-hide-scroll" data-scroll-key="tm-tabs">
      ${profileTabs.map(t => `<button type="button" role="tab" class="${cx('c-tm-tab', sec === t.id && 'is-on')}" aria-selected="${sec === t.id}" data-action="goSection" data-id="${t.id}" data-kind="${t.id === 'conteudo' ? 'rota' : ''}">${t.label}</button>`).join('')}
    </div>
    <div role="tabpanel" class="c-tm-panel">${panel}</div>
  </div>`;
}
