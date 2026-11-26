/* 16. Slideshow: conteúdo longo que conclui ao rolar até o fim (o progresso acompanha a rolagem). A mecânica "Leitura" (2) saiu
   em 25/11/2026; ficam aqui também os utilitários de texto e imagem usados pelo Quiz com apoio (code, figure). */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { slides as SLIDES } from '../../data/activity.js';
import { finish } from './flow.js';
import { head } from './head.js';

/* Trechos com tags HTML viram <code> (o texto passa por esc antes). */
export const code = text => esc(text).replace(/&lt;\/?[a-z][a-z0-9]*(?:(?!&gt;).)*?&gt;/g, m => `<code class="c-act-code">${m}</code>`);


export const figure = (img, cls = '') => `<figure class="${cx('c-act-figure', cls)}">
  <img class="c-act-figure__img" src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" />
  ${img.caption ? `<figcaption class="c-act-figure__caption">${esc(img.caption)}</figcaption>` : ''}
</figure>`;

const accent = '<span class="c-act-read__accent" aria-hidden="true"></span>';

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
      ${head({ mech: 'Slideshow', task: `Veja os ${SLIDES.length} tópicos`, how: 'Avance no seu ritmo · 8 min', title: 'Fundamentos de HTML e CSS' })}
      <p class="c-act-read__p">Do esqueleto da página ao seu visual: entenda como o HTML estrutura o conteúdo e como o CSS define a aparência e o layout.</p>
    </div>
    ${topics}
    <div class="c-act-read__quote c-act-read__quote--end">${accent}</div>
  </section>`;
}

/* ---------- Progresso pela rolagem ---------- */
const GAIN = { 16: { xp: 120, coins: 30 } };
const KEY = { 16: 'slides' };

/** Lê a posição do texto na janela; atualiza o anel do menu sem refazer a tela e conclui ao chegar em 98%. */
export function trackScroll(ctx) {
  const v = ctx.state.view;
  if (v !== 16) return;
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
    finish(ctx, v, GAIN[v]);
  }
}

const doneFooter = id => state => (state.justDone === id
  ? { label: 'Continuar', action: 'goNext', tone: 'success', disabled: false, feedback: { tone: 'success', title: 'Leitura concluída!' } }
  : null);

export const slidesMech = {
  id: 16,
  key: 'slides',
  init: () => ({ pct: 0 }),
  view: slidesView,
  actions: {},
  footer: doneFooter(16),
  pct: s => s.slides.pct / 100,
};
