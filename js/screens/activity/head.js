/* Cabeçalho único das mecânicas (o mesmo modelo em todas as atividades; Figma LP-DesignSystem 4.0, node 5299:92699, "info top"):
   - linha de cima ("infoCard"): ícone da mecânica (16) + o nome da mecânica em negrito ("Quiz") · o que fazer ("Escolha uma
     alternativa") · como fazer ("Toque numa alternativa ou use as teclas A a F"), em 12/16 com divisores de 2px; à direita, os
     contadores (pills: "1 de 5", "0 acertos"…) e as ações da mecânica (Dica, Recomeçar);
   - `before` (opcional): conteúdo entre a linha de cima e o título (a imagem e o texto de apoio do Quiz com apoio);
   - abaixo: o título, que é a pergunta ou o desafio.
   O progresso ("Pergunta 1 de 3") saiu do texto e virou a pill "1 de 3" à direita (25/11/2026).
   A linha de cima tem sempre 32px de altura (a de um botão "mobile"), para o título começar no mesmo ponto em todas as telas. */

import { esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { lpIcon } from '../../core/lp-icons.js';
import { pill } from '../../components/badges.js';
import { activities } from '../../data/activity.js';

const dot = '<span class="c-act-head__dot" aria-hidden="true"></span>';

/** Ícone da mecânica: o mesmo do menu de atividades (activities[].icon); a avaliação usa o LP-Icon challenge. */
function mechIcon(mech) {
  const a = activities.find(x => x.mech === mech);
  if (!a || a.icon === 'challenge') return lpIcon('challenge', 16);
  return icon(a.icon, 16);
}

/** Pill de progresso "n de N" (cor do sistema), à direita da linha de cima. */
export const stepPill = (n, total) => pill({ color: 'system', label: `${n} de ${total}` });

/** Pill de acertos (verde, com check). */
export const hitsPill = n => pill({ color: 'green', iconName: 'check-circle', label: `${n} ${n === 1 ? 'acerto' : 'acertos'}` });

/**
 * @param {object} o
 * @param {string} o.mech     nome da mecânica, como em activities[].mech ("Quiz", "Memória"…); dá o ícone
 * @param {string} o.task     o que fazer
 * @param {string} [o.how]    como fazer (toque, arraste, teclas)
 * @param {string} o.title    pergunta ou desafio (HTML já escapado)
 * @param {string} [o.aside]  pills e botões à direita da linha de cima
 * @param {string} [o.before] conteúdo entre a linha de cima e o título
 * @param {string} [o.id]     id do título (para aria-labelledby)
 * @param {string} [o.titleClass] classe extra do título (ex.: frase com lacunas do Misturadinho)
 */
export const head = ({ mech, task, how = '', title, aside = '', before = '', id, titleClass = '' }) => `<div class="c-act-card__head c-act-head">
    <div class="c-act-head__top">
      <p class="c-act-head__info">
        <span class="c-act-head__icon" aria-hidden="true">${mechIcon(mech)}</span>
        <span class="c-act-head__line"><b class="c-act-head__mech">${esc(mech)}</b><span class="c-act-head__dot c-act-head__dot--mech" aria-hidden="true"></span><span>${esc(task)}</span>${how ? `${dot}<span>${esc(how)}</span>` : ''}</span>
      </p>
      ${aside ? `<div class="c-act-card__pills">${aside}</div>` : ''}
    </div>
    ${before}
    <h2 class="c-act-card__title${titleClass ? ` ${titleClass}` : ''}"${id ? ` id="${id}"` : ''}>${title}</h2>
  </div>`;
