/* Apresentação da atividade: o passo entre o clique no card da atividade (Curso, Tabuleiro) e a mecânica
   (Figma LP-DesignSystem 4.0, node 5213:1953).
   - Com a apresentação aberta a app bar fica visível, o menu de atividades e a barra de desempenho ficam escondidos e o
     conteúdo é só o texto da atividade (kicker "Atividade N", título 30/40 e parágrafos 16/28) numa coluna de 640px.
   - "Iniciar" (ou Enter) entra na mecânica: a app bar sobe e o menu e a barra entram juntos, em 600ms ease-in-out.
   - O X no canto volta ao Curso sem perguntar nada (a atividade ainda não começou). */

import { esc } from '../../core/dom.js';
import { buttonIcon } from '../../components/button.js';
import { intros } from '../../data/activity.js';
import { actIndex, actById } from './flow.js';

/** Tem apresentação? (a avaliação final usa a própria tela de informações) */
export const hasIntro = id => Boolean(intros[id]);

export function introView(state) {
  const id = state.view;
  const it = intros[id] ?? { t: actById(id)?.title ?? '', ps: [] };
  return `<section class="c-act-intro" aria-labelledby="act-intro-title">
    <span class="c-act-intro__kicker">Atividade ${actIndex(id) + 1}</span>
    <h1 class="c-act-intro__title" id="act-intro-title">${esc(it.t)}</h1>
    ${it.ps.map(p => `<p class="c-act-intro__p">${esc(p)}</p>`).join('')}
  </section>`;
}

/** X da apresentação: buttonIcon large com contorno do design system, no canto superior direito. */
export const introClose = () => buttonIcon({ name: 'x', label: 'Fechar e voltar ao curso', action: 'leaveIntro', className: 'c-act-intro__close' });

export const introFooter = { label: 'Iniciar', action: 'startAct' };
