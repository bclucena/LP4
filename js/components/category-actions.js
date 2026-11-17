import { subcategories } from '../data/filters.js';

/* Handlers do menu de categorias (desktop) e dos chips de categoria do bottom sheet (mobile), para as telas que usam
   `categoryMenu` e `categoryGroup` (js/components/filters.js). Espalhe no objeto `actions` da tela:
     actions: { ...categoryMenuActions(), ...categoryDraftActions() }

   Estado esperado na tela:
     filters   → { category: { cat, subs }, ... }       (valor aplicado)
     draft     → o mesmo formato, enquanto o sheet está aberto
     menu, categoryView, categoryQ, slide, draftOpen    (estado dos dois controles) */

/** Menu do desktop: busca, subnível que desliza, "Todas as categorias" e subcategorias de múltipla escolha. */
export const categoryMenuActions = () => ({
  categorySearch: (ctx, el) => ctx.set({ categoryQ: el.value }),
  categoryBack: ctx => ctx.set({ categoryView: null, slide: 'out' }),
  pickCategory: (ctx, el) => {
    const c = el.dataset.value;
    const { filters } = ctx.state;
    if (!c) return ctx.set({ filters: { ...filters, category: { cat: null, subs: [] } }, menu: null, categoryView: null });
    if (subcategories[c]) {
      const category = filters.category.cat === c ? filters.category : { cat: c, subs: [] };
      return ctx.set({ filters: { ...filters, category }, categoryView: c, slide: 'in' });
    }
    ctx.set({ filters: { ...filters, category: { cat: c, subs: [] } }, menu: null, categoryView: null });
  },
  pickSubcategory: (ctx, el) => {
    const s = el.dataset.value;
    const { filters, categoryView: view } = ctx.state;
    if (!s) return ctx.set({ filters: { ...filters, category: { cat: view, subs: [] } } });
    // Vindo de "todas", o primeiro clique escolhe só aquela subcategoria.
    const base = filters.category.cat === view ? filters.category.subs : [];
    const next = base.includes(s) ? base.filter(x => x !== s) : [...base, s];
    ctx.set({ filters: { ...filters, category: { cat: view, subs: next.length === 0 || next.length === subcategories[view].length ? [] : next } } });
  },
});

/** Chips do sheet: a categoria aberta mostra as subcategorias numa faixa abaixo da linha dela. */
export const categoryDraftActions = () => ({
  pickDraftCategory: (ctx, el) => {
    const c = el.dataset.value;
    const { draft, draftOpen } = ctx.state;
    if (!c) return ctx.set({ draft: { ...draft, category: { cat: null, subs: [] } }, draftOpen: null });
    if (subcategories[c]) {
      if (draft.category.cat === c) return ctx.set({ draftOpen: draftOpen === c ? null : c });
      return ctx.set({ draft: { ...draft, category: { cat: c, subs: [] } }, draftOpen: c });
    }
    ctx.set({ draft: { ...draft, category: { cat: c, subs: [] } }, draftOpen: null });
  },
  pickDraftSub: (ctx, el) => {
    const { draft } = ctx.state;
    const { cat, subs } = draft.category;
    if (!cat) return;
    const next = subs.includes(el.dataset.value) ? subs.filter(x => x !== el.dataset.value) : [...subs, el.dataset.value];
    ctx.set({ draft: { ...draft, category: { cat, subs: next.length === subcategories[cat].length ? [] : next } } });
  },
});
