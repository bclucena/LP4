/* Arrastar e soltar com ponteiro (mouse e toque), sem refazer a tela a cada movimento: um "fantasma" segue o ponteiro e a
   zona sob ele ganha .is-over. O toque sem arrastar continua sendo um clique comum (data-action), o que mantém o teclado.
   Depois de um arrasto, o clique que o navegador dispara em seguida é ignorado (dragged(ctx)). */

import { sfx, tones } from '../../core/sound.js';

const MOVE = 6;

/**
 * pointerDrag(ctx, {
 *   item: '[data-drag-place]',            // o que pode ser arrastado
 *   zone: '[data-drop-place]',            // onde pode ser solto
 *   enabled: el => true,                  // pode começar? (ex.: peça travada)
 *   drop: (el, zoneEl, event) => {},      // soltou (zoneEl pode ser null)
 *   ghostClass: 'c-act-ghost--chip',
 *   hoverSound: false,                    // clique curto ao passar por cada encaixe (Ordenadinho, quebra-cabeça)
 * })
 * Sons: pegar a peça toca "flip"; soltar fora de uma zona toca "tick".
 */
export function pointerDrag(ctx, { item, zone, enabled = () => true, drop, ghostClass = '', hoverSound = false }) {
  let start = null;
  let ghost = null;
  let over = null;

  const clear = () => {
    ghost?.remove();
    ghost = null;
    over?.classList.remove('is-over');
    over = null;
    start?.el.classList.remove('is-dragging');
    ctx.root.classList.remove('is-dragging');
    start = null;
  };

  ctx.listen('pointerdown', event => {
    if (event.button > 0) return;
    const el = event.target.closest?.(item);
    if (!el || !ctx.root.contains(el) || !enabled(el)) return;
    const r = el.getBoundingClientRect();
    start = { el, x: event.clientX, y: event.clientY, ox: event.clientX - r.left, oy: event.clientY - r.top, w: r.width, moved: false };
  }, ctx.root);

  ctx.listen('pointermove', event => {
    if (!start) return;
    if (!start.moved) {
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < MOVE) return;
      start.moved = true;
      sfx('flip');
      ghost =start.el.cloneNode(true);
      ghost.removeAttribute('data-action');
      ghost.className = `${start.el.className} c-act-ghost ${ghostClass}`;
      ghost.style.width = `${start.w}px`;
      ghost.setAttribute('aria-hidden', 'true');
      ctx.root.appendChild(ghost);
      start.el.classList.add('is-dragging');
      ctx.root.classList.add('is-dragging');
    }
    event.preventDefault();
    ghost.style.left = `${event.clientX - start.ox}px`;
    ghost.style.top = `${event.clientY - start.oy}px`;
    const z = document.elementFromPoint(event.clientX, event.clientY)?.closest(zone) ?? null;
    if (z !== over) {
      over?.classList.remove('is-over');
      z?.classList.add('is-over');
      if (z && hoverSound && z !== start.el.closest(zone)) tones.hover();
      over = z;
    }
  }, window);

  ctx.listen('pointerup', event => {
    if (!start) return;
    const { el, moved } = start;
    const z = over;
    clear();
    if (!moved) return;
    ctx.draggedAt = Date.now();
    if (!z || !ctx.root.contains(z)) sfx('tick');
    drop(el, z && ctx.root.contains(z) ? z : null, event);
  }, window);

  ctx.listen('pointercancel', clear, window);
}

/** true logo depois de um arrasto (o clique que vem junto deve ser ignorado). */
export const dragged = ctx => Date.now() - (ctx.draggedAt ?? 0) < 350;
