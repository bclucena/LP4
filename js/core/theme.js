// Gera os tokens de tema a partir de uma cor primária (hex).
// Regra da plataforma, vinda da conversa "Variação de cor primária". Sem dependências; roda no navegador e no Node.
//
//   const tokens = generateTheme('#7b2fbe');
//   applyTheme(document.documentElement, tokens);   // injeta --color-brand-*, --color-action etc. no :root
//
// tokens: { brand, onBrand, action, onAction, hover, active, ui, subtle, border, strong, scale: { 50..950 } }

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const LADDER = [0.975, 0.94, 0.89, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.32, 0.22];
const WHITE = '#ffffff';

/* ---------- cor: conversões ---------- */
const toLinear = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGamma = l => (l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055);

const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);

/** Hex para OKLCH: { L, C, h }. */
export function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(a, bb), h: Math.atan2(bb, a) };
}

function oklchToLinearRgb(L, C, h) {
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLCH para hex, reduzindo o croma até caber no gamut sRGB. */
export function oklchToHex(L, C, h) {
  let c = C;
  for (let i = 0; i < 40; i++) {
    const rgb = oklchToLinearRgb(L, c, h);
    if (rgb.every(v => v >= -0.0005 && v <= 1.0005)) break;
    c *= 0.93;
  }
  const clamp = v => Math.min(1, Math.max(0, v));
  return '#' + oklchToLinearRgb(L, c, h).map(v => Math.round(clamp(toGamma(clamp(v))) * 255).toString(16).padStart(2, '0')).join('');
}

/** Distância perceptual (OKLab, escala x100) entre duas cores. */
export function deltaE(a, b) {
  const x = hexToOklch(a);
  const y = hexToOklch(b);
  const ax = x.C * Math.cos(x.h);
  const ay = x.C * Math.sin(x.h);
  const bx = y.C * Math.cos(y.h);
  const by = y.C * Math.sin(y.h);
  return 100 * Math.hypot(x.L - y.L, ax - bx, ay - by);
}

/* ---------- contraste (WCAG) ---------- */
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Escurece a cor até atingir o contraste mínimo contra branco. */
function darkenUntil(hex, min) {
  const o = hexToOklch(hex);
  let cur = hex;
  while (contrast(cur, WHITE) < min && o.L > 0.05) {
    o.L -= 0.01;
    cur = oklchToHex(o.L, o.C, o.h);
  }
  return cur;
}

function shiftLightness(hex, delta) {
  const o = hexToOklch(hex);
  return oklchToHex(Math.min(0.99, Math.max(0.05, o.L + delta)), o.C, o.h);
}

/* ---------- API pública ---------- */

/** Aceita "#7cf", "7cf", "#7c2fc4", "7c2fc4". Devolve "#rrggbb" ou null. */
export function normalizeHex(input) {
  let s = String(input).trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(s)) s = s.split('').map(c => c + c).join('');
  return /^[0-9a-f]{6}$/.test(s) ? '#' + s : null;
}

function buildScale(seed) {
  const o = hexToOklch(seed);
  let idx = 0;
  LADDER.forEach((v, i) => {
    if (Math.abs(v - o.L) < Math.abs(LADDER[idx] - o.L)) idx = i;
  });
  return STEPS.map((_, i) => {
    if (i === idx) return seed;
    let L;
    let k;
    if (i < idx) {
      const t = (idx - i) / idx;
      L = o.L + (0.975 - o.L) * t;
      k = 1 - 0.75 * t;
    } else {
      const t = (i - idx) / (10 - idx);
      L = o.L + (0.2 - o.L) * t;
      k = 1 - 0.35 * t;
    }
    return oklchToHex(L, o.C * k, o.h);
  });
}

export function generateTheme(input) {
  const seed = normalizeHex(input);
  if (!seed) throw new Error(`Cor inválida: ${input}`);

  const scaleList = buildScale(seed);
  const ink = scaleList[10];
  const bestText = bg => (contrast(WHITE, bg) >= contrast(ink, bg) ? WHITE : ink);

  const action = darkenUntil(seed, 4.5); // texto e botões: 4.5:1 com branco
  const ui = darkenUntil(seed, 3); // barras, ícones, foco: 3:1 com branco
  const strong = darkenUntil(seed, 7); // texto sobre o fundo suave
  const delta = hexToOklch(action).L > 0.4 ? -0.06 : 0.06;

  return {
    brand: seed,
    onBrand: bestText(seed),
    action,
    onAction: bestText(action),
    hover: shiftLightness(action, delta),
    active: shiftLightness(action, delta * 2),
    ui,
    subtle: scaleList[0],
    border: scaleList[2],
    strong,
    scale: Object.fromEntries(STEPS.map((s, i) => [s, scaleList[i]])),
  };
}

/** Variáveis CSS (nome -> valor) que o tema injeta no :root. */
export function themeVars(t) {
  const vars = {
    '--color-brand': t.brand,
    '--color-on-brand': t.onBrand,
    '--color-action': t.action,
    '--color-on-action': t.onAction,
    '--color-action-hover': t.hover,
    '--color-action-active': t.active,
    '--color-ui': t.ui,
    '--color-brand-strong': t.strong,
    '--color-brand-border': t.border,
    '--color-brand-subtle': t.subtle,
  };
  for (const [step, v] of Object.entries(t.scale)) vars[`--color-brand-${step}`] = v;
  return vars;
}

/** Injeta os tokens como variáveis CSS em um elemento (ex.: document.documentElement). */
export function applyTheme(el, t) {
  for (const [k, v] of Object.entries(themeVars(t))) el.style.setProperty(k, v);
}

/* ---------- cor primária salva no navegador ---------- */
const KEY = 'ludos-primary';
export const DEFAULT_PRIMARY = '#7b2fbe';

/** Aplica a cor salva (ou a padrão) antes do primeiro render, para não piscar a cor padrão. Devolve a cor. */
export function loadSavedTheme() {
  let saved = DEFAULT_PRIMARY;
  try {
    saved = normalizeHex(localStorage.getItem(KEY) ?? '') ?? DEFAULT_PRIMARY;
  } catch {
    /* sem armazenamento: usa a cor padrão */
  }
  applyTheme(document.documentElement, generateTheme(saved));
  return saved;
}

export function saveTheme(hex) {
  applyTheme(document.documentElement, generateTheme(hex));
  try {
    localStorage.setItem(KEY, hex);
  } catch {
    /* sem armazenamento: vale só para esta visita */
  }
}
