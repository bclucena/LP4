import { esc } from '../core/dom.js';

/* Peças das páginas do catálogo. `description`, `note` e `body` aceitam HTML (texto escrito aqui, não vindo de dado). */

const FIGMA_FILE = '3NRrDyxpWYIJD52LwuoysG';

export const pageTitle = (title, description = '', figma = '') => `<header class="pg-title">
  <h1>${esc(title)}</h1>
  ${description ? `<p>${description}</p>` : ''}
  ${figma ? `<a href="https://www.figma.com/design/${FIGMA_FILE}/LP-DesignSystem-4.0?node-id=${figma.replace(':', '-')}" target="_blank" rel="noreferrer">Abrir no Figma (node ${figma})</a>` : ''}
</header>`;

export const section = (title, note, body) => `<section class="pg-section">
  <h2>${esc(title)}</h2>
  ${note ? `<p class="pg-section__note">${note}</p>` : ''}
  <div class="pg-section__body">${body}</div>
</section>`;

/** Moldura de exemplo: rótulo + área com os componentes. */
export const specimen = (label, body) => `<div class="specimen">${label ? `<span class="specimen__label">${esc(label)}</span>` : ''}<div class="specimen__box">${body}</div></div>`;

/** Tabela estados x variantes. `render(linha, coluna)` devolve o HTML da célula. */
export const matrix = ({ cols, rows, render }) => `<div class="matrix"><table>
  <thead><tr><th></th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr><th>${esc(r)}</th>${cols.map(c => `<td>${render(r, c)}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div>`;

export const code = text => `<pre class="code"><code>${esc(text)}</code></pre>`;

/** Página ainda não portada para HTML e JS puros. */
export const soonPage = (title, description) => `${pageTitle(title, description)}
<div class="soon"><b>Em migração</b><p>Esta página existia no catálogo antigo (React) e ainda não foi portada para HTML, CSS e JS puros. A lista do que falta está em <code>docs/MIGRACAO.md</code>.</p></div>`;
