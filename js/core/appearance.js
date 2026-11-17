// Aparência escolhida no menu do perfil: tema (claro, escuro ou do sistema) e "Melhorar contraste".
// Liga atributos no <html> e o CSS troca os tokens semânticos (css/tokens.css):
//   <html data-theme="light|dark" data-contrast="more">
// A escolha fica no navegador (localStorage, chave `lp-appearance`). No produto vira preferência do usuário.
//
//   loadAppearance();                         // antes do primeiro render, para não piscar o tema claro
//   setAppearance({ mode: 'dark' });          // 'light' | 'dark' | 'system'
//   setAppearance({ contrast: true });
//   getAppearance();                          // { mode, contrast, dark }

const KEY = 'lp-appearance';
const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
const listeners = new Set();

let current = { mode: 'light', contrast: false };

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (saved && ['light', 'dark', 'system'].includes(saved.mode)) return { mode: saved.mode, contrast: !!saved.contrast };
  } catch {
    // sem armazenamento ou valor inválido: usa o padrão
  }
  return { mode: 'light', contrast: false };
}

const isDark = () => current.mode === 'dark' || (current.mode === 'system' && !!media?.matches);

function apply() {
  const root = document.documentElement;
  root.dataset.theme = isDark() ? 'dark' : 'light';
  if (current.contrast) root.dataset.contrast = 'more';
  else delete root.dataset.contrast;
  listeners.forEach(fn => fn(getAppearance()));
}

export const getAppearance = () => ({ ...current, dark: isDark() });

export function loadAppearance() {
  current = read();
  apply();
  // No modo "sistema", acompanha a troca de tema do sistema operacional.
  media?.addEventListener?.('change', () => { if (current.mode === 'system') apply(); });
  return getAppearance();
}

export function setAppearance(patch) {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // sem armazenamento: vale só para esta visita
  }
  apply();
}

/** Avisa quando a aparência muda (ex.: trocar o logo). Devolve a função que desliga o aviso. */
export function onAppearance(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
