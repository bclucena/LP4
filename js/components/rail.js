import { cx } from '../core/dom.js';
import { icon } from '../core/icons.js';

/**
 * Trilho vertical de uma lista em sequência (cursos da Rota, atividades do módulo no Curso): o traço de cima, o marcador e o
 * traço de baixo de um item. Os traços dos itens seguidos se emendam e formam a linha.
 * status: 'done' (verde, com check), 'current' (círculo cinza com a bolinha roxa que pulsa), 'locked' (cadeado) ou
 *   'open' (liberado: círculo vazio).
 * first / last: escondem o traço de cima do 1º item e o de baixo do último.
 * before / after: pintam de verde o traço de cima / de baixo (o caminho já feito).
 * Estilo em css/components/rail.css.
 */
const ICON = { done: 'check', locked: 'lock' };

export const rail = ({ status, first = false, last = false, before = false, after = false }) => `<span class="c-rail" aria-hidden="true">
    <span class="${cx('c-rail__line', first && 'is-hidden', before && 'is-on')}"></span>
    <span class="${cx('c-rail__node', `is-${status}`)}">${ICON[status] ? icon(ICON[status], 10) : ''}</span>
    <span class="${cx('c-rail__line', last && 'is-hidden', after && 'is-on')}"></span>
  </span>`;
