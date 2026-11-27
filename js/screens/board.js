import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { lpIcon } from '../core/lp-icons.js';
import { createView, onEscape } from '../core/view.js';
import { minWidth, reducedMotion } from '../core/media.js';
import { examDialog, examDialogActions, openExamDialog, closeExamDialog, examTextOk } from '../components/exam-dialog.js';
import { pill } from '../components/badges.js';
import { mpill } from '../components/mobile.js';
import { panel, leavePanel } from '../components/panel.js';
import {
  kinds, modules, activities, moduleStarts, starsPattern, doneCount, course, materials, boardBackground, pinImages,
} from '../data/board.js';
import { activityHref, exam } from '../data/activity.js';
import { leaveTo } from '../core/transition.js';
import { getModuleImage } from '../data/module-images.js';
import { fmtMinutes } from '../data/course-detail.js';
import { courseInfoData, certificateCard, summary, courseProgress, sideAbout, sideAboutCourse, sideCategories, description, materialsSection, mobileTabs, mobileSummary, mobileCategories, mobileAbout, rewardBoxes } from './course-detail.js';

/* Tabuleiro (Figma LP-DesignSystem 4.0, páginas "Curso Ludica - Versao A" e "Versao B").

   - Abaixo de 1179 (360 e 768 no Figma): app bar e navigation bar da casca, linha "Voltar" e abas de verdade. "Conteúdo"
     (a aba que abre) é a trilha; "Visão geral" e "Materiais" usam os mesmos blocos da tela Curso.
   - A partir de 1179: trilha à esquerda e, à direita, a coluna do curso (400, sticky) com as abas Visão geral, Descrição e
     Materiais. O botão ao lado da coluna recolhe e mostra a coluna.

   Trilha "Versão A": um pin por atividade em onda (0, 44 e 76px para cada lado do centro, a onda continua de um módulo para
   o outro), estrelas sobre as concluídas, anel de progresso do módulo no pin atual e a missão do módulo (pin com o ícone target) no fim de cada
   módulo. O cartão do módulo visível fica preso no topo; entre os módulos, um separador. Clicar num pin abre o detalhe:
   navdrawer a partir de 1179 e bottom sheet abaixo.
   Tweaks (js/data/tweaks.js): estado, trilha (a ou b = estrada em serpentina com cartões de módulo), fundo (cor ou imagem),
   cor do fundo e escurecer (camada escura sobre o fundo). */

const TABLET = 768; // trilha B compacta abaixo disso
const DESK = 1179; // coluna do curso e navdrawer

/** Onda da trilha A: deslocamento horizontal (px) do centro de cada pin, como no Figma. */
/* Onda da trilha A: uma senoide de 10 passos e amplitude 88 (antes 8 passos e 76, em linha quebrada). Os pins ficam nos
   pontos da curva e o pontilhado entre eles segue a mesma curva (waveAt). */
const WAVE_N = 10;
const WAVE_AMP = 88;
const waveAt = k => -WAVE_AMP * Math.sin((2 * Math.PI * k) / WAVE_N);
const WAVE = Array.from({ length: WAVE_N }, (_, k) => Math.round(waveAt(k)));
const ROW = 110; // linha de um pin: estrelas (30) + pin (80)
const ROW_CURRENT = 142; // linha do pin atual: estrelas (30) + anel (112)
const ROW_GAP = 40; // entre dois pins: espaço para os 3 pontos que ligam um ao outro (trailDots)
const ROW_B = 126; // pins da Versão B: estrelas (30) + disco de 84 + número que passa 10 da borda (+2)

/* ---------- Tweaks ---------- */
const hashParams = () => new URLSearchParams(location.hash.split('?')[1] ?? '');

/** Cores do tweak "Cor do fundo" (só tokens): subtle é o padrão, o mesmo fundo da casca. */
const BG_COLORS = {
  subtle: 'var(--color-background-subtle)',
  default: 'var(--color-background-default)',
  marca: 'var(--color-surface-system-subtle)',
  escuro: 'var(--color-surface-dark)',
};

/** Escurecer a partir do qual o fundo claro conta como escuro (separadores e "Voltar" passam a texto claro). */
const SHADE_DARK = 45;

/** Tweaks visuais lidos do hash (#tabuleiro?trilha=b&fundo=imagem&cor=escuro&escurecer=40). Sem parâmetro = padrão.
    Padrão: trilha E (desde 18/11/2026; antes C), pins B com imagens, fundo com uma imagem por módulo e a barra integrada no lugar da
    coluna lateral; o "clássico" anterior (trilha A, pins A, fundo cor, coluna fixa) segue disponível nos tweaks. */
function looksFromHash() {
  const q = hashParams();
  // e (padrão desde 18/11/2026): faixa colorida com um cartão por módulo; c: a estrada da B com nomes e sentido. No mobile e
  // no tablet (abaixo do desktop, DESK) a trilha é sempre vertical, com os pins um embaixo do outro numa linha reta: a Versão C,
  // seja qual for o tweak.
  const trilha = !minWidth(DESK) ? 'c' : ['a', 'b', 'c', 'd', 'e'].includes(q.get('trilha')) ? q.get('trilha') : 'e';
  // Pins: a = disco com o número (Figma); b = disco branco com o miolo colorido, o ícone do tipo e o número embaixo.
  const pins = q.get('pins') === 'a' ? 'a' : 'b';
  const pinImg = pins === 'b' && q.get('imagens') !== '0'; // imagem no miolo dos pins B (ligada por padrão)
  // Fundo: cor, uma imagem para a trilha toda ou uma imagem por módulo (revelada com a rolagem).
  const fundo = ['cor', 'imagem', 'modulos'].includes(q.get('fundo')) ? q.get('fundo') : 'modulos';
  const image = fundo !== 'cor';
  const cor = BG_COLORS[q.get('cor')] ? q.get('cor') : 'subtle';
  // Escurecer o fundo: 32% por padrão (desde 18/11/2026); escurecer=0 tira a camada.
  const shade = Math.max(0, Math.min(80, Math.round(q.get('escurecer') !== null && !Number.isNaN(Number(q.get('escurecer'))) ? Number(q.get('escurecer')) : 32)));
  // A imagem do protótipo é escura; a cor "escuro" também. Sobre elas o que fica direto no fundo usa texto claro.
  const dark = image || cor === 'escuro' || shade >= SHADE_DARK;
  // Sem nenhum tweak de fundo a camada nem é desenhada: a tela fica idêntica à de antes (fundo da casca).
  const custom = image || cor !== 'subtle' || shade > 0;
  // Layout moderno (tweak): trilha usando a largura toda, nome de cada atividade ao lado do pin, cartão do módulo compacto e
  // translúcido e, no desktop, a navegação dos módulos à esquerda.
  const modern = q.get('layout') === 'moderno';
  // Menu lateral (tweak): dock recolhível (padrão), barra integrada em cima da trilha, coluna fixa ou "float" (ícones na lateral que abrem o
  // conteúdo num cartão flutuante).
  const painel = ['fixo', 'float', 'barra', 'dock'].includes(q.get('painel')) ? q.get('painel') : 'dock';
  const float = painel === 'float';
  const hud = painel === 'barra';
  const dock = painel === 'dock'; // cartão compacto no canto inferior esquerdo, que recolhe numa pílula
  const cores = q.get('cores') === 'marca' ? 'marca' : 'modulos'; // Versão E: uma cor por módulo ou a da marca
  return { trilha, pins, pinImg, fundo, image, cor, shade, dark, custom, modern, float, hud, dock, cores };
}

/** Camada fixa do fundo (cor ou imagem) com a película escura por cima (--board-shade). */
/** Imagem de fundo do módulo: a enviada pelo painel Tweaks ou a padrão dos dados. */
const moduleBg = i => getModuleImage(i) || modules[i].background || boardBackground;

function background(look) {
  if (!look.custom) return '';
  // Uma camada por módulo, empilhadas em ordem: a do 1º começa visível e as seguintes aparecem com a rolagem (revealBackgrounds).
  if (look.fundo === 'modulos') {
    return `<div class="c-board-bg c-board-bg--modules" aria-hidden="true" style="--board-shade:${look.shade}%">${modules.map((m, i) =>
      `<span class="c-board-bg__layer" data-bg-layer="${i}" style="background-image:url('${moduleBg(i)}')${i ? ';opacity:0' : ''}"></span>`).join('')}</div>`;
  }
  const fill = look.fundo === 'imagem'
    ? `background-image:url(${boardBackground})`
    : `background-color:${BG_COLORS[look.cor]}`;
  return `<div class="${cx('c-board-bg', look.fundo === 'imagem' && 'c-board-bg--image')}" aria-hidden="true" style="${fill};--board-shade:${look.shade}%"></div>`;
}

/** Variáveis da faixa que cobre o respiro acima do cartão do módulo: a mesma cor ou imagem do fundo e a mesma película.
    A imagem vai com o endereço completo (url() em variável CSS seria resolvido em relação ao arquivo CSS). */
const imageUrl = src => `url('${new URL(src, location.href).href}')`;
const coverVars = look => (look.custom
  ? `--board-shade:${look.shade}%;--board-cover:${look.fundo === 'imagem' ? imageUrl(boardBackground) : look.fundo === 'modulos' ? imageUrl(moduleBg(0)) : BG_COLORS[look.cor]}`
  : '');

/* ---------- Progresso ---------- */
/** Atividades concluídas: o padrão dos dados ("Em andamento") ou o tweak #tabuleiro?estado=nao-iniciado|concluido|liberado. */
function doneFromHash() {
  const estado = hashParams().get('estado');
  if (estado === 'nao-iniciado' || estado === 'liberado') return 0;
  if (estado === 'concluido') return activities.length;
  return doneCount;
}

function progress() {
  const done = doneFromHash();
  const finished = done >= activities.length;
  const cur = Math.min(done, activities.length - 1);
  const modDone = mi => Math.max(0, Math.min(modules[mi].activities.length, done - moduleStarts[mi]));
  // Trilha liberada (tweak estado=liberado): nada concluído, mas tudo disponível em qualquer ordem — sem pin atual nem cadeados.
  const free = hashParams().get('estado') === 'liberado';
  return { done, finished, started: done > 0, cur, modDone, free, pct: Math.round((done / activities.length) * 100) };
}

/** done, current (a próxima da sequência), locked ou, na trilha liberada, free (disponível: cor cheia e clicável). */
const statusOf = (i, p) => (i < p.done ? 'done' : p.free ? 'free' : i === p.done ? 'current' : 'locked');
/** Missão do fim do módulo: concluída com o módulo; na trilha liberada, já disponível. */
const trophyStatus = (mi, p) => (p.modDone(mi) === modules[mi].activities.length ? 'done' : p.free ? 'free' : 'locked');

/* ---------- Trilha "Versão A" ---------- */

/** Separadores e pins com as posições (px): vertical pela soma das linhas, horizontal pela onda. O 1º módulo não tem
    separador (o cartão fixo faz esse papel): só um marcador para o cartão saber em que módulo a rolagem está. */
function trailItems(p, desk) {
  const rowH = looksFromHash().pins === 'b' ? ROW_B : ROW;
  const items = [];
  const dividerH = desk ? 60 : 46;
  let y = 0;
  let k = 0;
  modules.forEach((m, mi) => {
    const complete = p.modDone(mi) === m.activities.length;
    const curMod = !p.finished && activities[p.cur].mi === mi;
    if (mi === 0) items.push({ type: 'marker', mi, top: 0 });
    else {
      items.push({ type: 'divider', mi, top: y });
      y += dividerH + 40;
    }
    const seq = [...m.activities.map((_, j) => ({ i: moduleStarts[mi] + j })), { trophy: true }];
    seq.forEach((n, j) => {
      let status = n.trophy ? trophyStatus(mi, p) : statusOf(n.i, p);
      const current = status === 'current' && !p.finished;
      // Depois do pin atual, as do mesmo módulo aparecem "abertas" (roxo claro, com número); as seguintes, com cadeado.
      if (status === 'locked' && curMod && !n.trophy) status = 'open';
      const h = current ? ROW_CURRENT : rowH;
      items.push({ type: 'node', mi, i: n.i, trophy: !!n.trophy, status, current, top: y, height: h, off: WAVE[k % WAVE.length], wk: k });
      k += 1;
      y += h + (j < seq.length - 1 ? ROW_GAP : 0);
    });
    y += 64;
  });
  return { items, height: y - 64 };
}

/** Estrela de progresso do LP-DesignSystem 4.0 (Figma 5247:21402 preenchida, 5261:11062 vazia): corpo amarelo com brilho na
    metade direita, ou corpo claro sem brilho; contorno claro de 1px. As cores ficam inline (tokens --color-star-*) para valer
    por cima das regras de .c-icon de cada versão da trilha (que pintam o ícone Feather). */
const STAR_BODY = 'M11.175 2.78425C11.5722 2.20471 12.4272 2.20476 12.8244 2.78425L15.7385 7.03523C15.8034 7.1298 15.8989 7.19901 16.009 7.23152L20.9523 8.68855C21.6262 8.88725 21.8905 9.70104 21.4621 10.2579L18.3195 14.3419C18.2494 14.433 18.2128 14.5462 18.216 14.6612L18.3576 19.8116C18.3769 20.5139 17.6847 21.0167 17.0226 20.7813L12.1672 19.0548C12.0589 19.0164 11.9404 19.0163 11.8322 19.0548L6.97674 20.7813C6.31478 21.0166 5.62344 20.5139 5.64276 19.8116L5.78436 14.6612C5.78752 14.5462 5.75097 14.433 5.68084 14.3419L2.53826 10.2579C2.1098 9.70102 2.37408 8.88722 3.04803 8.68855L7.99041 7.23152C8.10062 7.19903 8.19688 7.12996 8.2619 7.03523L11.175 2.78425Z';
const STAR_SHINE = 'M11.9999 12.4649L19.9999 9.74538L15.413 8.08113L15.0693 7.97468L14.872 7.67292L11.9999 3.96492V12.4649Z';
function progressStar(size, on) {
  return `<svg class="c-icon c-board-star" width="${size}" height="${size}" viewBox="0 0 24 24" overflow="visible" aria-hidden="true" focusable="false">
    <path d="${STAR_BODY}" style="fill:var(${on ? '--color-star-fill' : '--color-star-empty'});stroke:var(--color-star-border);stroke-width:1;paint-order:normal"/>
    ${on ? `<path d="${STAR_SHINE}" style="fill:var(--color-star-shine);stroke:none"/>` : ''}</svg>`;
}

/** Estrelas ao lado do pin concluído: uma coluna de 3 em arco, contornando o pin (a do meio mais afastada), do lado oposto ao
    do cartão de detalhe (que abre para o lado com mais espaço). Ganhas de cima para baixo. */
function sideStars(count, label, side) {
  return `<span class="${cx('c-board-stars c-board-stars--side', `c-board-stars--${side}`)}" role="img" aria-label="${esc(label)}">${[1, 2, 3].map(k =>
    `<span class="${cx('c-board-stars__star', k === 2 && 'c-board-stars__star--mid', count >= k && 'is-on')}">${progressStar(22, count >= k)}</span>`).join('')}</span>`;
}

function stars(count, label) {
  return `<span class="c-board-stars" role="img" aria-label="${esc(label)}">${[1, 2, 3].map(k =>
    `<span class="${cx('c-board-stars__star', k === 2 && 'c-board-stars__star--mid', count >= k && 'is-on')}">${progressStar(k === 2 ? 24 : 20, count >= k)}</span>`).join('')}</span>`;
}

/** Separador ("board module divider"): no desktop, cartão no centro entre duas linhas; no mobile, cartão à esquerda. */
function divider(it) {
  return `<li class="c-board-divider" id="board-mod-${it.mi}" data-module="${it.mi}" style="top:${it.top}px">
    <span class="c-board-divider__line c-board-divider__line--start" aria-hidden="true"></span>
    <span class="c-board-divider__card">
      <span class="c-board-divider__kicker">Módulo ${it.mi + 1}</span>
      <span class="c-board-divider__title">${esc(modules[it.mi].title)}</span>
    </span>
    <span class="c-board-divider__line" aria-hidden="true"></span>
  </li>`;
}

function node(it, p) {
  const m = modules[it.mi];
  const done = it.status === 'done';
  const locked = it.status === 'locked' || it.status === 'open';
  let aria;
  let face;
  if (it.trophy) {
    // Pin do fim do módulo: a missão do módulo (ícone target), liberada quando as atividades do módulo terminam.
    aria = `Missão do módulo ${it.mi + 1}: ${done ? 'concluída' : it.status === 'free' ? 'disponível' : 'bloqueada'}`;
    face = icon('target', 28);
  } else {
    const a = activities[it.i];
    aria = `${it.i + 1}. ${kinds[a.kind].label}: ${a.title}, ${done ? 'concluída' : it.current || it.status === 'free' ? 'disponível' : 'bloqueada'}`;
    // Avaliação (e prova) mostra o LP-Icon challenge e missão o ícone target, mesmo bloqueadas (em cinza, como o pin de
    // conclusão); as demais mostram o número, ou o cadeado quando bloqueadas.
    const kindIcon = a.kind === 'avaliacao' || a.kind === 'prova' ? lpIcon('challenge', 28) : a.kind === 'missao' ? icon('target', 28) : '';
    face = kindIcon || (it.status === 'locked' ? icon('lock', 28) : `<span class="c-board-pin__num">${it.i + 1}</span>`);
  }
  const nStars = done && !it.trophy ? starsPattern[it.i % starsPattern.length] : 0;
  const key = it.trophy ? `trophy-${it.mi}` : `pin-${it.i}`;
  // Cartão de hover só no desktop (a partir de 1179); no mobile e no tablet o toque abre o bottom sheet.
  const modern = looksFromHash().modern;
  const tipHtml = minWidth(DESK) && !modern ? pinTip(it, `tip-${key}`) : '';
  // Moderno (a partir do tablet): o nome da atividade fica sempre visível ao lado do pin, virado para o meio da trilha.
  const variantC = isCD(); // Versões C e D: estrelas em cima do pin, sem anel
  const label = modern && minWidth(TABLET) && !variantC ? pinLabel(it, p) : '';
  // "Começar"/"Continuar" em cima do pin atual (no lugar das estrelas): mostra onde seguir sem precisar abrir nada.
  const start = it.current
    ? `<button type="button" class="c-board-start" data-action="openNode" data-direct="1" data-index="${it.i}" data-key="start-${it.i}" tabindex="-1" aria-hidden="true">${p.started ? 'Continuar' : 'Começar'}</button>`
    : '';
  // Anel do pin atual: progresso do módulo (trilha de 6px e arco com ponta redonda, como no Figma).
  const circ = 2 * Math.PI * 49;
  const modPct = (p.modDone(it.mi) / m.activities.length) * 100;
  // Pins B (disco visto de frente): anel circular. Pins A (ovais em relevo): anel achatado na mesma proporção dos pins (60/72),
  // como se estivesse no chão em volta do pin; o progresso começa no topo e segue no sentido horário (pathLength 100 = %).
  const ring = !it.current || variantC // Versão C: sem o anel de progresso no pin atual
    ? ''
    : looksFromHash().pins === 'b'
      ? `<svg class="c-board-node__ring" viewBox="0 0 104 104" aria-hidden="true"><circle class="c-board-node__ring-track" cx="52" cy="52" r="49"/><circle class="c-board-node__ring-fill" cx="52" cy="52" r="49" stroke-dasharray="${((circ * p.modDone(it.mi)) / m.activities.length).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 52 52)"/></svg>`
      : `<svg class="c-board-node__ring c-board-node__ring--flat" viewBox="0 0 122 112" aria-hidden="true"><ellipse class="c-board-node__ring-track" cx="61" cy="56" rx="58" ry="53"/><path class="c-board-node__ring-fill" d="M61 3 A58 53 0 1 1 61 109 A58 53 0 1 1 61 3" pathLength="100" stroke-dasharray="${modPct.toFixed(1)} 100"/></svg>`;
  const state = it.current ? 'current' : it.trophy && done ? 'done' : it.status;
  const look = looksFromHash();
  if (look.pins === 'b') face = pinFaceB(it, look.pinImg);
  return `<li class="${cx('c-board-node', it.current && 'c-board-node--current', look.pins === 'b' && 'c-board-node--b')}" ${it.current ? 'data-current' : ''} style="top:${it.top}px;height:${it.height}px;--off:${it.off}px">
    <span class="c-board-node__stars">${done && !it.trophy && variantC ? stars(nStars, `${nStars} de 3 estrelas`) : start}</span>
    <span class="c-board-node__pin">
      ${ring}
      <button type="button" class="${cx('c-board-pin', `c-board-pin--${state}`, look.pins === 'b' && 'c-board-pin--b', !it.trophy && ['avaliacao', 'prova'].includes(activities[it.i].kind) && 'c-board-pin--hex')}"
        aria-label="${esc(aria)}" ${tipHtml ? `aria-describedby="tip-${key}" ` : ''}${locked ? 'aria-disabled="true"' : ''}
        data-action="openNode" ${it.trophy ? `data-trophy="${it.mi}"` : `data-index="${it.i}"`} data-key="${key}">${face}</button>
      ${done && !it.trophy && !variantC ? sideStars(nStars, `${nStars} de 3 estrelas`, it.off > 0 ? 'right' : 'left') : ''}
    </span>
    ${tipHtml}${label}
  </li>`;
}

/** Nome ao lado do pin (layout moderno): tipo e duração em cima e o título, num cartão translúcido virado para o meio da
    trilha (as estrelas ficam do lado de fora). Bloqueada: esmaecida; atual: borda na cor da marca. */
function pinLabel(it, p) {
  const side = it.off > 0 ? 'left' : 'right';
  // Atividade atual: em vez do nome, o cartão da próxima atividade (tipo e duração, título, pontos e moedas e o botão), que
  // abre a atividade (ou o diálogo da avaliação) direto.
  if (it.current && !it.trophy) {
    const a = activities[it.i];
    const r = pinRewards(a);
    const g = ['avaliacao', 'prova'].includes(a.kind) ? 'avaliacao' : a.kind === 'missao' ? 'missao' : 'atividade';
    const cta = g === 'avaliacao' ? 'Iniciar avaliação' : g === 'missao' ? 'Iniciar missão' : p.started ? 'Continuar' : 'Começar';
    return `<div class="${cx('c-board-next', `c-board-next--${side}`)}">
      <span class="c-board-next__eyebrow">${icon('navigation', 12)}Próxima atividade</span>
      <span class="c-board-label__kicker">${esc(pinKicker(it.i))}</span>
      <span class="c-board-next__title">${esc(a.title)}</span>
      <span class="c-board-next__rewards">
        <span>${icon('star', 14)}<b>0</b>/${fmtInt(r.pts)}<span class="u-sr-only"> pontos</span></span>
        <span>${lpIcon('coin', 14)}<b>0</b>/${fmtInt(r.coins)}<span class="u-sr-only"> moedas</span></span>
      </span>
      <button type="button" class="c-button c-button--primary c-board-next__cta" data-action="openNode" data-direct="1" data-index="${it.i}" data-key="next-${it.i}"><span>${cta}</span>${icon('arrow-right', 16)}</button>
    </div>`;
  }
  const kicker = it.trophy ? 'Missão' : pinKicker(it.i);
  const title = it.trophy ? `Missão do módulo ${it.mi + 1}` : activities[it.i].title;
  const tone = it.current || it.status === 'free' ? 'current' : it.status === 'done' ? 'done' : 'locked';
  return `<span class="${cx('c-board-label', `c-board-label--${side}`, `c-board-label--${tone}`)}" aria-hidden="true">
      <span class="c-board-label__kicker">${esc(kicker)}</span>
      <span class="c-board-label__title">${esc(title)}</span>
    </span>`;
}

/** Pontos e moedas possíveis da atividade (os mesmos dos cards da tela Curso): avaliação e prova usam os da avaliação final;
    as demais, 20 pontos e 2 moedas por minuto. */
const pinRewards = a => (['avaliacao', 'prova'].includes(a.kind) ? { pts: exam.maxPoints, coins: exam.maxCoins } : { pts: a.min * 20, coins: a.min * 2 });
const fmtInt = n => n.toLocaleString('pt-BR');

/** Rótulo do tipo, como nos cards da tela Curso: "Atividade N · X min" (leitura, quiz e jogo; N conta só as atividades do
    módulo), "Avaliação · X min" (avaliação e prova) e "Missão" (sem tempo). */
function pinKicker(i) {
  const a = activities[i];
  if (a.kind === 'missao') return 'Missão';
  if (['avaliacao', 'prova'].includes(a.kind)) return `Avaliação · ${a.min} min`;
  const start = moduleStarts[a.mi];
  const n = activities.slice(start, i + 1).filter(x => !['avaliacao', 'prova', 'missao'].includes(x.kind)).length;
  return `Atividade ${n} · ${a.min} min`;
}

/** Detalhe do pin ao passar o mouse ou focar pelo teclado (desktop; no toque o pin já abre a atividade): tipo e duração,
    título, pontos e moedas (recebidos/possíveis) e a situação (concluída, disponível ou bloqueada e por quê). Abre para o
    lado com mais espaço. */
function pinInfo(it) {
  const done = it.status === 'done';
  let kicker;
  let title;
  let status;
  let rewards = '';
  if (it.trophy) {
    kicker = 'Missão';
    title = `Missão do módulo ${it.mi + 1}`;
    status = done ? ['done', 'check-circle', 'Concluída'] : it.status === 'free' ? ['current', 'play-circle', 'Disponível'] : ['locked', 'lock', 'Conclua as atividades do módulo'];
  } else {
    const a = activities[it.i];
    kicker = pinKicker(it.i);
    title = a.title;
    const r = pinRewards(a);
    const got = done; // concluída: recebeu o máximo
    // Pílula de pontos e moedas da lista de atividades do Curso (.c-cd-tl__rewards).
    rewards = `<span class="c-cd-tl__rewards c-board-tip__rewards">
        <span title="Pontos">${icon('star', 14)}<b>${fmtInt(got ? r.pts : 0)}</b>/${fmtInt(r.pts)}<span class="u-sr-only"> pontos</span></span>
        <span title="Moedas">${lpIcon('coin', 14)}<b>${fmtInt(got ? r.coins : 0)}</b>/${fmtInt(r.coins)}<span class="u-sr-only"> moedas</span></span>
      </span>`;
    status = done
      ? ['done', 'check-circle', 'Concluída']
      : it.current ? ['current', 'play-circle', 'Disponível agora'] : it.status === 'free' ? ['current', 'play-circle', 'Disponível'] : ['locked', 'lock', 'Conclua a anterior para liberar'];
  }
  const [tone, ic, label] = status;
  return { kicker, title, rewards, tone, statusHtml: `<span class="${cx('c-board-tip__status', `c-board-tip__status--${tone}`)}">${icon(ic, 14)}${esc(label)}</span>` };
}

/** Ícone do tipo no cartão do pin, como na lista de atividades da tela Curso: edit (atividade), challenge (avaliação e prova)
    ou target (missão e a missão do fim do módulo). */
function pinKindIcon(it, px) {
  const k = it.trophy ? 'missao' : activities[it.i].kind;
  if (['avaliacao', 'prova'].includes(k)) return lpIcon('challenge', px);
  return k === 'missao' ? icon('target', px) : icon('edit', px);
}

/** Títulos longos (mais de 2 linhas na largura padrão de 224) abrem o cartão mais largo. */
const TIP_WIDE_AT = 44;

/** Conteúdo do cartão do pin (o mesmo no hover e no bottom sheet do toque): título com o ícone do tipo, "Atividade N · X min",
    pontos e moedas e a situação. */
function pinCardBody(it, n) {
  return `<span class="c-cd-tl__head c-board-tip__head">${pinKindIcon(it, 14)}<span class="c-cd-tl__title c-board-tip__title">${esc(n.title)}</span></span>
      <span class="c-cd-tl__kicker c-board-tip__kicker"><span>${esc(n.kicker)}</span></span>
      ${n.rewards}
      ${n.statusHtml}`;
}

function pinTip(it, id) {
  const side = it.off > 0 ? 'left' : 'right';
  const n = pinInfo(it);
  const wide = [...n.title].length > TIP_WIDE_AT;
  return `<span class="${cx('c-board-tip', `c-board-tip--${side}`, wide && 'c-board-tip--wide', n.tone === 'locked' && 'c-board-tip--locked')}" role="tooltip" id="${id}">
      ${pinCardBody(it, n)}
    </span>`;
}

/* ---------- Bottom sheet do pin (toque) ----------
   Sem hover no toque (mobile, tablet e telas de toque): tocar no pin abre o mesmo conteúdo do cartão de hover num bottom
   sheet, com o botão para começar: "Iniciar atividade", "Iniciar avaliação" ou "Iniciar missão" ("Refazer …" se já
   concluída). Bloqueada: o botão fica desabilitado e a linha de situação diz o que falta. */
const useSheet = () => !minWidth(DESK) || window.matchMedia('(hover: none)').matches;

/** Item da trilha a partir do pin tocado (atividade pelo índice ou a missão do fim do módulo). */
function sheetItem(sheet, p) {
  if (sheet.trophy !== undefined) {
    const mi = sheet.trophy;
    return { trophy: true, mi, status: trophyStatus(mi, p), current: false };
  }
  const st = statusOf(sheet.i, p);
  return { i: sheet.i, mi: activities[sheet.i].mi, status: st, current: st === 'current' && !p.finished };
}

/** Tipo para o botão: atividade (leitura, quiz, jogo), avaliação (avaliação e prova) ou missão. */
function sheetNoun(it) {
  if (it.trophy) return 'missão';
  const k = activities[it.i].kind;
  if (['avaliacao', 'prova'].includes(k)) return 'avaliação';
  return k === 'missao' ? 'missão' : 'atividade';
}

function pinSheet(state, p) {
  const it = sheetItem(state.sheet, p);
  const n = pinInfo(it);
  const locked = n.tone === 'locked';
  const noun = sheetNoun(it);
  const verb = it.status === 'done' ? 'Refazer' : 'Iniciar';
  // O mesmo cartão do hover (pinCardBody), sem a caixa flutuante, e o botão embaixo: só "Iniciar" (play-circle, como no Curso)
  // ou "Refazer" (rotate-ccw); bloqueada, "Iniciar" com o cadeado. O nome inteiro ("Iniciar atividade") fica no aria-label.
  const body = `<div class="c-board-sheet">
      <div class="${cx('c-board-tip c-board-tip--sheet', locked && 'c-board-tip--locked')}">${pinCardBody(it, n)}</div>
      <button type="button" class="c-button c-button--primary c-board-sheet__cta" data-action="sheetStart" aria-label="${verb} ${noun}" ${locked ? 'disabled aria-disabled="true"' : ''}>
        <span>${verb}</span>${icon(locked ? 'lock' : it.status === 'done' ? 'rotate-ccw' : 'play-circle', 16)}
      </button>
    </div>`;
  return panel({ mode: 'sheet', label: n.title, body, closeAction: 'closeSheet', enter: state.fresh, className: 'c-board-sheet-panel' });
}

/** Pins da Versão B (tweak pins=b): disco branco com sombra, miolo colorido (concluída: dourado com aro na cor da marca;
    atual: cor da marca; aberta e bloqueada: cinza) com o ícone do tipo de atividade, ou uma imagem (tweak "Imagens nos
    pins"), e o número num selo escuro embaixo. A missão do fim do módulo não tem número. */
function pinFaceB(it, withImage) {
  let ic;
  if (it.trophy) ic = icon('target', 32);
  else {
    const a = activities[it.i];
    ic = a.kind === 'avaliacao' || a.kind === 'prova' ? lpIcon('challenge', 32) : a.kind === 'missao' ? icon('target', 32) : icon(kinds[a.kind].icon, 32);
  }
  // Avaliação, prova e missão ficam sempre com o ícone (challenge ou target), mesmo com "Imagens nos pins": só as atividades
  // usam a imagem.
  const iconOnly = it.trophy || ['avaliacao', 'prova', 'missao'].includes(activities[it.i].kind);
  const img = withImage && !iconOnly ? `<img class="c-board-pin__img" src="${pinImages[it.i % pinImages.length]}" alt="" />` : '';
  return `<span class="c-board-pin__core">${img || ic}</span>${it.trophy ? '' : `<span class="c-board-pin__badge" aria-hidden="true">${it.i + 1}</span>`}`;
}

/** Cartão fixo do módulo visível ("board module band"). */
function band(state, p, desk) {
  const vm = state.viewMod ?? (p.finished ? modules.length - 1 : activities[p.cur].mi);
  const len = modules[vm].activities.length;
  const d = p.modDone(vm);
  const status = desk
    ? (d === len ? pill({ label: 'Concluído', color: 'green', iconName: 'check' }) : pill({ label: `${d} de ${len} concluídas`, color: 'grey' }))
    : (d === len ? mpill({ tone: 'success', iconName: 'check', label: 'Concluído' }) : mpill({ tone: 'subtle', label: `${d} de ${len} concluídas` }));
  return `<div class="c-board-band">
    <div class="c-board-band__card">
      <span class="c-board-band__avatar" aria-hidden="true" style="background-image:url(${course.cover})"></span>
      <div class="c-board-band__text">
        <span class="c-board-band__kicker"><span>Módulo ${vm + 1} de ${modules.length}</span><span class="c-cd-bullet" aria-hidden="true"></span><span>${len} Atividades</span></span>
        <span class="c-board-band__title">${esc(modules[vm].title)}</span>
      </div>
      <span class="c-board-band__status">${status}</span>
    </div>
  </div>`;
}

/* ---------- Trilha "Versão B" (tweak trilha=b; Figma "Curso Ludica - Versao B") ---------- */
/* Estrada em serpentina: o cartão do módulo (o mesmo da Versão A) na largura toda, a estrada sai de baixo dele, faz a
   curva e corre em fileiras de até 5 pins, virando nas pontas; no fim do módulo desce por baixo do cartão seguinte. Uma
   linha de progresso cobre a estrada até a atividade atual (ou inteira, no curso concluído). Pins, estrelas e anel são os
   da Versão A; não há pin de conclusão. A geometria depende da largura real da área (state.bw, medida no onRender).
   Medidas do Figma (1440, trilha de 832): estrada a 84 da borda, curvas de 44, 1º pin a 72 da estrada, fileiras a 116,
   1ª fileira 114 abaixo do cartão e o cartão seguinte 92 abaixo da última fileira. Fileira com menos de 5 pins: eles se
   espalham entre o 1º e o último lugar. */
const B_MAX = 832; // largura máxima da trilha B (a do cartão do módulo)
const B_R = 44; // raio das curvas
const B_STEP = 116; // distância entre fileiras (linha de 110 + 6)

/* Versão C (tweak trilha=c): a estrada da B, mais legível. Estrelas maiores, com contorno, em cima de cada pin concluído;
   pins um pouco mais afastados (124 no desktop, 104 no mobile); estrada fina, da espessura do aro branco do pin (9); setas no
   caminho, entre um pin e o seguinte, mostram o sentido de leitura; e a estrada entra e sai dos cartões dos módulos pelas laterais. */
const C_GAP = 40; // Versão C: espaço a mais acima e abaixo de cada cartão de módulo
const C_LABEL = 16; // folga a mais entre as fileiras: as estrelas maiores, em cima do pin, não encostam no selo do pin de cima

/* Versão C no mobile (abaixo de 768): a trilha é sempre vertical — todos os pins numa coluna no meio, ligados por uma
   estrada reta que passa por trás dos cartões dos módulos. Marcador (seta para baixo, ou cadeado) no meio de cada trecho entre
   dois pins e entre o último pin de um módulo e o cartão seguinte. No fim, o último pin fica no meio da área visível. */
function trailCVertical(p, bw, cardHs) {
  const pinsB = looksFromHash().pins === 'b';
  const ch = mi => cardHs?.[mi] ?? 90; // altura medida do cartão (título em 2 linhas) ou a padrão
  const cx = Math.round(bw / 2);
  const items = [];
  let ty = 0; // topo do próximo item
  let cardMid = null;
  let lastCenter = 0;
  let progEnd = null; // centro do pin até onde vai o progresso
  modules.forEach((mo, mi) => {
    items.push({ type: 'card', mi, top: ty, inset: 0 });
    if (cardMid === null) cardMid = ty + ch(mi) / 2;
    if (mi > 0) {
      // marcador entre o último pin do módulo anterior e este cartão
      const st0 = statusOf(moduleStarts[mi], p);
      items.push({ type: 'chev', x: cx, y: Math.round((lastCenter + 42 + ty) / 2), dir: 'down', done: st0 === 'done' || st0 === 'current', locked: st0 === 'locked' });
    }
    ty += ch(mi) + 28;
    let prevCenter = null;
    mo.activities.forEach((_, j) => {
      const i = moduleStarts[mi] + j;
      let status = statusOf(i, p);
      const current = status === 'current' && !p.finished;
      if (status === 'locked' && !p.finished && activities[p.cur].mi === mi) status = 'open';
      const h = (current ? ROW_CURRENT : pinsB ? ROW_B : ROW) + C_LABEL;
      const center = ty + (current ? 82 : pinsB ? 72 : 66);
      if (prevCenter !== null) {
        // no vão entre o selo do número do pin de cima (centro + 52) e o topo da linha de baixo (estrelas ou "Continuar")
        items.push({ type: 'chev', x: cx, y: Math.round((prevCenter + 52 + ty) / 2), dir: 'down', done: status === 'done' || current, locked: status === 'locked' || status === 'open' });
      }
      items.push({ type: 'node', mi, i, status, current, top: ty, height: h, off: 0 });
      if (status === 'done' || current) progEnd = center;
      prevCenter = center;
      lastCenter = center;
      ty += h + 24;
    });
    ty = lastCenter + 42 + 64; // respiro até o próximo cartão
  });
  // Rolando até o fim, o último pin fica no meio da área visível (abaixo das abas).
  const height = lastCenter + Math.max(66 + C_LABEL, Math.round((window.innerHeight - (44 + 40 + 55)) / 2) - 150);
  const road = `M${cx} ${cardMid} L${cx} ${lastCenter}`;
  const end = p.finished ? lastCenter : progEnd;
  const prog = end ? `M${cx} ${cardMid} L${cx} ${end}` : '';
  return { items, road, prog, height };
}

/* Trilha vertical do mobile e do tablet (abaixo do desktop) no visual da Versão E: os pins da E (disco branco, imagem ou
   ícone na cor do módulo, halo pulsando no atual, estrelas em arco) numa coluna no meio; a estrada reta por trás, com a linha
   do progresso na cor de cada módulo (tokens --color-module-N; tweak "Cores dos módulos"), sem setas nem cadeados no trilho;
   e o cartão do módulo com as informações do cartão da E (etiqueta "Módulo N", título inteiro, "N atividades · tempo" e a
   barra de progresso com o %), com a imagem do módulo no topo, como na E. Cada trecho vai do meio de um cartão ao meio do seguinte (no último, até o
   último pin). */
function trailVLayout(p, bw, cardHs) {
  const s = minWidth(TABLET) ? 1 : 1.14; // escala do pin: 84 no tablet; no mobile 96 (0,76 × 1,5 = 1,14; era 64, aumentado em 50% em 24/11/2026)
  const ch = mi => cardHs?.[mi] ?? 120;
  const cx = Math.round(bw / 2);
  const above = Math.round(71 * s); // do centro do pin ao topo das estrelas
  const below = Math.round(58 * s); // do centro do pin à base do selo do número
  // Do selo de um pin às estrelas do seguinte: 28 no tablet; no mobile 68 (o vão entre os pins, 79, cresceu 50% para 119 em 24/11/2026).
  const step = above + below + (minWidth(TABLET) ? 28 : 68);
  const items = [];
  const legs = [];
  let ty = 0;
  let lastCenter = 0;
  let curY = null;
  let curLeg = -1;
  modules.forEach((mo, mi) => {
    items.push({ type: 'card', mi, top: ty });
    const y0 = ty + ch(mi) / 2;
    let y = ty + ch(mi) + 32 + above;
    mo.activities.forEach((_, j) => {
      const i = moduleStarts[mi] + j;
      let status = statusOf(i, p);
      const current = status === 'current' && !p.finished;
      if (status === 'locked' && !p.finished && activities[p.cur].mi === mi) status = 'open';
      if (current) { curY = y; curLeg = mi; }
      items.push({ type: 'node', mi, i, status, current, x: cx, y, off: -1 });
      lastCenter = y;
      y += step;
    });
    ty = lastCenter + below + 40;
    legs.push({ mi, y0, y1: mi < modules.length - 1 ? ty + ch(mi + 1) / 2 : lastCenter });
  });
  // Trilha liberada: nada feito, então nada preenchido (só o caminho cinza).
  legs.forEach(l => { l.reached = p.free ? l.y0 : p.finished || l.mi < curLeg ? l.y1 : l.mi === curLeg ? curY : l.y0; });
  // Rolando até o fim, o último pin fica no meio da área visível (abaixo das abas).
  const height = lastCenter + Math.max(below + 24, Math.round((window.innerHeight - (44 + 40 + 55)) / 2) - 150);
  return { items, legs, height, s, cx };
}

/** Tablet (768 a 1178): a trilha vertical com as curvas da Versão E do desktop. Entre um cartão e o seguinte, a estrada desce
    do meio do cartão, vai e volta na horizontal entre duas faixas (esquerda e direita), descendo a cada volta, com cantos
    arredondados (roundedSegs, raio R), e entra no meio do cartão seguinte. Os pins ficam espaçados por igual ao longo do
    caminho (como na E). Cada trecho é de um módulo, na cor dele, e o progresso vai até o pin atual. */
function trailVCurvedLayout(p, bw, cardHs) {
  const s = 1; // pin de 84
  const ch = mi => cardHs?.[mi] ?? 120;
  const cx = Math.round(bw / 2);
  const A = Math.round(Math.min(bw / 2 - 64, 260)); // meia largura do vai e vem
  const R = 32;
  const D = 200; // descida a cada volta (o pin do trecho vertical fica no meio, sem cobrir as curvas)
  const h0 = 220; // descida reta ao sair do cartão e antes de entrar no seguinte (cabe 1 pin longe do cartão)
  const items = [];
  const legs = [];
  let ty = 0;
  let curS = null;
  let curLeg = -1;
  let lastY = 0;
  modules.forEach((mo, mi) => {
    items.push({ type: 'card', mi, top: ty });
    const last = mi === modules.length - 1;
    const n = mo.activities.length;
    const y0 = ty + ch(mi) - E_IN;
    // Trechos (26/11/2026): as descidas que saem do cartão e entram no seguinte nunca têm pin; a meia fileira de saída e a de
    // chegada têm 1; cada trecho vertical entre fileiras tem 1; cada fileira inteira tem 2 ou 3. Quantas fileiras: o menor
    // número em que cabem todos os pins do módulo (mínimo = 1 em cada trecho e 2 nas fileiras; máximo = 3 nas fileiras).
    // Módulo com 1 pin: um trecho reto até o cartão seguinte, com o pin no meio.
    let pts;
    let path;
    let slots;
    if (n === 1) {
      const L = 360;
      pts = [[cx, y0], [cx, y0 + L + (last ? 0 : E_IN)]];
      path = roundedSegs(pts, R);
      slots = [E_IN + L / 2];
    } else {
      const maxOf = r => 2 + r + 3 * (r - 1);
      let rows = 1;
      while (maxOf(rows) < n && rows < 40) rows++;
      pts = [[cx, y0], [cx, y0 + h0]];
      let y = y0 + h0;
      let side = 1;
      pts.push([cx + side * A, y]);
      for (let k = 1; k < rows; k++) { y += D; pts.push([cx + side * A, y]); side = -side; pts.push([cx + side * A, y]); }
      y += D;
      pts.push([cx + side * A, y], [cx, y]);
      if (!last) pts.push([cx, y + h0 + E_IN]);
      path = roundedSegs(pts, R);
      // Trechos retos na ordem do caminho, sem as duas descidas das pontas.
      const lines = path.segs.filter(sg => sg.t === 'L' && sg.len > 1).slice(1, last ? undefined : -1);
      const full = sg => Math.abs(sg.a[1] - sg.b[1]) < 0.5 && Math.abs(sg.a[0] - sg.b[0]) > A + 1;
      const caps = lines.map(sg => (full(sg) ? 2 : 1));
      let extra = n - caps.reduce((t, c) => t + c, 0);
      lines.forEach((sg, k) => { if (extra > 0 && full(sg)) { caps[k] = 3; extra--; } });
      // Menos pins que o mínimo (ex.: 4 ou 5 com 2 fileiras): tira das fileiras inteiras e depois dos trechos do fim.
      let over = caps.reduce((t, c) => t + c, 0) - n;
      for (let k = caps.length - 1; k >= 0 && over > 0; k--) if (full(lines[k]) && caps[k] > 1) { caps[k]--; over--; }
      for (let k = caps.length - 1; k >= 0 && over > 0; k--) if (caps[k] > 0) { caps[k]--; over--; }
      slots = [];
      lines.forEach((sg, k) => {
        const c = caps[k];
        const from = sg.s + 48;
        const to = sg.s + sg.len - 48;
        for (let j = 0; j < c; j++) {
          if (c === 1) slots.push(sg.s + sg.len / 2);
          else if (c === 2) slots.push(sg.s + ((j + 1) * sg.len) / 3); // 2 pins: a fileira dividida em 3 partes
          else slots.push(from + (j * (to - from)) / (c - 1));
        }
      });
    }
    mo.activities.forEach((_, j) => {
      const i = moduleStarts[mi] + j;
      let status = statusOf(i, p);
      const current = status === 'current' && !p.finished;
      if (status === 'locked' && !p.finished && activities[p.cur].mi === mi) status = 'open';
      const sAt = slots[j] ?? slots[slots.length - 1];
      const [nx, ny] = pointAt(path, sAt);
      if (current) { curS = sAt; curLeg = mi; }
      items.push({ type: 'node', mi, i, status, current, x: Math.round(nx), y: Math.round(ny), off: -1 });
      lastY = Math.max(lastY, ny);
    });
    legs.push({ mi, path });
    const endY = pts[pts.length - 1][1];
    ty = last ? endY : endY - E_IN;
  });
  legs.forEach(l => { l.reached = p.free ? 0 : p.finished || l.mi < curLeg ? l.path.total : l.mi === curLeg ? curS : 0; });
  const height = Math.round(lastY + Math.max(58 + 24, Math.round((window.innerHeight - (64 + 40 + 55)) / 2) - 150));
  return { items, legs, height, s };
}

function cardV(it, p) {
  const m = modules[it.mi];
  const len = m.activities.length;
  const d = p.modDone(it.mi);
  const pct = Math.round((d / len) * 100);
  const mins = m.activities.reduce((sum, a) => sum + a[2], 0);
  return `<li class="${cx('c-board-bcard c-board-vcard', d === len && 'is-done')}" id="board-mod-${it.mi}" data-module="${it.mi}" style="top:${it.top}px;--mod:${modColor(it.mi)}">
    <div class="c-board-ecard__top"><img class="c-board-ecard__img" src="${esc(moduleBg(it.mi))}" alt="" loading="lazy" /></div>
    <div class="c-board-vcard__body">
    <span class="c-board-ecard__tag">Módulo ${it.mi + 1}</span>
    <h3 class="c-board-vcard__title">${esc(m.title)}</h3>
    <span class="c-cd-module__meta">${[`${len} atividades`, fmtMinutes(mins)].map(t => `<span>${esc(t)}</span>`).join('<span class="c-cd-bullet" aria-hidden="true"></span>')}</span>
    <span class="c-cd-module__progress c-board-vcard__progress" role="img" aria-label="${d} de ${len} atividades concluídas"><span class="c-cd-module__track"><span class="${cx(d === len && 'is-done')}" style="width:${pct}%"></span></span><span class="c-cd-module__pct">${pct}%</span></span>
    </div>
  </li>`;
}

function trailV(state, p) {
  const bw = trailBWidth(state);
  // Tablet: a trilha vertical com as curvas da Versão E.
  if (minWidth(TABLET)) {
    const { items, legs, height, s } = trailVCurvedLayout(p, bw, state.cardHs);
    const roads = legs.map(l => {
      const d = subPath(l.path, 0, l.path.total);
      return `<g style="--mod:${modColor(l.mi)}">
      <path class="c-board-road__shadow" d="${d}" transform="translate(0 2)"/>
      <path class="c-board-road__way" d="${d}"/>
      ${l.reached > 0.5 ? `<path class="c-board-road__progress" d="${subPath(l.path, 0, l.reached)}"/>` : ''}
    </g>`;
    }).join('');
    return `<div class="c-board-btrail c-board-etrail c-board-vtrail c-board-vtrail--curved" style="width:${bw}px;height:${height}px;--e-pin:${s}">
      <svg class="c-board-road c-board-eroad" width="${bw}" height="${height}" viewBox="0 0 ${bw} ${height}" aria-hidden="true">${roads}</svg>
      <ol class="c-board-trail__list" aria-label="Atividades do curso">${items.map(it => (it.type === 'card' ? cardV(it, p) : nodeE(it, p))).join('')}</ol>
    </div>
    ${jumpAndFinish(state, p)}`;
  }
  const { items, legs, height, s, cx: x } = trailVLayout(p, bw, state.cardHs);
  const roads = legs.map(l => `<g style="--mod:${modColor(l.mi)}">
      <path class="c-board-road__shadow" d="M${x} ${l.y0} L${x} ${l.y1}" transform="translate(0 2)"/>
      <path class="c-board-road__way" d="M${x} ${l.y0} L${x} ${l.y1}"/>
      ${l.reached > l.y0 ? `<path class="c-board-road__progress" d="M${x} ${l.y0} L${x} ${l.reached}"/>` : ''}
    </g>`).join('');
  return `<div class="c-board-btrail c-board-etrail c-board-vtrail" style="width:${bw}px;height:${height}px;--e-pin:${s}">
      <svg class="c-board-road c-board-eroad" width="${bw}" height="${height}" viewBox="0 0 ${bw} ${height}" aria-hidden="true">${roads}</svg>
      <ol class="c-board-trail__list" aria-label="Atividades do curso">${items.map(it => (it.type === 'card' ? cardV(it, p) : nodeE(it, p))).join('')}</ol>
    </div>
    ${jumpAndFinish(state, p)}`;
}

function trailBLayout(p, bw, compact, cardHs) {
  const c = looksFromHash().trilha === 'c';
  if (c && compact) return trailCVertical(p, bw, cardHs);
  const pinsB = looksFromHash().pins === 'b'; // pins B: centro do disco 72 abaixo do topo da linha (A: 66)
  const m = compact ? 28 : Math.min(84, Math.round(bw * 0.1)); // estrada a partir da borda
  const cardH = compact ? 90 : 80;
  // Versão C: altura real de cada cartão (o título pode ir a 2 linhas), medida depois de desenhar (measureCards).
  const ch = mi => (c && cardHs?.[mi]) || cardH;
  const xa = m + (compact ? 56 : 72); // centro do 1º pin da fileira
  const xb = bw - xa; // centro do último
  const minGap = c ? (compact ? 104 : 124) : 88;
  const perRow = Math.max(2, Math.min(5, Math.floor((xb - xa) / minGap) + 1));
  // Distância entre fileiras. Versão C: 50% maior (132 → 198) para as fileiras respirarem.
  const step = c ? Math.round((B_STEP + C_LABEL) * 1.5) : B_STEP;
  const gap = (xb - xa) / (perRow - 1);
  const items = [];
  let road = '';
  let prog = '';
  let progOn = true;
  let y = 0;
  let fromLeft = true;
  const seg = c => {
    road += c;
    if (progOn) prog += c;
  };
  // Versão C: o cartão do módulo fica entre as duas descidas da estrada (recuado r de cada uma), e a estrada entra por uma
  // lateral dele, no meio da altura, e sai pela outra (curva de raio r até a descida).
  const r = compact ? 14 : B_R;
  const inset = m + r;
  modules.forEach((mo, mi) => {
    items.push({ type: 'card', mi, top: y, inset: c ? inset : 0 });
    if (c) {
      const cy = y + ch(mi) / 2;
      // Entrou pelo lado em que a estrada chegou (fromLeft); sai pelo outro.
      if (mi > 0) fromLeft = !fromLeft;
      const ox = fromLeft ? m : bw - m;
      const edge = fromLeft ? inset : bw - inset;
      if (mi === 0) {
        road = `M${edge} ${cy}`;
        prog = road;
      } else seg(` M${edge} ${cy}`);
      seg(` A${r} ${r} 0 0 ${fromLeft ? 0 : 1} ${ox} ${cy + r}`);
    }
    const sx = fromLeft ? m : bw - m;
    const cb = y + ch(mi);
    if (mi === 0 && !c) {
      road = `M${sx} ${cb - 12}`;
      prog = road;
    }
    const curMod = !p.finished && activities[p.cur].mi === mi;
    // Versão C, módulo de uma fileira só (até 5 atividades) que não é o último: o espaço até o próximo cartão cresce para que,
    // com este cartão encostado na barra do curso, a metade do próximo já apareça na base da tela. O extra se divide em cima e
    // embaixo da fileira.
    let extra = 0;
    if (c && mi < modules.length - 1 && mo.activities.length <= perRow) {
      const topEdge = minWidth(DESK) ? 64 + 12 + 66 : 44 + 40 + 55 + 8; // base da barra do curso (desktop) ou das abas (mobile, abaixo do "Voltar")
      const base = ch(mi) + 114 + C_GAP + 92 + C_LABEL + C_GAP; // do topo deste cartão ao topo do próximo, sem o extra
      extra = Math.max(0, Math.round(window.innerHeight - topEdge - ch(mi + 1) / 2 - base));
    }
    let rowY = cb + 114 + (c ? C_GAP : 0) + Math.round(extra / 2); // Versão C: mais respiro entre o cartão do módulo e a 1ª fileira
    let right = fromLeft; // sentido da fileira
    seg(` L${sx} ${rowY - B_R}`);
    seg(` A${B_R} ${B_R} 0 0 ${right ? 0 : 1} ${right ? sx + B_R : sx - B_R} ${rowY}`);
    const rows = [];
    for (let j = 0; j < mo.activities.length; j += perRow) rows.push(mo.activities.slice(j, j + perRow).map((_, k) => j + k));
    rows.forEach((row, ri) => {
      // Fileira incompleta: os pins se espalham na largura toda (um só fica no centro).
      // Versão C: fileira incompleta com o mesmo espaçamento das cheias, centralizada na largura.
      const g = c ? gap : row.length === perRow ? gap : row.length > 1 ? (xb - xa) / (row.length - 1) : 0;
      const x0 = c ? (bw - (row.length - 1) * gap) / 2 : row.length > 1 ? xa : (xa + xb) / 2;
      row.forEach((j, k) => {
        const x = right ? x0 + k * g : bw - x0 - k * g;
        const i = moduleStarts[mi] + j;
        seg(` L${x} ${rowY}`);
        let status = statusOf(i, p);
        const current = status === 'current' && !p.finished;
        if (status === 'locked' && curMod) status = 'open';
        const h = (current ? ROW_CURRENT : pinsB ? ROW_B : ROW) + (c ? C_LABEL : 0);
        // Seta no caminho entre este pin e o anterior da fileira (Versão C): mostra para que lado a trilha segue.
        if (c && k > 0) items.push({ type: 'chev', x: Math.round(x - (right ? g : -g) / 2), y: rowY, dir: right ? 'right' : 'left', done: progOn, locked: status === 'locked' || status === 'open' });
        items.push({ type: 'node', mi, i, status, current, top: rowY - (current ? 82 : pinsB ? 72 : 66), height: h, off: Math.round(x - bw / 2) });
        if (current) progOn = false;
      });
      if (ri < rows.length - 1) {
        // Virada: quarto de círculo, reta e outro quarto de círculo até a fileira de baixo.
        const ex = right ? bw - m - B_R : m + B_R;
        const ox = right ? bw - m : m;
        const sweep = right ? 1 : 0;
        seg(` L${ex} ${rowY}`);
        seg(` A${B_R} ${B_R} 0 0 ${sweep} ${ox} ${rowY + B_R}`);
        seg(` L${ox} ${rowY + step - B_R}`);
        seg(` A${B_R} ${B_R} 0 0 ${sweep} ${ex} ${rowY + step}`);
        // Versão C: marcador no meio da descida entre as fileiras (seta para baixo, ou cadeado se o próximo pin está bloqueado).
        if (c) {
          const nst = statusOf(moduleStarts[mi] + rows[ri + 1][0], p);
          items.push({ type: 'chev', x: ox, y: Math.round(rowY + step / 2), dir: 'down', done: progOn, locked: nst === 'locked' });
        }
        rowY += step;
        right = !right;
      } else if (mi < modules.length - 1) {
        // Fim do módulo: curva para baixo na ponta e desce por baixo do cartão seguinte.
        const ex = right ? bw - m : m;
        const ax = right ? ex - B_R : ex + B_R;
        seg(` L${ax} ${rowY}`);
        seg(` A${B_R} ${B_R} 0 0 ${right ? 1 : 0} ${ex} ${rowY + B_R}`);
        y = rowY + 92 + (c ? C_LABEL + C_GAP : 0) + (extra - Math.round(extra / 2)); // Versão C: mais respiro entre a última fileira e o próximo cartão
        if (c) {
          // Desce até a altura do meio do cartão seguinte e entra pela lateral dele.
          const cy = y + ch(mi + 1) / 2;
          seg(` L${ex} ${cy - r}`);
          // Marcador no meio da descida até o próximo módulo.
          items.push({ type: 'chev', x: ex, y: Math.round((rowY + B_R + cy - r) / 2), dir: 'down', done: progOn, locked: statusOf(moduleStarts[mi + 1], p) === 'locked' });
          seg(` A${r} ${r} 0 0 ${right ? 1 : 0} ${right ? bw - inset : inset} ${cy}`);
        } else seg(` L${ex} ${y + cardH}`);
        fromLeft = !right;
      } else if (c) {
        // Último módulo (Versão C): espaço depois da última fileira para que, rolando até o fim, ela fique no meio da área
        // visível (entre a barra do curso, ou as abas no mobile, e a base da tela). Descontam-se o que vem depois da trilha
        // (botão de ir à atividade atual e respiros: 64 no desktop, 150 no mobile, com a navigation bar).
        const topEdge = minWidth(DESK) ? 64 + 12 + 66 : 44 + 40 + 55;
        const below = minWidth(DESK) ? 64 : 150;
        y = rowY + Math.max(66 + C_LABEL, Math.round((window.innerHeight - topEdge) / 2) - below);
      } else y = rowY + 66;
    });
  });
  return { items, road, prog: p.free ? '' : prog, height: y }; // trilha liberada: nada preenchido
}

/** Cartão do módulo da trilha B: o "board module band" da Versão A, um por módulo, com o selo Concluído, o andamento ou
    Bloqueado. */
function cardB(it, p, desk) {
  const m = modules[it.mi];
  const len = m.activities.length;
  const d = p.modDone(it.mi);
  const started = p.free || d > 0 || (!p.finished && activities[p.cur].mi === it.mi);
  const [label, tone, ic] = d === len ? ['Concluído', 'green', 'check'] : started ? [`${d} de ${len} concluídas`, 'grey', null] : ['Bloqueado', 'grey', 'lock'];
  const status = desk
    ? pill({ label, color: tone, iconName: ic ?? undefined })
    : mpill({ tone: tone === 'green' ? 'success' : 'subtle', iconName: ic ?? undefined, label });
  if (isCD()) return cardC(it, p, desk);
  return `<li class="c-board-bcard" id="board-mod-${it.mi}" data-module="${it.mi}" style="top:${it.top}px">
    <div class="c-board-band__card">
      <span class="c-board-band__avatar" aria-hidden="true" style="background-image:url(${course.cover})"></span>
      <div class="c-board-band__text">
        <span class="c-board-band__kicker"><span>Módulo ${it.mi + 1} de ${modules.length}</span><span class="c-cd-bullet" aria-hidden="true"></span><span>${len} Atividades</span></span>
        <span class="c-board-band__title">${esc(m.title)}</span>
      </div>
      <span class="c-board-band__status">${status}</span>
    </div>
  </li>`;
}

/** Cartão do módulo da Versão C: o título e, embaixo, "N atividades · tempo" e o andamento na barra de progresso do módulo da
    tela Curso (base de 10, preenchimento de 6 e o %). Fica entre as descidas
    da estrada (left/right = inset) para ela entrar e sair pelas laterais. Os módulos ficam sempre abertos. */
function cardC(it, p, desk) {
  const m = modules[it.mi];
  const len = m.activities.length;
  const d = p.modDone(it.mi);
  const started = p.free || d > 0 || (!p.finished && activities[p.cur].mi === it.mi);
  const st = d === len ? 'done' : started ? 'current' : 'locked';
  const mins = m.activities.reduce((sum, a) => sum + a[2], 0); // [tipo, título, minutos]
  const pct = Math.round((d / len) * 100);
  const pos = it.lane ? `top:${it.top}px;left:${it.x}px;width:${it.w}px;right:auto;--card-w:${it.cw}px;--card-left:${it.sl}px` : `top:${it.top}px;left:${it.inset}px;right:${it.inset}px`;
  return `<li class="${cx('c-board-bcard c-board-ccard', `c-board-ccard--${st}`, it.lane && 'c-board-dcard')}" id="board-mod-${it.mi}" data-module="${it.mi}" style="${pos}">
    <div class="c-board-band__card">
      <span class="c-board-band__avatar" aria-hidden="true" style="background-image:url(${course.cover})"></span>
      <div class="c-board-band__text">
        <span class="c-board-band__title" title="${esc(m.title)}">${esc(m.title)}</span>
        <span class="c-board-band__kicker"><span>${len} atividades</span><span class="c-cd-bullet" aria-hidden="true"></span><span>${esc(fmtMinutes(mins))}</span></span>
      </div>
      <div class="c-board-ccard__end">
        <span class="c-cd-module__progress" role="img" aria-label="${d} de ${len} atividades concluídas"><span class="c-cd-module__track"><span class="${cx(d === len && 'is-done')}" style="width:${pct}%"></span></span><span class="c-cd-module__pct">${pct}%</span></span>
      </div>
    </div>
  </li>`;
}

/** Seta no caminho (Versão C), no meio entre dois pins da mesma fileira. */
// Antes de uma atividade bloqueada a seta vira o cadeado (ainda não dá para seguir por ali).
const chev = it => `<li class="${cx('c-board-chev', it.done && 'is-done', it.locked && 'is-locked')}" aria-hidden="true" style="left:${it.x}px;top:${it.y}px">${it.locked ? icon('lock', 10) : icon(`chevron-${it.dir}`, 14)}</li>`;

/** Largura da trilha B: a medida (state.bw) ou, antes da primeira medição, uma estimativa pela janela. */
function trailBWidth(state) {
  if (state.bw) return state.bw;
  const w = window.innerWidth;
  const side = minWidth(DESK) ? (looksFromHash().hud || looksFromHash().dock ? 0 : looksFromHash().float ? FLOAT_RAIL : state.panelHidden ? 0 : SIDE_W + 32) : 0;
  return Math.min(B_MAX, Math.max(280, w - (minWidth(TABLET) ? 48 : 16) - side));
}

function trailB(state, p, desk) {
  // Abaixo do desktop: a trilha vertical no visual da Versão E (trailV).
  if (!minWidth(DESK) && looksFromHash().trilha === 'c') return trailV(state, p);
  const bw = trailBWidth(state);
  // Abaixo do desktop (mobile e tablet) a trilha é uma coluna reta, com os pins um embaixo do outro.
  const { items, road, prog, height } = trailBLayout(p, bw, !minWidth(DESK), state.cardHs);
  const look = looksFromHash();
  // Barra integrada + Versão C: um trecho da estrada liga a barra do curso ao 1º cartão de módulo pela lateral direita (sai do
  // meio da lateral da barra, desce ao lado dela e entra no meio da lateral do cartão, com as curvas da estrada; com o curso iniciado, o
  // progresso roxo também). O desenho depende do vão e da altura do cartão, medidos depois de desenhar (linkHud).
  const link = desk && look.hud && look.trilha === 'c'
    ? `<svg class="c-board-road c-board-hudlink" aria-hidden="true">
        <path class="c-board-road__shadow" transform="translate(0 2)"/>
        <path class="c-board-road__way"/>
        ${p.started ? '<path class="c-board-road__progress"/>' : ''}
      </svg>`
    : '';
  return `<div class="c-board-btrail" style="width:${bw}px;height:${height}px">
      ${link}
      <svg class="c-board-road" width="${bw}" height="${height}" viewBox="0 0 ${bw} ${height}" aria-hidden="true">
        <path class="c-board-road__shadow" d="${road}" transform="translate(0 2)"/>
        <path class="c-board-road__way" d="${road}"/>
        <path class="c-board-road__progress" d="${prog}"/>
      </svg>
      <ol class="c-board-trail__list" aria-label="Atividades do curso">${items.map(it => (it.type === 'card' ? cardB(it, p, desk) : it.type === 'chev' ? chev(it) : node(it, p))).join('')}</ol>
    </div>
    ${jumpAndFinish(state, p)}`;
}


/* ---------- Trilha "Versão D" (tweak trilha=d): horizontal ----------
   Os pins da C (estrelas em arco em cima, número no selo) numa linha só, ligados por uma estrada reta com as setas de sentido
   (ou o cadeado) no meio de cada trecho; a trilha rola para o lado (a roda do mouse também anda para o lado). Entre um módulo e
   outro o espaço dobra. O cartão de cada módulo fica em cima dos pins dele, numa faixa da largura do módulo, e acompanha a
   rolagem preso à esquerda enquanto o módulo está na tela. A faixa ocupa a largura da página: o 1º pin começa no meio da tela
   e, rolando até o fim, o último pin também para no meio (o respiro antes do 1º e depois do último é meia tela). */
const isCD = () => ['c', 'd'].includes(looksFromHash().trilha);
/** Versões D e E: a trilha rola para o lado. */
const isHoriz = () => ['d', 'e'].includes(looksFromHash().trilha);

function trailDLayout(p, dw, cardHs) {
  const pinsB = looksFromHash().pins === 'b';
  const g = minWidth(TABLET) ? 140 : 112; // distância entre os pins
  const cardsH = Math.max(90, ...Object.values(cardHs ?? {})); // o cartão mais alto (título em 2 linhas)
  const nodeTop = cardsH + 40; // linha dos pins: estrelas e pin
  const pinY = pinsB ? 72 : 66;
  const roadY = nodeTop + pinY;
  // Cartão do módulo com a largura do da Versão C: a trilha C (até 832) menos a estrada e a curva de cada lado; no mobile a
  // C é vertical e o cartão ocupa a largura da área (aqui com 16 de cada lado, por ficar preso à esquerda).
  const bwC = Math.min(B_MAX, Math.max(280, dw - (minWidth(TABLET) ? 48 : 16)));
  const cardW = minWidth(TABLET) ? bwC - 2 * (Math.min(84, Math.round(bwC * 0.1)) + B_R) : dw - 32;
  const items = [];
  const firstX = Math.round(dw / 2);
  let x = firstX;
  let lastX = x;
  let curX = null;
  let prev = null; // centro do pin anterior
  let laneEnd = -Infinity; // fim da faixa (cartão) do módulo anterior
  modules.forEach((mo, mi) => {
    // Entre os módulos: o 1º pin do seguinte só começa depois do fim da faixa do anterior, com 80 de respiro e meio cartão
    // (a faixa dele começa meio cartão antes do 1º pin). Assim os cartões nunca se encostam e os módulos ficam bem separados.
    if (mi > 0) x = Math.max(x + g, laneEnd + 80 + cardW / 2);
    const start = x;
    mo.activities.forEach((_, j) => {
      const i = moduleStarts[mi] + j;
      let status = statusOf(i, p);
      const current = status === 'current' && !p.finished;
      if (status === 'locked' && !p.finished && activities[p.cur].mi === mi) status = 'open';
      if (prev !== null) items.push({ type: 'chev', x: Math.round((prev + x) / 2), y: roadY, dir: 'right', done: status === 'done' || current, locked: status === 'locked' || status === 'open' });
      items.push({ type: 'node', mi, i, status, current, top: roadY - (current ? 82 : pinY), height: (current ? ROW_CURRENT : pinsB ? ROW_B : ROW) + C_LABEL, x });
      if (current) curX = x;
      prev = x;
      lastX = x;
      x += g;
    });
    // Faixa do cartão: do 1º ao último pin do módulo (mais o raio do pin de cada lado).
    // Faixa do cartão: de meio cartão antes do 1º pin a meio cartão depois do último. O cartão gruda no meio da tela (sticky):
    // com o 1º pin no meio ele já está centralizado em cima dele, fica parado no meio enquanto os pins do módulo passam e só
    // sai quando o último pin passa do meio.
    items.push({ type: 'card', mi, top: 0, lane: true, x: Math.round(start - cardW / 2), w: Math.round(lastX - start + cardW), cw: cardW, sl: Math.round((dw - cardW) / 2) });
    laneEnd = lastX + cardW / 2;
  });
  const width = lastX + Math.round(dw / 2);
  items.forEach(it => { if (it.type === 'node') it.off = it.x - width / 2; });
  // Altura simétrica em volta da estrada (o dobro da distância até ela): com a trilha centralizada na faixa, a estrada fica no
  // meio da altura da tela e os cartões dos módulos descem junto, na mesma distância acima dos pins.
  const height = Math.max(roadY + 42 + 14 + 32, 2 * roadY);
  const road = `M${firstX} ${roadY} L${lastX} ${roadY}`;
  const end = p.finished ? lastX : curX;
  const prog = end !== null && end > firstX ? `M${firstX} ${roadY} L${end} ${roadY}` : '';
  return { items, road, prog, width, height };
}

function trailD(state, p, desk) {
  const dw = state.dw || document.documentElement.clientWidth;
  const { items, road, prog, width, height } = trailDLayout(p, dw, state.cardHs);
  return `<div class="c-board-dscroll" data-dscroll tabindex="-1">
      <div class="c-board-btrail c-board-dtrail" style="width:${width}px;height:${height}px">
        <svg class="c-board-road" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">
          <path class="c-board-road__shadow" d="${road}" transform="translate(0 2)"/>
          <path class="c-board-road__way" d="${road}"/>
          <path class="c-board-road__progress" d="${prog}"/>
        </svg>
        <ol class="c-board-trail__list" aria-label="Atividades do curso">${items.map(it => (it.type === 'card' ? cardB(it, p, desk) : it.type === 'chev' ? chev(it) : node(it, p))).join('')}</ol>
      </div>
    </div>
    ${jumpAndFinish(state, p)}`;
}

/** Versão D: a faixa ocupa a largura da página (sai do recuo da área) e a altura que sobra até a base da tela; a largura
    medida (state.dw) define o respiro de meia tela antes do 1º e depois do último pin. Com a coluna fixa ou o menu float, fica
    na largura da área da trilha. */
function fitTrailD(ctx) {
  const sc = ctx.root.querySelector('[data-dscroll]');
  const main = ctx.root.querySelector('.c-board__main');
  if (!sc || !main) return;
  const full = !minWidth(DESK) || looksFromHash().hud || looksFromHash().dock;
  const w = full ? document.documentElement.clientWidth : main.clientWidth;
  sc.style.width = `${w}px`;
  sc.style.marginLeft = full ? `${-Math.round(main.getBoundingClientRect().left)}px` : '0px';
  const top = sc.getBoundingClientRect().top + window.scrollY;
  const bottom = minWidth(DESK) ? 16 : 96; // navigation bar no mobile
  sc.style.height = `${Math.max(320, Math.round(window.innerHeight - top - bottom))}px`;
  if (w !== ctx.state.dw) ctx.set({ dw: w });
}

/** Versão D: leva o pin atual para o meio da tela (curso concluído: o fim da trilha; sem atividade atual: o começo). */
function scrollToCurrentD(ctx) {
  const sc = ctx.root.querySelector('[data-dscroll]');
  if (!sc) return;
  const pin = ctx.root.querySelector('[data-current] :is(.c-board-pin, .c-board-epin)');
  let left = 0;
  if (pin) {
    const r = pin.getBoundingClientRect();
    const s = sc.getBoundingClientRect();
    left = sc.scrollLeft + (r.left + r.width / 2) - (s.left + sc.clientWidth / 2);
  } else if (progress().finished) left = sc.scrollWidth;
  sc.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

/* ---------- Trilha "Versão E" (tweak trilha=e): faixa colorida em zigue-zague ----------
   Horizontal como a D, num desenho de "frentes". Cada módulo tem um cartão (imagem, selo "Módulo N", título, andamento e
   tempo, moedas e pontos), alternando em cima e embaixo. A faixa do módulo sai da lateral direita do cartão dele e entra na
   lateral esquerda do cartão seguinte (a do último termina sozinha), na cor do módulo (tokens --color-module-N; tweak "Cores
   dos módulos" = Cor da marca usa a primária). A estrada é a da Versão C (sombra de 13 e caminho branco de 9) com a linha fina
   do progresso no meio, na cor do módulo, só até o pin atual (sem setas nem cadeados na estrada). Entre os cartões ela sobe e desce em ângulos
   retos com curvas arredondadas: quantas vezes depende de quantas atividades o módulo tem (passo mínimo entre os pins). As
   atividades ficam por igual nesse trecho (as concluídas com as 3 estrelas em arco em cima, como na C), com os pins da Versão B (imagem da atividade no miolo, ou o ícone challenge ou
   target na avaliação e na missão, e o número embaixo; tweak "Imagens nos pins"), com o miolo e o aro na cor do módulo. O
   atual ganha um halo pulsando. O trecho percorrido fica na cor cheia; o
   resto, esmaecido. */
const E_SIZES = {
  desk: { minLeg: 1308, C: 300, cardH: 316, pin: 1, step: 168, E: 72, hs: 216, R: 32, H: 496, yT: 72, yB: 428, hi: 32, lo: 144, pad: 64 },
  mobile: { minLeg: 1032, C: 248, cardH: 265, pin: 0.76, step: 132, E: 56, hs: 168, R: 28, H: 436, yT: 64, yB: 380, hi: 24, lo: 136, pad: 24 },
};
const E_IN = 24; // a faixa começa e termina 24px por baixo do cartão (parece sair de dentro dele)

/** Caminho em ângulos retos com cantos arredondados (raio R): segmentos de reta e de quarto de círculo, com o comprimento de
    cada um, para achar um ponto pela distância percorrida e desenhar só um trecho. Pontos repetidos ou alinhados são tirados. */
function roundedSegs(raw, R) {
  const pts = raw.filter((q, k) => k === 0 || q[0] !== raw[k - 1][0] || q[1] !== raw[k - 1][1])
    .filter((q, k, arr) => k === 0 || k === arr.length - 1 || !((arr[k - 1][0] === q[0] && q[0] === arr[k + 1][0]) || (arr[k - 1][1] === q[1] && q[1] === arr[k + 1][1])));
  const segs = [];
  const dir = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
  let cur = pts[0];
  for (let k = 1; k < pts.length; k++) {
    const P = pts[k];
    const next = pts[k + 1];
    if (!next) { segs.push({ t: 'L', a: cur, b: P, len: Math.hypot(P[0] - cur[0], P[1] - cur[1]) }); break; }
    const din = dir(pts[k - 1], P);
    const dout = dir(P, next);
    const s0 = [P[0] - din[0] * R, P[1] - din[1] * R];
    const s1 = [P[0] + dout[0] * R, P[1] + dout[1] * R];
    segs.push({ t: 'L', a: cur, b: s0, len: Math.hypot(s0[0] - cur[0], s0[1] - cur[1]) });
    const sweep = din[0] * dout[1] - din[1] * dout[0] > 0 ? 1 : 0;
    segs.push({ t: 'A', a: s0, b: s1, c: [s0[0] + dout[0] * R, s0[1] + dout[1] * R], din, dout, R, sweep, len: (Math.PI * R) / 2 });
    cur = s1;
  }
  let acc = 0;
  segs.forEach(sg => { sg.s = acc; acc += sg.len; });
  return { segs, total: acc };
}

function pointOn(seg, d) {
  const t = seg.len ? Math.max(0, Math.min(1, d / seg.len)) : 0;
  if (seg.t === 'L') return [seg.a[0] + (seg.b[0] - seg.a[0]) * t, seg.a[1] + (seg.b[1] - seg.a[1]) * t];
  const f = (t * Math.PI) / 2;
  return [seg.c[0] + seg.R * (-seg.dout[0] * Math.cos(f) + seg.din[0] * Math.sin(f)), seg.c[1] + seg.R * (-seg.dout[1] * Math.cos(f) + seg.din[1] * Math.sin(f))];
}

const pointAt = (path, s) => {
  const seg = path.segs.find(sg => s <= sg.s + sg.len) ?? path.segs[path.segs.length - 1];
  return pointOn(seg, s - seg.s);
};

/** "d" do SVG só do trecho entre as distâncias s0 e s1 (cantos cortados viram arcos menores). */
function subPath(path, s0, s1) {
  if (s1 - s0 < 0.5) return '';
  const r = n => Math.round(n * 10) / 10;
  let d = '';
  path.segs.forEach(sg => {
    const a = Math.max(s0, sg.s);
    const b = Math.min(s1, sg.s + sg.len);
    if (b <= a) return;
    const p0 = pointOn(sg, a - sg.s);
    const p1 = pointOn(sg, b - sg.s);
    if (!d) d = `M${r(p0[0])} ${r(p0[1])}`;
    d += sg.t === 'L' ? ` L${r(p1[0])} ${r(p1[1])}` : ` A${sg.R} ${sg.R} 0 0 ${sg.sweep} ${r(p1[0])} ${r(p1[1])}`;
  });
  return d;
}

const modColor = mi => (looksFromHash().cores === 'marca' ? 'var(--color-surface-system-default)' : `var(--color-module-${(mi % 4) + 1})`);

/** Sorteio fixo por módulo (o mesmo a cada abertura): número entre 0 e 1. */
const eRand = (mi, salt) => { const v = Math.sin(mi * 12.9898 + salt * 78.233) * 43758.5453; return v - Math.floor(v); };

/** Por onde a faixa sai do cartão do módulo e entra no seguinte, sorteado por módulo (fixo). Entrada: pela esquerda ou pelo
    lado que dá para a pista livre (por cima no cartão de baixo, por baixo no de cima). Saída: pela direita ou pelo lado da
    pista livre, mas nunca pelo mesmo lado da entrada (se entrou por cima ou por baixo, sai pela direita). `fx`/`fn`: onde,
    na largura do cartão, a faixa sai ou entra por cima ou por baixo. */
const eEntry = k => (k === 0 ? null : eRand(k - 1, 13) < 0.5 ? 'left' : k % 2 === 0 ? 'bottom' : 'top');

function eSides(mi) {
  const high = mi % 2 === 0;
  const inSide = eEntry(mi);
  const exit = inSide && inSide !== 'left' ? 'right' : eRand(mi, 1) < 0.5 ? 'right' : high ? 'bottom' : 'top';
  // Pelo topo ou pela base, a faixa entra e sai sempre no centro da borda do cartão (fx/fn = meio da largura); pelas laterais,
  // no meio da altura (eLegPoints).
  return { exit, entry: eEntry(mi + 1), fx: 0.5, fn: 0.5 };
}

/** Pontos do trecho de um módulo: sai do cartão (rect `a`) pelo lado sorteado, dá `teeth` voltas entre as pistas de cima e de
    baixo e entra no cartão seguinte (só a altura `b`; o x sai daqui) pelo lado sorteado. Devolve os pontos e o x do
    cartão seguinte. No último módulo a faixa só termina, depois das voltas. */
function eLegPoints(z, a, by, sides, teeth, last, bh = z.cardH) {
  const ah = a.h ?? z.cardH; // alturas do cartão de saída (a) e do de entrada (bh): o cartão abraça o título, que varia
  const other = y => (y === z.yT ? z.yB : y === z.yT ? z.yB : y === z.yB ? z.yT : y < z.H / 2 ? z.yB : z.yT);
  const pts = [];
  let x;
  let y;
  if (sides.exit === 'right') {
    y = a.y + ah / 2;
    x = a.x + z.C + z.E;
    pts.push([a.x + z.C - E_IN, y], [x, y]);
  } else {
    const ex = Math.round(a.x + z.C * sides.fx);
    const top = sides.exit === 'top';
    y = top ? z.yT : z.yB;
    x = a.x + z.C + z.E;
    pts.push([ex, top ? a.y + E_IN : a.y + ah - E_IN], [ex, y], [x, y]);
  }
  for (let j = 0; j < teeth; j++) {
    y = other(y);
    pts.push([x, y]);
    x += z.hs;
    pts.push([x, y]);
  }
  if (last) {
    pts.push([x + z.E, y]);
    return { pts, next: x + z.E };
  }
  const next = x + z.E; // x do cartão seguinte
  if (sides.entry === 'left') {
    pts.push([x, by], [next + E_IN, by]);
  } else {
    const top = sides.entry === 'top';
    const lane = top ? z.yT : z.yB;
    const en = Math.round(next + z.C * sides.fn);
    pts.push([x, lane], [en, lane], [en, top ? by - bh / 2 + E_IN : by + bh / 2 - E_IN]);
  }
  return { pts, next };
}

/** Vagas de pins por trecho reto do caminho (26/11/2026; desktop e tablet). Cada segmento reto (sem as curvas) recebe um número
    de pins pela direção: `vCap` nos verticais e `hCap` nos horizontais; o primeiro trecho que comporta um pin (logo depois do
    cartão) e o último (antes do cartão seguinte ou da chegada) recebem 1. Os pins ficam a `margin` das curvas (não as cobrem) e
    a `cardGap` do cartão nas pontas do caminho; um trecho curto demais recebe menos (no mínimo `minGap` entre pins). Devolve as
    vagas (posições ao longo do caminho) e a capacidade total. `n` corta o excesso, tirando pins dos trechos do meio a partir
    do fim (dos que têm mais). */
function pathSlots(path, { vCap, hCap, margin = 48, cardGap = E_IN + 80, endGap = cardGap, minGap = 140, n = Infinity, edgeFree = false, thirds = false }) {
  // edgeFree: os trechos que saem do cartão e entram no seguinte (pontas do caminho) ficam sem pins, e os demais seguem a
  // regra da direção (tablet). thirds: trecho horizontal com 2 pins fica dividido em 3 partes iguais (pins a 1/3 e 2/3 dele).
  const segs = path.segs.map((sg, k) => ({ sg, k })).filter(({ sg }) => sg.t === 'L' && sg.len > 1);
  const lastK = path.segs.length - 1;
  const rows = segs.map(({ sg, k }) => {
    const from = sg.s + (k === 0 ? cardGap : margin);
    const to = sg.s + sg.len - (k === lastK ? endGap : margin);
    const vertical = Math.abs(sg.a[0] - sg.b[0]) < 0.5;
    const room = to - from;
    const edge = k === 0 || k === lastK;
    const fit = room < 0 || (edgeFree && edge) ? 0 : 1 + Math.floor(room / minGap);
    return { from, to, fit, vertical, a: sg.s, b: sg.s + sg.len, cap: Math.min(vertical ? vCap : hCap, fit) };
  });
  const usable = rows.filter(r => r.fit > 0);
  if (usable.length && !edgeFree) { usable[0].cap = 1; usable[usable.length - 1].cap = 1; }
  let total = rows.reduce((s, r) => s + r.cap, 0);
  const middle = edgeFree ? usable : usable.slice(1, -1);
  // Sobrou vaga: tira 1 pin de cada trecho do meio, do fim para o começo, até fechar (as primeiras fileiras ficam completas).
  while (total > n && middle.some(r => r.cap > 0)) {
    for (const r of [...middle].reverse()) {
      if (total <= n) break;
      if (r.cap > 0) { r.cap--; total--; }
    }
  }
  const slots = [];
  rows.forEach(r => {
    for (let j = 0; j < r.cap; j++) {
      if (thirds && !r.vertical && r.cap === 2) slots.push(r.a + ((j + 1) * (r.b - r.a)) / 3);
      else slots.push(r.cap === 1 ? (r.from + r.to) / 2 : r.from + (j * (r.to - r.from)) / (r.cap - 1));
    }
  });
  return { slots, total };
}

const manhattan = pts =>pts.reduce((sum, q, k) => (k ? sum + Math.abs(q[0] - pts[k - 1][0]) + Math.abs(q[1] - pts[k - 1][1]) : 0), 0);

function trailELayout(p, cardHs, dw = document.documentElement.clientWidth) {
  const z = minWidth(TABLET) ? E_SIZES.desk : E_SIZES.mobile;
  // Altura de cada cartão: a medida (measureCardsE; o título aparece inteiro, então varia) ou a de E_SIZES até medir.
  const ch = mi => cardHs?.[mi] ?? z.cardH;
  const cardY = mi => (mi % 2 === 0 ? z.hi : z.lo);
  const cy = mi => cardY(mi) + ch(mi) / 2;
  const items = [];
  const legs = [];
  let curS = null;
  let curLeg = -1;
  let x = z.pad;
  let end = x;
  modules.forEach((mo, mi) => {
    const rect = { x, y: cardY(mi), h: ch(mi) };
    items.push({ type: 'card', mi, x, y: rect.y, w: z.C });
    const last = mi === modules.length - 1;
    const sides = eSides(mi);
    const by = last ? 0 : cy(mi + 1);
    const n = mo.activities.length;
    // Voltas suficientes para os pins caberem no passo mínimo (com folga para o pin não encostar no cartão em cada ponta).
    const need = n * z.step + 2 * (E_IN + 56);
    let teeth = 0;
    const bh = last ? z.cardH : ch(mi + 1);
    let leg = eLegPoints(z, rect, by, sides, teeth, last, bh);
    // Do cartão de um módulo ao do seguinte (no último, até a chegada) há no mínimo z.minLeg (a distância do Módulo 1, o mais
    // longo): a trilha de cada módulo ocupa pelo menos uma tela, e o fundo dele aparece inteiro antes do seguinte começar a
    // entrar (revealBackgrounds).
    // Desktop: voltas até caber os pins nas vagas por trecho (verticais 2, horizontais 1, pontas 1; pathSlots). Mobile: o
    // comprimento mínimo de antes (nada muda).
    const deskSlots = z === E_SIZES.desk;
    const slotsOf = lg => pathSlots(roundedSegs(lg.pts, z.R), { vCap: 2, hCap: 1, n, endGap: last ? 40 : E_IN + 80 });
    if (deskSlots) {
      // Sem o comprimento mínimo do trecho (z.minLeg) desde 26/11/2026: só as voltas necessárias para os pins.
      while (slotsOf(leg).total < n && teeth < 40) leg = eLegPoints(z, rect, by, sides, ++teeth, last, bh);
    } else {
      while ((manhattan(leg.pts) < need || leg.next - x < z.minLeg) && teeth < 30) leg = eLegPoints(z, rect, by, sides, ++teeth, last, bh);
    }
    const path = roundedSegs(leg.pts, z.R);
    const slots = deskSlots ? slotsOf(leg).slots : null;
    const a = E_IN + 56;
    const b = path.total - (last ? 32 : E_IN + 56);
    // Espaçamento padronizado (26/11/2026): pins sempre a z.step um do outro, medidos ao longo do caminho da trilha; o grupo
    // fica centrado no trecho, com a mesma folga até o cartão de cada ponta (antes o passo era (b - a) / n e variava por módulo).
    const s0 = a + Math.max(0, (b - a - (n - 1) * z.step) / 2);
    mo.activities.forEach((_, j) => {
      const i = moduleStarts[mi] + j;
      let status = statusOf(i, p);
      const current = status === 'current' && !p.finished;
      if (status === 'locked' && !p.finished && activities[p.cur].mi === mi) status = 'open';
      const s = slots ? slots[j] ?? slots[slots.length - 1] : s0 + j * z.step;
      const [nx, ny] = pointAt(path, s);
      if (current) { curS = s; curLeg = mi; }
      items.push({ type: 'node', mi, i, status, current, x: Math.round(nx), y: Math.round(ny) });
    });
    legs.push({ mi, path });
    // Fim da faixa do último módulo: a chegada (bandeira), na ponta.
    if (last) { const e = leg.pts[leg.pts.length - 1]; items.push({ type: 'end', mi, x: e[0], y: e[1] }); end = e[0]; }
    x = leg.next;
  });
  // Depois da chegada sobra meia faixa: no fim da rolagem a bandeira fica no meio da tela.
  const width = Math.max(end + z.pad + 40, Math.round(end + dw / 2));
  // Percorrido: os trechos antes do módulo atual inteiros, o atual até o pin atual e os seguintes nada.
  // Trilha liberada: nada feito, então nada preenchido.
  legs.forEach(l => { l.reached = p.free ? 0 : p.finished || l.mi < curLeg ? l.path.total : l.mi === curLeg ? curS : 0; });
  items.forEach(it => { if (it.type === 'node') it.off = it.x > width - 320 ? 1 : -1; });
  // Altura da faixa: a de E_SIZES ou mais, se um cartão de baixo crescer além dela (título longo).
  const height = Math.max(z.H, ...modules.map((_, mi) => cardY(mi) + ch(mi) + 32));
  return { z, items, legs, width, height };
}

function nodeE(it, p) {
  const a = activities[it.i];
  const done = it.status === 'done';
  const locked = it.status === 'locked' || it.status === 'open';
  const key = `pin-${it.i}`;
  const aria = `${it.i + 1}. ${kinds[a.kind].label}: ${a.title}, ${done ? 'concluída' : it.current || it.status === 'free' ? 'disponível' : 'bloqueada'}`;
  const tipHtml = minWidth(DESK) ? pinTip(it, `tip-${key}`) : '';
  const state = it.current ? 'current' : it.status;
  // Bloqueada com imagem: a imagem fica colorida com desfoque e um cadeado por cima (claro ou escuro conforme a imagem:
  // toneLockedPins mede depois de carregar).
  const hasImg = looksFromHash().pinImg && !['avaliacao', 'prova', 'missao'].includes(a.kind);
  // Pin da Versão B (disco branco com o miolo: imagem, ou o ícone challenge/target, e o número embaixo). No pin atual, o balão
  // flutuante "Continuar"/"Começar" em cima (c-board-start, o mesmo das outras versões; 25/11/2026), que abre a atividade direto.
  return `<li class="${cx('c-board-enode', `is-${locked ? 'locked' : state}`)}" ${it.current ? 'data-current' : ''} style="left:${it.x}px;top:${it.y}px;--mod:${modColor(it.mi)}">
    <button type="button" class="${cx('c-board-pin c-board-pin--b c-board-epin', `c-board-pin--${state}`)}" aria-label="${esc(aria)}" ${tipHtml ? `aria-describedby="tip-${key}" ` : ''}${locked ? 'aria-disabled="true"' : ''}
      data-action="openNode" data-index="${it.i}" data-key="${key}">${pinFaceB(it, looksFromHash().pinImg)}</button>
    ${locked && hasImg ? `<span class="c-board-enode__lock" aria-hidden="true">${icon('lock', 22)}</span>` : ''}
    ${done ? `<span class="c-board-enode__stars">${stars(starsPattern[it.i % starsPattern.length], `${starsPattern[it.i % starsPattern.length]} de 3 estrelas`)}</span>` : ''}
    ${it.current ? `<button type="button" class="c-board-start c-board-enode__start" data-action="openNode" data-direct="1" data-index="${it.i}" data-key="start-${it.i}" tabindex="-1" aria-hidden="true">${p.started ? 'Continuar' : 'Começar'}</button>` : ''}
    ${tipHtml}
  </li>`;
}

function cardE(it, p) {
  const m = modules[it.mi];
  const len = m.activities.length;
  const d = p.modDone(it.mi);
  const pct = Math.round((d / len) * 100);
  const mins = m.activities.reduce((sum, a) => sum + a[2], 0);
  // Imagem limpa (16:9, recuada 8 como no card de curso mobile); no corpo, a etiqueta "Módulo N" na cor do módulo, o título,
  // "N atividades · tempo" e a barra de progresso com o %, as mesmas do card de módulo da página de Curso.
  return `<li class="${cx('c-board-ecard', it.mi % 2 === 0 ? 'is-high' : 'is-low', d === len && 'is-done')}" id="board-mod-${it.mi}" data-module="${it.mi}" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;--mod:${modColor(it.mi)}">
    <div class="c-board-ecard__top">
      <img class="c-board-ecard__img" src="${esc(moduleBg(it.mi))}" alt="" loading="lazy" />
    </div>
    <div class="c-board-ecard__body">
      <span class="c-board-ecard__tag">Módulo ${it.mi + 1}</span>
      <h3 class="c-board-ecard__title" title="${esc(m.title)}">${esc(m.title)}</h3>
      <span class="c-cd-module__meta">${[`${len} atividades`, fmtMinutes(mins)].map(t => `<span>${esc(t)}</span>`).join('<span class="c-cd-bullet" aria-hidden="true"></span>')}</span>
      <span class="c-cd-module__progress c-board-ecard__progress" role="img" aria-label="${d} de ${len} atividades concluídas"><span class="c-cd-module__track"><span class="${cx(d === len && 'is-done')}" style="width:${pct}%"></span></span><span class="c-cd-module__pct">${pct}%</span></span>
    </div>
  </li>`;
}

function trailE(state, p, desk) {
  const { z, items, legs, width, height } = trailELayout(p, state.eCardHs, state.dw || document.documentElement.clientWidth);
  // Cada trecho: a estrada da Versão C (sombra de 13 e caminho branco de 9) e, no meio dela, a linha fina do progresso na cor
  // do módulo, só até o pin atual (entre as atividades já feitas). Os cartões ficam por cima da faixa, então as pontas que
  // entram neles somem por baixo.
  const roads = legs.map(l => {
    const d = subPath(l.path, 0, l.path.total);
    return `<g style="--mod:${modColor(l.mi)}">
      <path class="c-board-road__shadow" d="${d}" transform="translate(0 2)"/>
      <path class="c-board-road__way" d="${d}"/>
      <path class="c-board-road__progress" d="${subPath(l.path, 0, l.reached)}"/>
    </g>`;
  }).join('');
  return `<div class="c-board-dscroll" data-dscroll tabindex="-1">
      <div class="c-board-btrail c-board-dtrail c-board-etrail" style="width:${width}px;height:${height}px;--e-pin:${z.pin};--e-card-h:${z.cardH}px">
        <svg class="c-board-road c-board-eroad" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">${roads}</svg>
        <ol class="c-board-trail__list" aria-label="Atividades do curso">${items.map(it => (it.type === 'card' ? cardE(it, p) : it.type === 'end' ? endE(it, p) : nodeE(it, p))).join('')}</ol>
      </div>
    </div>
    ${jumpAndFinish(state, p)}`;
}

/** Versão E: mede a luminosidade média de cada imagem de pin bloqueado (numa tela de 12×12) e marca o pin com
    data-tone="light" ou "dark", para o cadeado por cima ficar escuro na imagem clara e claro na escura. O resultado fica
    guardado por endereço da imagem. */
const imgTone = new Map();
function toneLockedPins(ctx) {
  ctx.root.querySelectorAll('.c-board-enode.is-locked .c-board-pin__img').forEach(img => {
    const li = img.closest('.c-board-enode');
    const apply = () => {
      let tone = imgTone.get(img.src);
      if (!tone) {
        try {
          const c = document.createElement('canvas');
          c.width = 12;
          c.height = 12;
          const g = c.getContext('2d', { willReadFrequently: true });
          g.drawImage(img, 0, 0, 12, 12);
          const d = g.getImageData(0, 0, 12, 12).data;
          let sum = 0;
          for (let k = 0; k < d.length; k += 4) sum += 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2];
          tone = sum / (d.length / 4) / 255 > 0.55 ? 'light' : 'dark';
        } catch { tone = 'dark'; }
        imgTone.set(img.src, tone);
      }
      li.dataset.tone = tone;
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
  });
}

/** Chegada no fim da faixa: disco com a bandeira, na cor do último módulo quando o curso termina; antes, cinza. */
const endE = (it, p) => `<li class="${cx('c-board-eend', p.finished && 'is-done')}" aria-hidden="true" style="left:${it.x}px;top:${it.y}px;--mod:${modColor(it.mi)}">${icon('flag', 20)}</li>`;

function jumpAndFinish(state, p) {
  return `${p.finished ? `<div class="c-board-finished" role="status"><span class="c-board-finished__text">${icon('check-circle', 20)}Curso concluído! Seu certificado já está na área de Certificados.</span><a class="c-button c-button--primary c-board-finished__cta" href="#certificados"><span>Ver certificados</span>${icon('arrow-right', 16)}</a></div>` : ''}
    <button type="button" class="${cx('c-button-icon c-button-icon--large c-button-icon--outlined c-board-jump', !state.curVis && 'is-visible', state.curUp && 'is-up')}" data-action="jumpCurrent"
      aria-label="Ir para a atividade atual" title="Ir para a atividade atual" ${state.curVis ? 'aria-hidden="true" tabindex="-1"' : ''}>${icon(isHoriz() ? 'arrow-right' : 'arrow-down', 16)}</button>`;
}

/** Pontilhado da Versão A: pontos entre cada par de pins seguidos do mesmo módulo, sobre a mesma senoide dos pins. São 3 no
    vão entre a base de um pin e as estrelas (ou o "Continuar") do seguinte; quando o seguinte não tem nada em cima (ainda
    não iniciado), o pontilhado vai até perto dele, com mais pontos no mesmo passo. Até o pin atual os pontos ficam na cor da marca (caminho feito);
    depois, num lilás claro. As coordenadas x são em relação ao meio da trilha, como o --off dos pins. */
function trailDots(items) {
  const nodes = items.filter(it => it.type === 'node');
  let html = '';
  nodes.forEach((a, k) => {
    const b = nodes[k + 1];
    if (!b || b.mi !== a.mi) return;
    const pinsB = looksFromHash().pins === 'b';
    const y0 = a.top + a.height - 2; // base do pin (e do anel, no atual)
    // Fim: o topo da linha seguinte quando ela tem algo em cima do pin (estrelas da concluída ou o "Continuar" do atual);
    // senão o espaço das estrelas está vazio e o pontilhado segue até perto do pin.
    const topped = b.current; // as estrelas agora ficam ao lado do pin: só o "Continuar" ocupa o espaço de cima
    const y1 = topped ? b.top + 2 : b.top + (pinsB ? 26 : 30);
    const reached = b.status === 'done' || b.current;
    // Mesmo passo entre os pontos (o dos 3 pontos no vão de 40): no vão maior entram mais pontos.
    const count = Math.max(3, Math.round((y1 - y0) / 10.5) - 1);
    // Centro dos discos: a posição do pin na curva; cada ponto pega o x da senoide na altura dele.
    const cy = it => it.top + (it.current ? 82 : pinsB ? 72 : 66);
    const ya = cy(a);
    const yb = cy(b);
    const dots = Array.from({ length: count }, (_, n) => {
      const y = y0 + ((y1 - y0) * (n + 1)) / (count + 1);
      const x = waveAt(a.wk + (y - ya) / (yb - ya));
      return `<span class="c-board-dots__dot" style="left:calc(${Math.round(x)}px * var(--wave-scale, 1));top:${Math.round(y)}px"></span>`;
    }).join('');
    html += `<li class="${cx('c-board-dots', reached && 'is-reached')}" aria-hidden="true">${dots}</li>`;
  });
  return html;
}

function trail(state, p, desk) {
  if (looksFromHash().trilha === 'd') return trailD(state, p, desk);
  if (looksFromHash().trilha === 'e') return trailE(state, p, desk);
  if (looksFromHash().trilha !== 'a') return trailB(state, p, desk);
  const { items, height } = trailItems(p, desk);
  return `${band(state, p, desk)}
    <div class="c-board-trail" style="height:${height}px">
      <ol class="c-board-trail__list" aria-label="Atividades do curso">${trailDots(items)}${items.map(it => (it.type === 'divider' ? divider(it) : it.type === 'marker' ? `<li class="c-board-marker" id="board-mod-0" data-module="0" aria-hidden="true"></li>` : node(it, p))).join('')}</ol>
    </div>
    ${jumpAndFinish(state, p)}`;
}

/* ---------- Coluna do curso (desktop) e abas do mobile: mesmos blocos da tela Curso ---------- */
// "Continuar" abre a atividade atual; o tweak "Certificado" escolhe o estado do card do certificado (curso concluído).
const info = p => courseInfoData(p.done, { ctaHref: activityHref(p.cur), certificado: hashParams().get('certificado') === 'andamento' ? 'andamento' : 'recebido' });

const panelTabs = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'descricao', label: 'Descrição' },
  { id: 'materiais', label: 'Materiais de apoio', count: materials.length },
];

const SIDE_W = 364; // coluna do curso (Figma "Curso Ludica - Versao 12/11": fixa à direita, altura toda)

/* ---------- Menu lateral "float" (tweak painel=float) ----------
   Uma coluna de ícones presa à direita (Visão geral, Descrição, Materiais); cada um abre o conteúdo num cartão flutuante ao
   lado dos ícones, por cima da trilha, e o ícone ativo vira o "x" que fecha. Fechado, só os ícones ficam e a trilha usa a
   largura toda (menos a coluna de ícones). */
const FLOAT_RAIL = 56; // coluna de ícones (32) + 12 da borda + 12 de folga
const FLOAT_ICONS = { visao: ['info', 'Visão geral'], descricao: ['edit-2', 'Descrição'], materiais: ['file-text', 'Materiais de apoio'] };

function floatPanel(state, p) {
  const d = info(p);
  const open = !state.panelHidden;
  const body = state.panelTab === 'descricao'
    ? description(d, false)
    : state.panelTab === 'materiais' ? materialsSection(d) : `${summary(d, { certificate: true })}${sideAbout(d)}`;
  return `<nav class="c-board-rail" aria-label="Painel do curso">${panelTabs.map(t => {
      const active = open && state.panelTab === t.id;
      const [ic, label] = FLOAT_ICONS[t.id];
      return `<button type="button" class="${cx('c-board-rail__btn', active && 'is-active')}" data-action="floatTab" data-id="${t.id}" aria-expanded="${active}" aria-controls="board-float" aria-label="${active ? `Fechar ${label}` : label}" title="${active ? 'Fechar' : label}">${icon(active ? 'x' : ic, 16)}</button>`;
    }).join('')}</nav>
    ${open ? `<aside class="${cx('c-board-float', state.fresh && 'is-entering')}" id="board-float" aria-label="${esc(FLOAT_ICONS[state.panelTab][1])}">${body}</aside>` : ''}`;
}

/* ---------- Barra integrada (tweak painel=barra) ----------
   Sem coluna: as informações do curso viram uma barra discreta em cima da trilha, presa abaixo da app bar enquanto rola —
   Voltar, nome do curso com "N módulos · tempo · andamento (barra e %)" embaixo, pontos e moedas, Sobre o curso e Materiais. "Sobre o curso" e
   "Materiais" abrem num navdrawer só quando pedidos. A trilha usa a largura toda. */
function hudBar(state, p) {
  const d = info(p);
  // Sem a pílula de pontos e moedas (eles ficam em "Sobre o curso"). A barra rola com a página.
  return `<div class="c-board-hudwrap"><header class="c-board-hud" aria-label="Curso">
    <a class="c-board-hud__back" href="#cursos" aria-label="Voltar para Cursos" title="Voltar">${icon('arrow-left', 18)}</a>
    <div class="c-board-hud__course">
      <span class="c-board-hud__title">${esc(course.title)}</span>
      <span class="c-board-hud__meta">
        <span>${d.modules.length} módulos</span><span class="c-cd-bullet" aria-hidden="true"></span>
        <span>${esc(fmtMinutes(d.totalMin))}</span><span class="c-cd-bullet" aria-hidden="true"></span>
        <span class="c-board-hud__progress" role="img" aria-label="${d.pct}% do curso: ${d.done} de ${d.total} atividades concluídas">
          <span class="c-cd-module__track"><span class="${cx(d.finished && 'is-done')}" style="width:${d.pct}%"></span></span>
          <span>${d.pct}%</span>
        </span>
      </span>
    </div>
    <div class="c-board-hud__actions">
      <button type="button" class="c-board-hud__btn" data-action="openHud" data-id="sobre" aria-haspopup="dialog">${icon('info', 16)}<span>Sobre o curso</span></button>
      <button type="button" class="c-board-hud__btn" data-action="openHud" data-id="materiais" aria-haspopup="dialog">${icon('file-text', 16)}<span>Materiais de apoio</span><span class="c-button-badge__count">${materials.length}</span></button>
    </div>
  </header></div>`;
}

/** Navdrawer da barra integrada: "Sobre o curso" (card do curso, números e recursos, descrição e categorias) ou "Materiais
    de apoio". */
function hudDrawer(state, p) {
  const d = info(p);
  const sobre = state.hud === 'sobre';
  return panel({
    mode: 'drawer',
    label: sobre ? 'Sobre o curso' : 'Materiais de apoio',
    title: `${icon(sobre ? 'info' : 'file-text', 20)}${sobre ? 'Sobre o curso' : 'Materiais de apoio'}`,
    // "Sobre o curso" (Figma 5149:53581): card do curso (capa, informações, botão e recompensas), Sobre o curso, Descrição e
    // Categorias, nessa ordem, nos cards de raio 16 da coluna lateral.
    body: `<div class="c-board-hud-drawer">${sobre ? `${summary(d, { certificate: true })}${sideAboutCourse(d)}${description(d, false)}${sideCategories()}` : materialsSection(d)}</div>`,
    closeAction: 'closeHud',
    enter: state.fresh,
  });
}

/* ---------- Dock recolhível (tweak painel=dock) ----------
   Uma 4ª forma de mostrar o curso, para comparar com as outras três (que não mudam). Segue boas práticas de painel de apoio:
   - Revelação progressiva: um cartão compacto (296) preso no canto inferior esquerdo com só o essencial — o curso, o
     andamento (anel com o %) e pontos e moedas — e o resto ("Sobre o curso" e "Materiais") sob demanda,
     nos mesmos cards soltos da barra integrada.
   - Não disputa espaço com a trilha: fica no canto, fora da faixa central, e recolhe numa pílula (anel + nome) com um clique;
     a trilha usa a largura toda.
   - Acessível: região com nome, botão de recolher com aria-expanded, foco visível e alvos de 36 ou mais. */
/** Dock, ao carregar a tela: o cartão de informação começa recolhido (pílula), abre sozinho depois de DOCK_AUTO_OPEN ms (com a
    animação de abrir), fica aberto DOCK_AUTO_CLOSE ms e recolhe (com a animação de recolher). Um scroll/swipe da pessoa na
    trilha recolhe na hora e, antes da abertura, cancela a sequência. Pelo tempo, o fechamento espera o foco e o ponteiro
    saírem do cartão; a rolagem automática da tela (centralizar a atividade atual) não conta. */
const DOCK_AUTO_OPEN = 1200;
const DOCK_AUTO_CLOSE = 3000;

function autoCloseDock(ctx, fromTimer = false) {
  clearTimeout(ctx.dockTimer);
  if (ctx.destroyed || ctx.state.dockClosed || !looksFromHash().dock) return;
  const dock = ctx.root.querySelector('.c-board-dock--tabs');
  if (!dock) return;
  // Pelo tempo, não recolhe com o foco ou o ponteiro no cartão: tenta de novo quando a pessoa sair dele. O scroll/swipe na
  // trilha recolhe sempre.
  if (fromTimer && (dock.contains(document.activeElement) || dock.matches(':hover'))) {
    ctx.dockTimer = setTimeout(() => autoCloseDock(ctx, true), 1000);
    return;
  }
  ctx.actions.toggleDock(ctx, { auto: true });
}

function dockPanel(state, p) {
  const d = info(p);
  const open = !state.dockClosed;
  const r = 18;
  const circ = 2 * Math.PI * r;
  // Curso concluído: o anel fica verde e, no lugar de "100%", um check.
  const ring = `<span class="c-board-dock__ring" role="img" aria-label="${d.finished ? 'Curso concluído' : `${d.pct}% do curso concluído`}">
      <svg viewBox="0 0 44 44" aria-hidden="true"><circle class="c-board-dock__ring-track" cx="22" cy="22" r="${r}"/><circle class="${cx('c-board-dock__ring-fill', d.finished && 'is-done')}" cx="22" cy="22" r="${r}" stroke-dasharray="${((circ * d.pct) / 100).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 22 22)"/></svg>
      ${d.finished ? icon('check', 18, 'c-board-dock__ring-check') : `<b>${d.pct}%</b>`}
    </span>`;
  if (!open) {
    // Recolhido: a pílula com o anel de progresso e o nome do curso (numa linha, com reticências) e, na borda de baixo dela, o
    // mesmo botão circular do dock aberto com a seta para baixo (expandir). O botão repete a ação da pílula, então fica fora do
    // teclado e dos leitores de tela; a pílula é o controle acessível.
    return `<aside class="${cx('c-board-dock c-board-dock--closed', state.fresh && 'is-entering')}" aria-label="Curso">
      <button type="button" class="c-board-dock__pill" data-action="toggleDock" aria-expanded="false" aria-controls="board-dock" aria-label="Mostrar o curso ${esc(course.title)} (${d.pct}% concluído)" title="Mostrar o curso">
        ${ring}<span class="c-board-dock__pill-title">${esc(course.title)}</span>
      </button>
      <button type="button" class="c-board-dock__toggle" data-action="toggleDock" tabindex="-1" aria-hidden="true" title="Expandir">${icon('chevron-down', 14)}</button>
    </aside>`;
  }
  // Aberto: a capa do curso em cima, o título inteiro (sem reticências), "N módulos · tempo" e o progresso do card do curso
  // ("Progresso 24%", a barra e "x de N atividades concluídas"); embaixo, as abas "Sobre o curso" e "Materiais" (as abas do
  // design system, como as da coluna fixa) com o conteúdo dentro do próprio dock, rolando por dentro. Em "Sobre o curso" o card
  // do curso perde a capa, o progresso, o botão e a moldura (as informações usam a largura toda). O botão de recolher fica fora
  // do cartão, à direita do topo.
  const tab = state.dockTab === 'materiais' ? 'materiais' : 'sobre';
  const tabs = [['sobre', 'Sobre', 0], ['materiais', 'Materiais de apoio', materials.length]];
  const body = tab === 'sobre'
    ? `${summary(d, { cover: false, progress: false, cta: false, rewards: false })}${sideAboutCourse(d, { title: false })}${description(d, false)}${sideCategories()}`
    : materialsSection(d);
  return `<aside class="${cx('c-board-dock c-board-dock--tabs', state.fresh && 'is-entering')}" id="board-dock" aria-label="Curso">
    <button type="button" class="c-board-dock__toggle" data-action="toggleDock" aria-expanded="true" aria-controls="board-dock" aria-label="Recolher" title="Recolher">${icon('chevron-up', 14)}</button>
    <div class="c-board-dock__card">
      <div class="c-board-dock__course">
        <img class="c-board-dock__cover" style="--i:0" src="${esc(course.cover)}" alt="" />
        <span class="c-board-dock__title" style="--i:1">${esc(course.title)}</span>
        <span class="c-board-dock__meta" style="--i:2">${d.modules.length} módulos<span class="c-cd-bullet" aria-hidden="true"></span>${esc(fmtMinutes(d.totalMin))}</span>
        ${courseProgress(d, 'c-board-dock__progress').replace('<div ', '<div style="--i:3" ')}
        <div class="c-cd-side__rewards c-board-dock__boxes" style="--i:4">${rewardBoxes(d)}</div>
        ${d.finished ? `${certificateCard(d, { inline: true }).replace('<section ', '<section style="--i:4" ')}<hr class="c-board-dock__rule" style="--i:4" />` : ''}
      </div>
      <nav class="c-cd-tabs c-board-dock__tabs" style="--i:5" aria-label="Informações do curso"><div class="c-cd-tabs__row" role="tablist">${tabs.map(([id, label, count]) =>
        `<button type="button" role="tab" id="dock-tab-${id}" class="${cx('c-button-badge c-board-dock__tab', tab === id && 'is-active')}" data-action="setDockTab" data-id="${id}" aria-selected="${tab === id}" aria-controls="dock-panel" tabindex="${tab === id ? 0 : -1}"><span>${label}</span>${count ? `<span class="c-button-badge__count">${count}</span>` : ''}</button>`).join('')}</div></nav>
      <div class="c-board-dock__content c-board-hud-drawer" style="--i:6" id="dock-panel" role="tabpanel" aria-labelledby="dock-tab-${tab}" tabindex="0">${body}</div>
    </div>
  </aside>`;
}

function deskPanel(state, p) {
  if (looksFromHash().hud) return '';
  if (looksFromHash().dock) return dockPanel(state, p);
  if (looksFromHash().float) return floatPanel(state, p);
  const d = info(p);
  const body = state.panelTab === 'descricao'
    ? description(d, false)
    : state.panelTab === 'materiais' ? materialsSection(d) : `${summary(d, { certificate: true })}${sideAbout(d)}`;
  // O botão de ocultar fica fora da coluna (ela rola por dentro e cortaria o botão), colado à esquerda dela.
  return `<button type="button" class="c-button-icon c-button-icon--large c-button-icon--outlined c-board-side__toggle" data-action="hidePanel" aria-label="Ocultar painel" title="Ocultar painel" ${state.panelHidden ? 'inert' : ''}>${icon('chevron-right', 16)}</button>
  <aside class="c-board-side" aria-label="Painel do curso" ${state.panelHidden ? 'inert' : ''}>
    <nav class="c-cd-tabs c-board-side__tabs" aria-label="Informações do curso"><div class="c-cd-tabs__row" role="tablist">${panelTabs.map(t =>
      `<button type="button" role="tab" class="${cx('c-button-badge', state.panelTab === t.id && 'is-active')}" aria-selected="${state.panelTab === t.id}" data-action="setPanelTab" data-id="${t.id}"><span>${t.label}</span>${t.count ? `<span class="c-button-badge__count">${t.count}</span>` : ''}</button>`).join('')}</div></nav>
    ${body}
  </aside>
  <button type="button" class="c-button-icon c-button-icon--large c-button-icon--outlined c-board-side__show" data-action="showPanel" aria-label="Mostrar painel" title="Mostrar painel" ${state.panelHidden ? '' : 'inert'}>${icon('chevron-left', 16)}</button>`;
}

function mobileBody(state, p) {
  const d = info(p);
  if (state.tab === 'materiais') return `<div class="c-cd-mbody" id="cd-panel" role="tabpanel" aria-labelledby="cd-tab-materiais">${materialsSection(d)}</div>`;
  return `<div class="c-cd-mbody" id="cd-panel" role="tabpanel" aria-labelledby="cd-tab-sobre">${mobileSummary(d)}${certificateCard(d, { mobile: true })}${description(d, false)}${mobileAbout(d)}${mobileCategories()}</div>`;
}

/* ---------- Esqueleto ----------
   O carregamento usa o desenho da própria trilha (a versão escolhida no tweak, no mesmo tamanho e lugar), em cinza: estrada,
   pins e cartões de módulo viram blocos de background/skeleton, sem imagens, textos nem ícones, pulsando. Assim o esqueleto
   acompanha qualquer mudança de desenho. É só visual (aria-hidden e inert). */
const skeleton = (state, p, desk) => `<div class="c-board-skel" aria-hidden="true" inert>${trail(state, p, desk)}</div>`;

/* ---------- Tela ---------- */
function view(state) {
  const p = progress();
  const desk = minWidth(DESK);
  const look = looksFromHash();
  const showTrail = desk || state.tab === 'conteudo';
  const main = `<main class="c-board__main">${state.loading ? skeleton(state, p, desk) : trail(state, p, desk)}</main>`;
  const mobileTop = desk ? '' : `<nav class="c-cd-mback" aria-label="Voltar"><a class="c-cd-mback__link" href="#cursos">${icon('arrow-left', 16)}Voltar</a></nav>
    ${mobileTabs({ tab: state.tab }, { total: activities.length, materials })}`;
  return `<div class="${cx('c-board', desk && 'c-board--desk', desk && state.panelHidden && 'is-panel-hidden', look.trilha !== 'a' && 'c-board--b', isCD() && 'c-board--c', look.trilha === 'd' && 'c-board--d', look.trilha === 'e' && 'c-board--e', look.custom && 'c-board--bg', look.custom && look.image && 'c-board--bg-image', look.dark && 'is-on-dark', look.modern && 'c-board--modern', desk && look.float && 'c-board--float', desk && look.hud && 'c-board--hud', desk && look.dock && 'c-board--dock', desk && look.dock && !state.dockClosed && 'is-dock-open')}" data-reveal="content" style="${coverVars(look)}">
    ${showTrail ? background(look) : ''}
    ${mobileTop}
    ${desk
      ? `<div class="c-board__wrap">
          ${look.hud && !state.loading ? hudBar(state, p) : `<nav class="c-board-top" aria-label="Voltar"><a class="c-board-top__back" href="#cursos">${icon('arrow-left', 16)}Voltar</a></nav>`}
          <div class="c-board__stage">${main}${state.loading ? '' : deskPanel(state, p)}</div>
        </div>`
      : showTrail ? `<div class="c-board__wrap">${main}</div>` : mobileBody(state, p)}
    ${state.sheet ? pinSheet(state, p) : ''}
    ${desk && (look.hud || look.dock) && state.hud ? hudDrawer(state, p) : ''}
    ${examDialog(state.examDialog)}
    <div class="${cx('c-board-toast', state.toastOn && 'is-on', state.toastWarn && 'is-warn')}" role="status" aria-live="polite">${state.toast ? `${icon(state.toastWarn ? 'alert-circle' : 'check', 16)}${esc(state.toast)}` : ''}</div>
  </div>`;
}

/** Fundo por módulo: a imagem de cada módulo (a partir do 2º) se revela enquanto o separador (ou cartão) dele sobe de 90% a
    30% da altura da tela: a opacidade vai de 0 a 1 e a imagem assenta de 108% a 100%. A faixa acima do cartão fixo usa a
    imagem que já domina a tela. Atualiza direto no DOM (sem refazer o HTML) para acompanhar a rolagem. */
/** Fundo por módulo: troca por limiar, não pela rolagem (24/11/2026). O fundo do módulo N entra quando o cartão dele chega
    à beira da área da trilha — na horizontal, a borda esquerda do cartão a BG_EDGE_X ou menos da borda esquerda da faixa (o
    último pin do módulo anterior já saiu da tela); na vertical, o topo do cartão a BG_EDGE_Y ou menos do topo da tela — e
    sai quando o cartão volta para depois desse ponto. A troca é um fade automático (CSS: transição de opacidade e de escala
    das camadas), com duração própria: não acompanha a velocidade do scroll/swipe. No fim da trilha, o último módulo com o
    cartão na tela também entra. */
const BG_EDGE_X = 24;
const BG_EDGE_Y = 160;

function revealBackgrounds(ctx) {
  const layers = ctx.root.querySelectorAll('[data-bg-layer]');
  if (!layers.length) return;
  const sc = isHoriz() ? ctx.root.querySelector('[data-dscroll]') : null;
  const size = sc ? window.innerWidth : window.innerHeight;
  const atEnd = sc ? sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 2 : window.scrollY + size >= document.documentElement.scrollHeight - 2;
  const edge = sc ? sc.getBoundingClientRect().left + BG_EDGE_X : BG_EDGE_Y;
  let top = 0;
  layers.forEach((_, i) => {
    if (i === 0) return;
    const mark = ctx.root.querySelector('#board-mod-' + i);
    if (!mark) return;
    const r = mark.getBoundingClientRect();
    const pos = sc ? r.left : r.top;
    if (pos <= edge || (atEnd && pos < size)) top = i;
  });
  // HTML refeito (ctx.bgTop nulo): as camadas nascem apagadas; vão direto ao estado certo, sem animar (senão o fundo piscaria
  // a cada redesenho da tela).
  const fresh = ctx.bgTop == null;
  if (!fresh && top === ctx.bgTop) return;
  layers.forEach((layer, i) => {
    if (i === 0) return;
    if (fresh) layer.style.transition = 'none';
    layer.style.opacity = i <= top ? '1' : '0';
    layer.style.transform = i <= top ? 'scale(1)' : 'scale(1.08)';
  });
  if (fresh) {
    void layers[0].offsetWidth; // aplica sem transição antes de devolvê-la
    layers.forEach(layer => { layer.style.transition = ''; });
  }
  ctx.bgTop = top;
  ctx.root.querySelector('.c-board')?.style.setProperty('--board-cover', imageUrl(moduleBg(top)));
}

/* ---------- Rolagem: módulo do cartão fixo e botão "ir para a atividade atual" ---------- */
function onScroll(ctx) {
  const root = ctx.root;
  revealBackgrounds(ctx);
  const cur = root.querySelector('[data-current]');
  let vis = true;
  let up = false;
  if (cur) {
    const r = cur.getBoundingClientRect();
    if (isHoriz()) {
      vis = r.right > 0 && r.left < window.innerWidth;
      up = r.right <= 0; // à esquerda: a seta vira para a esquerda
    } else {
      vis = r.bottom > 0 && r.top < window.innerHeight;
      up = r.bottom <= 0;
    }
  }
  // O botão muda direto no DOM para manter a transição (refazer o HTML a cada rolagem cortaria a animação).
  if (vis !== ctx.state.curVis || up !== ctx.state.curUp) {
    ctx.state.curVis = vis;
    ctx.state.curUp = up;
    const jump = root.querySelector('.c-board-jump');
    if (jump) {
      jump.classList.toggle('is-visible', !vis);
      jump.classList.toggle('is-up', up);
      if (vis) {
        jump.setAttribute('aria-hidden', 'true');
        jump.setAttribute('tabindex', '-1');
      } else {
        jump.removeAttribute('aria-hidden');
        jump.removeAttribute('tabindex');
      }
    }
  }
  const band = root.querySelector('.c-board-band');
  if (!band) return;
  const limit = band.getBoundingClientRect().bottom + 24;
  let act = 0;
  root.querySelectorAll('[data-module]').forEach(el => {
    if (el.getBoundingClientRect().top <= limit) act = Number(el.dataset.module);
  });
  if (act !== ctx.state.viewMod) ctx.set({ viewMod: act });
}

const scrollToCurrent = ctx => {
  if (isHoriz()) return scrollToCurrentD(ctx);
  const el = ctx.root.querySelector('[data-current]') ?? ctx.root.querySelector(`#board-mod-${modules.length - 1}`);
  if (!el) return;
  const top = window.scrollY + el.getBoundingClientRect().top - window.innerHeight / 2 + 40;
  window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
};

let toastTimer = 0;
function toast(ctx, text, warn = false) {
  clearTimeout(toastTimer);
  ctx.set({ toast: text, toastWarn: warn, toastOn: true });
  toastTimer = setTimeout(() => !ctx.destroyed && ctx.set({ toastOn: false }), 2400);
}

/* ---------- Dock: abrir e fechar como uma peça só ----------
   A pílula vira o cartão crescendo para baixo, e o cartão vira a pílula encolhendo para cima, num movimento contínuo:
   - Abrir: o conteúdo da pílula some (120ms); a tela troca para o cartão, que começa recortado no tamanho da pílula (44 de
     altura, cantos de 22) e cresce até a altura toda (cantos de 16) em 420ms, desacelerando. A barriguinha com o chevron desce
     junto com a borda de baixo. O conteúdo do cartão aparece no fim (220ms, a partir de 240ms).
   - Fechar: o conteúdo do cartão some (120ms); o cartão encolhe até a pílula (380ms), com a barriguinha subindo junto; então a
     tela troca para a pílula, cujo conteúdo aparece (160ms).
   O recorte é o clip-path do cartão; o contorno e a sombra (filter: drop-shadow no Dock) seguem a silhueta. Sem movimento com
   prefers-reduced-motion (troca direto). */
const DOCK_PILL_H = 44;

/** Anima a altura visível do cartão (recorte) e a barriguinha juntas, quadro a quadro, no mesmo relógio: assim a barriguinha
    nunca se solta da borda (animações separadas de clip-path e de transform podem andar em ritmos diferentes, e o contorno
    por drop-shadow atrasaria em relação a elas). from/to = quanto do cartão fica escondido embaixo (px). Um timer garante o
    estado final mesmo com a aba em segundo plano (sem quadros). */
const easeOut = t => 1 - (1 - t) ** 3;
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function tweenDock(card, bump, from, to, ms, ease) {
  const radius = h => 22 - 6 * (1 - h / Math.max(1, Math.max(from, to))); // 22 na pílula, 16 no cartão inteiro
  const apply = hidden => {
    card.style.clipPath = 'inset(0 0 ' + hidden.toFixed(2) + 'px 0 round ' + radius(hidden).toFixed(2) + 'px)';
    if (bump) bump.style.transform = 'translateY(' + (-hidden).toFixed(2) + 'px)';
  };
  // Sem as transições do CSS (a barriguinha tem transition em transform): cada quadro vai direto ao valor, senão ela atrasa.
  card.style.transition = 'none';
  if (bump) bump.style.transition = 'none';
  apply(from);
  const t0 = performance.now();
  let done = false;
  const frame = now => {
    if (done) return;
    const t = Math.min(1, (now - t0) / ms);
    apply(from + (to - from) * ease(t));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  setTimeout(() => {
    if (!done) apply(to);
    done = true;
    card.style.transition = '';
    if (bump) bump.style.transition = '';
  }, ms + 20);
}

function morphDock(ctx, dock, closing, swap) {
  ctx.dockMorphing = true;
  // A sequência anda por timers (e não pelo fim das animações): com a aba em segundo plano as animações param, mas a troca
  // acontece do mesmo jeito e o Dock nunca fica preso no meio.
  const step = (ms, fn) => setTimeout(() => { if (ctx.destroyed) { ctx.dockMorphing = false; return; } fn(); }, ms);
  const fadeOut = nodes => nodes.forEach(n => n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-in', fill: 'forwards' }));
  if (!closing) {
    fadeOut([...dock.querySelectorAll('.c-board-dock__pill > *')]);
    step(120, () => {
      swap();
      const d = ctx.root.querySelector('.c-board-dock--tabs');
      const card = d?.querySelector('.c-board-dock__card');
      const bump = d?.querySelector('.c-board-dock__toggle');
      if (card) {
        const dy = Math.max(0, card.offsetHeight - DOCK_PILL_H);
        tweenDock(card, bump, dy, 0, 420, easeOut);
        bump?.querySelector('.c-icon')?.animate([{ transform: 'rotate(-180deg)' }, { transform: 'rotate(0deg)' }], { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
        [...card.children].forEach(n =>
          n.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, delay: 240, easing: 'ease-out', fill: 'backwards' }));
      }
      step(450, () => {
        // Fim: tira os estilos da animação (o cartão aberto fica como o CSS manda).
        if (card) card.style.clipPath = '';
        if (bump) bump.style.transform = '';
        ctx.dockMorphing = false;
      });
    });
    return;
  }
  const card = dock.querySelector('.c-board-dock__card');
  const bump = dock.querySelector('.c-board-dock__toggle');
  if (!card) { swap(); ctx.dockMorphing = false; return; }
  const dy = Math.max(0, card.offsetHeight - DOCK_PILL_H);
  fadeOut([...card.children]);
  step(120, () => {
    tweenDock(card, bump, 0, dy, 380, easeInOut);
    bump?.querySelector('.c-icon')?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }], { duration: 380, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
    step(400, () => {
      swap();
      ctx.root.querySelector('.c-board-dock--closed')?.querySelectorAll('.c-board-dock__pill > *').forEach(n =>
        n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' }));
      ctx.dockMorphing = false;
    });
  });
}

/* Ida para a atividade: leaveTo (js/core/transition.js) faz o fade out da trilha; a apresentação entra com fade in e se monta. */

const actions = {
  ...examDialogActions,
  openNode: (ctx, el) => {
    const p = progress();
    // Toque (sem hover): abre o bottom sheet com o detalhe e o botão de começar. O "Começar/Continuar" vai direto.
    if (useSheet() && !el.dataset.direct) {
      ctx.sheetFrom = el.dataset.key;
      return ctx.set({ sheet: el.dataset.trophy !== undefined ? { trophy: Number(el.dataset.trophy) } : { i: Number(el.dataset.index) }, fresh: true });
    }
    if (el.dataset.trophy !== undefined) {
      const mi = Number(el.dataset.trophy);
      const complete = p.modDone(mi) === modules[mi].activities.length;
      if (p.free && !complete) { location.hash = '#missoes'; return; }
      return toast(ctx, complete ? 'Missão do módulo concluída!' : 'Conclua todas as atividades do módulo para liberar a missão.', !complete);
    }
    const i = Number(el.dataset.index);
    if (statusOf(i, p) === 'locked') return toast(ctx, 'Conclua as atividades anteriores para desbloquear.', true);
    // Avaliação (e prova): diálogo da avaliação (apresentação → confirmação) no lugar do detalhe da atividade.
    if (['avaliacao', 'prova'].includes(activities[i].kind)) return openExamDialog(ctx, el.dataset.key);
    leaveTo(ctx, activityHref(i)); // a apresentação da atividade (sem o detalhe em drawer/sheet), com fade out da trilha
  },
  closeSheet: ctx => closeSheet(ctx),
  // Botão do bottom sheet: avaliação abre o diálogo da avaliação; missão do módulo vai para Missões; as demais, a atividade.
  sheetStart: ctx => {
    const sh = ctx.state.sheet;
    if (!sh) return;
    const key = ctx.sheetFrom;
    ctx.set({ sheet: null });
    if (sh.trophy !== undefined) { location.hash = '#missoes'; return; }
    if (['avaliacao', 'prova'].includes(activities[sh.i].kind)) { openExamDialog(ctx, key); return; }
    leaveTo(ctx, activityHref(sh.i));
  },
  jumpCurrent: ctx => scrollToCurrent(ctx),

  // Abas do mobile (Visão geral, Conteúdo, Materiais): voltar para a trilha centraliza de novo a atividade atual.
  setTab: (ctx, el) => {
    if (ctx.state.tab === el.dataset.id) return;
    if (el.dataset.id === 'conteudo') ctx.centered = false;
    ctx.set({ tab: el.dataset.id, viewMod: null, curVis: true });
    window.scrollTo({ top: 0 });
  },
  setPanelTab: (ctx, el) => ctx.set({ panelTab: el.dataset.id }),
  // Barra integrada: abre "Sobre o curso" ou "Materiais" no navdrawer; fechar devolve o foco ao botão.
  openHud: (ctx, el) => {
    ctx.hudFrom = el.dataset.id;
    ctx.set({ hud: el.dataset.id, fresh: true });
    ctx.state.fresh = false;
  },
  closeHud: ctx => closeHud(ctx),
  // Dock: troca a aba (Sobre o curso / Materiais) e volta o conteúdo para o topo.
  setDockTab: (ctx, el) => {
    if (ctx.state.dockTab === el.dataset.id) return;
    ctx.set({ dockTab: el.dataset.id });
    ctx.root.querySelector(`#dock-tab-${el.dataset.id}`)?.focus({ preventScroll: true });
  },
  // Dock: recolhe na pílula ou abre o cartão; o foco fica no botão equivalente do novo estado.
  // Animação: ao recolher, os elementos do cartão saem um a um (de baixo para cima) e o cartão some; então entra a pílula. Ao
  // abrir, a pílula some e o cartão aparece montando os elementos um a um (ver .c-board-dock.is-entering/.is-leaving no CSS).
  toggleDock: (ctx, el) => {
    const closing = !ctx.state.dockClosed;
    const dock = ctx.root.querySelector('.c-board-dock');
    if (ctx.dockMorphing) return;
    const swap = () => {
      if (ctx.destroyed) return;
      // O cartão abre e fecha por cima da trilha: ela não se move (nas trilhas horizontais, a faixa guarda a rolagem).
      const sx = ctx.root.querySelector('[data-dscroll]')?.scrollLeft;
      ctx.set({ dockClosed: closing });
      const sc = ctx.root.querySelector('[data-dscroll]');
      if (sc && sx != null) sc.scrollLeft = sx;
      // Aberto ou fechado sozinho (autoCloseDock e a abertura ao carregar): o foco fica onde está.
      if (!el?.auto) ctx.root.querySelector('[data-action="toggleDock"]:not([tabindex="-1"])')?.focus({ preventScroll: true });
    };
    if (!dock || reducedMotion() || !dock.animate) return swap();
    morphDock(ctx, dock, closing, swap);
  },
  // Menu float: o ícone abre o cartão com aquele conteúdo; clicar de novo no ativo (o "x") fecha.
  floatTab: (ctx, el) => {
    const id = el.dataset.id;
    const close = !ctx.state.panelHidden && ctx.state.panelTab === id;
    ctx.set({ panelTab: id, panelHidden: close, fresh: !close });
    ctx.state.fresh = false;
    if (looksFromHash().trilha !== 'a') measureTrailB(ctx);
  },
  openMaterial: (ctx, el) => toast(ctx, el.dataset.link === 'true' ? 'Abrindo em nova aba…' : 'Download iniciado'),
  hidePanel: ctx => togglePanel(ctx, true),
  showPanel: ctx => togglePanel(ctx, false),
};

function closeHud(ctx) {
  const from = ctx.hudFrom;
  leavePanel(ctx.root, () => {
    if (ctx.destroyed) return;
    ctx.set({ hud: null });
    if (from) ctx.root.querySelector(`[data-action="openHud"][data-id="${from}"]`)?.focus({ preventScroll: true });
  });
}

function closeSheet(ctx) {
  const key = ctx.sheetFrom;
  leavePanel(ctx.root, () => {
    if (ctx.destroyed) return;
    ctx.set({ sheet: null });
    if (key) ctx.root.querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
  });
}

function togglePanel(ctx, hidden) {
  ctx.state.panelHidden = hidden;
  const root = ctx.root;
  root.querySelector('.c-board')?.classList.toggle('is-panel-hidden', hidden);
  root.querySelector('.c-board-side')?.toggleAttribute('inert', hidden);
  root.querySelector('.c-board-side__toggle')?.toggleAttribute('inert', hidden);
  const show = root.querySelector('.c-board-side__show');
  show?.toggleAttribute('inert', !hidden);
  // O botão de mostrar só fica visível quando a coluna termina de sair (450ms): o foco vai para ele nessa hora.
  const focusTo = hidden ? show : root.querySelector('.c-board-side__toggle');
  if (hidden && !reducedMotion()) setTimeout(() => !ctx.destroyed && ctx.state.panelHidden && focusTo?.focus(), 460);
  else focusTo?.focus();
  // A trilha B é desenhada em px na largura da área, que muda com a coluna: mede de novo quando o movimento (600ms) termina.
  if (looksFromHash().trilha !== 'a') setTimeout(() => !ctx.destroyed && measureTrailB(ctx), reducedMotion() ? 0 : 620);
}

/** Versão C: mede a altura de cada cartão de módulo (o título pode ocupar 2 linhas) e refaz a trilha se mudou, para a
    estrada entrar e sair pelo meio da lateral de cada cartão e os espaços seguirem certos. */
/** Ligação da barra do curso ao 1º cartão: mede o vão entre a base da barra e o topo da trilha (a barra rola junto, então o
    vão só muda com a re-renderização). */
function linkHud(ctx) {
  const hud = ctx.root.querySelector('.c-board-hud');
  const tr = ctx.root.querySelector('.c-board-btrail');
  const svg = tr?.querySelector('.c-board-hudlink');
  const card = tr?.querySelector('.c-board-ccard .c-board-band__card');
  if (!hud || !svg || !card) return;
  // Pela lateral direita, no mesmo desenho da estrada: sai do meio da lateral direita da barra do curso, faz a curva para
  // baixo (raio B_R) numa coluna B_R + 12 depois da barra, desce e faz a outra curva para entrar no
  // meio da lateral direita do 1º cartão de módulo. Coordenadas em relação ao topo e à esquerda da trilha.
  const t = tr.getBoundingClientRect();
  const h = hud.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  const r = B_R;
  const y0 = Math.round(h.top + h.height / 2 - t.top); // meio da barra (negativo: fica acima da trilha)
  const x0 = Math.round(h.right - t.left) - 8; // começa 8 por baixo da barra
  const x = Math.round(h.right - t.left) + r + 12; // sempre ao lado da barra (o CSS deixa 72 livres à direita dela)
  const cy = Math.round(c.top + c.height / 2 - t.top);
  const cx = Math.round(c.right - t.left) - 8; // termina 8 por baixo do cartão
  const top = y0 - 16;
  const w = x + 24;
  const hgt = cy - top + 16;
  const d = `M${x0} ${y0 - top} L${x - r} ${y0 - top} A${r} ${r} 0 0 1 ${x} ${y0 - top + r} L${x} ${cy - top - r} A${r} ${r} 0 0 1 ${x - r} ${cy - top} L${cx} ${cy - top}`;
  svg.setAttribute('width', w);
  svg.setAttribute('height', hgt);
  svg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
  Object.assign(svg.style, { top: `${top}px`, left: '0px', width: `${w}px`, height: `${hgt}px` });
  svg.querySelectorAll('path').forEach(path => path.setAttribute('d', d));
}

/** Versão E: mede a altura de cada cartão de módulo (abraça o título inteiro) e refaz a faixa se alguma mudou. */
function measureCardsE(ctx) {
  if (looksFromHash().trilha !== 'e') return; // também no esqueleto, que usa a mesma trilha
  const cards = [...ctx.root.querySelectorAll('.c-board-ecard')];
  if (!cards.length) return;
  const hs = {};
  cards.forEach(li => { hs[li.dataset.module] = Math.round(li.offsetHeight); });
  const prev = ctx.state.eCardHs ?? {};
  if (Object.keys(hs).some(k => hs[k] !== prev[k])) ctx.set({ eCardHs: hs });
}

function measureCards(ctx) {
  if (!isCD()) return; // também no esqueleto, que usa a mesma trilha
  const cards = [...ctx.root.querySelectorAll('.c-board-ccard, .c-board-vcard')];
  if (!cards.length) return;
  const hs = {};
  // Trilha vertical (trailV): o próprio cartão; Versão C: o cartão dentro do item.
  cards.forEach(li => { hs[li.dataset.module] = Math.round((li.querySelector('.c-board-band__card') ?? li).offsetHeight); });
  const prev = ctx.state.cardHs ?? {};
  if (Object.keys(hs).some(k => hs[k] !== prev[k])) ctx.set({ cardHs: hs });
}

/** Mede a área da trilha B e refaz a tela se a largura mudou (a estrada é desenhada em px). */
function measureTrailB(ctx) {
  if (looksFromHash().trilha === 'a') return; // também no esqueleto, que usa a mesma trilha
  if (isHoriz()) { fitTrailD(ctx); return; }
  const main = ctx.root.querySelector('.c-board__main');
  if (!main) return;
  // Versão C com a barra integrada: o cartão do módulo tem 68% da largura da barra do curso (32% menor). O cartão fica entre as
  // descidas da estrada (bw - 2 × (estrada + curva)), então a trilha cresce ou diminui para o cartão ter essa largura.
  // No dock não há barra: usa a largura que ela teria (a da área menos 144, até 1120; css .c-board-hudwrap), para os pins terem
  // o mesmo espaçamento e o cartão do módulo o mesmo tamanho da barra integrada.
  const c = minWidth(DESK) && looksFromHash().trilha === 'c';
  const hud = c ? ctx.root.querySelector('.c-board-hud') : null;
  // Dock: o cartão abre por cima da trilha, sem mudar a área dela.
  const hudW = hud ? hud.offsetWidth : c && looksFromHash().dock ? Math.min(main.clientWidth - 144, 1120) : 0;
  const max = hudW > 0 ? trailWidthForCard(Math.round(hudW * 0.68)) : B_MAX;
  const bw = Math.min(max, Math.floor(main.clientWidth));
  if (bw > 0 && bw !== ctx.state.bw) ctx.set({ bw });
}

/** Largura da trilha (B/C, desktop) para o cartão do módulo ter "card" de largura: cartão = bw - 2 × (m + B_R), com a estrada a
    m = min(84, 10% de bw) da borda. */
function trailWidthForCard(card) {
  const wide = card + 2 * (84 + B_R);
  return wide >= 840 ? wide : Math.round((card + 2 * B_R) / 0.8);
}

export function mountBoard(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, dockClosed: true, viewMod: null, curVis: true, curUp: false, tab: 'conteudo', panelTab: 'visao', panelHidden: false,
      toast: '', toastOn: false, toastWarn: false, bw: null, examDialog: null, sheet: null, fresh: false, hud: null,
    },
    view,
    actions,
    breakpoints: [TABLET, DESK],
    onRender: ctx => {
      measureTrailB(ctx);
      measureCards(ctx);
      measureCardsE(ctx);
      toneLockedPins(ctx);
      linkHud(ctx);
      // A ligação depende da posição da barra e do cartão: refaz sempre que um dos dois (ou a trilha) muda de tamanho — fontes
      // carregando, barra de rolagem aparecendo, janela redimensionada —, não só quando a tela é redesenhada.
      ctx.linkRO?.disconnect();
      const hudEl = ctx.root.querySelector('.c-board-hud');
      if (hudEl && window.ResizeObserver) {
        ctx.linkRO = new ResizeObserver(() => !ctx.destroyed && linkHud(ctx));
        [hudEl, ctx.root.querySelector('.c-board-btrail'), ctx.root.querySelector('.c-board__wrap')].forEach(el => el && ctx.linkRO.observe(el));
      }
      // Versões D e E: a rolagem é dentro da faixa horizontal (o evento não sobe até a janela). A faixa é refeita a cada
      // renderização (trocar a aba do Dock, abrir um cartão...) e voltaria ao começo: guarda a posição e a devolve, para a
      // trilha não sair do lugar onde a pessoa está.
      const dsc = ctx.root.querySelector('[data-dscroll]');
      if (dsc) {
        if (ctx.dLeft != null && dsc.scrollLeft !== ctx.dLeft) dsc.scrollLeft = ctx.dLeft;
        dsc.onscroll = () => {
          ctx.dLeft = dsc.scrollLeft;
          onScroll(ctx);
        };
      }
      ctx.bgTop = null; // o HTML foi refeito: o fundo por módulo volta ao estado da rolagem atual
      revealBackgrounds(ctx);
      // Dock: carrega recolhido, abre sozinho depois de 1,2 s e recolhe 3 s depois de aberto (autoCloseDock). O scroll da pessoa
      // antes de abrir cancela (autoCloseDock limpa o timer).
      if (!ctx.state.loading && !ctx.dockTimerSet && ctx.root.querySelector('.c-board-dock--closed')) {
        ctx.dockTimerSet = true;
        ctx.dockTimer = setTimeout(() => {
          if (ctx.destroyed || !ctx.state.dockClosed) return;
          ctx.actions.toggleDock(ctx, { auto: true });
          ctx.dockTimer = setTimeout(() => autoCloseDock(ctx, true), DOCK_AUTO_CLOSE + 540); // + a pílula virando cartão (120 + 420)
        }, DOCK_AUTO_OPEN);
      }
      // Ao terminar de carregar (ou ao voltar para a trilha), centraliza a atividade atual (como no protótipo).
      if (!ctx.state.loading && !ctx.centered && ctx.root.querySelector('.c-board__main')) {
        ctx.centered = true;
        setTimeout(() => {
          if (ctx.destroyed) return;
          scrollToCurrent(ctx);
          onScroll(ctx);
        }, 250);
      }
    },
    onMount: ctx => {
      // Tweak de estado trocado com a tela aberta: a casca não remonta (mesma página), então a tela se refaz.
      // Os tweaks de fundo e de trilha também vêm do hash; trocar o desenho da trilha volta a centralizar a atividade atual.
      let trilha = looksFromHash().trilha;
      ctx.listen('hashchange', () => {
        if (location.hash.slice(1).split('?')[0] !== 'tabuleiro') return;
        const next = looksFromHash().trilha;
        if (next !== trilha) {
          trilha = next;
          ctx.centered = false;
        }
        ctx.set({ viewMod: null, sheet: null });
      }, window);
      ctx.listen('scroll', () => onScroll(ctx), window);
      // Versão D: a roda do mouse (para cima e para baixo) anda a trilha para os lados.
      ctx.listen('wheel', e => {
        const sc = e.target.closest?.('[data-dscroll]');
        if (!sc || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        e.preventDefault();
        sc.scrollLeft += e.deltaY;
      }, ctx.root);
      // Dock: o primeiro scroll/swipe da pessoa (roda do mouse, toque arrastando ou teclas de rolagem) recolhe o cartão. Gestos
      // dentro do próprio cartão não contam.
      const userScroll = e => { if (!e.target.closest?.('.c-board-dock')) autoCloseDock(ctx); };
      ctx.listen('wheel', userScroll, window);
      ctx.listen('touchmove', userScroll, window);
      ctx.listen('keydown', e => {
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)
          && !e.target.closest?.('input, textarea, select, [role="tab"], .c-board-dock')) userScroll(e);
      }, window);
      // Imagem de módulo enviada ou removida pelo painel Tweaks: refaz o fundo.
      ctx.listen('module-images-change', () => ctx.render(), window);
      // A estrada da trilha B é desenhada em px: acompanha a largura da janela.
      let resizeTimer = 0;
      ctx.listen('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (ctx.destroyed) return; measureTrailB(ctx); linkHud(ctx); }, 100);
      }, window);
      onEscape(ctx, () => closeExamDialog(ctx), () => !!ctx.state.examDialog);
      onEscape(ctx, () => closeSheet(ctx), () => !!ctx.state.sheet);
      onEscape(ctx, () => closeHud(ctx), () => !!ctx.state.hud);
      ctx.listen('keydown', e => {
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.matches?.('.c-board-dock__tab[role="tab"]')) {
          e.preventDefault();
          ctx.actions.setDockTab(ctx, { dataset: { id: e.target.dataset.id === 'sobre' ? 'materiais' : 'sobre' } });
          return;
        }
        if (e.key === 'Enter' && e.target.matches?.('[data-input="examDialogInput"]') && examTextOk(e.target.value)) ctx.actions.examDialogStart(ctx);
      });
    },
  });
}
