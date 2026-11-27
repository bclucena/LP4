import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { lpIcon } from '../core/lp-icons.js';
import { createView } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { pill, tag } from '../components/badges.js';
import { mpill } from '../components/mobile.js';
import { avatar } from '../components/avatar.js';
import { rail } from '../components/rail.js';
import { progressDonut, progressLabeled } from '../components/progress.js';
import { fmtMinutes } from '../data/course-detail.js';
import { stickyAside, mobileBox } from './course-detail.js';
import { route, routeSteps, routeStates, stepKinds } from '../data/learning-path.js';
import { kindLabel, periodLabel } from '../data/missions.js';
import { materialInfo } from '../data/library.js';
import { modeInfo } from '../data/events.js';

/* Rota de aprendizagem (#rota; Figma LP-DesignSystem 4.0, página "Rota", 1440). Abre pelos cards de rota da tela Cursos.
   Mesma montagem da tela Curso e com as mesmas classes (c-cd-*, css/screens/course-detail.css): capa larga, coluna lateral
   sticky (card da rota, "Sobre a rota" e Categorias) e as seções em cards (Descrição, Cursos, Certificado). O que é
   só da rota (trilho dos cursos e card do curso; o card do certificado saiu em 12/11/2026) fica em css/screens/learning-path.css.

   Os cursos são feitos em sequência: o trilho à esquerda marca concluído (check), atual (círculo) e bloqueado (x); um curso
   bloqueado não abre. O Figma só tem o 1440: abaixo de 1179 a tela usa os componentes mobile da tela Curso (abas de verdade).

   Etapas (25/11/2026): os cursos vêm intercalados com uma notícia, um material da Biblioteca, uma missão e um evento
   (routeSteps); todas usam o mesmo card (stepCard), com um selo do tipo na miniatura.

   Parâmetros no hash: #rota?estado=nao-iniciado | andamento | concluido | liberada (padrão: andamento). */

const DESK = 1179;
const TABLET = 768; // abaixo disso as etapas usam o card compacto do mobile (stepCardCompact)
const MOBILE_TABS = ['sobre', 'cursos'];

function hashState() {
  const estado = new URLSearchParams(location.hash.split('?')[1] ?? '').get('estado');
  return routeStates[estado] ? estado : 'andamento';
}

/** Etapas da rota (cursos intercalados com notícia, material, missão e evento) com o estado de cada uma. Na rota liberada
    nenhuma etapa é "atual" nem bloqueada: todas ficam abertas (status 'open'). */
function derive(state) {
  const cfg = routeStates[state.estado];
  const open = !!cfg.open;
  const total = routeSteps.length;
  const done = Math.min(total, cfg.done(total));
  const finished = done >= total;
  const courseCount = routeSteps.filter(s => s.kind === 'curso').length;
  const totalMin = routeSteps.reduce((sum, s) => sum + (s.min ?? 0), 0);
  const courses = routeSteps.map((c, i) => {
    const status = open ? 'open' : i < done ? 'done' : i === done ? 'current' : 'locked';
    const pct = status === 'done' ? 100 : status === 'current' ? cfg.currentPct : 0;
    return { ...c, index: i, status, pct };
  });
  return { total, done, finished, open, courseCount, totalMin, courses };
}

const bullet = '<span class="c-cd-bullet" aria-hidden="true"></span>';
const metaLine = parts => parts.map(p => `<span>${esc(p)}</span>`).join(bullet);

const flagPills = mobile => (route.flags.novo
  ? (mobile ? mpill({ tone: 'info', iconHtml: lpIcon('badge-2', 12), label: 'Novo' }) : pill({ label: 'Novo', color: 'blue', iconHtml: lpIcon('badge-2', 16) }))
  : '');

const facts = (d, px) => [
  d.open
    ? [icon('shuffle', px), '<b>Rota de aprendizagem liberada</b>']
    : [lpIcon('sequence', px), '<b>Rota de aprendizagem sequencial</b>'],
  [icon('book', px), `<b>${d.courseCount}</b> Cursos e <b>${d.total - d.courseCount}</b> conteúdos`],
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
const statBoxes = d => `<div class="c-cd-boxes">${infoBox('', d.courseCount, 'Cursos')}${infoBox('', d.total - d.courseCount, 'Conteúdos')}<div class="c-cd-boxes__wide">${infoBox('', fmtMinutes(d.totalMin), 'Tempo dos cursos')}</div></div>`;
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

/** Miolo do card da rota (informações com ícone de 16 e os infocards de pontos e moedas): o mesmo no card lateral do desktop
    e no card da rota do mobile (mobileSummary). */
const sideBody = d => `<ul class="c-cd-side__facts">${facts(d, 16).map(([ic, text]) => `<li>${ic}<span>${text}</span></li>`).join('')}</ul>
    <div class="c-cd-side__pad c-cd-side__rewards">${rewards(d)}</div>`;

const sideCard = d => `<aside class="c-cd-side c-cd-side--course" aria-label="Resumo da rota">
    <img class="c-cd-side__cover" src="${esc(route.cover)}" alt="" />
    ${sideBody(d)}
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

/* Nome do estado do curso (vai no aria-label do card). O trilho e o marcador vêm do componente rail
   (js/components/rail.js), o mesmo da linha do tempo de atividades do Curso. */
const STATUS = {
  done: { label: 'Concluído' },
  current: { label: 'Em andamento' },
  locked: { label: 'Bloqueado' },
  open: { label: 'Liberado' },
};

/** Tipo da etapa (Curso, Notícia, Biblioteca, Missão, Evento): ícone e texto (sem a moldura de tag, desde 26/11/2026) acima
    do título do card (mobile, tablet e
    desktop). */
const kindTag = (kind, mobile, extra) => `<span class="c-lp-course__kind">${icon(kind.icon, mobile ? 12 : 16)}${metaLine([kind.label, extra].filter(Boolean))}</span>`;

/** Linha de dados do card de cada tipo de etapa (à direita dos selos) e o canto direito da linha das tags. Os textos e ícones
    seguem os cards das próprias áreas (Missões, Feed, Biblioteca, Eventos). */
function stepDetails(c, px) {
  const meta = (ic, parts) => `<span class="c-lp-course__meta">${icon(ic, px)}${metaLine(parts)}</span>`;
  const side = (ic, text) => `<span class="c-lp-course__author">${icon(ic, px)}${text}</span>`;
  const person = () => `<span class="c-lp-course__author">${avatar({ use: 'image', src: c.author.avatar, px: px === 8 ? 16 : 24 })}${esc(c.author.name)}</span>`;
  // Rodapé sem barra de progresso (notícia, biblioteca, evento): os indicadores da própria área, no lugar da barra.
  const stats = items => `<span class="c-lp-course__stats">${items.map(([ic, html]) => `<span>${icon(ic, px)}${html}</span>`).join(bullet)}</span>`;
  switch (c.kind) {
    case 'noticia': // reações e comentários, como no card do Feed
      return { meta: meta('send', [c.published, `${c.readMin} min de leitura`]), side: person(),
        foot: stats([['thumbs-up', `${c.likes} reações`], ['message-square', `${c.comments} comentários`]]) };
    case 'material': { // curtidas e visualizações, como no card da Biblioteca
      const m = materialInfo[c.material];
      return { meta: meta(m.icon, [m.label, c.date]), side: '', foot: stats([['thumbs-up', `${c.likes} curtidas`], ['eye', `${c.views} visualizações`]]) };
    }
    case 'missao':
      return { meta: meta(c.mission === 'meta' ? 'flag' : 'upload', [kindLabel[c.mission], c.scope, periodLabel[c.period]]), side: side('clock', esc(c.ends)) };
    case 'evento': // vagas, como no card de Eventos
      return { meta: meta(modeInfo[c.mode].icon, [c.place, c.date]), side: '', foot: stats([['users', `<b>${c.taken}/${c.slots}</b> vagas disponíveis`]]) };
    default:
      return { meta: meta('clock', [fmtMinutes(c.min), `${c.modules} Módulos`]), side: person() };
  }
}

/** Card de uma etapa da rota ("cardCourse" use=path): miniatura à esquerda; selos, dados e progresso à direita. O curso usa a
    capa do curso; notícia, material, missão e evento, a imagem de cada um (sem imagem, a capa de exemplo c-cover com o ícone do tipo). Na miniatura, um
    selo escuro diz o tipo da etapa. O card todo leva à área da etapa (Curso, Feed, Biblioteca, Missões, Eventos). */
function stepCard(c, mobile) {
  const kind = stepKinds[c.kind];
  const locked = c.status === 'locked';
  const px = mobile ? 8 : 16;
  // Sem a linha de dados (tempo e módulos, data, publicação, local; retirada em 26/11/2026).
  const { side, foot } = stepDetails(c, px);
  // Sem os selos Novo, Sugerido e Obrigatório nos conteúdos da rota (retirados em 26/11/2026).
  // O card inteiro é o link (só um chevron indica a ação). Bloqueado: não é link; o clique avisa por que.
  const name = esc(`${c.index + 1}. ${kind.label}: ${c.title} (${STATUS[c.status].label})`);
  const open = locked
    ? `<div class="c-lp-course c-lp-course--${c.kind} is-locked" aria-disabled="true" aria-label="${name}" title="Conclua a etapa anterior para liberar esta" data-action="lockedCourse">`
    : `<a class="c-lp-course c-lp-course--${c.kind}" href="${kind.href}" aria-label="${name}" data-key="lp-step-${c.index}">`;
  // Imagem da etapa (curso: a capa da rota; notícia, material, missão e evento: a imagem de cada um). Sem imagem, a capa de
  // exemplo (c-cover) com o ícone do tipo.
  const src = c.image ?? (c.kind === 'curso' ? route.cover : null);
  const media = src
    ? `<img src="${esc(src)}" alt="" />`
    : `<span class="c-lp-course__cover c-cover c-lp-course__cover--${c.kind}">${icon(kind.icon, mobile ? 32 : 40)}</span>`;
  return `${open}
    <div class="c-lp-course__media">
      <span class="c-lp-course__frame">${media}</span>
      ${c.deadline ? `<span class="c-lp-course__deadline">${esc(c.deadline)}</span>` : ''}
    </div>
    <div class="c-lp-course__body">
      <div class="c-lp-course__info">
        ${kindTag(kind, mobile, fmtMinutes(c.min))}
        <h3 class="c-lp-course__title" title="${esc(c.title)}">${esc(c.title)}</h3>
        <div class="c-lp-course__row">
          <span class="c-cd-tags">${c.tags.map(t => tag({ label: t, size: mobile ? 'mobile' : 'md' })).join('')}${c.extraTags ? tag({ label: `+${c.extraTags}`, outlined: true, size: mobile ? 'mobile' : 'md' }) : ''}</span>
          ${side}
        </div>
      </div>
      <div class="c-lp-course__foot">
        ${foot ?? `<div class="c-lp-course__progress">
          <div class="c-lp-course__progress-head"><span>${c.pct === 100 ? 'Concluído!' : 'Progresso'}</span><span>${c.pct}%</span></div>
          <div class="c-lp-course__track"><span class="${cx(c.pct === 100 && 'is-done')}" style="width:${c.pct}%"></span></div>
        </div>`}
        <span class="c-lp-course__go" aria-hidden="true">${icon(locked ? 'lock' : 'chevron-right', 20)}</span>
      </div>
    </div>
  ${locked ? '</div>' : '</a>'}`;
}

/** Card compacto da etapa no mobile (abaixo de 768): o mesmo layout dos cards mobile de Cursos, Missões, Eventos, Feed e
    Biblioteca (classes c-course-compact, css/screens/courses.css). Imagem recuada com cantos de 4 e os selos só com ícone
    sobrepostos na borda de baixo; o selo escuro do tipo no canto de cima; título de 2 linhas; a linha de informação numa linha só (ícone de
    12 e as partes separadas por bullet, como no card do desktop); no rodapé, as tags e o indicador de cada área. O último ícone do rodapé é a ação: chevron, cadeado
    (bloqueado) ou check (concluído). A biblioteca tem imagem 1:1, como na área dela. */
/** Etapa que não é curso (notícia, biblioteca, missão, evento; 26/11/2026): o conteúdo no formato do item de Materiais de
    apoio (.c-cd-material__icon, __name, __meta), dentro do contorno do card, sem imagem nem tags. A linha de dados traz o
    tipo e o dado principal de cada um; a notícia mostra ainda 3 linhas do texto (com reticências) e "Continuar lendo" (o
    estilo do Link small; não é outro link, o card todo já é); a missão, a barra de progresso do card de Missões
    (progressLabeled: "Progresso x%" e a barra). Bloqueada não fica apagada: só o cadeado indica. À direita, o cadeado (bloqueada), o check (concluída) ou, a partir do tablet, o
    chevron. */
function stepItem(c, compact) {
  const kind = stepKinds[c.kind];
  const locked = c.status === 'locked';
  const done = c.status === 'done';
  const extra = {
    noticia: `${c.readMin} min de leitura`,
    material: materialInfo[c.material]?.label,
    missao: kindLabel[c.mission],
    evento: c.date,
  }[c.kind];
  const name = esc(`${c.index + 1}. ${kind.label}: ${c.title} (${STATUS[c.status].label})`);
  // A notícia não tem chevron (o "Continuar lendo" já indica a ação).
  const go = locked ? icon('lock', 16) : done ? icon('check-circle', 16) : compact || c.kind === 'noticia' ? '' : icon('chevron-right', 16);
  const cls = cx('c-lp-step', `c-lp-step--${c.kind}`, locked && 'is-locked', done && 'is-done');
  // Linha 1: o ícone do tipo (sem a caixa) junto de "tipo · dado", como o tipo do card de curso; linha 2: o título.
  const inner = `<span class="c-cd-material__text"><span class="c-cd-material__meta c-lp-step__kind">${icon(kind.icon, compact ? 12 : 16)}${metaLine([kind.label, extra].filter(Boolean))}</span><span class="c-cd-material__name" title="${esc(c.title)}">${esc(c.title)}</span>${c.excerpt ? `<span class="c-lp-step__excerpt">${locked ? '' : '<span class="c-text-link c-text-link--small c-lp-step__more">Continuar lendo</span>'}${esc(c.excerpt)}</span>` : ''}${c.kind === 'missao' ? `<span class="c-lp-step__progress">${progressLabeled({ value: c.pct })}</span>` : ''}</span>
      ${go ? `<span class="c-lp-step__go" aria-hidden="true">${go}</span>` : ''}`;
  return locked
    ? `<div class="${cls}" aria-disabled="true" aria-label="${name}" title="Conclua a etapa anterior para liberar esta" data-action="lockedCourse">${inner}</div>`
    : `<a class="${cls}" href="${kind.href}" aria-label="${name}" data-key="lp-step-${c.index}">${inner}</a>`;
}

function stepCardCompact(c) {
  const kind = stepKinds[c.kind];
  const locked = c.status === 'locked';
  const done = c.status === 'done';
  const dot = '<span class="c-m-bullet" aria-hidden="true"></span>';
  const count = text => `<span class="c-lp-mcard__count">${text}</span>`;
  let indicator = '';
  switch (c.kind) {
    case 'noticia':
      indicator = `<span class="c-lp-mcard__stats">${icon('thumbs-up', 12)}${c.likes}${dot}${icon('message-square', 12)}${c.comments}</span>`;
      break;
    case 'material':
      break;
    case 'missao':
      indicator = c.mission === 'meta' ? progressDonut(c.pct) : count(`${c.pct}/100`);
      break;
    case 'evento':
      indicator = count(`${c.taken}/${c.slots}`);
      break;
    default:
      // Curso: o anel de progresso só em andamento (ou liberado); bloqueado não tem anel (só o cadeado) e concluído só o check.
      indicator = done || locked ? '' : progressDonut(c.pct);
  }
  // Ação no fim do rodapé: cadeado (bloqueado) ou check (concluído); disponível não tem ícone (o card todo é o link).
  const go = locked ? icon('lock', 12) : done ? icon('check-circle', 14) : '';
  const name = esc(`${c.index + 1}. ${kind.label}: ${c.title} (${STATUS[c.status].label})`);
  const cls = cx('c-course-compact', 'c-lp-mcard', `c-lp-mcard--${c.kind}`, locked && 'is-locked', done && 'is-done');
  const open = locked
    ? `<div class="${cls}" aria-disabled="true" aria-label="${name}" title="Conclua a etapa anterior para liberar esta" data-action="lockedCourse">`
    : `<a class="${cls}" href="${kind.href}" aria-label="${name}" data-key="lp-step-${c.index}">`;
  const src = c.image ?? (c.kind === 'curso' ? route.cover : null);
  const tags = `${c.tags.map(t => tag({ label: t, size: 'mobile' })).join('')}${c.extraTags ? tag({ label: `+${c.extraTags}`, size: 'mobile', outlined: true }) : ''}`;
  return `${open}
    <div class="c-course-compact__top">
      <div class="c-course-compact__cover-wrap">
        ${src ? `<img class="c-course-compact__cover c-lp-mcard__img" src="${esc(src)}" alt="" />` : `<span class="c-course-compact__cover c-cover c-lp-mcard__img"></span>`}
        ${c.deadline ? `<span class="c-lp-mcard__deadline">${esc(c.deadline)}</span>` : ''}
        ${c.kind === 'curso' ? `<span class="c-course-compact__time">${icon('clock', 12)}${esc(fmtMinutes(c.min))}</span>` : ''}
      </div>
    </div>
    <div class="c-course-compact__body">
      ${kindTag(kind, true, fmtMinutes(c.min))}
      <h3 class="c-course-compact__title" title="${esc(c.title)}">${esc(c.title)}</h3>
      <div class="c-course-compact__foot">
        <span class="c-course-compact__tags">${tags}</span>
        <span class="c-lp-mcard__end">${indicator}${go ? `<span class="c-lp-mcard__go" aria-hidden="true">${go}</span>` : ''}</span>
      </div>
    </div>
  ${locked ? '</div>' : '</a>'}`;
}

/** "O que você verá nessa rota": trilho (check, círculo, cadeado; na liberada, círculos vazios) ao lado das etapas. */
function coursesSection(d, mobile) {
  const cur = d.open ? -1 : d.finished ? d.total : d.done;
  const order = d.open || !route.sequential ? 'Realize as etapas em qualquer ordem' : 'Realize as etapas em sequência';
  return `<section class="c-cd-card" id="sec-cursos" aria-labelledby="lp-courses">
    <div class="c-cd-card__head">
      <h2 class="c-cd-card__title" id="lp-courses">O que você verá nessa rota de aprendizagem</h2>
      <span class="c-cd-card__meta">${metaLine([`${d.total} etapas`, order])}</span>
    </div>
    <ol class="c-lp-route">${d.courses.map((c, i) => `<li class="c-lp-route__item">
        ${rail({ status: c.status, first: i === 0, last: i === d.total - 1, before: i <= cur, after: i < cur })}
        ${c.kind !== 'curso' ? stepItem(c, mobile && !minWidth(TABLET)) : mobile && !minWidth(TABLET) ? stepCardCompact(c) : stepCard(c, mobile)}
      </li>`).join('')}</ol>
  </section>`;
}

/* ---------- Mobile ---------- */
const mobileTabs = (state, d) => {
  const defs = [{ id: 'sobre', label: 'Visão geral' }, { id: 'cursos', label: 'Conteúdo', count: d.total }];
  return `<nav class="c-cd-mtabs" aria-label="Seções da rota"><div class="c-cd-mtabs__row" role="tablist">${defs.map(t =>
    `<button type="button" role="tab" id="lp-tab-${t.id}" class="${cx('c-cd-mtab', state.tab === t.id && 'is-active')}" aria-selected="${state.tab === t.id}" aria-controls="lp-panel" data-action="setTab" data-id="${t.id}"><span>${t.label}</span>${t.count ? `<span class="c-cd-mtab__count">${t.count}</span>` : ''}</button>`).join('')}</div></nav>`;
};

/** Card da rota no mobile: os elementos do card mobile do Curso — capa limpa, selos acima do título, título, linha, a duração
    como 1ª informação, as informações
    (ícones de 8, 10/12, "Certificado") e os infocards de pontos e moedas (mobileBox). */
const mobileSummary = d => `<section class="c-cd-mcard c-cd-mcard--rota" aria-labelledby="lp-title">
    <div class="c-cd-mcard__media">
      <img class="c-cd-mcard__cover" src="${esc(route.cover)}" alt="" />
    </div>
    ${route.flags.novo ? `<div class="c-cd-mcard__pills">${flagPills(true)}</div>` : ''}
    <div class="c-cd-mcard__info">
      <div class="c-cd-mcard__name">
        <h1 class="c-cd-mcard__title" id="lp-title">${esc(route.title)}</h1>
      </div>
      <hr class="c-cd-mcard__rule" />
      <ul class="c-cd-mcard__facts">${[[icon('clock', 12), `<b>${esc(fmtMinutes(d.totalMin))}</b> de conteúdo`], ...facts(d, 12)].map(([ic, text]) => `<li>${ic}<span>${text}</span></li>`).join('')}</ul>
      <div class="c-cd-mcard__boxes">${mobileRewards(d)}</div>
    </div>
  </section>`;

/** Pontos e moedas no card mobile: os infocards do card mobile do Curso (mobileBox). */
const mobileRewards = d => {
  const r = routeRewards(d);
  return `${mobileBox(icon('star', 12), fmtInt(r.got.pts), fmtInt(r.max.pts), d.finished ? 'pontos ganhos' : 'pontos disponíveis')}${mobileBox(lpIcon('coin', 12), fmtInt(r.got.coins), fmtInt(r.max.coins), d.finished ? 'moedas ganhas' : 'moedas disponíveis')}`;
};

function mobilePanel(state, d) {
  const body = state.tab === 'cursos'
    ? coursesSection(d, true)
    : `${mobileSummary(d)}${description()}
        <section class="c-cd-card c-cd-about-m" aria-labelledby="lp-about-m"><h2 class="c-cd-card__title" id="lp-about-m">Sobre a rota</h2>${statBoxes(d)}</section>
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
        <div class="c-course-detail__aside" data-sticky-aside>${sideCard(d)}</div>
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
  lockedCourse: ctx => toast(ctx, 'Conclua a etapa anterior para liberar esta.'),
};

export function mountLearningPath(root, { loading = true } = {}) {
  return createView(root, {
    state: { loading, estado: hashState(), tab: 'sobre', toast: '' },
    view,
    actions,
    breakpoints: [TABLET, DESK],
    // Coluna lateral: mesma rolagem do Curso (stickyAside): mais alta que a tela, desce junto até a base encostar na base
    // da tela e, ao inverter, volta até o topo encostar abaixo da app bar.
    onRender: ctx => stickyAside(ctx),
    onMount: ctx => {
      ctx.listen('scroll', () => stickyAside(ctx), window);
      ctx.listen('resize', () => stickyAside(ctx), window);
      ctx.listen('hashchange', () => {
        if (location.hash.slice(1).split('?')[0] !== 'rota') return;
        ctx.set({ estado: hashState() });
      }, window);
    },
  });
}
