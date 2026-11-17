import { createView, onEscape } from '../core/view.js';
import { profileMenu, LANGS } from '../components/profile-menu.js';
import { getAppearance, setAppearance } from '../core/appearance.js';
import { soundOn, setSound, sfx } from '../core/sound.js';

/* Menu do perfil na app bar: um createView por pílula (mobile e desktop), com estado próprio, para abrir e fechar sem
   refazer a casca (o que remontaria a tela da área). Tema e contraste vão para js/core/appearance.js; o idioma fica só
   guardado no navegador (lp-lang): o mockup ainda não tem textos traduzidos. */

const LANG_KEY = 'lp-lang';

function readLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return LANGS.some(l => l.id === v) ? v : 'pt-BR';
  } catch {
    return 'pt-BR';
  }
}

function saveLang(id) {
  try {
    localStorage.setItem(LANG_KEY, id);
  } catch {
    // sem armazenamento: vale só para esta visita
  }
}

function close(ctx, { focusPill = false } = {}) {
  if (!ctx.state.open) return;
  ctx.set({ open: false });
  if (focusPill) ctx.root.querySelector('.c-user-pill')?.focus();
}

/** Monta o menu em cada [data-profile-slot] de `root`. Devolve a função que desmonta todos. */
export function mountProfiles(root) {
  const views = [...root.querySelectorAll('[data-profile-slot]')].map(slot => {
    const small = slot.dataset.profileSlot === 'mobile';
    return createView(slot, {
      state: { open: false, fresh: false, lang: readLang() },
      breakpoints: [],
      view: state => {
        const { mode, contrast } = getAppearance();
        return profileMenu({ open: state.open, enter: state.fresh, small, lang: state.lang, mode, contrast, sound: soundOn(), id: `profile-${slot.dataset.profileSlot}` });
      },
      actions: {
        toggleProfile: ctx => ctx.set({ open: !ctx.state.open, fresh: !ctx.state.open }),
        closeProfile: ctx => close(ctx, { focusPill: true }),
        pickLang: (ctx, el) => { saveLang(el.dataset.id); ctx.set({ lang: el.dataset.id }); },
        pickTheme: (ctx, el) => { setAppearance({ mode: el.dataset.id }); ctx.render(); },
        toggleContrast: ctx => { setAppearance({ contrast: !getAppearance().contrast }); ctx.render(); },
        // Sons da plataforma (efeitos das atividades): a escolha fica no navegador (js/core/sound.js). Ao ligar, toca um clique.
        toggleSound: ctx => {
          const on = !soundOn();
          setSound(on);
          if (on) sfx('click');
          ctx.render();
        },
      },
      onMount: ctx => {
        // Fecha ao clicar fora desta pílula e do painel (há duas pílulas na página; só uma aparece por largura).
        ctx.listen('mousedown', event => { if (ctx.state.open && !ctx.root.contains(event.target)) close(ctx); });
        onEscape(ctx, () => close(ctx, { focusPill: true }), () => ctx.state.open);
      },
    });
  });
  return () => views.forEach(v => v.destroy());
}
