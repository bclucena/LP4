import { esc } from '../../core/dom.js';
import { contrast, deltaE, generateTheme, normalizeHex, saveTheme, STEPS, themeVars } from '../../core/theme.js';
import { pageTitle, section } from '../layout.js';

/* Tema: seletor de cor primária (no menu), escala ativa, tokens semânticos e a comparação com o Figma. */

const SEED = '#7b2fbe';
const presets = [['Ludos Pro', '#7b2fbe'], ['Amarelo', '#facc15'], ['Azul-bebê', '#bfdbfe'], ['Rosa quase branco', '#faf5fa'], ['Marinho', '#0f172a']];

/** Seletor de cor primária do menu lateral. O tema vale para o catálogo inteiro e para o mockup (mesmo navegador). */
export const themePicker = state => {
  const valid = normalizeHex(state.themeText);
  return `<div class="theme-picker">
    <label>Cor primária</label>
    <div class="theme-picker__row">
      <input type="color" value="${state.themeHex}" aria-label="Escolher cor" data-change="setTheme" />
      <input type="text" data-key="theme-text" data-input="setTheme" value="${esc(state.themeText)}" spellcheck="false" aria-label="Cor em hexadecimal" ${valid ? '' : 'class="is-invalid"'} />
    </div>
    ${valid ? '' : '<p class="theme-picker__error">Use 3 ou 6 dígitos hexadecimais.</p>'}
    <div class="theme-picker__presets">${presets.map(([name, c]) => `<button type="button" title="${name} ${c}" style="background:${c}" data-action="setThemePreset" data-value="${c}"></button>`).join('')}</div>
    <p class="theme-picker__hint">Gera a escala de 11 passos e os tokens semânticos. O catálogo inteiro muda com a cor.</p>
  </div>`;
};

export const themeActions = {
  setTheme: (ctx, el) => {
    const hex = normalizeHex(el.value);
    if (hex) saveTheme(hex);
    ctx.set({ themeText: el.value, ...(hex ? { themeHex: hex } : {}) });
  },
  setThemePreset: (ctx, el) => {
    saveTheme(el.dataset.value);
    ctx.set({ themeHex: el.dataset.value, themeText: el.dataset.value });
  },
};

/** Variáveis do tema ativo, lidas do :root (acompanham o seletor). */
const activeVars = () => {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(Object.keys(themeVars(generateTheme(SEED))).map(k => [k, cs.getPropertyValue(k).trim()]));
};

const semantic = [
  ['brand', '--color-brand', 'Cor exata da semente (cabeçalhos, banners)'],
  ['on-brand', '--color-on-brand', 'Texto sobre brand: branco ou passo 950'],
  ['action', '--color-action', 'Brand escurecida até 4.5:1 com branco (botões, links)'],
  ['on-action', '--color-on-action', 'Texto sobre action'],
  ['action-hover', '--color-action-hover', 'Action com L ±0.06'],
  ['action-active', '--color-action-active', 'Action com L ±0.12'],
  ['ui', '--color-ui', 'Brand até 3:1 com branco (barras, ícones, foco)'],
  ['strong', '--color-brand-strong', 'Brand até 7:1 com branco (texto sobre subtle)'],
  ['subtle', '--color-brand-subtle', 'Passo 50 (fundo de aba e chips)'],
  ['border', '--color-brand-border', 'Passo 200'],
];

export const themePage = () => {
  const v = activeVars();
  return `
  ${pageTitle('Tema e cor primária', 'Uma cor semente gera a escala de 11 passos (50 a 950, em OKLCH) e os tokens semânticos. Os componentes usam os tokens, nunca o passo direto. Troque a cor no menu lateral e todo o catálogo muda. Cores de sucesso, erro e aviso são fixas.')}
  ${section('Escala (cor ativa)', '', `<div class="swatches swatches--scale">${STEPS.map(s => `<div class="swatch"><div class="swatch__chip" style="height:56px;background:var(--color-brand-${s})"></div><span class="swatch__name">${s}</span><span class="swatch__hex">${v[`--color-brand-${s}`]}</span></div>`).join('')}</div>`)}
  ${section('Tokens semânticos (cor ativa)', 'Contraste calculado contra branco. Texto precisa de 4.5:1 e elementos de interface de 3:1.', `<div class="pg-box kv kv--tokens">${semantic.map(([name, cssVar, rule]) => {
    const hex = v[cssVar];
    return `<div><span class="token-dot" style="background:var(${cssVar})"></span><b style="width:128px">${name}</b><span class="token-hex">${hex}</span><span style="flex:1">${rule}</span>${hex && name !== 'on-brand' && name !== 'on-action' ? `<span class="token-contrast">${contrast(hex, '#ffffff').toFixed(1)}:1 com branco</span>` : ''}</div>`;
  }).join('')}</div>`)}`;
};

/* ---------- Figma vs gerador ---------- */
const figmaPurple = [['50', '#f7f1fd'], ['100', '#efe3fb'], ['200', '#d9b5f7'], ['300', '#c490e8'], ['400', '#a35cea'], ['500', '#8e3fd1'], ['600', '#7b2fbe'], ['700', '#5a1aa0'], ['800', '#4a1384'], ['900', '#3b0d68']];

// token do Figma, valor antigo, passo do gerador usado agora e a chave para ler o valor
const tokenMap = [
  ['surface/system-subtle', '#f7f1fd', 'brand-50', '50'],
  ['surface/system-light', '#efe3fb', 'brand-100', '100'],
  ['surface/system-soft', '#d9b5f7', 'brand-200', '200'],
  ['surface/system-muted', '#a35cea', 'brand-400', '400'],
  ['surface/system-accent', '#8e3fd1', 'action', 'action'],
  ['surface/system-default', '#7b2fbe', 'action', 'action'],
  ['surface/system-strong', '#5a1aa0', 'action-hover', 'hover'],
  ['surface/system-emphasis', '#3b0d68', 'brand-900', '900'],
];

const generated = generateTheme(SEED);
const genValue = key => (key === 'action' ? generated.action : key === 'hover' ? generated.hover : generated.scale[Number(key)]);
const verdict = d => (d < 2 ? ['praticamente igual', 'ok'] : d < 5 ? ['diferença pequena', 'warn'] : ['diferença visível', 'bad']);
const chip = hex => `<span class="hex-chip"><span style="background:${hex}"></span>${hex}</span>`;

export const figmaVsGenerator = () => `
  ${pageTitle('Figma vs gerador', `O gerador é a fonte da verdade. Aqui está o que muda nas cores do Figma para a semente ${SEED}. ΔE é a distância perceptual (OKLab ×100): abaixo de 2 quase não se vê, entre 2 e 5 é leve e acima de 5 é visível.`)}
  ${section('Rampa roxa: Figma × gerador', 'O Figma tem 10 passos com a semente no 600. O gerador tem 11, com a semente no 700.', `<div class="pg-box pg-box--pad" style="display:flex;flex-direction:column;gap:16px">
    <div><div class="specimen__label" style="margin-bottom:8px">Figma (10 passos)</div><div class="swatches">${figmaPurple.map(([n, hex]) => `<div class="swatch"><div class="swatch__chip" style="height:40px;background:${hex}"></div><span class="swatch__name">${n}</span><span class="swatch__hex">${hex}</span></div>`).join('')}</div></div>
    <div><div class="specimen__label" style="margin-bottom:8px">Gerador (11 passos)</div><div class="swatches swatches--scale">${STEPS.map(s => `<div class="swatch"><div class="swatch__chip" style="height:40px;background:${generated.scale[s]}"></div><span class="swatch__name">${s}</span><span class="swatch__hex">${generated.scale[s]}</span></div>`).join('')}</div></div></div>`)}
  ${section('O que muda em cada token', 'Para a semente #7b2fbe. Com outra cor primária, todos os valores do gerador mudam.', `<div class="bp-table"><table>
    <thead><tr>${['Token do Figma', 'Antes (Figma)', 'Agora (gerador)', 'Usa', 'ΔE', 'Resultado'].map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tokenMap.map(([token, old, via, key]) => {
      const now = genValue(key);
      const d = deltaE(old, now);
      const [label, cls] = verdict(d);
      return `<tr><td>${token}</td><td>${chip(old)}</td><td>${chip(now)}</td><td style="color:var(--color-text-secondary)">${via}</td><td>${d.toFixed(1)}</td><td class="verdict verdict--${cls}">${label}</td></tr>`;
    }).join('')}</tbody></table></div>`)}
  ${section('Mudanças de regra, além de cor', '', `<ul class="bullets">
    <li>A semente passa a ser o passo <b>700</b>, e não o 600 como no Figma. Regras de layout por passo (ex.: pílula no 100, título no 900) continuam valendo, mas o 600 agora é um tom mais claro que a semente.</li>
    <li>A escala ganha o passo <b>950</b>, que não existe no Figma, e o passo 400 deixa de ter equivalente exato no Figma (o mais próximo é o 500 do Figma).</li>
    <li><b>surface/system-accent</b> e <b>surface/system-default</b> passam a ser a mesma cor (<code>action</code>). No Figma, o accent era um pouco mais claro. Os links usam <code>action</code>, para garantir contraste.</li>
    <li>Hover e pressed dos botões preenchidos deixam de usar passos fixos e usam <code>action-hover</code> e <code>action-active</code>, calculados a partir da cor.</li>
    <li>Texto sobre botões deixa de ser sempre <code>#f8f8f8</code> e passa a ser <code>on-action</code> (branco ou o passo 950, o que tiver mais contraste).</li>
    <li>As outras rampas do Figma (gray, red, yellow, green e blue) não mudam. Sucesso, erro e aviso são fixos.</li></ul>`)}`;
