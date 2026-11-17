/* Cabeçalho único das mecânicas (o mesmo modelo em todas as atividades):
   - linha de cima: instrução (kicker), com o progresso na frente quando houver ("Pergunta 1 de 3 · Escolha uma alternativa");
     à direita, os contadores (pills) e ações da mecânica (Dica, Recomeçar);
   - abaixo: o título, que é a pergunta ou o desafio.
   A linha de cima tem sempre 32px de altura (a de um botão "mobile"), para o título começar no mesmo ponto em todas as telas. */

/**
 * @param {object} o
 * @param {string} o.kicker   instrução (HTML já escapado; aceita <b>)
 * @param {string} o.title    pergunta ou desafio (HTML já escapado)
 * @param {string} [o.aside]  pills e botões à direita da instrução
 * @param {string} [o.id]     id do título (para aria-labelledby)
 * @param {string} [o.titleClass] classe extra do título (ex.: frase com lacunas do Misturadinho)
 */
export const head = ({ kicker, title, aside = '', id, titleClass = '' }) => `<div class="c-act-card__head c-act-head">
    <div class="c-act-head__top">
      <span class="c-act-card__kicker">${kicker}</span>
      ${aside ? `<div class="c-act-card__pills">${aside}</div>` : ''}
    </div>
    <h2 class="c-act-card__title${titleClass ? ` ${titleClass}` : ''}"${id ? ` id="${id}"` : ''}>${title}</h2>
  </div>`;
