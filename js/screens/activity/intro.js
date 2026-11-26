/* Apresentação da atividade: o passo entre o clique no card da atividade (Curso, Tabuleiro) e a mecânica
   (Figma LP-DesignSystem 4.0, node 5213:1953).
   - Com a apresentação aberta a app bar fica visível, o menu de atividades e a barra de desempenho ficam escondidos e o
     conteúdo é só o texto da atividade (kicker "Atividade N", título 30/40 e parágrafos 16/28) numa coluna de 640px.
   - "Iniciar" (ou Enter) entra na mecânica: a app bar sobe e o menu e a barra entram juntos, em 600ms ease-in-out.
   - O X no canto volta ao Curso sem perguntar nada (a atividade ainda não começou). */

import { esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { lpIcon } from '../../core/lp-icons.js';
import { buttonIcon } from '../../components/button.js';
import { intros, courseActivity } from '../../data/activity.js';
import { actIndex, actById } from './flow.js';

/** Tem apresentação? (a avaliação final usa a própria tela de informações) */
export const hasIntro = id => Boolean(intros[id]);

/* Informações da atividade (25/11/2026, reorganizada a pedido):
   1. ícone + "Módulo M · Atividade N" — o ícone e o rótulo do card de atividade do Curso (edit; avaliação: LP-Icon challenge e
      "Avaliação"; missão: target e "Missão");
   2. pílulas com a duração, as etapas (quando > 1) e os pontos (sem a pílula da mecânica);
   3. o título da atividade, o mesmo do card de atividade (nome da atividade do curso);
   4. o texto da apresentação.
   Os dados da atividade do curso vêm de ?atv=n (Tabuleiro e Curso). Sem ele, "Atividade N" e o título da apresentação.
   Montagem: cada linha entra em sequência (opacidade e um leve deslocamento para cima); a ordem vai em --i e o atraso sai do
   CSS (.c-act-intro > *, css/screens/activity.css). */
const atvFromHash = () => {
  const v = new URLSearchParams(location.hash.split('?')[1] ?? '').get('atv');
  return v === null ? null : courseActivity(Number(v));
};

/** Rótulo e ícone do card de atividade do Curso (actLook em js/screens/course-detail.js). */
function kindLook(kind, n) {
  if (kind === 'avaliacao' || kind === 'prova') return { label: 'Avaliação', icon: lpIcon('challenge', 16) };
  if (kind === 'missao') return { label: 'Missão', icon: icon('target', 16) };
  return { label: `Atividade ${n}`, icon: icon('edit', 16) };
}

export function introView(state) {
  const id = state.view;
  const a = actById(id);
  const it = intros[id] ?? { t: a?.title ?? '', ps: [] };
  const atv = atvFromHash();
  const look = kindLook(atv?.kind, atv ? atv.number : actIndex(id) + 1);
  const facts = [
    atv && [icon('clock', 16), `${atv.min} min`],
    atv && atv.steps > 1 && [icon('layers', 16), `${atv.steps} etapas`],
    a && [icon('star', 16), `${a.xp} pontos`],
  ].filter(Boolean);
  let i = 0;
  const step = () => `style="--i:${i++}"`;
  return `<section class="c-act-intro" aria-labelledby="act-intro-title">
    <span class="c-act-intro__kicker" ${step()}>${look.icon}${atv ? `Módulo ${atv.module} · ` : ''}${esc(look.label)}</span>
    ${facts.length ? `<ul class="c-act-intro__facts" aria-label="Sobre a atividade" ${step()}>${facts.map(([ic, t]) => `<li>${ic}<span>${t}</span></li>`).join('')}</ul>` : ''}
    <h1 class="c-act-intro__title" id="act-intro-title" ${step()}>${esc(atv ? atv.name : it.t)}</h1>
    ${it.ps.map(p => `<p class="c-act-intro__p" ${step()}>${esc(p)}</p>`).join('')}
  </section>`;
}

/** X da apresentação: buttonIcon large com contorno do design system, no canto superior direito. */
export const introClose = () => buttonIcon({ name: 'x', label: 'Fechar e voltar ao curso', action: 'leaveIntro', className: 'c-act-intro__close' });

export const introFooter = { label: 'Iniciar', action: 'startAct' };
