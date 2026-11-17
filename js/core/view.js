// Mini runtime das telas: estado + função de visão + ações. Sem framework.
//
//   const view = createView(root, {
//     state: { tab: 'todos' },
//     view: (state, ctx) => `<button data-action="setTab" data-id="favoritos">Favoritos</button>`,
//     actions: { setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }) },
//   });
//
// - `view(state, ctx)` devolve o HTML da tela inteira; cada `ctx.set(...)` refaz o HTML e restaura o foco e a rolagem.
// - Eventos entram por delegação, uma vez, na raiz:
//     data-action="nome"  → clique       data-input="nome"  → digitação (input)
//     data-change="nome"  → mudança      data-key="nome"    → liga o foco ao mesmo campo depois de refazer o HTML
//     data-scroll-key     → guarda a rolagem do elemento entre renderizações
// - Quem usa Angular depois: o estado vira signals, a `view` vira o template e as `actions` viram os handlers de (click).

import { watchBreakpoints } from './media.js';

const EVENTS = [
  ['click', 'action'],
  ['input', 'input'],
  ['change', 'change'],
];

export function createView(root, { state, view, actions = {}, breakpoints = [768, 1024, 1180], onMount, onRender }) {
  const ctx = {
    root,
    state,
    actions,
    /** Atualiza o estado (objeto parcial ou função que recebe o estado) e refaz a tela. */
    set(patch) {
      Object.assign(ctx.state, typeof patch === 'function' ? patch(ctx.state) : patch);
      ctx.render();
    },
    render() {
      const focus = captureFocus(root);
      const scrolls = captureScroll(root);
      root.innerHTML = view(ctx.state, ctx);
      restoreScroll(root, scrolls);
      restoreFocus(root, focus);
      // `fresh` só vale para a renderização em que foi ligado (abrir um painel ou menu): evita animar de novo a cada re-render.
      ctx.state.fresh = false;
      onRender?.(ctx);
    },
    /** Ouvinte global (document) que sai junto com a tela: ctx.listen('keydown', fn). */
    listen(type, handler, target = document) {
      target.addEventListener(type, handler);
      globals.push(() => target.removeEventListener(type, handler));
    },
    destroy() {
      stop?.();
      listeners.forEach(([type, handler]) => root.removeEventListener(type, handler));
      globals.forEach(off => off());
      ctx.destroyed = true;
    },
  };
  const globals = [];

  const listeners = EVENTS.map(([type, name]) => {
    const handler = event => {
      const el = event.target.closest?.(`[data-${name}]`);
      if (!el || !root.contains(el)) return;
      const fn = actions[el.dataset[name]];
      if (!fn) return;
      // Cliques em links e botões de formulário não devem navegar; campos mantêm o comportamento do navegador.
      if (type === 'click' && el.tagName === 'A') event.preventDefault();
      fn(ctx, el, event);
    };
    root.addEventListener(type, handler);
    return [type, handler];
  });

  // Cruzar um corte de largura refaz a tela (a estrutura muda).
  const stop = watchBreakpoints(breakpoints, () => ctx.render());

  ctx.render();
  onMount?.(ctx);
  return ctx;
}

function captureFocus(root) {
  const el = document.activeElement;
  if (!el || !root.contains(el) || !el.dataset.key) return null;
  const isText = typeof el.selectionStart === 'number';
  return { key: el.dataset.key, start: isText ? el.selectionStart : null, end: isText ? el.selectionEnd : null };
}

function restoreFocus(root, focus) {
  if (!focus) return;
  const el = root.querySelector(`[data-key="${CSS.escape(focus.key)}"]`);
  if (!el) return;
  el.focus({ preventScroll: true });
  if (focus.start !== null) el.setSelectionRange(focus.start, focus.end);
}

function captureScroll(root) {
  return [...root.querySelectorAll('[data-scroll-key]')].map(el => [el.dataset.scrollKey, el.scrollLeft, el.scrollTop]);
}

function restoreScroll(root, scrolls) {
  for (const [key, left, top] of scrolls) {
    const el = root.querySelector(`[data-scroll-key="${CSS.escape(key)}"]`);
    if (el) {
      el.scrollLeft = left;
      el.scrollTop = top;
    }
  }
}

/**
 * Fecha um popover ao clicar fora dele ou apertar Esc. Chame uma vez em `onMount`:
 *   closeOnOutside(ctx, '[data-popover]', () => ctx.set({ menu: null }), () => ctx.state.menu !== null);
 */
export function closeOnOutside(ctx, selector, close, isOpen) {
  ctx.listen('mousedown', event => {
    if (isOpen() && !event.target.closest(selector)) close();
  });
  onEscape(ctx, close, isOpen);
}

/** Esc fecha o que estiver aberto: onEscape(ctx, () => ctx.set({ sheet: false }), () => ctx.state.sheet). */
export function onEscape(ctx, close, isOpen = () => true) {
  ctx.listen('keydown', event => {
    if (event.key === 'Escape' && isOpen()) close();
  });
}
