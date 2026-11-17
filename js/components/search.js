import { attrs, cx } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { buttonIcon } from './button.js';

/**
 * Campo de busca do design system (o "Search" da app bar): lupa de 18, texto 14/20, borda default, radius 12.
 * label: nome acessível do campo. input/key: ligam a digitação ao handler da tela (data-input) e preservam o foco (data-key).
 * clear: { action, label } mostra o botão de fechar/limpar à direita (buttonIcon small sem contorno).
 * O campo ocupa a largura do pai; quem posiciona define a largura (ex.: c-search--topbar = 274).
 */
export const searchField = ({ placeholder = 'Buscar', label, value, input, key, clear, className } = {}) =>
  `<label class="${cx('c-search', clear && 'c-search--clear', className)}">${icon('search', 18, 'c-search__icon')}
    <input ${attrs({ type: 'search', placeholder, value, 'aria-label': label ?? placeholder, 'data-input': input, 'data-key': key })} />
    ${clear ? buttonIcon({ style: 'small', outlined: false, name: 'x', label: clear.label ?? 'Limpar busca', action: clear.action, className: 'c-search__clear' }) : ''}
  </label>`;
