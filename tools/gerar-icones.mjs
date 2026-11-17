// Gera js/core/icons.js a partir dos SVGs em assets/icons/feather (Feather Icons, licença MIT, como estão no Figma).
// Os SVGs foram exportados do Figma "LP-DesignSystem 4.0", página Icones (191:676), frame FeatherIcons (198:4875):
// mesmo desenho do Feather, mas com traço de 1px e a cor #3B3447 trocada por currentColor. Para atualizar: exporte de
// novo os SVGs para assets/icons/feather e rode
//   node tools/gerar-icones.mjs
// O resultado (js/core/icons.js) é versionado; o projeto em si não depende de npm.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'assets/icons/feather';

const icons = {};
for (const file of readdirSync(dir).filter(f => f.endsWith('.svg')).sort()) {
  const svg = readFileSync(join(dir, file), 'utf8');
  if (!svg.includes('viewBox="0 0 24 24"')) throw new Error(`${file}: esperava viewBox 0 0 24 24`);
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\n/g, '').trim();
  if (/#[0-9a-f]{3,8}/i.test(inner)) throw new Error(`${file}: cor fixa no SVG; troque por currentColor`);
  if (inner.includes("'")) throw new Error(`${file}: aspas simples no SVG`);
  icons[file.replace(/\.svg$/, '')] = inner;
}

const lines = Object.entries(icons).map(([name, svg]) => `  '${name}': '${svg}',`);
writeFileSync(
  'js/core/icons.js',
  `// Gerado por tools/gerar-icones.mjs a partir de assets/icons/feather (Feather do Figma, MIT). Não edite à mão.
// Uso: icon('award', 16) devolve o <svg> pronto, na cor do texto (currentColor). Traço de 1, como no Figma.

const paths = {
${lines.join('\n')}
};

/** Ícone do Feather como <svg> (traço de 1, cantos arredondados, cor do texto). */
export const icon = (name, size = 16, className = '') =>
  \`<svg class="c-icon \${className}" xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke-width="1" aria-hidden="true" focusable="false">\${paths[name] ?? ''}</svg>\`;

export const hasIcon = name => name in paths;

/** Nomes de todos os ícones (kebab-case), para o catálogo. */
export const iconNames = Object.keys(paths);
`,
);
console.log(`${Object.keys(icons).length} ícones gerados`);
