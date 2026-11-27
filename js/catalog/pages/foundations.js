import { esc } from '../../core/dom.js';
import { pageTitle, section } from '../layout.js';

/* Fundamentos: cores, tipografia, espaçamento e raio, efeitos. */

/* ---------- Cores ---------- */
const ramps = ['gray', 'red', 'yellow', 'green', 'blue', 'purple'];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const semantic = {
  text: ['primary', 'default', 'secondary', 'tertiary', 'disabled', 'link', 'on-color', 'error', 'success', 'warning', 'info', 'on-system', 'value', 'level', 'negative'],
  background: ['default', 'subtle', 'muted', 'info', 'success', 'warning', 'error', 'notification', 'level', 'skeleton', 'tooltip'],
  border: ['default', 'strong', 'subtle', 'error', 'success', 'warning', 'info', 'on-system', 'level'],
  icon: ['default', 'secondary', 'tertiary', 'on-color', 'error', 'success', 'warning', 'warning-strong', 'info', 'on-system'],
  surface: ['elevated', 'system-accent', 'system-strong', 'system-subtle', 'system-light', 'system-soft', 'system-muted', 'system-default', 'system-emphasis'],
};

/** O valor (hex) aparece depois de renderizar, lido da variável CSS (catalog.js, em onRender). */
const swatch = (name, v) => `<div class="swatch" data-var="--color-${v}"><div class="swatch__chip" style="background:var(--color-${v})"></div><span class="swatch__name">${name}</span><span class="swatch__hex"></span></div>`;

export const colors = () => `
  ${pageTitle('Cores', 'Seis rampas de 50 a 900 e tokens semânticos de texto, fundo, borda, ícone e superfície. Em componentes, use sempre os semânticos; as rampas são a matéria-prima.', '1995:347')}
  ${section('Rampas', '', `
    ${ramps.map(r => `<div class="ramp"><h3>${r}</h3><div class="swatches">${steps.map(s => swatch(`${r}/${s}`, `${r}-${s}`)).join('')}</div></div>`).join('')}
    <div class="ramp"><h3>Black &amp; White</h3><div class="swatches">${swatch('black', 'black')}${swatch('white', 'white')}</div></div>`)}
  ${Object.entries(semantic).map(([group, names]) => section(`Semânticos: ${group}`, '', `<div class="swatches swatches--semantic">${names.map(n => swatch(`${group}/${n}`, `${group}-${n}`)).join('')}</div>`)).join('')}`;

/** Preenche o valor de cada amostra com o que o navegador resolveu para a variável (acompanha o tema escolhido). */
export function fillSwatches(root) {
  const style = getComputedStyle(document.documentElement);
  root.querySelectorAll('.swatch[data-var]').forEach(el => {
    el.querySelector('.swatch__hex').textContent = style.getPropertyValue(el.dataset.var).trim();
  });
}

/* ---------- Tipografia ---------- */
const textStyles = [
  ['display-lg', 700, 'Display grande', 48, 48], ['display-sm', 700, 'Display pequeno', 30, 40], ['heading', 700, 'Título de seção', 20, 32],
  ['subtitle', 700, 'Subtítulo e labels', 16, 24], ['subtitle-extrabold', 800, 'Subtítulo em destaque', 16, 24], ['price', 700, 'R$ 1.250,00', 18, 28],
  ['body', 400, 'Texto corrido e conteúdo principal', 14, 20], ['body-medium', 500, 'Texto corrido e conteúdo principal', 14, 20],
  ['body-semibold', 600, 'Texto corrido e conteúdo principal', 14, 20], ['body-bold', 700, 'Texto corrido e conteúdo principal', 14, 20],
  ['body-extrabold', 800, 'Texto corrido e conteúdo principal', 14, 20], ['caption-light', 300, 'Legendas, labels e metadados', 12, 16],
  ['caption', 400, 'Legendas, labels e metadados', 12, 16], ['caption-medium', 500, 'Legendas, labels e metadados', 12, 16],
  ['caption-semibold', 600, 'Legendas, labels e metadados', 12, 16], ['caption-bold', 700, 'Legendas, labels e metadados', 12, 16],
  ['caption-extrabold', 800, 'Legendas, labels e metadados', 12, 16],
];
const primitive = [['xs', 12], ['sm', 14], ['base', 16], ['lg', 18], ['xl', 20], ['2xl', 24], ['3xl', 30], ['4xl', 36], ['5xl', 48], ['6xl', 60], ['7xl', 72]];
const mobileWeights = [['light', 300], ['normal', 400], ['medium', 500], ['semibold', 600], ['bold', 700], ['extrabold', 800]];

export const typography = () => `
  ${pageTitle('Tipografia', 'Fonte Plus Jakarta Sans. Estilos semânticos (tamanho / line-height) conforme os rótulos do Figma; ver pendências em design-system/FIGMA-MAP.md.', '1995:66756')}
  ${section('Text styles semânticos', '', `<div class="rows">${textStyles.map(([name, weight, sample, size, lh]) =>
    `<div><span class="rows__name">type/${name}</span><span class="rows__sample" style="font-weight:${weight};font-size:${size}px;line-height:${lh}px">${esc(sample)}</span><span class="rows__spec">${size}px / ${lh}px</span></div>`).join('')}</div>`)}
  ${section('Escala primitiva', 'xs a 9xl com 9 pesos (thin a black). Aqui, xs a 7xl em Bold.', `<div class="rows rows--tight">${primitive.map(([k, size]) =>
    `<div><span class="rows__name" style="width:96px">${k} (${size}px)</span><span style="font-weight:700;color:var(--color-text-primary);font-size:${size}px;line-height:1.2">Aa</span></div>`).join('')}</div>`)}
  ${section('Type mobile', '10px / 12px para caption, body e subtitle, e 12px / 16px para heading-area. Pesos de light a extrabold.', `<div class="pg-box pg-box--pad" style="display:flex;flex-wrap:wrap;gap:24px">
    ${mobileWeights.map(([w, n]) => `<span style="font-size:12px;line-height:16px;font-weight:${n};color:var(--color-text-primary)">type-mobile/${w}</span>`).join('')}
    <span style="font-size:12px;line-height:16px;font-weight:700;color:var(--color-text-primary)">type-mobile/heading-area</span></div>`)}`;

/* ---------- Espaçamento, raio e breakpoints ---------- */
const spacing = [['0_25', 1], ['0_5', 2], ['1', 4], ['1_5', 6], ['2', 8], ['2_5', 10], ['3', 12], ['3_5', 14], ['4', 16], ['5', 20], ['6', 24], ['7', 28], ['8', 32], ['9', 36], ['10', 40], ['11', 44], ['12', 48], ['14', 56], ['16', 64], ['20', 80], ['24', 96], ['28', 112], ['32', 128], ['36', 144], ['40', 160], ['48', 192], ['64', 256], ['96', 384]];
const radii = [['none', 0], ['sm', 2], ['DEFAULT', 4], ['md', 6], ['lg', 8], ['xl', 12], ['2xl', 16], ['3xl', 24], ['full', 999]];
const breakpoints = [['sm', 640], ['md', 768], ['lg', 1024], ['xl', 1280], ['2xl', 1536]];

export const spacingPage = () => `
  ${pageTitle('Espaçamento e raio', 'Escala em múltiplos de 4px para padding, margin e gap. O padding de componentes de interação é fixo em todos os breakpoints.', '1995:66878')}
  ${section('Spacing', '', `<div class="pg-box pg-box--pad bars">${spacing.map(([k, px]) => `<div><span class="bars__key">${k}</span><span class="bars__px">${px}px</span><span class="bars__bar" style="width:${px}px"></span></div>`).join('')}</div>`)}
  ${section('Border radius', 'De none (0) a full (999px). Em CSS: border-radius com os tokens --radius-*.', `<div class="pg-box pg-box--pad tiles">${radii.map(([k, px]) =>
    `<div class="tile"><span class="tile__box" style="border-radius:${Math.min(px, 28)}px"></span><b>${k}</b><span>${px}px</span></div>`).join('')}</div>`)}
  ${section('Breakpoints', '', `<div class="pg-box pg-box--pad bars">${breakpoints.map(([k, px]) =>
    `<div><span class="bars__key bars__key--wide">breakpoint/${k}</span><span class="bars__px" style="width:56px">${px}px</span><span class="bars__bar bars__bar--bp" style="width:${px / 4}px"></span></div>`).join('')}</div>
    <p class="pg-note">Estes são os breakpoints da página Size e Spacing do arquivo de design system. Os do handoff (usados nas telas) são 768, 1180, 1366, 1440 e 2560: veja Layout e responsividade.</p>`)}`;

/* ---------- Efeitos ---------- */
const shadows = [['none', 'none'], ['2xs', 'var(--shadow-2xs)'], ['xs', 'var(--shadow-xs)'], ['sm', 'var(--shadow-sm)'], ['md', 'var(--shadow-md)'], ['lg', 'var(--shadow-lg)'], ['xl', 'var(--shadow-xl)'], ['2xl', 'var(--shadow-2xl)']];

export const effects = () => `
  ${pageTitle('Efeitos', 'Sombras de elevação (alguns níveis usam duas camadas), blur, opacity e largura de borda.', '1995:67138')}
  ${section('Sombras', 'No Figma, shadow/lg e shadow/xl têm valores idênticos (ver pendências).', `<div class="shadows">
    ${shadows.map(([s, v]) => `<div class="shadow"><div class="shadow__box" style="box-shadow:${v}"></div><b>${s}</b></div>`).join('')}
    <div class="shadow"><div class="shadow__box" style="box-shadow:inset 0 2px 4px 0 rgba(0,0,0,.05)"></div><b>inner</b></div></div>`)}
  ${section('Blur', 'none 0, sm 4, DEFAULT 8, md 12, lg 16, xl 24, 2xl 40, 3xl 64 (px).', `<div class="dots">${[0, 4, 8, 12, 16, 24, 40, 64].map(b =>
    `<div class="dot"><div class="dot__box" style="filter:blur(${b / 4}px)"></div><span>${b}px</span></div>`).join('')}</div>`)}
  ${section('Opacity', '15 níveis de 0 a 100%.', `<div class="dots dots--op">${[0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100].map(o =>
    `<div class="dot"><div class="dot__box" style="opacity:${o / 100}"></div><span>${o}</span></div>`).join('')}</div>`)}`;
