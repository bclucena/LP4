import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside } from '../core/view.js';
import { tweaks } from '../data/tweaks.js';
import { getModuleImage, setModuleImageFromFile, removeModuleImage } from '../data/module-images.js';

/* Painel "Tweaks" (só no mockup, como o atalho "← Catálogo"; some dentro do catálogo e do visualizador): mostra os tweaks da
   tela aberta (js/data/tweaks.js) e grava a escolha no endereço. A tela relê o parâmetro no evento hashchange. */

const pageOf = () => location.hash.slice(1).split('?')[0] || 'cursos';
const params = () => new URLSearchParams(location.hash.split('?')[1] ?? '');

/** Troca um parâmetro do endereço sem criar entrada no histórico e avisa as telas (hashchange). */
function setParam(t, value) {
  const p = params();
  const isDefault = t.type === 'switch' ? value === !!t.default : String(value) === t.default;
  if (isDefault) p.delete(t.id);
  else p.set(t.id, t.type === 'switch' ? (value ? '1' : '0') : String(value));
  const q = p.toString();
  history.replaceState(null, '', `#${pageOf()}${q ? `?${q}` : ''}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

const valueOf = t => {
  const v = params().get(t.id);
  if (t.type === 'switch') return v === null ? !!t.default : v === '1';
  if (t.type === 'range') return v !== null && !Number.isNaN(Number(v)) ? v : t.default;
  return t.options.some(o => o.value === v) ? v : t.default;
};

/** Envio de imagens (tipo 'images'): miniatura, nome do item, "Trocar" (abre o seletor de arquivo) e remover (volta à padrão). */
function imagesControl(t, msg) {
  return `<div class="c-tweaks__row">
    <span class="c-tweaks__label">${esc(t.label)}</span>
    <ul class="c-tweaks__images">${t.slots.map((s, i) => {
      const custom = getModuleImage(i, t.store);
      return `<li class="c-tweaks__image">
        <span class="c-tweaks__thumb" style="background-image:url('${custom || s.fallback}')" aria-hidden="true"></span>
        <span class="c-tweaks__image-text"><b>${esc(s.label)}</b><span>${custom ? 'Imagem enviada' : 'Imagem padrão'}</span></span>
        <label class="c-tweaks__image-btn" title="${esc(s.title)}">Trocar<input type="file" accept="image/*" class="u-sr-only" data-change="upload" data-id="${t.id}" data-index="${i}" aria-label="Trocar a imagem do ${esc(s.label)}" /></label>
        ${custom ? `<button type="button" class="c-tweaks__image-remove" data-action="removeImage" data-id="${t.id}" data-index="${i}" aria-label="Remover a imagem do ${esc(s.label)}" title="Voltar à imagem padrão">${icon('x', 14)}</button>` : ''}
      </li>`;
    }).join('')}</ul>
    ${msg ? `<span class="c-tweaks__hint c-tweaks__hint--warn" role="status">${esc(msg)}</span>` : ''}
    ${t.hint ? `<span class="c-tweaks__hint">${esc(t.hint)}</span>` : ''}
  </div>`;
}

const hasImages = list => list.some(t => t.type === 'images' && t.slots.some((_, i) => getModuleImage(i, t.store)));

function control(t, state) {
  if (t.type === 'images') return imagesControl(t, state.msg);
  const v = valueOf(t);
  const label = `<span class="c-tweaks__label" id="tw-${t.id}">${esc(t.label)}</span>`;
  const hint = t.hint ? `<span class="c-tweaks__hint">${esc(t.hint)}</span>` : '';
  if (t.type === 'switch') {
    return `<div class="c-tweaks__row">
      <button type="button" role="switch" aria-checked="${v}" class="c-tweaks__switch" data-action="toggle" data-id="${t.id}">
        <span class="c-switch" aria-hidden="true"><span class="c-switch__knob"></span></span>${label}
      </button>${hint}
    </div>`;
  }
  if (t.type === 'range') {
    return `<label class="c-tweaks__row">
      <span class="c-tweaks__range-head">${label}<output class="c-tweaks__value">${esc(v)}${esc(t.unit ?? '')}</output></span>
      <input type="range" class="c-tweaks__range" min="${t.min}" max="${t.max}" step="${t.step}" value="${esc(v)}" data-change="pick" data-input="preview" data-id="${t.id}" data-key="tw-${t.id}" aria-labelledby="tw-${t.id}" />${hint}
    </label>`;
  }
  if (t.type === 'select') {
    return `<label class="c-tweaks__row">${label}
      <select class="c-tweaks__select" data-change="pick" data-id="${t.id}" data-key="tw-${t.id}">
        ${t.options.map(o => `<option value="${esc(o.value)}" ${o.value === v ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
      </select>${hint}
    </label>`;
  }
  return `<div class="c-tweaks__row">${label}
    <div class="c-tweaks__choices" role="radiogroup" aria-labelledby="tw-${t.id}">
      ${t.options.map(o => `<button type="button" role="radio" aria-checked="${o.value === v}" class="${cx('c-tweaks__choice', o.value === v && 'is-active')}" data-action="pick" data-id="${t.id}" data-value="${esc(o.value)}">${esc(o.label)}</button>`).join('')}
    </div>${hint}
  </div>`;
}

function view(state) {
  const list = tweaks[pageOf()] ?? [];
  if (!list.length) return '';
  const changed = list.some(t => params().has(t.id)) || hasImages(list);
  return `<div class="c-tweaks" data-tweaks>
    ${state.open ? `<section class="c-tweaks__panel" id="tweaks-panel" aria-label="Tweaks da tela">
      <div class="c-tweaks__head">
        <b>Tweaks</b>
        <button type="button" class="c-tweaks__reset" data-action="reset" ${changed ? '' : 'disabled'}>Restaurar padrão</button>
      </div>
      ${[...new Set(list.map(t => t.section))].map(s => `<div class="c-tweaks__section">
        ${s ? `<span class="c-tweaks__section-title">${esc(s)}</span>` : ''}
        ${list.filter(t => t.section === s).map(t => control(t, state)).join('')}
      </div>`).join('')}
      <a class="c-tweaks__viewer" href="visualizador.html?tela=${encodeURIComponent(location.hash.slice(1))}" target="_blank" rel="noreferrer">${icon('monitor', 16)}Ver em vários tamanhos</a>
    </section>` : ''}
    <button type="button" class="${cx('c-tweaks__toggle', changed && 'is-changed')}" aria-expanded="${state.open}" aria-controls="tweaks-panel" data-action="togglePanel">${icon('sliders', 16)}Tweaks</button>
  </div>`;
}

export function mountTweaks(root) {
  if (document.documentElement.classList.contains('is-embedded')) return null;
  const find = id => (tweaks[pageOf()] ?? []).find(t => t.id === id);
  return createView(root, {
    state: { open: false, msg: '' },
    breakpoints: [],
    view,
    actions: {
      togglePanel: ctx => ctx.set({ open: !ctx.state.open }),
      pick: (ctx, el) => setParam(find(el.dataset.id), el.dataset.value ?? el.value),
      toggle: (ctx, el) => setParam(find(el.dataset.id), el.getAttribute('aria-checked') !== 'true'),
      // Arrastando o controle deslizante: só atualiza o número; a tela muda ao soltar (change).
      preview: (ctx, el) => { const out = el.closest('.c-tweaks__row')?.querySelector('.c-tweaks__value'); if (out) out.textContent = `${el.value}${find(el.dataset.id).unit ?? ''}`; },
      // Envio da imagem de um módulo: reduz, grava e liga o fundo "Imagem por módulo" (se ainda não estiver).
      upload: async (ctx, el) => {
        const file = el.files?.[0];
        if (!file) return;
        try {
          const t = find(el.dataset.id);
          const { saved } = await setModuleImageFromFile(Number(el.dataset.index), file, t?.store);
          ctx.set({ msg: saved ? '' : 'Sem espaço no navegador: a imagem vale só até recarregar a página.' });
          // Liga o fundo que usa a imagem (Tabuleiro: "Imagem por módulo"; Curso: "Imagem"), se ainda não estiver.
          const fundo = find('fundo');
          const want = t?.fundo ?? 'modulos';
          if (fundo && valueOf(fundo) !== want) setParam(fundo, want);
        } catch (e) {
          ctx.set({ msg: e.message || 'Não foi possível usar essa imagem.' });
        }
      },
      removeImage: (ctx, el) => { removeModuleImage(Number(el.dataset.index), find(el.dataset.id)?.store); ctx.set({ msg: '' }); },
      reset: () => {
        // "Restaurar padrão" também tira as imagens enviadas desta tela.
        (tweaks[pageOf()] ?? []).filter(t => t.type === 'images').forEach(t => t.slots.forEach((_, i) => getModuleImage(i, t.store) && removeModuleImage(i, t.store)));
        history.replaceState(null, '', `#${pageOf()}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      },
    },
    onMount: ctx => {
      // Troca de tela ou de parâmetro: o painel mostra os tweaks da tela atual com os valores do endereço.
      ctx.listen('hashchange', () => ctx.render(), window);
      ctx.listen('module-images-change', () => ctx.render(), window);
      closeOnOutside(ctx, '[data-tweaks]', () => ctx.set({ open: false }), () => ctx.state.open);
    },
  });
}
