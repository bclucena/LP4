/* 7. No lugar: classifica 8 práticas em "Ajuda" ou "Prejudica". Arrasta a opção até o quadro, ou toca na opção e depois no
   quadro. "Confirmar" (no rodapé) só libera com tudo posicionado; as certas travam e as erradas voltam para as opções.
   Tudo certo: +180 pts, +45 moedas. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { place as P } from '../../data/activity.js';
import { upd, finish, later, fx, shuffle, toast, streakOn } from './flow.js';
import { pointerDrag, dragged } from './drag.js';
import { sfx, tones } from '../../core/sound.js';

const init = () => ({ placed: Object.fromEntries(shuffle(P.items).map((p, i) => [p.id, { z: 'bank', i }])), locked: {}, result: null, sel: null, tries: 0, msg: null });

function chip(state, id) {
  const pl = state.place;
  const item = P.items.find(x => x.id === id);
  const lock = pl.locked[id];
  const r = pl.result ? pl.result[id] : undefined;
  const sel = pl.sel === id;
  const ok = r === true || lock;
  return `<button type="button" class="${cx('c-act-chip-drag', ok && 'is-right', r === false && 'is-wrong', sel && 'is-selected', r === false && fx(state, 'placeCheck') && 'is-shake')}" data-action="placeTap" data-id="${id}" data-drag-place ${lock || pl.result ? 'data-fixed' : ''} aria-pressed="${sel}" aria-label="${esc(item.t)}${lock ? ', correta' : r === false ? ', errada' : sel ? ', selecionada' : ''}">
    ${icon(ok ? 'check-circle' : r === false ? 'x-circle' : 'move', 16)}<span>${esc(item.t)}</span>
  </button>`;
}

const listOf = (state, zone) => Object.entries(state.place.placed).filter(([, v]) => v.z === zone).sort((a, b) => a[1].i - b[1].i).map(([id]) => id);

function view(state) {
  const pl = state.place;
  const bank = listOf(state, 'bank');
  const armed = !!pl.sel;
  const zones = P.zones.map(z => {
    const ids = listOf(state, z.id);
    return `<div class="c-act-zone" data-action="placeZone" data-zone="${z.id}">
      <div class="c-act-zone__banner c-act-zone__banner--${z.tone}"><span>${esc(z.label)}</span><span class="c-act-zone__count">${ids.length}</span></div>
      <div class="${cx('c-act-zone__drop', armed && 'is-armed')}" data-drop-place="${z.id}">
        ${ids.length ? ids.map(id => chip(state, id)).join('') : `<span class="c-act-zone__empty">${icon('download', 20)}${armed ? 'Toque para soltar aqui' : 'Solte aqui'}</span>`}
      </div>
    </div>`;
  }).join('');
  return `<section class="c-act-card c-act-place" aria-label="No lugar">
    <div class="c-act-card__head">
      <span class="c-act-card__kicker">Arraste as opções e solte nos quadros corretos · ou toque na opção e depois no quadro</span>
      <h2 class="c-act-card__title">${esc(P.question)}</h2>
    </div>
    <div class="c-act-place__zones">${zones}</div>
    <div class="c-act-bank" data-action="placeZone" data-zone="bank" data-drop-place="bank">
      <div class="c-act-bank__head"><b>Opções</b><span>${bank.length} de ${P.items.length} restantes</span></div>
      <div class="c-act-bank__chips">${bank.length ? bank.map(id => chip(state, id)).join('') : `<span class="c-act-bank__done">${icon('check', 16)}Tudo posicionado. Confira e confirme.</span>`}</div>
    </div>
    <div class="c-act-msg" aria-live="polite">${pl.msg ? toast(esc(pl.msg.t), pl.msg.ok ? 'ok' : 'bad', fx(state, 'placeCheck')) : ''}</div>
  </section>`;
}

function put(ctx, id, zone) {
  const pl = ctx.state.place;
  if (pl.placed[id].z === zone) { upd(ctx, 'place', { sel: null }); return; }
  if (zone === 'bank') tones.toBank();
  else tones.placed();
  const maxI = Math.max(0, ...Object.values(pl.placed).map(p => p.i));
  upd(ctx, 'place', { placed: { ...pl.placed, [id]: { z: zone, i: maxI + 1 } }, sel: null, msg: null });
}

function confirm(ctx) {
  const pl = ctx.state.place;
  if (pl.result || Object.values(pl.placed).some(p => p.z === 'bank')) return;
  const res = {};
  let ok = 0;
  P.items.forEach(p => { res[p.id] = pl.placed[p.id].z === p.g; if (res[p.id]) ok++; });
  const tries = pl.tries + 1;
  if (ok === P.items.length) {
    sfx('correct');
    upd(ctx, 'place', { result: res, tries, msg: { ok: true, t: `Perfeito! Todas as ${P.items.length} opções no lugar certo.` } }, { ...streakOn(ctx, true), fx: { placeCheck: true } });
    later(ctx, 1200, () => finish(ctx, 7, { xp: 180, coins: 45 }));
    return;
  }
  const bad = P.items.length - ok;
  sfx('wrong');
  upd(ctx, 'place', { result: res, tries, msg: { ok: false, t: `${ok} de ${P.items.length} corretas. ${bad === 1 ? 'A opção errada volta' : `As ${bad} erradas voltam`} para as opções.` } }, { ...streakOn(ctx, false), fx: { placeCheck: true } });
  later(ctx, 1500, () => upd(ctx, 'place', s => {
    const placed = { ...s.placed };
    const locked = { ...s.locked };
    P.items.forEach(p => { if (res[p.id]) locked[p.id] = true; else placed[p.id] = { z: 'bank', i: placed[p.id].i }; });
    return { placed, locked, result: null };
  }));
}

const actions = {
  placeTap: (ctx, el, e) => {
    e.stopPropagation();
    if (dragged(ctx) || el.hasAttribute('data-fixed')) return;
    const id = el.dataset.id;
    sfx('click');
    upd(ctx, 'place', s => ({ sel: s.sel === id ? null : id }));
  },
  placeZone: (ctx, el) => { if (!dragged(ctx) && ctx.state.place.sel) put(ctx, ctx.state.place.sel, el.dataset.zone); },
  placeConfirm: ctx => confirm(ctx),
};

function footer(state) {
  if (state.justDone === 7) return null;
  const pl = state.place;
  const left = listOf(state, 'bank').length;
  const ready = !left && !pl.result;
  return { label: pl.result ? 'Conferindo…' : left ? `Confirmar (${left} restantes)` : 'Confirmar', action: 'placeConfirm', disabled: !ready };
}

export default {
  id: 7,
  key: 'place',
  init,
  view,
  actions,
  footer,
  mount: ctx => pointerDrag(ctx, {
    item: '[data-drag-place]',
    zone: '[data-drop-place]',
    enabled: el => ctx.state.view === 7 && !el.hasAttribute('data-fixed'),
    drop: (el, z) => { if (z) put(ctx, el.dataset.id, z.dataset.dropPlace); },
    ghostClass: 'c-act-ghost--chip',
  }),
  pct: s => Object.values(s.place.placed).filter(v => v.z !== 'bank').length / P.items.length,
  reset: s => (s.status[7] === 'done' ? init() : null),
};
