import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { menuTop } from '../shell/shell.js';
import { faqs, regulations, regulationPages } from '../data/faq.js';

/* Perguntas frequentes e Regulamentos (Figma "Ludos Pro 4.0 - handoff", página 10.Perguntas frequentes e Regulamento, nó 18:1644).
   São duas áreas: #faq (menu lateral e "Mais") e #regulamento (menu do perfil). Não há alternador entre elas no Figma.
   - Perguntas frequentes: um card com o acordeão (uma pergunta aberta por vez). No desktop (1179+) todas começam fechadas;
     no mobile e no tablet a primeira começa aberta.
   - Regulamentos: vários viram uma lista e cada item abre o documento em modal ("regulamento full"); com um só, o documento
     abre direto no card ("regulamento único"). Para ver esse estado: #regulamento?unico=1.
   O título ("Perguntas frequentes" / "Regulamentos") é o menu top do mobile e do tablet; no desktop o menu lateral já mostra a área. */

/* ---------- Documento (páginas do PDF) ---------- */
const doc = (title, className = '') =>
  `<div class="${cx('c-fq-doc', className)}" tabindex="0" role="document" aria-label="${esc(title)}">
    ${regulationPages.map((src, i) => `<img class="c-fq-doc__page" src="${src}" alt="${esc(title)}: página ${i + 1}" />`).join('')}
  </div>`;

const docModal = title =>
  `<div class="c-fq-modal" role="dialog" aria-modal="true" aria-labelledby="fq-modal-title">
    <div class="c-fq-modal__scrim" data-action="closeDoc"></div>
    <div class="c-fq-modal__box">
      <div class="c-fq-modal__head">
        <h2 class="c-fq-modal__title" id="fq-modal-title">${esc(title)}</h2>
        <button type="button" class="c-fq-icon-button" aria-label="Fechar" data-action="closeDoc" data-key="fq-close">${icon('x', 16)}</button>
      </div>
      ${doc(title, 'c-fq-doc--modal')}
    </div>
  </div>`;

/* ---------- Itens ---------- */
/** Pergunta: o cabeçalho inteiro é o botão (aria-expanded); o ícone repete o "button icon" do Figma. */
const faqItem = (f, i, open) =>
  `<div class="c-fq-item">
    <h3 class="c-fq-item__heading">
      <button type="button" class="c-fq-item__header" aria-expanded="${open}" aria-controls="fq-answer-${i}" id="fq-q-${i}" data-action="toggleFaq" data-id="${i}" data-key="fq-q-${i}">
        <span class="c-fq-item__title">${esc(f.q)}</span>
        <span class="c-fq-icon-button" aria-hidden="true">${icon(open ? 'chevron-up' : 'chevron-down', 16)}</span>
      </button>
    </h3>
    ${open ? `<div class="c-fq-item__answer" id="fq-answer-${i}" role="region" aria-labelledby="fq-q-${i}">${esc(f.a)}</div>` : ''}
  </div>`;

const regulationItem = (title, i) =>
  `<div class="c-fq-item">
    <button type="button" class="c-fq-item__header" aria-haspopup="dialog" data-action="openDoc" data-id="${i}" data-key="fq-r-${i}">
      <span class="c-fq-item__title">${esc(title)}</span>
      <span class="c-fq-icon-button c-fq-icon-button--link" aria-hidden="true">${icon('external-link', 16)}</span>
    </button>
  </div>`;

/** Lista com divisor entre os itens (o divisor do Figma é um elemento próprio, "div / lineHor"). */
const list = items => `<div class="c-fq-list">${items.join('<div class="c-fq-divider" role="separator"></div>')}</div>`;

const skeleton = () => `<div class="c-fq-card c-fq-card--skeleton" aria-hidden="true">${Array.from({ length: 6 }, () => '<span class="c-fq-skeleton__row"></span>').join('')}</div>`;

/* ---------- Telas ---------- */
function faqView(state) {
  return `
    ${menuTop({ title: 'Perguntas frequentes', withFilter: false })}
    <div class="c-fq" data-reveal="content">
      ${state.loading ? skeleton() : `<section class="c-fq-card" aria-label="Perguntas frequentes">${list(faqs.map((f, i) => faqItem(f, i, state.open === i)))}</section>`}
    </div>`;
}

const single = () => regulations.length === 1 || new URLSearchParams(location.hash.split('?')[1] ?? '').get('unico') === '1';

function regulationView(state) {
  const one = single();
  let content;
  if (state.loading) content = skeleton();
  else if (one) content = `<section class="c-fq-card c-fq-card--doc" aria-label="Regulamento">${doc(regulations[0])}</section>`;
  else content = `<section class="c-fq-card" aria-label="Regulamentos">${list(regulations.map(regulationItem))}</section>`;
  return `
    ${menuTop({ title: one ? 'Regulamento' : 'Regulamentos', withFilter: false })}
    <div class="${cx('c-fq', one && 'c-fq--doc')}" data-reveal="content">${content}</div>
    ${state.doc !== null && !one ? docModal(regulations[state.doc]) : ''}`;
}

export function mountFaq(root, { loading = true } = {}) {
  return createView(root, {
    // Figma (nova versão): a partir de 1179 todas as perguntas começam fechadas; em 360 e 768 a primeira começa aberta.
    state: { loading, open: minWidth(1179) ? null : 0 },
    view: faqView,
    actions: {
      toggleFaq: (ctx, el) => {
        const i = Number(el.dataset.id);
        ctx.set({ open: ctx.state.open === i ? null : i });
      },
    },
    breakpoints: [768, 1180],
  });
}

export function mountRegulation(root, { loading = true } = {}) {
  let opener = null; // botão que abriu o modal: o foco volta para ele ao fechar
  const close = ctx => {
    ctx.set({ doc: null });
    if (opener) ctx.root.querySelector(`[data-key="${opener}"]`)?.focus();
  };
  return createView(root, {
    state: { loading, doc: null },
    view: regulationView,
    actions: {
      openDoc: (ctx, el) => {
        opener = el.dataset.key;
        ctx.set({ doc: Number(el.dataset.id) });
        ctx.root.querySelector('[data-key="fq-close"]')?.focus();
      },
      closeDoc: ctx => close(ctx),
    },
    breakpoints: [768, 1180],
    onMount: ctx => {
      onEscape(ctx, () => close(ctx), () => ctx.state.doc !== null);
      // #regulamento?unico=1 na mesma área: a casca não remonta a tela, então ela se refaz sozinha.
      ctx.listen('hashchange', () => ctx.set({ doc: null }), window);
    },
  });
}
