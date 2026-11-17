/* 10. Jogo dos 7 erros: duas versões da capa do curso; toca nas diferenças em qualquer uma. Achou: círculo verde;
   errou: marca vermelha. "Mostrar onde" (15 moedas) circula um erro. Todos: +200 pts, +50 moedas. */

import { cx } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { spot as S } from '../../data/activity.js';
import { upd, finish, later, fx, plural, toast, streakOn } from './flow.js';
import { sfx, tones } from '../../core/sound.js';
import { button } from '../../components/button.js';
import { pill } from '../../components/badges.js';

const TOL = 2.5;
const init = () => ({ found: [], miss: 0, missAt: null, hint: null, sec: 0, on: false, msg: null });

/** Círculo que envolve a diferença (em % da imagem, compensando a proporção). */
function circle(d) {
  const D = Math.max(d.w, d.h / S.ratio) + 4;
  return `left:${d.x + d.w / 2 - D / 2}%;top:${d.y + d.h / 2 - (D * S.ratio) / 2}%;width:${D}%`;
}

/** Recorte alterado da imagem (filtro, espelho ou área coberta por uma cor do tema). */
function patch(d) {
  const box = `left:${d.x}%;top:${d.y}%;width:${d.w}%;height:${d.h}%`;
  if (d.fill) return `<span class="c-act-spot__patch" style="${box};background-color:var(${d.fill});border-radius:${d.radius ?? '0'}"></span>`;
  const bg = `background-image:url('${S.image}');background-size:${10000 / d.w}% ${10000 / d.h}%;background-position:${(d.x / (100 - d.w)) * 100}% ${(d.y / (100 - d.h)) * 100}%`;
  return `<span class="c-act-spot__patch" style="${box};${bg};${d.filter ? `filter:${d.filter};` : ''}${d.flip ? 'transform:scaleX(-1);' : ''}${d.clip ? `clip-path:${d.clip};` : ''}"></span>`;
}

function picture(state, label, changed) {
  const sp = state.spot;
  const marks = sp.found.map(k => `<span class="${cx('c-act-spot__mark', fx(state, `spotFound${k}`) && 'is-in')}" style="${circle(S.diffs[k])}"></span>`).join('');
  const hint = sp.hint != null ? `<span class="c-act-spot__hint" style="${circle(S.diffs[sp.hint])}"></span>` : '';
  const miss = sp.missAt && fx(state, 'spotMiss') ? `<span class="c-act-spot__miss" style="left:${sp.missAt.x}%;top:${sp.missAt.y}%">${icon('x', 14)}</span>` : '';
  return `<div class="c-act-spot__side">
    <span class="c-act-spot__label">${label}</span>
    <div class="c-act-spot__pic" data-action="spotTap" style="background-image:url('${S.image}')">
      ${changed ? S.diffs.map(patch).join('') : ''}${marks}${hint}${miss}
    </div>
  </div>`;
}

function view(state) {
  const sp = state.spot;
  const done = sp.found.length === S.diffs.length;
  const dots = S.diffs.map((_, k) => `<span class="${cx('c-act-dot c-act-dot--sm', k < sp.found.length && 'is-ok')}"></span>`).join('');
  const hintOff = done || state.coins < S.hintCost || sp.hint != null;
  return `<section class="c-act-card c-act-spot" aria-label="Jogo dos 7 erros">
    <div class="c-act-card__bar c-act-card__bar--end">
      <div class="c-act-card__head"><span class="c-act-card__kicker">Toque nas diferenças em qualquer uma das imagens</span><h2 class="c-act-card__title">Encontre os 7 erros entre as imagens</h2></div>
      <div class="c-act-card__pills">
        ${pill({ color: 'grey', outline: true, html: `<span class="c-act-dots">${dots}</span><b class="c-act-tone--success">${sp.found.length}/${S.diffs.length}</b>`, attrs: { title: 'Erros encontrados' } })}
        ${pill({ color: sp.miss > 5 ? 'red' : 'grey', outline: true, label: plural(sp.miss, 'toque errado', 'toques errados') })}
      </div>
    </div>
    <div class="c-act-msg" aria-live="polite">${sp.msg ? toast(sp.msg.t, sp.msg.ok ? 'ok' : 'bad', fx(state, 'spotMsg')) : toast('Os erros podem estar em cores, formas, objetos a mais ou a menos')}</div>
    <div class="${cx('c-act-spot__board', done && 'is-done', done && fx(state, 'spotMsg') && 'is-glow')}">
      ${picture(state, 'Original', false)}
      ${picture(state, 'Encontre as diferenças', true)}
    </div>
    <div class="c-act-card__center">
      ${button({ variant: 'stroked', iconStart: 'help-circle', action: 'spotHint', disabled: hintOff, label: `Mostrar onde · ${S.hintCost} moedas` })}
    </div>
  </section>`;
}

function tap(ctx, el, e) {
  const sp = ctx.state.spot;
  if (sp.found.length === S.diffs.length) return;
  const r = el.getBoundingClientRect();
  const px = ((e.clientX - r.left) / r.width) * 100;
  const py = ((e.clientY - r.top) / r.height) * 100;
  const inside = d => px >= d.x - TOL && px <= d.x + d.w + TOL && py >= d.y - TOL * 1.8 && py <= d.y + d.h + TOL * 1.8;
  const i = S.diffs.findIndex((d, k) => !sp.found.includes(k) && inside(d));
  if (i >= 0) {
    const found = [...sp.found, i];
    const left = S.diffs.length - found.length;
    tones.found(found.length - 1);
    upd(ctx, 'spot', { found, on: true, hint: sp.hint === i ? null : sp.hint, msg: { ok: true, t: left ? `Achou! Faltam ${left} ${left > 1 ? 'erros' : 'erro'}.` : 'Você encontrou os 7 erros!' } }, { ...streakOn(ctx, true), fx: { [`spotFound${i}`]: true, spotMsg: true } });
    if (!left) {
      later(ctx, 300, () => sfx('victory'));
      later(ctx, 1500, () => finish(ctx, 10, { xp: 200, coins: 50 }));
    }
  } else if (S.diffs.some((d, k) => sp.found.includes(k) && inside(d))) {
    sfx('tick');
    upd(ctx, 'spot', { msg: { ok: true, t: 'Esse você já encontrou. Procure os outros!' } }, { fx: { spotMsg: true } });
  } else {
    const miss = sp.miss + 1;
    sfx('wrong');
    upd(ctx, 'spot', { miss, on: true, missAt: { x: px, y: py }, msg: { ok: false, t: miss >= 4 && sp.hint == null ? 'Não é aí. Que tal usar uma dica?' : 'Não é aí. Compare com calma as duas imagens.' } }, { ...streakOn(ctx, false), fx: { spotMiss: true, spotMsg: true } });
  }
}

function tick(ctx) {
  const sp = ctx.state.spot;
  if (!sp.on || sp.found.length === S.diffs.length) return;
  sp.sec += 1;
  const t = ctx.root.querySelector('[data-tick="elapsed"]');
  if (t) t.textContent = `${String(Math.floor(sp.sec / 60)).padStart(2, '0')}:${String(sp.sec % 60).padStart(2, '0')}`;
}

export default {
  id: 10,
  key: 'spot',
  init,
  view,
  actions: {
    spotTap: tap,
    spotHint: ctx => {
      const sp = ctx.state.spot;
      if (sp.found.length === S.diffs.length || ctx.state.coins < S.hintCost || sp.hint != null) return;
      const left = S.diffs.map((_, k) => k).filter(k => !sp.found.includes(k));
      sfx('click');
      upd(ctx, 'spot', { hint: left[Math.floor(Math.random() * left.length)], on: true, msg: { ok: true, t: 'Olhe dentro do círculo dourado.' } }, { coins: ctx.state.coins - S.hintCost, fx: { spotMsg: true } });
    },
  },
  footer: () => null,
  tick,
  elapsed: s => s.spot.sec,
  pct: s => s.spot.found.length / S.diffs.length,
  reset: s => (s.spot.found.length === S.diffs.length ? init() : null),
};
