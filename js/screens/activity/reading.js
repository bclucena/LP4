/* 2. Leitura multimídia e 16. Slideshow: conteúdo longo que conclui ao rolar até o fim (o progresso acompanha a rolagem).
   A leitura tem galeria, citação, cartão que vira, figura, resumo narrado (player simulado) e vídeo (espaço reservado). */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { reading as R, slides as SLIDES } from '../../data/activity.js';
import { upd, finish, clock } from './flow.js';
import { sfx } from '../../core/sound.js';
import { head } from './head.js';

/* Trechos com tags HTML viram <code> (o texto passa por esc antes). */
export const code = text => esc(text).replace(/&lt;\/?[a-z][a-z0-9]*(?:(?!&gt;).)*?&gt;/g, m => `<code class="c-act-code">${m}</code>`);


export const figure = (img, cls = '') => `<figure class="${cx('c-act-figure', cls)}">
  <img class="c-act-figure__img" src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" />
  ${img.caption ? `<figcaption class="c-act-figure__caption">${esc(img.caption)}</figcaption>` : ''}
</figure>`;

const accent = '<span class="c-act-read__accent" aria-hidden="true"></span>';

/* ---------- Leitura ---------- */
function readingView(state) {
  const r = state.read;
  return `<section class="c-act-read" data-read="2" aria-label="Leitura">
    <div class="c-act-read__intro">
      ${head({ kicker: 'Leitura de 5 min · texto, áudio, imagem e vídeo', title: 'O que torna uma página semântica?' })}
      <p class="c-act-read__p">A Web Semântica permite que navegadores e motores de busca compreendam a estrutura e o significado real do conteúdo. Em vez de divs genéricas, tags estruturadas otimizam o SEO, a acessibilidade e a manutenção do código.</p>
    </div>
    <div class="c-act-read__gallery">${R.gallery.map(g => figure(g, 'c-act-figure--square')).join('')}</div>
    <div class="c-act-read__quote">
      ${accent}
      <p>Hoje, o HTML semântico é a base de páginas rápidas, inclusivas e fáceis de encontrar.</p>
      <p>Mas você sabe como o navegador transforma suas tags em significado?</p>
    </div>
    <div class="c-act-read__center">
      <button type="button" class="${cx('c-act-flip', r.flip && 'is-flipped')}" data-action="readFlip" aria-pressed="${r.flip}" aria-label="Virar cartão">
        <span class="c-act-flip__inner">
          <span class="c-act-flip__face c-act-flip__face--front"><span class="c-act-flip__text">A árvore DOM<br>Do código ao significado</span><span class="c-act-flip__hint">Clique para virar${icon('refresh-cw', 16)}</span></span>
          <span class="c-act-flip__face c-act-flip__face--back"><span class="c-act-flip__text c-act-flip__text--small">O navegador lê o HTML e monta uma árvore de nós. Tags semânticas dão a cada nó um papel claro, que leitores de tela e robôs de busca conseguem interpretar.</span><span class="c-act-flip__hint">Voltar${icon('rotate-ccw', 16)}</span></span>
        </span>
      </button>
    </div>
    <div class="c-act-read__block">
      <h2 class="c-act-read__h">Uma div? Uma section? Ou um article?</h2>
      <p class="c-act-read__p">Cada elemento comunica uma intenção. Escolher a tag certa influencia como o conteúdo é compreendido por pessoas e máquinas.</p>
      <p class="c-act-read__p">${code('Ao empregar elementos como <header>, <nav>, <article> e <footer>, a página cria uma árvore de documentos legível e eficiente para leitores de tela e robôs de indexação.')}</p>
      <p class="c-act-read__p">Não existe uma única marcação correta para todos os casos. O importante é que a estrutura reflita o significado do conteúdo, e não apenas a sua aparência.</p>
    </div>
    <div class="c-act-read__split">
      ${figure(R.figure, 'c-act-figure--wide c-act-figure--ruled')}
      <div class="c-act-read__side">
        <p class="c-act-read__p">A semântica marca uma nova fase para a web: conteúdos pensados para todas as pessoas.</p>
        <p class="c-act-read__p">Ouça o resumo narrado desta aula para fixar os conceitos.</p>
        <div class="c-act-pod">
          <button type="button" class="c-act-pod__play" data-action="readPod" aria-label="${r.pod ? 'Pausar áudio' : 'Tocar áudio'}">${icon(r.pod ? 'pause' : 'play', 16)}</button>
          <div class="c-act-pod__info">
            <div class="c-act-pod__row"><span>${esc(R.podcast.title)}</span><span data-tick="pod">${clock(r.podSec)} / ${clock(R.podcast.seconds)}</span></div>
            <div class="c-act-pod__track"><span data-tick-bar="pod" style="width:${(r.podSec / R.podcast.seconds) * 100}%"></span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="c-act-read__block c-act-read__block--narrow">
      <h2 class="c-act-read__h">Por que isso importa?</h2>
      <p class="c-act-read__p">Este módulo cobre como a estrutura semântica afeta a acessibilidade, o SEO e a experiência de quem navega. Na videoaula a seguir, você verá esses conceitos aplicados em uma página real.</p>
      <div class="c-act-video" role="img" aria-label="Videoaula do módulo (espaço reservado para o player)">${icon('play-circle', 48)}<span>Videoaula do módulo</span></div>
    </div>
    <div class="c-act-read__reflect">
      <div class="c-act-placeholder c-act-placeholder--square" role="img" aria-label="Ilustração: momento de reflexão">${icon('image', 32)}<span>Ilustração: momento de reflexão</span></div>
      <div class="c-act-read__side">
        <span class="c-act-read__kicker">Pare e reflita</span>
        <p class="c-act-read__p">Este ícone aparecerá ao longo do curso. É um convite para pausar e anotar suas ideias. Só você verá.</p>
        <p class="c-act-read__p">Pense em um site que você usa todo dia: ele seria fácil de navegar só com o teclado ou com um leitor de tela?</p>
        <p class="c-act-read__p">Quando terminar, a leitura é concluída ao chegar ao fim da página.</p>
      </div>
    </div>
    <div class="c-act-read__quote c-act-read__quote--end">
      ${accent}
      <p>Na próxima atividade, vamos colocar esse vocabulário em prática.</p>
    </div>
  </section>`;
}

/* ---------- Slideshow ---------- */
function slidesView() {
  const topics = SLIDES.map((sl, i) => `<article class="c-act-slide" aria-labelledby="act-slide-${i + 1}">
      ${figure({ src: sl.img, alt: sl.t }, 'c-act-figure--wide')}
      <div class="c-act-slide__text">
        <span class="c-act-read__kicker c-act-read__kicker--system">Tópico ${i + 1} de ${SLIDES.length}</span>
        <h3 class="c-act-slide__title" id="act-slide-${i + 1}">${esc(sl.t)}</h3>
        ${sl.ps.map(p => `<p class="c-act-read__p">${code(p)}</p>`).join('')}
      </div>
    </article>`).join('');
  return `<section class="c-act-read" data-read="16" aria-label="Fundamentos de HTML e CSS">
    <div class="c-act-read__intro">
      ${head({ kicker: `Slideshow de 8 min · ${SLIDES.length} tópicos`, title: 'Fundamentos de HTML e CSS' })}
      <p class="c-act-read__p">Do esqueleto da página ao seu visual: entenda como o HTML estrutura o conteúdo e como o CSS define a aparência e o layout.</p>
    </div>
    ${topics}
    <div class="c-act-read__quote c-act-read__quote--end">${accent}</div>
  </section>`;
}

/* ---------- Progresso pela rolagem ---------- */
const GAIN = { 2: { xp: 100, coins: 25 }, 16: { xp: 120, coins: 30 } };
const KEY = { 2: 'read', 16: 'slides' };

/** Lê a posição do texto na janela; atualiza o anel do menu sem refazer a tela e conclui ao chegar em 98%. */
export function trackScroll(ctx) {
  const v = ctx.state.view;
  if (v !== 2 && v !== 16) return;
  const el = ctx.root.querySelector(`[data-read="${v}"]`);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const p = Math.round(Math.max(0, Math.min(100, ((window.innerHeight - r.top) / r.height) * 100)));
  const slice = ctx.state[KEY[v]];
  if (p > slice.pct) {
    slice.pct = p;
    const arc = ctx.root.querySelector(`[data-ring="${v}"]`);
    if (arc) { arc.classList.remove('is-empty'); arc.setAttribute('stroke-dashoffset', String(100 - Math.min(95, p))); }
  }
  if (p >= 98 && ctx.state.status[v] !== 'done') {
    if (v === 2) ctx.state.read.pod = false;
    finish(ctx, v, GAIN[v]);
  }
}

const doneFooter = id => state => (state.justDone === id
  ? { label: 'Continuar', action: 'goNext', tone: 'success', disabled: false, feedback: { tone: 'success', title: 'Leitura concluída!', text: `Você ganhou ${GAIN[id].xp}pts.` } }
  : null);

export const readingMech = {
  id: 2,
  key: 'read',
  init: () => ({ pct: 0, flip: false, pod: false, podSec: 0 }),
  view: readingView,
  actions: {
    /* Vira o cartão sem refazer a tela, para a transição 3D acontecer. */
    readFlip: (ctx, el) => {
      const r = ctx.state.read;
      r.flip = !r.flip;
      el.classList.toggle('is-flipped', r.flip);
      el.setAttribute('aria-pressed', String(r.flip));
    },
    readPod: ctx => { sfx('click'); upd(ctx, 'read', r => ({ pod: !r.pod })); },
  },
  footer: doneFooter(2),
  pct: s => s.read.pct / 100,
  /** Player simulado: avança 1s por segundo e para no fim (90s). */
  tick(ctx) {
    const r = ctx.state.read;
    if (!r.pod) return;
    r.podSec += 1;
    if (r.podSec > R.podcast.seconds) { upd(ctx, 'read', { pod: false, podSec: 0 }); return; }
    const t = ctx.root.querySelector('[data-tick="pod"]');
    if (t) t.textContent = `${clock(r.podSec)} / ${clock(R.podcast.seconds)}`;
    const b = ctx.root.querySelector('[data-tick-bar="pod"]');
    if (b) b.style.width = `${(r.podSec / R.podcast.seconds) * 100}%`;
  },
};

export const slidesMech = {
  id: 16,
  key: 'slides',
  init: () => ({ pct: 0 }),
  view: slidesView,
  actions: {},
  footer: doneFooter(16),
  pct: s => s.slides.pct / 100,
};
