import { esc, norm } from '../../core/dom.js';
import { icon, iconNames } from '../../core/icons.js';
import { lpIcon, lpIconNames } from '../../core/lp-icons.js';
import { pageTitle, section } from '../layout.js';

const lpMecanicas = ['slideshow', 'video', 'quiz', 'enquete', 'ordenadinho', 'nolugar', 'misturadinho', 'mosaico', 'sequencia', 'memoria', 'tetris', 'emparedado', 'pdf', 'thisthat', 'sete-erros', 'caca-palavras'];
const lpMidia = ['genially01', 'vimeo01', 'youtube01', 'soundcloud01', 'canva01', 'spotify01'];

/** Nome em PascalCase, como no pacote do Feather: 'alert-circle' vira 'AlertCircle'. */
const pascal = name => name.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');

export const icons = state => {
  const q = norm(state.iconQ);
  const list = iconNames.filter(n => norm(pascal(n)).includes(q));
  const lpList = lpIconNames.filter(n => norm(n).includes(q));
  return `
  ${pageTitle('Ícones', 'Quatro conjuntos: Feather Icons (traço de 1px, 16 a 24px), LP-Icons (ícones próprios da Ludos Pro), ícones LP das mecânicas e ícones de mídia e social. <code>icon(nome, tamanho)</code> (js/core/icons.js) devolve o SVG do Feather e <code>lpIcon(nome, tamanho)</code> (js/core/lp-icons.js) o dos LP-Icons; os dois herdam a cor do texto.', '191:676')}
  <input class="icon-search" data-key="icon-search" data-input="iconSearch" value="${esc(state.iconQ)}" placeholder="Buscar ícone" />
  ${section(`LP-Icons (${lpList.length})`, 'Ícones próprios da Ludos Pro, frame LPIcons (204:2795) do Figma. Traço de 1px, grade de 24px. Use quando o Feather não tiver o ícone. SVGs em assets/icons/lp.', `
    <div class="icon-grid">${lpList.map(n => `<div class="icon-cell" title="${n}">${lpIcon(n, 24)}<span>${n}</span></div>`).join('')}</div>`)}
  ${section(`Feather (${list.length})`, 'Os 257 ícones do frame FeatherIcons (198:4875) do Figma: desenho do Feather com traço de 1px. SVGs em assets/icons/feather.', `
    <div class="icon-grid">${list.map(n => `<div class="icon-cell">${icon(n, 20)}<span>${pascal(n)}</span></div>`).join('')}</div>`)}
  ${section('Ludos Pro: mecânicas', 'Pendente: exportar os SVGs do Figma para a pasta assets/icons.', `<div class="chips">${lpMecanicas.map(n => `<span class="chip-label">Icons/LP/${n}</span>`).join('')}</div>`)}
  ${section('Ludos Pro: mídia', 'Pendente: exportar os SVGs do Figma.', `<div class="chips">${lpMidia.map(n => `<span class="chip-label">Icons/LP/${n}</span>`).join('')}</div>`)}`;
};

export const iconActions = {
  iconSearch: (ctx, el) => ctx.set({ iconQ: el.value }),
};
