// Utilitários de marcação. Os componentes são funções que devolvem HTML (string); tudo que vem de dado passa por `esc`.

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para uso dentro de HTML ou de um atributo. */
export const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => entities[ch]);

/** Junta classes ignorando valores vazios: cx('a', cond && 'b') */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Atributos a partir de um objeto; `false`, `null` e `undefined` somem, `true` vira atributo sem valor. */
export const attrs = obj =>
  Object.entries(obj)
    .filter(([, v]) => v !== false && v !== null && v !== undefined)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');

/** Normaliza texto para busca: sem acento e sem maiúsculas. */
export const norm = text => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Lista de n itens, para esqueletos e grades de exemplo: range(3, i => `...`). */
export const range = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
