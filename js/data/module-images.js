/* Imagens de fundo trocadas pelo painel Tweaks (só no mockup): os 4 módulos do Tabuleiro (prefixo padrão) e o fundo da
   página Curso (prefixo 'lp-curso-bg'). Cada tweak de imagens informa o seu prefixo em `store`.

   - A imagem enviada é reduzida (lado maior de até 1920, JPEG 82%) para caber no armazenamento do navegador e não pesar.
   - Fica no localStorage deste navegador; se o armazenamento falhar (cheio, aba privada), vale só até recarregar a página.
   - Sem imagem enviada, o módulo usa a imagem padrão (`background` em js/data/board.js).
   - Toda troca dispara o evento `module-images-change` na janela: o Tabuleiro e o painel se refazem. */

export const MODULE_IMAGE_COUNT = 4;
export const BOARD_STORE = 'lp-board-module-bg';
const KEY = (i, store = BOARD_STORE) => `${store}-${i}`;
const memory = new Map(); // fallback quando o localStorage não está disponível (chave = KEY)

export function getModuleImage(i, store = BOARD_STORE) {
  if (memory.has(KEY(i, store))) return memory.get(KEY(i, store));
  try {
    return localStorage.getItem(KEY(i, store));
  } catch {
    return null;
  }
}

function store(i, value, prefix = BOARD_STORE) {
  const key = KEY(i, prefix);
  if (value) memory.set(key, value);
  else memory.delete(key);
  let saved = true;
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
    memory.delete(key); // salvo: o localStorage passa a ser a fonte
  } catch {
    saved = false; // fica só na memória desta aba
  }
  window.dispatchEvent(new CustomEvent('module-images-change', { detail: { index: i, store: prefix } }));
  return saved;
}

export const removeModuleImage = (i, prefix = BOARD_STORE) => store(i, null, prefix);

/** Lê o arquivo, reduz para no máximo 1920 px no lado maior e grava. Devolve { saved } (false = só nesta aba). */
export async function setModuleImageFromFile(i, file, prefix = BOARD_STORE) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
      el.src = url;
    });
    const scale = Math.min(1, 1920 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return { saved: store(i, canvas.toDataURL('image/jpeg', 0.82), prefix) };
  } finally {
    URL.revokeObjectURL(url);
  }
}
