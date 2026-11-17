import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { lpIcon } from '../core/lp-icons.js';
import { createView } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { pill, tag } from '../components/badges.js';
import { mpill } from '../components/mobile.js';
import { avatar } from '../components/avatar.js';
import { fmtMinutes } from '../data/course-detail.js';
import { route, routeCourses, routeStates } from '../data/learning-path.js';

/* Rota de aprendizagem (#rota; Figma LP-DesignSystem 4.0, página "Rota", 1440). Abre pelos cards de rota da tela Cursos.
   Mesma montagem da tela Curso e com as mesmas classes (c-cd-*, css/screens/course-detail.css): capa larga, coluna lateral
   sticky (card da rota, "Sobre a rota" e Categorias) e as seções em cards (Descrição, Cursos, Certificado). O que é
   só da rota (trilho dos cursos e card do curso; o card do certificado saiu em 12/11/2026) fica em css/screens/learning-path.css.

   Os cursos são feitos em sequência: o trilho à esquerda marca concluído (check), atual (círculo) e bloqueado (x); um curso
   bloqueado não abre. O Figma só tem o 1440: abaixo de 1179 a tela usa os componentes mobile da tela Curso (abas de verdade).

   Parâmetros no hash: #rota?estado=nao-iniciado | andamento | concluido (padrão: andamento). */

const DESK = 1179;
const MOBILE_TABS = ['sobre', 'cursos'];

function hashState() {
  const estado = new URLSearchParams(location.hash.split('?')[1] ?? '').get('estado');
  return routeStates[estado] ? estado : 'andamento';
}

function derive(state) {
  const total = routeCourses.length;
  const done = Math.min(total, routeStates[state.estado].done(total));
  const finished = done >= total;
  const totalMin = routeCourses.reduce((sum, c) => sum + c.min, 0);
  const courses = routeCourses.map((c, i) => {
    const status = i < done ? 'done' : i === done ? 'current' : 'locked';
    const pct = status === 'done' ? 100 : status === 'current' ? routeStates[state.estado].currentPct : 0;
    return { ...c, index: i, status, pct };
  });
  return { total, done, finished, totalMin, courses };
}

const bullet = '<span class="c-cd-bullet" aria-hidden="true"></span>';
const metaLine = parts => parts.map(p => `<span>${esc(p)}</span>`).join(bullet);

const flagPills = mobile => (route.flags.novo
  ? (mobile ? mpill({ tone: 'info', iconHtml: lpIcon('badge-2', 8), label: 'Novo' }) : pill({ label: 'Novo', color: 'blue', iconHtml: lpIcon('badge-2', 16) }))
  : '');

const facts = (d, px) => [
  [lpIcon('sequence', px), `<b>Rota de aprendizagem sequencial</b>`],
  [icon('book', px), `<b>${d.total}</b> Cursos`],
  [icon('users', px), `<b>${esc(route.started)}</b> Usuários iniciaram o curso`],
  [icon('monitor', px), 'Acesso mobile e desktop'],
  [lpIcon('badge-3', px), px > 8 ? 'Certificado de conclusão' : 'Certificado'],
  [lpIcon('calendar-check-off', px), `Última atualização <b>${esc(route.updated)}</b>`],
];

const infoBox = (iconHtml, value, label) => `<div class="c-cd-box">
    <span class="c-cd-box__value">${iconHtml ? `<span class="c-cd-box__icon">${iconHtml}</span>` : ''}${esc(value)}</span>
    <span class="c-cd-box__label">${esc(label)}</span>
  </div>`;

/** Pontos e moedas recebidos/possíveis da rota ("875/3.500", como no Curso): o possível é o da rota; o recebido é a parte
    dos cursos concluídos (cada curso vale o total dividido pelo número de cursos). */
const fmtInt = n => n.toLocaleString('pt-BR');
const num = v => Number(String(v).replace(/\D/g, '')) || 0; // "3.500" → 3500
function routeRewards(d) {
  const max = { pts: num(route.points), coins: num(route.coins) };
  const share = d.finished ? 1 : d.done / d.total;
  return { got: { pts: Math.round(max.pts * share), coins: Math.round(max.coins * share) }, max };
}
const infoBoxOf = (iconHtml, got, max, label) => `<div class="c-cd-box">
    <span class="c-cd-box__value"><span class="c-cd-box__icon">${iconHtml}</span>${fmtInt(got)}<span class="c-cd-box__of">/${fmtInt(max)}</span></span>
    <span class="c-cd-box__label">${esc(label)}</span>
  </div>`;
const rewards = d => {
  const r = routeRewards(d);
  return `${infoBoxOf(icon('star', 18), r.got.pts, r.max.pts, d.finished ? 'pontos ganhos' : 'pontos disponíveis')}${infoBoxOf(lpIcon('coin', 18), r.got.coins, r.max.coins, d.finished ? 'moedas ganhas' : 'moedas disponíveis')}`;
};
const statBoxes = d => `<div class="c-cd-boxes">${infoBox('', d.total, 'Cursos')}${infoBox('', fmtMinutes(d.totalMin), 'Tempo da rota')}</div>`;
const categoryTags = mobile => `<div class="c-cd-tags">${route.categories.map(c => tag({ label: c, size: mobile ? 'mobile' : 'md' })).join('')}</div>`;

/* ---------- Desktop ---------- */
const hero = () => `<section class="c-cd-hero" aria-labelledby="lp-title">
    <div class="c-cd-hero__back" aria-hidden="true">
      <img class="c-cd-hero__image" src="${esc(route.banner)}" alt="" />
      <span class="c-cd-hero__scrim"></span>
    </div>
    <div class="c-cd-hero__info">
      <div class="c-cd-hero__flags">${flagPills(false)}</div>
      <div class="c-cd-hero__group">
        <div class="c-cd-hero__titles">
          <span class="c-cd-hero__kicker">${esc(route.kicker)}</span>
          <h1 class="c-cd-hero__title" id="lp-title">${esc(route.title)}.</h1>
        </div>
      </div>
    </div>
  </section>`;

const sideCard = d => `<aside class="c-cd-side c-cd-side--course" aria-label="Resumo da rota">
    <img class="c-cd-side__cover" src="${esc(route.cover)}" alt="" />
    <ul class="c-cd-side__facts">${facts(d, 16).map(([ic, text]) => `<li>${ic}<span>${text}</span></li>`).join('')}</ul>
    <div class="c-cd-side__pad c-cd-side__rewards">${rewards(d)}</div>
  </aside>
  <section class="c-cd-side" aria-labelledby="lp-about">
    <h3 class="c-cd-side__title" id="lp-about">Sobre a rota</h3>
    <div class="c-cd-side__pad">${statBoxes(d)}</div>
  </section>
  <section class="c-cd-side" aria-labelledby="lp-categories">
    <h3 class="c-cd-side__title" id="lp-categories">Categorias</h3>
    <div class="c-cd-side__pad">${categoryTags(false)}</div>
  </section>`;

/* ---------- Seções (desktop e mobile; o CSS troca a escala) ---------- */
const description = () => `<section class="c-cd-card" id="sec-sobre" aria-labelledby="lp-desc">
    <h2 class="c-cd-card__title" id="lp-desc">Descrição</h2>
    <div class="c-cd-card__text">${route.description.map(p => `<p>${esc(p)}</p>`).join('')}</div>
  </section>`;

/* Marcador do trilho igual ao da linha do tempo de atividades do Curso (c-cd-tl__node): check na concluída, círculo cheio na
   atual (sem ícone) e cadeado na bloqueada. */
const STATUS = {
  done: { icon: 'check', label: 'Concluído' },
  current: { icon: null, label: 'Em andamento' },
  locked: { icon: 'lock', label: 'Bloqueado' },
};

/** Card do curso dentro da rota ("cardCourse" use=path): miniatura à esquerda; selos, dados e progresso à direita. */
function courseCard(c, mobile) {
  const p = mobile
    ? (tone, ic, label) => mpill({ tone, iconHtml: ic(8), label })
    // Tablet e desktop: só o ícone (o nome vai no title e no aria-label), para os selos caberem na linha do tempo.
    : (tone, ic, label) => pill({ label, color: { info: 'blue', warning: 'yellow', error: 'red' }[tone], iconHtml: ic(16), iconOnly: true, attrs: { title: label, 'aria-label': label, role: 'img' } });
  const locked = c.status === 'locked';
  // Selos ficam no corpo, na linha do tempo e dos módulos: a imagem é uma miniatura e não comporta os três lado a lado.
  const flags = [
    c.novo && p('info', px => lpIcon('badge-2', px), 'Novo'),
    c.sugerido && p('warning', px => lpIcon('bulb', px), 'Sugerido'),
    c.obrigatorio && p('error', px => icon('alert-circle', px), 'Obrigatório'),
  ].filter(Boolean).join('');
  const link = locked
    ? `<button type="button" class="c-text-link c-text-link--small c-lp-course__link" data-action="lockedCourse" aria-disabled="true">Ir para o curso${icon('arrow-right', 18)}</button>`
    : `<a class="c-text-link c-text-link--small c-lp-course__link" href="#curso">${c.status === 'done' ? 'Revisar curso' : 'Ir para o curso'}${icon('arrow-right', 18)}</a>`;
  return `<article class="${cx('c-lp-course', locked && 'is-locked')}" aria-label="${esc(`${c.index + 1}. ${c.title} (${STATUS[c.status].label})`)}">
    <div class="c-lp-course__media">
      <img src="${esc(route.cover)}" alt="" />
      ${c.deadline ? `<span class="c-lp-course__deadline">${esc(c.deadline)}</span>` : ''}
    </div>
    <div class="c-lp-course__body">
      <div class="c-lp-course__info">
        <div class="c-lp-course__top">
          ${flags ? `<div class="c-lp-course__pills">${flags}</div>` : ''}
          <span class="c-lp-course__meta">${icon('clock', mobile ? 8 : 16)}${metaLine([fmtMinutes(c.min), `${c.modules} Módulos`])}</span>
        </div>
        <h3 class="c-lp-course__title" title="${esc(c.title)}">${esc(c.title)}</h3>
        <div class="c-lp-course__row">
          <span class="c-cd-tags">${c.tags.map(t => tag({ label: t, size: mobile ? 'mobile' : 'md' })).join('')}${c.extraTags ? tag({ label: `+${c.extraTags}`, outlined: true, size: mobile ? 'mobile' : 'md' }) : ''}</span>
          <span class="c-lp-course__author">${avatar({ use: 'image', src: c.author.avatar, px: mobile ? 16 : 24 })}${esc(c.author.name)}</span>
        </div>
      </div>
      <div class="c-lp-course__foot">
        <div class="c-lp-course__progress">
          <div class="c-lp-course__progress-head"><span>${c.pct === 100 ? 'Concluído!' : 'Progresso'}</span><span>${c.pct}%</span></div>
          <div class="c-lp-course__track"><span class="${cx(c.pct === 100 && 'is-done')}" style="width:${c.pct}%"></span></div>
        </div>
        ${link}
      </div>
    </div>
  </article>`;
}

/** "O que você verá nessa rota": trilho (check, círculo, x) ao lado da lista de cursos. */
function coursesSection(d, mobile) {
  const cur = d.finished ? d.total : d.done;
  return `<section class="c-cd-card" id="sec-cursos" aria-labelledby="lp-courses">
    <div class="c-cd-card__head">
      <h2 class="c-cd-card__title" id="lp-courses">O que você verá nessa rota de aprendizagem</h2>
      <span class="c-cd-card__meta">${metaLine([`${d.total} cursos`, route.sequential ? 'Realize os cursos em sequência' : 'Realize os cursos em qualquer ordem'])}</span>
    </div>
    <ol class="c-lp-route">${d.courses.map((c, i) => `<li class="c-lp-route__item">
        <span class="c-lp-route__rail" aria-hidden="true">
          <span class="${cx('c-lp-route__line', i === 0 && 'is-hidden', i <= cur && 'is-on')}"></span>
          <span class="${cx('c-lp-route__node', `is-${c.status}`)}">${STATUS[c.status].icon ? icon(STATUS[c.status].icon, 10) : ''}</span>
          <span class="${cx('c-lp-route__line', i === d.total - 1 && 'is-hidden', i < cur && 'is-on')}"></span>
        </span>
        ${courseCard(c, mobile)}
      </li>`).join('')}</ol>
  </section>`;
}

/* ---------- Mobile ---------- */
const mobileTabs = (state, d) => {
  const defs = [{ id: 'sobre', label: 'Visão geral' }, { id: 'cursos', label: 'Cursos', count: d.total }];
  return `<nav class="c-cd-mtabs" aria-label="Seções da rota"><div class="c-cd-mtabs__row" role="tablist">${defs.map(t =>
    `<button type="button" role="tab" id="lp-tab-${t.id}" class="${cx('c-cd-mtab', state.tab === t.id && 'is-active')}" aria-selected="${state.tab === t.id}" aria-controls="lp-panel" data-action="setTab" data-id="${t.id}"><span>${t.label}</span>${t.count ? `<span class="c-cd-mtab__count">${t.count}</span>` : ''}</button>`).join('')}</div></nav>`;
};

const mobileSummary = d => `<section class="c-cd-mcard" aria-labelledby="lp-title">
    <div class="c-cd-mcard__media">
      <img class="c-cd-mcard__cover" src="${esc(route.cover)}" alt="" />
      <div class="c-cd-mcard__over">
        <span class="c-cd-mcard__flags">${flagPills(true)}</span>
        <span class="c-cd-mcard__time">${icon('clock', 8)}${esc(fmtMinutes(d.totalMin))}</span>
      </div>
    </div>
    <div class="c-cd-mcard__name">
      <span class="c-lp-mkicker">${esc(route.kicker)}</span>
      <h1 class="c-cd-mcard__title" id="lp-title">${esc(route.title)}</h1>
    </div>
    <hr class="c-cd-mcard__rule" />
    <ul class="c-cd-mcard__facts">${facts(d, 8).map(([ic, text]) => `<li>${ic}<span>${text}</span></li>`).join('')}</ul>
    <div class="c-cd-mcard__rewards">
      <b>Recompensas</b>
      ${mpill({ tone: 'system', iconName: 'star', label: `${fmtInt(routeRewards(d).got.pts)}/${fmtInt(routeRewards(d).max.pts)}` })}
      ${mpill({ tone: 'system', iconHtml: lpIcon('coin', 8), label: `${fmtInt(routeRewards(d).got.coins)}/${fmtInt(routeRewards(d).max.coins)}` })}
    </div>
  </section>`;

function mobilePanel(state, d) {
  const body = state.tab === 'cursos'
    ? coursesSection(d, true)
    : `${mobileSummary(d)}${description()}
        <section class="c-cd-card" aria-labelledby="lp-about-m"><h2 class="c-cd-card__title" id="lp-about-m">Sobre a rota</h2>${statBoxes(d)}</section>
        <section class="c-cd-card" aria-labelledby="lp-cat-m"><h2 class="c-cd-card__title" id="lp-cat-m">Categorias</h2>${categoryTags(true)}</section>`;
  return `<div class="c-cd-mbody" id="lp-panel" role="tabpanel" aria-labelledby="lp-tab-${state.tab}">${body}</div>`;
}

/* ---------- Esqueleto ---------- */
const skelLines = widths => widths.map(w => `<span class="c-cd-skel__line" style="width:${w}%"></span>`).join('');
const skeleton = desk => (desk
  ? `<div class="c-course-detail" aria-busy="true"><div class="c-course-detail__wrap">
      <span class="c-cd-skel c-cd-skel--line" style="width:72px"></span>
      <div class="c-cd-skel c-cd-skel--hero"></div>
      <div class="c-course-detail__grid">
        <div class="c-course-detail__main">${range(2, () => `<div class="c-cd-skel c-cd-skel--card">${skelLines([40, 100, 100, 90, 70])}</div>`)}</div>
        <div class="c-course-detail__aside"><div class="c-cd-skel c-cd-skel--card"><span class="c-cd-skel__cover"></span>${skelLines([70, 40, 60, 65, 75])}</div></div>
      </div>
    </div></div>`
  : `<div class="c-course-detail" aria-busy="true">
      <div class="c-cd-mback"><span class="c-cd-skel c-cd-skel--line" style="width:48px"></span></div>
      <div class="c-cd-mtabs"><div class="c-cd-mtabs__row">${range(3, () => '<span class="c-cd-skel c-cd-skel--mtab"></span>')}</div></div>
      <div class="c-cd-mbody"><div class="c-cd-skel c-cd-skel--card c-cd-skel--mcard"><span class="c-cd-skel__cover"></span>${skelLines([90, 50, 60, 55, 65])}</div></div>
    </div>`);

/* ---------- Tela ---------- */
function view(state) {
  const desk = minWidth(DESK);
  if (state.loading) return skeleton(desk);
  const d = derive(state);
  const toast = `<div class="${cx('c-cd-toast', state.toast && 'is-visible')}" role="status" aria-live="polite">${state.toast ? `${icon(state.toastOk ? 'check' : 'lock', 16)}${esc(state.toast)}` : ''}</div>`;
  if (!desk) {
    return `<div class="c-course-detail c-course-detail--mobile c-lp" data-reveal="content">
      <nav class="c-cd-mback" aria-label="Voltar"><a class="c-cd-mback__link" href="#cursos">${icon('arrow-left', 16)}Voltar</a></nav>
      ${mobileTabs(state, d)}
      ${mobilePanel(state, d)}
      ${toast}
    </div>`;
  }
  return `<div class="c-course-detail c-lp" data-reveal="content">
    <div class="c-course-detail__wrap">
      <nav class="c-cd-back" aria-label="Voltar"><a class="c-cd-back__link" href="#cursos">${icon('arrow-left', 16)}Voltar</a></nav>
      ${hero()}
      <div class="c-course-detail__grid">
        <div class="c-course-detail__main">
          ${description()}
          ${coursesSection(d, false)}
        </div>
        <div class="c-course-detail__aside">${sideCard(d)}</div>
      </div>
    </div>
    ${toast}
  </div>`;
}

let toastTimer = 0;
function toast(ctx, text, ok = false) {
  clearTimeout(toastTimer);
  ctx.set({ toast: text, toastOk: ok });
  toastTimer = setTimeout(() => !ctx.destroyed && ctx.set({ toast: '' }), 2200);
}

const actions = {
  setTab: (ctx, el) => {
    if (!MOBILE_TABS.includes(el.dataset.id) || ctx.state.tab === el.dataset.id) return;
    ctx.set({ tab: el.dataset.id });
    window.scrollTo({ top: 0 });
  },
  lockedCourse: ctx => toast(ctx, 'Conclua o curso anterior para liberar este.'),
};

export function mountLearningPath(root, { loading = true } = {}) {
  return createView(root, {
    state: { loading, estado: hashState(), tab: 'sobre', toast: '' },
    view,
    actions,
    breakpoints: [DESK],
    onMount: ctx => {
      ctx.listen('hashchange', () => {
        if (location.hash.slice(1).split('?')[0] !== 'rota') return;
        ctx.set({ estado: hashState() });
      }, window);
    },
  });
}
