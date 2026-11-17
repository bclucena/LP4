import { cx, esc, range } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { lpIcon } from '../core/lp-icons.js';
import { createView, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { pill, tag } from '../components/badges.js';
import { mpill } from '../components/mobile.js';
import { avatar } from '../components/avatar.js';
import { progressLabeled } from '../components/progress.js';
import { examDialog, examDialogActions, openExamDialog, closeExamDialog, examTextOk } from '../components/exam-dialog.js';
import { modules as boardModules, starsPattern } from '../data/board.js';
import { getModuleImage } from '../data/module-images.js';
import { exam, activityHref } from '../data/activity.js';
import { course, modules as allModules, materials as allMaterials, courseStates, layoutTweaks, fmtMinutes } from '../data/course-detail.js';

/* Curso (Figma LP-DesignSystem 4.0, página "Curso Classica"): duas montagens.

   - Abaixo de 1179 (360 e 768 no Figma): componentes mobile. App bar e navigation bar da casca, linha "Voltar", abas de
     verdade (Visão geral, Conteúdo, Materiais) e, em Visão geral, o card do curso (imagem com selos e duração, autor,
     informações, progresso, "Ir para a trilha", recompensas), a descrição e as categorias.
   - A partir de 1179 (1179, 1180, 1366 e 1440): capa larga com imagem desfocada, card do curso em coluna lateral (400)
     que sobe sobre a capa e fica sticky, e as seções em cards (Descrição, Conteúdo, Materiais de apoio).

   Clicar numa atividade abre a atividade (#atividade?item=…); a avaliação abre o diálogo da avaliação antes.

   O Tabuleiro reaproveita os blocos exportados daqui (card do curso, descrição, categorias, materiais e abas do mobile);
   os estilos deles (c-cd-*) ficam em css/screens/course-detail.css.

   Parâmetros no hash (opcionais):
   - #curso?estado=nao-iniciado | andamento | concluido | liberado  (padrão: andamento, 5 concluídas e a 6ª liberada;
     liberado: todas as atividades abertas e nenhuma concluída)
   - #curso?vazio=1  mostra os estados vazios (curso sem atividades e sem materiais).
   - #curso?lista=linha | cards  lista de atividades em linha do tempo (padrão; trilho com a situação de cada uma) ou em cards.
   - #curso?fundo=imagem | cor  imagem atrás da página (padrão: a do 1º módulo do Tabuleiro, trocável no painel) ou cor.
   No desktop, "Sobre o curso" e "Categorias" ficam sempre como cards na coluna lateral. */

const DESK = 1179; // capa e coluna lateral
const SIDE_TOP = 80; // app bar (64) + 16: topo da coluna lateral sticky
const MOBILE_TABS = ['sobre', 'conteudo', 'materiais'];

/* ---------- Estado vindo do hash ---------- */
function hashParams() {
  const params = new URLSearchParams(location.hash.split('?')[1] ?? '');
  const estado = courseStates[params.get('estado')] ? params.get('estado') : 'andamento'; // padrão: 5 concluídas, a 6ª liberada
  const pick = id => (layoutTweaks[id].values.includes(params.get(id)) ? params.get(id) : layoutTweaks[id].default);
  // Tweak de fundo (como no Tabuleiro): imagem atrás da página e película escura (0 a 80%).
  const fundo = params.get('fundo') === 'cor' ? 'cor' : 'imagem'; // padrão: imagem
  const shade = Math.max(0, Math.min(80, Math.round((Number(params.get('escurecer')) || 0) / 5) * 5));
  return { estado, vazio: params.get('vazio') === '1', lista: pick('lista'), fundo, shade };
}

/** Imagem do fundo: a enviada pelo painel Tweaks (neste navegador) ou a do 1º módulo do Tabuleiro. */
const courseBg = () => getModuleImage(0, 'lp-curso-bg') || boardModules[0].background;

/** Fundo da página pelos tweaks: camada fixa (a mesma do Tabuleiro, .c-board-bg) atrás do conteúdo. */
const bgLook = state => (state.fundo === 'imagem' || state.shade > 0 ? { image: state.fundo === 'imagem', shade: state.shade } : null);
const bgLayer = look => (look
  ? `<div class="${cx('c-board-bg', look.image && 'c-board-bg--image')}" aria-hidden="true" style="${look.image ? `background-image:url('${courseBg()}')` : 'background-color:var(--color-background-subtle)'};--board-shade:${look.shade}%"></div>`
  : '');
const bgClasses = look => cx(look && 'c-course-detail--bg', look?.image && 'c-course-detail--bg-image');

/** Tudo o que a visão precisa, calculado a partir do estado (progresso, próxima atividade, chamada principal). */
function derive(state) {
  const modules = state.vazio ? [] : allModules;
  const materials = state.vazio ? [] : allMaterials;
  let gi = 0;
  // n: número da atividade comum dentro do módulo ("Atividade 1", "Atividade 2"...); avaliação e missão não contam.
  const all = modules.flatMap((m, mi) => {
    let n = 0;
    return m.acts.map(a => ({ ...a, mi, index: gi++, n: actGroup(a.kind) === 'atividade' ? ++n : 0 }));
  });
  const total = all.length;
  const done = Math.min(total, state.done ?? courseStates[state.estado].done(total));
  const unlocked = !!courseStates[state.estado]?.unlocked; // todas liberadas: nenhuma bloqueada nem "atual"
  const finished = total > 0 && done >= total;
  const started = done > 0;
  const next = all[Math.min(done, total - 1)] ?? null;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const totalMin = all.reduce((sum, a) => sum + a.min, 0);
  const open = state.open ?? (next ? { [finished ? 0 : next.mi]: true } : {});
  const cta = finished
    ? { label: 'Ver certificado', icon: 'award', href: '#certificados', hint: 'Você concluiu este curso. Revise quando quiser.' }
    : started
      ? { label: 'Continuar', icon: 'play-circle', href: '#tabuleiro', hint: `Próxima: ${next.title} · Módulo ${next.mi + 1}` }
      : { label: 'Iniciar', icon: 'play-circle', href: '#tabuleiro', hint: next ? `Comece por: ${next.title} · Módulo ${next.mi + 1}` : '' };
  return {
    modules, materials, all, total, done, finished, started, unlocked, next, pct, totalMin, open, cta, rewards: rewardsOf(all, done, finished),
    meta: [`${modules.length} módulos`, `${total} atividades`, fmtMinutes(totalMin)],
  };
}

/** Pontos e moedas recebidos/possíveis do curso: o possível é o do curso (course.points e course.coins); o recebido soma as
    atividades concluídas (os mesmos valores dos cards), sem passar do possível; curso concluído = tudo. */
function rewardsOf(all, done, finished) {
  const num = v => Number(String(v).replace(/\D/g, '')) || 0; // "3.500" → 3500
  const max = { pts: num(course.points), coins: num(course.coins) };
  const sum = all.slice(0, done).reduce((acc, a) => { const r = actRewards(a); return { pts: acc.pts + r.pts, coins: acc.coins + r.coins }; }, { pts: 0, coins: 0 });
  return finished ? { got: max, max } : { got: { pts: Math.min(sum.pts, max.pts), coins: Math.min(sum.coins, max.coins) }, max };
}

/** Dados do card do curso para outra tela (o Tabuleiro): `done` atividades concluídas; `ctaHref` troca o destino da chamada. */
export function courseInfoData(done, { ctaHref } = {}) {
  const d = derive({ estado: "nao-iniciado", vazio: false, open: {}, done });
  if (ctaHref) d.cta = { ...d.cta, href: d.finished ? d.cta.href : ctaHref };
  return d;
}

/** Grupo do card ("activityItem" do Figma): atividade (leitura, quiz, jogo), avaliação (avaliação e prova) ou missão. */
const actGroup = kind => (kind === 'avaliacao' || kind === 'prova' ? 'avaliacao' : kind === 'missao' ? 'missao' : 'atividade');

/** Rótulo e ícone do card: "Atividade N" com o ícone edit, "Avaliação" com o LP-Icon challenge, "Missão" com o ícone target. */
function actLook(a, px) {
  const g = actGroup(a.kind);
  if (g === 'avaliacao') return { label: 'Avaliação', icon: lpIcon('challenge', px) };
  if (g === 'missao') return { label: 'Missão', icon: icon('target', px) };
  return { label: `Atividade ${a.n}`, icon: icon('edit', px) };
}

/** Situação de uma atividade: concluída, a próxima (atual), liberada (estado "Todas liberadas") ou bloqueada. */
const actStatus = (index, d) => (index < d.done ? 'done' : d.unlocked ? 'open' : index === d.done ? 'current' : 'locked');

const bullet = '<span class="c-cd-bullet" aria-hidden="true"></span>';
const metaLine = parts => parts.map(p => `<span>${esc(p)}</span>`).join(bullet);
const resIcon = (r, px) => (r.lp ? lpIcon(r.lp, px) : icon(r.icon, px));

const flags = (mobile) => {
  const f = course.flags;
  const p = mobile
    ? (tone, ic, label) => mpill({ tone, iconHtml: ic(8), label })
    : (color, ic, label) => pill({ label, color: { info: 'blue', warning: 'yellow', error: 'red' }[color], iconHtml: ic(16) });
  return [
    f.novo && p('info', px => lpIcon('badge-2', px), 'Novo'),
    f.sugerido && p('warning', px => lpIcon('bulb', px), 'Sugerido'),
    f.obrigatorio && p('error', px => icon('alert-circle', px), 'Obrigatório'),
  ].filter(Boolean).join('');
};

const empty = (iconName, title, text) =>
  `<div class="c-cd-empty"><span class="c-cd-empty__icon">${icon(iconName, 24)}</span><b>${title}</b><span>${text}</span></div>`;

/* ======================================================================================================================
   Desktop (a partir de 1179)
   ====================================================================================================================== */

/* ---------- Capa ---------- */
function hero(d) {
  return `<section class="c-cd-hero" aria-labelledby="cd-title">
    <div class="c-cd-hero__back" aria-hidden="true">
      <img class="c-cd-hero__image" src="${esc(course.banner)}" alt="" />
      <span class="c-cd-hero__scrim"></span>
    </div>
    <div class="c-cd-hero__info">
      <div class="c-cd-hero__flags">${flags(false)}</div>
      <div class="c-cd-hero__group">
        <div class="c-cd-hero__titles">
          <span class="c-cd-hero__kicker">Curso</span>
          <h1 class="c-cd-hero__title" id="cd-title">${esc(course.fullTitle)}.</h1>
        </div>
        <div class="c-cd-hero__creator">
          <span class="c-cd-hero__author">${avatar({ use: 'image', src: course.author.avatar, px: 32 })}<b>${esc(course.author.name)}</b>${bullet}<span>${esc(course.author.role)}</span></span>
          <span class="c-cd-hero__meta">${icon('clock', 16)}${metaLine(d.meta)}</span>
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- Card do curso (coluna lateral) ---------- */
function ctaLink(d, className = '') {
  if (!d.next) return `<span class="${cx('c-button c-button--primary c-button--block', className)}" aria-disabled="true" data-state="disabled">Em breve</span>`;
  return `<a class="${cx('c-button c-button--primary c-button--block', className)}" href="${d.cta.href}" title="${esc(d.cta.hint)}"><span>${d.cta.label}</span>${icon(d.cta.icon, 16)}</a>`;
}

const facts = () => [
  [icon('users', 16), `<b>${esc(course.started)}</b> Usuários iniciaram o curso`],
  [icon('monitor', 16), 'Acesso mobile e desktop'],
  [lpIcon('badge-3', 16), 'Certificado de conclusão'],
  [lpIcon('calendar-check-off', 16), `Última atualização <b>${esc(course.updated)}</b>`],
];

const infoBox = (iconHtml, value, label, of) => `<div class="c-cd-box">
    <span class="c-cd-box__value">${iconHtml ? `<span class="c-cd-box__icon">${iconHtml}</span>` : ''}${esc(value)}${of !== undefined ? `<span class="c-cd-box__of">/${esc(of)}</span>` : ''}</span>
    <span class="c-cd-box__label">${esc(label)}</span>
  </div>`;

/** Progresso do curso ("Progresso 24%", a barra e "x de N atividades concluídas"), o mesmo do card do curso. */
export const courseProgress = (d, cls = '') => `<div class="${cx('c-cd-side__progress', cls)}">
      ${progressLabeled({ value: d.pct, done: d.finished })}
      <span class="c-cd-side__progress-sub">${d.finished ? `Todas as ${d.total} atividades concluídas` : `${d.done} de ${d.total} atividades concluídas`}</span>
    </div>`;

/** Card do curso. `cover`, `progress`, `cta` e `rewards` desligam a capa, o progresso, o botão e os infocards de pontos e moedas (o Dock do Tabuleiro mostra a capa e o
    progresso no topo e não tem o botão). */
export const summary = (d, { cover = true, progress = true, cta = true, rewards = true } = {}) => `<aside class="c-cd-side c-cd-side--course" aria-label="Resumo do curso">
    ${cover ? `<img class="c-cd-side__cover" src="${esc(course.cover)}" alt="" />` : ''}
    <ul class="c-cd-side__facts">${facts().map(([ic, text]) => `<li>${ic}<span>${text}</span></li>`).join('')}</ul>
    ${progress && d.started ? courseProgress(d, 'c-cd-side__pad') : ''}
    ${cta ? `<div class="c-cd-side__pad">${ctaLink(d)}</div>` : ''}
    ${rewards ? `<div class="c-cd-side__pad c-cd-side__rewards">
      ${infoBox(icon('star', 18), fmtInt(d.rewards.got.pts), d.finished ? 'pontos ganhos' : 'pontos disponíveis', fmtInt(d.rewards.max.pts))}
      ${infoBox(lpIcon('coin', 18), fmtInt(d.rewards.got.coins), d.finished ? 'moedas ganhas' : 'moedas disponíveis', fmtInt(d.rewards.max.coins))}
    </div>` : ''}
  </aside>`;

/* ---------- Sobre o curso ---------- */
const stats = d => [
  { v: d.modules.length, l: 'Módulos' },
  { v: d.total, l: 'Atividades' },
  { v: fmtMinutes(d.totalMin), l: 'Tempo do curso', wide: true },
];

const statBoxes = d => `<div class="c-cd-boxes">${stats(d).map(s => `<div class="${cx(s.wide && 'c-cd-boxes__wide')}">${infoBox('', s.v, s.l)}</div>`).join('')}</div>`;
const resourceTags = () => `<div class="c-cd-tags">${course.resources.map(r => `<span class="c-tag">${resIcon(r, 16)}${esc(r.label)}</span>`).join('')}</div>`;
const categoryTags = () => `<div class="c-cd-tags">${course.categories.map(c => tag({ label: c })).join('')}</div>`;

/** "Sobre o curso" e "Categorias" na coluna lateral (tweak sobre=cards, o padrão). */
/** Os dois cards separados (o Tabuleiro usa cada um num lugar do drawer "Sobre o curso"). */
export const sideAboutCourse = d => `<section class="c-cd-side" aria-labelledby="cd-about-side">
    <h3 class="c-cd-side__title" id="cd-about-side">Sobre o curso</h3>
    <div class="c-cd-side__pad">${statBoxes(d)}</div>
    <div class="c-cd-side__pad" role="group" aria-label="Recursos disponíveis">${resourceTags()}</div>
  </section>`;

export const sideCategories = () => `<section class="c-cd-side" aria-labelledby="cd-categories-side">
    <h3 class="c-cd-side__title" id="cd-categories-side">Categorias</h3>
    <div class="c-cd-side__pad">${categoryTags()}</div>
  </section>`;

export const sideAbout = d => `${sideAboutCourse(d)}
  ${sideCategories()}`;

/* ---------- Descrição ---------- */
export function description(d, inBody) {
  return `<section class="c-cd-card" id="sec-sobre" aria-labelledby="cd-desc">
    <h2 class="c-cd-card__title" id="cd-desc">Descrição</h2>
    <div class="c-cd-card__text">${course.description.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    ${inBody ? `<div class="c-cd-card__group"><h3 class="c-cd-card__title">Sobre o curso</h3>${statBoxes(d)}</div>
      <div class="c-cd-card__group"><h3 class="c-cd-card__title">Recursos disponíveis</h3>${resourceTags()}</div>
      <div class="c-cd-card__group"><h3 class="c-cd-card__title">Categorias</h3>${categoryTags()}</div>` : ''}
  </section>`;
}

/* ---------- Conteúdo: acordeão de módulos (desktop e mobile usam a mesma marcação; o CSS troca a escala) ---------- */
const STATUS_ICON = { done: 'check-circle', current: 'play-circle', open: 'play-circle', locked: 'lock' };
const STATUS_HINT = { done: 'Concluída — revisar', current: 'Próxima atividade', open: 'Disponível', locked: 'Conclua a atividade anterior para desbloquear' };

/** Pontos e moedas máximos de uma atividade: a avaliação usa os da avaliação final (os mesmos do diálogo); as demais, pela
    duração (20 pontos e 2 moedas por minuto, como no detalhe da atividade). */
const actRewards = a => (actGroup(a.kind) === 'avaliacao' ? { pts: exam.maxPoints, coins: exam.maxCoins } : { pts: a.min * 20, coins: a.min * 2 });
const fmtInt = n => n.toLocaleString('pt-BR');

function activityRow(a, d) {
  const st = actStatus(a.index, d);
  const look = actLook(a, 18);
  const r = actRewards(a);
  const got = st === 'done'; // concluída: ganhou o máximo; as demais mostram 0 do máximo possível
  // Linha de cima: "Atividade 1 · 8 min" (missão não mostra o tempo). À direita: pontos, moedas e a situação.
  const typeLine = actGroup(a.kind) === 'missao' ? `<span>${look.label}</span>` : `<span>${look.label}</span><span class="c-cd-bullet" aria-hidden="true"></span><span>${a.min} min</span>`;
  const inner = `<span class="c-cd-act__icon">${look.icon}</span>
    <span class="c-cd-act__text"><span class="c-cd-act__type">${typeLine}</span><span class="c-cd-act__title" title="${esc(a.title)}">${esc(a.title)}</span></span>
    <span class="c-cd-act__end">
      <span class="c-cd-act__reward" title="Pontos">${icon('star', 16)}<span><b>${fmtInt(got ? r.pts : 0)}</b>/${fmtInt(r.pts)}</span><span class="u-sr-only"> pontos</span></span>
      <span class="c-cd-act__reward" title="Moedas">${lpIcon('coin', 16)}<span><b>${fmtInt(got ? r.coins : 0)}</b>/${fmtInt(r.coins)}</span><span class="u-sr-only"> moedas</span></span>
      <span class="c-cd-act__status">${icon(STATUS_ICON[st], 16)}</span>
    </span>`;
  if (st === 'locked') {
    return `<li><div class="c-cd-act c-cd-act--locked" aria-disabled="true" title="${STATUS_HINT.locked}">${inner}<span class="u-sr-only">Bloqueada</span></div></li>`;
  }
  // Avaliação: diálogo da avaliação (apresentação → confirmação). As demais abrem direto a atividade.
  if (actGroup(a.kind) === 'avaliacao') {
    return `<li><button type="button" class="${cx('c-cd-act', `c-cd-act--${st}`)}" data-action="openExam" data-key="act-${a.index}" aria-haspopup="dialog" title="${STATUS_HINT[st]}">${inner}</button></li>`;
  }
  return `<li><a class="${cx('c-cd-act', `c-cd-act--${st}`)}" href="${activityHref(a.index)}" data-key="act-${a.index}" title="${STATUS_HINT[st]}">${inner}</a></li>`;
}

/* ---------- Lista em linha do tempo (tweak lista=linha) ----------
   Hierarquia: um trilho vertical liga as atividades do módulo; cada uma tem um marcador com a situação (concluída: check
   verde; atual: círculo cheio na cor da marca com halo; liberada: círculo vazio na cor do trilho; bloqueada: cadeado). Sem moldura de card por item:
   a linha só ganha fundo no hover, e a atividade atual fica em destaque (fundo da marca suave). Pontos e moedas numa pílula
   compacta, sempre cinza. O título começa alinhado ao texto do tipo ("Atividade 1"), depois do ícone. */
/** Estrelas ganhas na atividade concluída (1 a 3; o mesmo padrão do Tabuleiro): vão na linha do tipo, depois da duração,
    com o ponto separador. As que faltam ficam em contorno. */
const earnedStars = n => `<span class="c-cd-bullet" aria-hidden="true"></span><span class="c-cd-tl__stars" role="img" aria-label="${n} de 3 estrelas">${[1, 2, 3].map(k =>
  `<span class="${cx('c-cd-tl__star', k <= n && 'is-on')}">${icon('star', 12)}</span>`).join('')}</span>`;

const TL_ICON = { done: 'check', locked: 'lock' }; // liberadas (atual e abertas): marcador sem ícone

function timelineRow(a, d) {
  const st = actStatus(a.index, d);
  const look = actLook(a, 14);
  const r = actRewards(a);
  const got = st === 'done';
  const g = actGroup(a.kind);
  const kicker = g === 'missao' ? look.label : `${look.label} · ${a.min} min`;
  const inner = `<span class="c-cd-tl__body">
      <span class="c-cd-tl__kicker">${look.icon}<span>${esc(kicker)}</span>${got ? earnedStars(starsPattern[a.index % starsPattern.length]) : ''}</span>
      <span class="c-cd-tl__title" title="${esc(a.title)}">${esc(a.title)}</span>
    </span>
    <span class="c-cd-tl__end">
      <span class="c-cd-tl__rewards">
        <span title="Pontos">${icon('star', 14)}<b>${fmtInt(got ? r.pts : 0)}</b>/${fmtInt(r.pts)}<span class="u-sr-only"> pontos</span></span>
        <span title="Moedas">${lpIcon('coin', 14)}<b>${fmtInt(got ? r.coins : 0)}</b>/${fmtInt(r.coins)}<span class="u-sr-only"> moedas</span></span>
      </span>
      ${st === 'locked' ? '' : `<span class="c-cd-tl__go" aria-hidden="true">${icon('play-circle', 20)}</span>`}
    </span>`;
  const node = `<span class="c-cd-tl__node" aria-hidden="true">${TL_ICON[st] ? icon(TL_ICON[st], 10) : ''}</span>`;
  let row;
  if (st === 'locked') row = `<div class="c-cd-tl__row" aria-disabled="true" title="${STATUS_HINT.locked}">${inner}<span class="u-sr-only">Bloqueada</span></div>`;
  else if (g === 'avaliacao') row = `<button type="button" class="c-cd-tl__row" data-action="openExam" data-key="act-${a.index}" aria-haspopup="dialog" title="${STATUS_HINT[st]}">${inner}</button>`;
  else row = `<a class="c-cd-tl__row" href="${activityHref(a.index)}" data-key="act-${a.index}" title="${STATUS_HINT[st]}">${inner}</a>`;
  return `<li class="${cx('c-cd-tl__item', `c-cd-tl__item--${st}`)}">${node}${row}</li>`;
}

function moduleItem(m, mi, d) {
  const start = d.all.findIndex(a => a.mi === mi);
  const md = Math.max(0, Math.min(m.acts.length, d.done - start));
  const mDone = md === m.acts.length;
  const open = !!d.open[mi];
  const mins = m.acts.reduce((sum, a) => sum + a.min, 0);
  const meta = [`${m.acts.length} atividades`, fmtMinutes(mins)];
  const pct = Math.round((md / m.acts.length) * 100);
  return `<div class="${cx('c-cd-module', open && 'is-open')}">
    <button type="button" class="c-cd-module__head" data-action="toggleModule" data-id="${mi}" aria-expanded="${open}" aria-controls="cd-mod-${mi}" data-key="mod-${mi}">
      <span class="c-cd-module__text">
        <span class="c-cd-module__title" title="${esc(m.title)}">${esc(m.title)}</span>
        <span class="c-cd-module__meta">${metaLine(meta)}</span>
      </span>
      <span class="c-cd-module__progress" role="img" aria-label="${md} de ${m.acts.length} atividades concluídas"><span class="c-cd-module__track"><span class="${cx(mDone && 'is-done')}" style="width:${pct}%"></span></span><span class="c-cd-module__pct">${pct}%</span></span>
      <span class="c-cd-module__chev">${icon(open ? 'chevron-up' : 'chevron-down', 16)}</span>
    </button>
    ${open
      ? d.lista === 'linha'
        ? `<ol class="c-cd-tl" id="cd-mod-${mi}">${d.all.filter(a => a.mi === mi).map(a => timelineRow(a, d)).join('')}</ol>`
        : `<ol class="c-cd-module__acts" id="cd-mod-${mi}">${d.all.filter(a => a.mi === mi).map(a => activityRow(a, d)).join('')}</ol>`
      : ''}
  </div>`;
}

function content(d, desk) {
  const allOpen = d.modules.length > 0 && d.modules.every((_, i) => d.open[i]);
  return `<section class="c-cd-card" id="sec-conteudo" aria-labelledby="cd-content">
    <div class="c-cd-card__head">
      <h2 class="c-cd-card__title" id="cd-content">Conteúdo</h2>
      <div class="c-cd-card__info">
        <span class="c-cd-card__meta">${metaLine(d.meta)}</span>
        ${desk && d.modules.length ? `<button type="button" class="c-text-link c-text-link--small c-cd-expand" data-action="toggleAll" data-key="toggle-all" aria-expanded="${allOpen}">${lpIcon(allOpen ? 'close-all' : 'open-all', 16)}<span>${allOpen ? 'Recolher' : 'Expandir'}</span></button>` : ''}
      </div>
    </div>
    ${d.modules.length
      ? `<div class="c-cd-modules">${d.modules.map((m, mi) => moduleItem(m, mi, d)).join('')}</div>`
      : empty('layers', 'Este curso ainda não tem atividades', 'Os módulos aparecem aqui assim que forem publicados.')}
  </section>`;
}

/* ---------- Materiais de apoio ---------- */
export function materialsSection(d) {
  return `<section class="c-cd-card" id="sec-materiais" aria-labelledby="cd-materials">
    <div class="c-cd-card__head">
      <h2 class="c-cd-card__title" id="cd-materials">Materiais de apoio</h2>
      ${d.materials.length ? `<span class="c-cd-card__meta"><span>${d.materials.length} recursos para auxiliar no seu aprendizado</span></span>` : ''}
    </div>
    ${d.materials.length
      ? `<ul class="c-cd-materials">${d.materials.map(f => {
        const [type, ...rest] = f.meta.split(' · ');
        const inner = `<span class="c-cd-material__icon">${icon(f.link ? 'link-2' : 'file-text', 18)}</span>
            <span class="c-cd-material__text"><span class="c-cd-material__name">${esc(f.name)}</span><span class="c-cd-material__meta">${metaLine([type, ...rest])}</span></span>
            <span class="c-cd-material__action">${icon(f.link ? 'external-link' : 'download', 16)}</span>`;
        // Material indisponível (`disabled` nos dados): sem link, no estado disabled.
        return f.disabled
          ? `<li><div class="c-cd-material c-cd-material--disabled" aria-disabled="true" title="Material indisponível">${inner}<span class="u-sr-only">Indisponível</span></div></li>`
          : `<li><a class="c-cd-material" href="#" data-action="openMaterial" data-link="${f.link}" aria-label="${f.link ? 'Abrir' : 'Baixar'} ${esc(f.name)}">${inner}</a></li>`;
      }).join('')}</ul>`
      : empty('folder', 'Nenhum material de apoio', 'Quando o curso tiver arquivos ou links de apoio, eles aparecem aqui.')}
  </section>`;
}

/* ======================================================================================================================
   Mobile e tablet (abaixo de 1179)
   ====================================================================================================================== */

export const mobileTabs = (state, d) => {
  const defs = [
    { id: 'sobre', label: 'Visão geral' },
    { id: 'conteudo', label: 'Conteúdo', count: d.total },
    { id: 'materiais', label: 'Materiais', count: d.materials.length },
  ];
  return `<nav class="c-cd-mtabs" aria-label="Seções do curso"><div class="c-cd-mtabs__row" role="tablist">${defs.map(t =>
    `<button type="button" role="tab" id="cd-tab-${t.id}" class="${cx('c-cd-mtab', state.tab === t.id && 'is-active')}" aria-selected="${state.tab === t.id}" aria-controls="cd-panel" data-action="setTab" data-id="${t.id}"><span>${t.label}</span>${t.count ? `<span class="c-cd-mtab__count">${t.count}</span>` : ''}</button>`).join('')}</div></nav>`;
};

/** Card do curso no mobile ("side card cursos mobile"). */
export function mobileSummary(d, { trailCta = true } = {}) {
  const cta = d.finished || !trailCta ? d.cta : { label: 'Ir para a trilha', icon: 'play-circle', href: '#tabuleiro', hint: d.cta.hint };
  return `<section class="c-cd-mcard" aria-labelledby="cd-title">
    <div class="c-cd-mcard__media">
      <img class="c-cd-mcard__cover" src="${esc(course.cover)}" alt="" />
      <div class="c-cd-mcard__over">
        <span class="c-cd-mcard__flags">${flags(true)}</span>
        <span class="c-cd-mcard__time">${icon('clock', 8)}${esc(fmtMinutes(d.totalMin))}</span>
      </div>
    </div>
    <div class="c-cd-mcard__name">
      <h1 class="c-cd-mcard__title" id="cd-title">${esc(course.fullTitle)}</h1>
      <span class="c-cd-mcard__author">${avatar({ use: 'image', src: course.author.avatar, px: 24 })}<b>${esc(course.author.name)}</b>${bullet}<span>${esc(course.author.role)}</span></span>
    </div>
    <hr class="c-cd-mcard__rule" />
    <ul class="c-cd-mcard__facts">
      <li>${icon('users', 8)}<span><b>${esc(course.started)}</b> Usuários iniciaram o curso</span></li>
      <li>${icon('monitor', 8)}<span>Acesso mobile e desktop</span></li>
      <li>${lpIcon('badge-3', 8)}<span>Certificado</span></li>
      <li>${lpIcon('calendar-check-off', 8)}<span>Última atualização <b>${esc(course.updated)}</b></span></li>
    </ul>
    <div class="c-cd-mcard__progress">
      <div class="c-cd-mcard__progress-head"><span>${d.finished ? 'Concluído!' : 'Progresso'}</span><span>${d.pct}%</span></div>
      <div class="c-cd-mcard__track"><span class="${cx(d.finished && 'is-done')}" style="width:${d.pct}%"></span></div>
    </div>
    <div class="c-cd-mcard__pad">
      ${d.next
        ? `<a class="c-button c-button--primary c-button--block c-cd-mcard__cta" href="${cta.href}" title="${esc(cta.hint)}"><span>${cta.label}</span>${icon(cta.icon, 16)}</a>`
        : `<span class="c-button c-button--primary c-button--block c-cd-mcard__cta" aria-disabled="true" data-state="disabled">Em breve</span>`}
    </div>
    <div class="c-cd-mcard__rewards">
      <b>Recompensas</b>
      ${mpill({ tone: 'system', iconName: 'star', label: `${fmtInt(d.rewards.got.pts)}/${fmtInt(d.rewards.max.pts)}` })}
      ${mpill({ tone: 'system', iconHtml: lpIcon('coin', 8), label: `${fmtInt(d.rewards.got.coins)}/${fmtInt(d.rewards.max.coins)}` })}
    </div>
  </section>`;
}

export const mobileCategories = () => `<section class="c-cd-card" aria-labelledby="cd-categories">
    <h2 class="c-cd-card__title" id="cd-categories">Categorias</h2>
    <div class="c-cd-tags">${course.categories.map(c => tag({ label: c, size: 'mobile' })).join('')}</div>
  </section>`;

function mobilePanel(state, d) {
  const body = state.tab === 'conteudo'
    ? content(d, false)
    : state.tab === 'materiais'
      ? materialsSection(d)
      : `${mobileSummary(d)}${description(d, false)}${mobileCategories()}`;
  return `<div class="c-cd-mbody" id="cd-panel" role="tabpanel" aria-labelledby="cd-tab-${state.tab}">${body}</div>`;
}

/* ---------- Esqueleto ---------- */
const skelLines = widths => widths.map(w => `<span class="c-cd-skel__line" style="width:${w}%"></span>`).join('');

const skeleton = desk => (desk
  ? `<div class="c-course-detail" data-reveal="content" aria-busy="true"><div class="c-course-detail__wrap">
      <span class="c-cd-skel c-cd-skel--line" style="width:72px"></span>
      <div class="c-cd-skel c-cd-skel--hero"></div>
      <div class="c-course-detail__grid">
        <div class="c-course-detail__main">
          ${range(2, () => `<div class="c-cd-skel c-cd-skel--card">${skelLines([40, 100, 100, 90, 70])}</div>`)}
        </div>
        <div class="c-course-detail__aside"><div class="c-cd-skel c-cd-skel--card"><span class="c-cd-skel__cover"></span>${skelLines([70, 60, 65, 75])}<span class="c-cd-skel__button"></span></div></div>
      </div>
    </div></div>`
  : `<div class="c-course-detail" data-reveal="content" aria-busy="true">
      <div class="c-cd-mback"><span class="c-cd-skel c-cd-skel--line" style="width:48px"></span></div>
      <div class="c-cd-mtabs"><div class="c-cd-mtabs__row">${range(3, () => '<span class="c-cd-skel c-cd-skel--mtab"></span>')}</div></div>
      <div class="c-cd-mbody">
        <div class="c-cd-skel c-cd-skel--card c-cd-skel--mcard"><span class="c-cd-skel__cover"></span>${skelLines([90, 50, 60, 55, 65])}<span class="c-cd-skel__button"></span></div>
        <div class="c-cd-skel c-cd-skel--card c-cd-skel--mcard">${skelLines([30, 100, 100, 80])}</div>
      </div>
    </div>`);

/* ---------- Tela ---------- */
function view(state) {
  const desk = minWidth(DESK);
  if (state.loading) return skeleton(desk);
  const d = { ...derive(state), lista: state.lista };
  const toast = `<div class="${cx('c-cd-toast', state.toast && 'is-visible')}" role="status" aria-live="polite">${state.toast ? `${icon('check', 16)}${esc(state.toast)}` : ''}</div>`;
  const modal = examDialog(state.examDialog); // avaliação: apresentação → confirmação
  if (!desk) {
    const look = bgLook(state);
    return `<div class="${cx('c-course-detail c-course-detail--mobile', bgClasses(look))}" data-reveal="content">
      ${bgLayer(look)}
      <nav class="c-cd-mback" aria-label="Voltar"><a class="c-cd-mback__link" href="#cursos">${icon('arrow-left', 16)}Voltar</a></nav>
      ${mobileTabs(state, d)}
      ${mobilePanel(state, d)}
      ${toast}${modal}
    </div>`;
  }
  const look = bgLook(state);
  return `<div class="${cx('c-course-detail', bgClasses(look))}" data-reveal="content">
    ${bgLayer(look)}
    <div class="c-course-detail__wrap">
      <nav class="c-cd-back" aria-label="Voltar"><a class="c-cd-back__link" href="#cursos">${icon('arrow-left', 16)}Voltar</a></nav>
      ${hero(d)}
      <div class="c-course-detail__grid">
        <div class="c-course-detail__main">
          ${description(d, false)}
          ${content(d, true)}
          ${materialsSection(d)}
        </div>
        <div class="c-course-detail__aside" data-sticky-aside>
          ${summary(d)}
          ${sideAbout(d)}
        </div>
      </div>
    </div>
    ${toast}${modal}
  </div>`;
}

/* ---------- Comportamento de rolagem (desktop) ---------- */

/** Coluna lateral sticky que acompanha a rolagem quando é mais alta que a tela: desce junto até a base encostar na base
    da tela e, ao inverter, volta até o topo encostar abaixo da app bar. */
function stickyAside(ctx) {
  const el = ctx.root.querySelector('[data-sticky-aside]');
  const y = window.scrollY;
  const delta = y - (ctx.lastY ?? y);
  ctx.lastY = y;
  if (!el) return;
  if (getComputedStyle(el).position !== 'sticky') {
    el.style.top = '';
    return;
  }
  const minTop = Math.min(SIDE_TOP, window.innerHeight - el.offsetHeight - 16);
  ctx.sideTop = Math.max(minTop, Math.min(SIDE_TOP, (ctx.sideTop ?? SIDE_TOP) - delta));
  el.style.top = `${ctx.sideTop}px`;
}

/* ---------- Ações ---------- */
let toastTimer = 0;
function toast(ctx, text) {
  clearTimeout(toastTimer);
  ctx.set({ toast: text });
  toastTimer = setTimeout(() => !ctx.destroyed && ctx.set({ toast: '' }), 2200);
}

const actions = {
  ...examDialogActions,
  openExam: (ctx, el) => openExamDialog(ctx, el.dataset.key),
  setTab: (ctx, el) => {
    if (!MOBILE_TABS.includes(el.dataset.id) || ctx.state.tab === el.dataset.id) return;
    ctx.set({ tab: el.dataset.id });
    window.scrollTo({ top: 0 });
  },
  toggleModule: (ctx, el) => {
    const mi = Number(el.dataset.id);
    const open = derive(ctx.state).open;
    ctx.set({ open: { ...open, [mi]: !open[mi] } });
  },
  toggleAll: ctx => {
    const d = derive(ctx.state);
    const allOpen = d.modules.every((_, i) => d.open[i]);
    ctx.set({ open: Object.fromEntries(d.modules.map((_, i) => [i, !allOpen])) });
  },
  openMaterial: (ctx, el) => toast(ctx, el.dataset.link === 'true' ? 'Abrindo em nova aba…' : 'Download iniciado'),
};

export function mountCourseDetail(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, ...hashParams(), open: null, toast: '', tab: 'sobre', examDialog: null,
    },
    view,
    actions,
    breakpoints: [DESK],
    onRender: ctx => {
      // A tela é refeita inteira: reaplica a posição da coluna lateral e a aba ativa.
      stickyAside(ctx);
    },
    onMount: ctx => {
      onEscape(ctx, () => closeExamDialog(ctx), () => !!ctx.state.examDialog);
      // Enter no campo da confirmação começa a avaliação (como na tela de Atividades).
      ctx.listen('keydown', e => {
        if (e.key === 'Enter' && e.target.matches?.('[data-input="examDialogInput"]') && examTextOk(e.target.value)) ctx.actions.examDialogStart(ctx);
      });
      ctx.listen('scroll', () => stickyAside(ctx), window);
      ctx.listen('resize', () => stickyAside(ctx), window);
      // Imagem do fundo enviada ou removida pelo painel Tweaks: refaz a tela.
      ctx.listen('module-images-change', () => ctx.render(), window);
      // #curso?estado=... trocado com a tela aberta: a casca não remonta (mesma página), então a tela relê o hash.
      ctx.listen('hashchange', () => {
        if (location.hash.slice(1).split('?')[0] !== 'curso') return;
        ctx.set({ ...hashParams(), open: null });
      }, window);
    },
  });
}
