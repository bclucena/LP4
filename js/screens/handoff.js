import { esc } from '../core/dom.js';
import { createView } from '../core/view.js';
import { minWidth } from '../core/media.js';

/* Enquanto uma tela ainda não foi portada para HTML e JS puros, mostra a captura do handoff (Figma) dentro da casca real. */

/** Itens do menu -> arquivo da captura (quando o nome é diferente). */
const capture = { time: 'gestores' };
const withoutCapture = ['home'];

export function mountHandoff(root, { id, label, loading = true }) {
  return createView(root, {
    state: { loading },
    breakpoints: [768],
    view: state => {
      if (withoutCapture.includes(id)) {
        return `<div class="c-handoff c-handoff--empty" data-reveal="content"><b>${esc(label)}</b><p>A Home ainda não tem tela no Figma de handoff. Quando ela for desenhada, entra aqui.</p></div>`;
      }
      const name = capture[id] ?? id;
      const file = minWidth(768) ? `${name}-1440.png` : `${name}-360.png`;
      return `<div class="c-handoff" data-reveal="content">
        <p class="c-handoff__note"><b>${esc(label)}</b> Captura do handoff; esta tela ainda não foi portada para HTML e JS puros.</p>
        ${state.loading ? '<div class="c-handoff__skeleton"></div>' : `<img class="c-handoff__img" src="assets/handoff/${esc(file)}" alt="${esc(label)}" />`}
      </div>`;
    },
  });
}
