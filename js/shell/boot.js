import { range } from '../core/dom.js';
import { reducedMotion } from '../core/media.js';

/* Sequência de montagem do handoff (mobile): o skeleton some, depois entram app bar, busca, menu e navigation bar,
   fundo e, por fim, os componentes da área. Começa 200ms depois do carregamento e cada etapa espera a anterior.
   Quem pede menos movimento no sistema vê a página já montada. ?slow=5 mostra a sequência em câmera lenta (5x). */

const slow = Number(new URLSearchParams(location.search).get('slow')) || 1;

const STEPS = [
  { at: 200, name: 'skeleton-off' }, // A. skeleton some (200ms)
  { at: 400, name: 'appbar' }, // B. app bar (100ms)
  { at: 500, name: 'search' }, // C. busca (100ms)
  { at: 600, name: 'menu nav' }, // D. menu e navigation bar (200ms)
  { at: 800, name: 'bg' }, // E. fundo (200ms)
  { at: 1000, name: 'content' }, // F. componentes da área (200ms)
];

/** Tela inteira de skeleton, só no primeiro carregamento. */
export const bootSkeleton = () => `<div class="c-boot" id="boot" aria-hidden="true">
  <div class="c-boot__bar"><span class="c-bone c-boot__logo"></span><span class="c-boot__actions"><span class="c-bone"></span><span class="c-bone c-bone--pill"></span></span></div>
  <div class="c-boot__search"><span class="c-bone c-bone--pill"></span></div>
  <div class="c-boot__layout">
    <div class="c-boot__side"><span class="c-bone"></span></div>
    <div class="c-boot__main">
      <div class="c-boot__menu"><span class="c-bone"></span><span class="c-bone c-bone--tabs"></span></div>
      <div class="c-boot__filters"></div>
      <div class="c-boot__grid">${range(8, () => '<div class="c-boot__card"><span class="c-bone"></span><span class="c-bone"></span><span class="c-bone"></span></div>')}</div>
    </div>
  </div>
</div>`;

/**
 * Liga os grupos da montagem em #shell (data-on) no tempo do handoff.
 * `onContent` roda quando os componentes da área entram (é quando a tela deixa de mostrar o esqueleto).
 */
export function runBoot(shell, onContent) {
  const boot = document.getElementById('boot');
  if (reducedMotion()) {
    shell.dataset.on = 'appbar search menu nav bg content';
    boot?.remove();
    onContent();
    return;
  }
  for (const step of STEPS) {
    setTimeout(() => {
      if (step.name === 'skeleton-off') {
        boot?.classList.add('is-fading');
        setTimeout(() => boot?.remove(), 200 * slow);
        return;
      }
      shell.dataset.on = `${shell.dataset.on ?? ''} ${step.name}`.trim();
      if (step.name === 'content') onContent();
    }, step.at * slow);
  }
}
