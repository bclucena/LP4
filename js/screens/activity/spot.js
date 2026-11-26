/* 10. Jogo dos 7 erros: duas versões da capa do curso; toca nas diferenças em qualquer uma. Achou: círculo verde;
   errou: marca vermelha. "Mostrar onde" (15 moedas) circula um erro. Todos: +200 pts, +50 moedas. */

import { cx } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { spot as S } from '../../data/activity.js';
import { upd, finish, later, fx, plural, toast, streakOn, verdict, defaultFooter } from './flow.js';
import { sfx, tones } from '../../core/sound.js';
import { button } from '../../components/button.js';
import { pill } from '../../components/badges.js';
import { head } from './head.js';

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
  return `<section class="c-act-card c-act-spot" aria-label="Jogo dos 7 erros">
    ${head({ mech: 'Jogo dos 7 erros', task: 'Encontre as diferenças', how: 'Toque nas diferenças em qualquer uma das imagens', title: 'Encontre os 7 erros entre as imagens', aside: `
        ${pill({ color: 'grey', outline: true, html: `<span class="c-act-dots">${dots}</span><b class="c-act-tone--success">${sp.found.length}/${S.diffs.length}</b>`, attrs: { title: 'Erros encontrados' } })}
        ${pill({ color: sp.miss > 5 ? 'red' : 'grey', outline: true, label: plural(sp.miss, 'toque errado', 'toques errados') })}
      ` })}
    ${sp.msg?.tip ? `<div class="c-act-msg" aria-live="polite">${toast(sp.msg.t, 'ok', fx(state, 'spotMsg'))}</div>` : ''}
    <div class="${cx('c-act-spot__board', done && 'is-done', done && fx(state, 'spotMsg') && 'is-glow')}">
      ${picture(state, 'Original', false)}
      ${picture(state, 'Encontre as diferenças', true)}
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
    upd(ctx, 'spot', { msg: { ok: true, tip: true, t: 'Esse você já encontrou. Procure os outros!' } }, { fx: { spotMsg: true } });
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

/** Ajuda no rodapé: Mostrar onde (circula um erro). */
function aux(state) {
  const sp = state.spot;
  const done = sp.found.length === S.diffs.length;
  return [{ icon: 'help-circle', action: 'spotHint', disabled: done || state.coins < S.hintCost || sp.hint != null, label: `Mostrar onde · ${S.hintCost} moedas` }];
}

export default {
  id: 10,
  aux,
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
      upd(ctx, 'spot', { hint: left[Math.floor(Math.random() * left.length)], on: true, msg: { ok: true, tip: true, t: 'Olhe dentro do círculo dourado.' } }, { coins: ctx.state.coins - S.hintCost, fx: { spotMsg: true } });
    },
  },
  footer: s => {
    const sp = s.spot;
    if (!sp.msg || sp.msg.tip) return null;
    const done = sp.found.length === S.diffs.length;
    return { ...defaultFooter(s), ...verdict(sp.msg.ok, { title: done ? 'Concluído!' : undefined, why: sp.msg.t }) };
  },
  tick,
  elapsed: s => s.spot.sec,
  pct: s => s.spot.found.length / S.diffs.length,
  reset: s => (s.spot.found.length === S.diffs.length ? init() : null),
};
