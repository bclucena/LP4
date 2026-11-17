// Gera js/core/lp-icons.js a partir dos SVGs em assets/icons/lp (LP-Icons, os ícones próprios da Ludos Pro).
// Os SVGs foram exportados do Figma "LP-DesignSystem 4.0", página Icones (191:676), frame LPIcons (204:2795),
// com a cor #3B3447 trocada por currentColor. Para atualizar: exporte de novo os SVGs para assets/icons/lp e rode
//   node tools/gerar-icones-lp.mjs
// O resultado (js/core/lp-icons.js) é versionado; o projeto em si não depende de npm.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'assets/icons/lp';

const icons = {};
for (const file of readdirSync(dir).filter(f => f.endsWith('.svg')).sort()) {
  const svg = readFileSync(join(dir, file), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 24 24';
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\n/g, '').trim();
  if (/#[0-9a-f]{3,8}/i.test(inner)) throw new Error(`${file}: cor fixa no SVG; troque por currentColor`);
  if (inner.includes("'")) throw new Error(`${file}: aspas simples no SVG`);
  icons[file.replace(/\.svg$/, '')] = viewBox === '0 0 24 24' ? `'${inner}'` : `{ viewBox: '${viewBox}', inner: '${inner}' }`;
}

const lines = Object.entries(icons).map(([name, v]) => `  '${name}': ${v},`);
writeFileSync(
  'js/core/lp-icons.js',
  `// Gerado por tools/gerar-icones-lp.mjs a partir de assets/icons/lp (LP-Icons do Figma). Não edite à mão.
// Uso: lpIcon('crown', 16) devolve o <svg> pronto, na cor do texto (currentColor). Traço de 1, como no Figma.

const paths = {
${lines.join('\n')}
};

/** LP-Icon como <svg> (cor do texto). Grade de 24px; escala com o tamanho pedido. */
export const lpIcon = (name, size = 16, className = '') => {
  const v = paths[name] ?? '';
  const viewBox = typeof v === 'string' ? '0 0 24 24' : v.viewBox;
  const inner = typeof v === 'string' ? v : v.inner;
  return \`<svg class="c-icon \${className}" xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="\${viewBox}" fill="none" aria-hidden="true" focusable="false">\${inner}</svg>\`;
};

export const hasLpIcon = name => name in paths;

/** Nomes de todos os LP-Icons (kebab-case), para o catálogo. */
export const lpIconNames = Object.keys(paths);
`,
);
console.log(`${Object.keys(icons).length} LP-Icons gerados`);
