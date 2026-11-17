/* 11. This or that: 5 rodadas com duas alternativas (A ou B, também pelas teclas A/B, 1/2 ou setas; Enter confirma).
   Acerto soma 10 + 2 por sequência; erro tira uma vida. No fim: +150 pts, +40 moedas. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { thisOrThat as TT } from '../../data/activity.js';
import { upd, finish, fx } from './flow.js';
import { sfx } from '../../core/sound.js';
import { pill } from '../../components/badges.js';
import { feedback } from '../../components/feedback.js';

const init = () => ({ i: 0, pick: null, rev: false, res: [] });

function card(state, k) {
  const t = state.tt;
  const q = TT[t.i];
  const picked = t.pick === k;
  const right = q.c === k;
  const st = !t.rev ? (picked ? 'sel' : 'idle') : right ? 'right' : picked ? 'wrong' : 'off';
  const anim = fx(state, 'ttReveal') && (st === 'right' || st === 'wrong');
  return `<button type="button" class="${cx('c-act-tt__card', `is-${st}`, anim && 'is-anim')}" data-action="ttSelect" data-k="${k}" aria-pressed="${picked}" aria-label="Alternativa ${k.toUpperCase()}: ${esc(q[k])}" ${t.rev ? 'tabindex="-1"' : ''}>
    <span class="c-act-tt__banner">
      <span class="c-act-tt__key">tecla ${k.toUpperCase()}</span>
      <span class="c-act-tt__ring">${t.rev && (right || picked) ? icon(right ? 'check' : 'x', 40) : `<span>${k.toUpperCase()}</span>`}</span>
    </span>
    <span class="c-act-tt__text">${esc(q[k])}</span>
    ${t.rev && (right || picked) ? `<span class="c-act-tt__tag c-act-tt__tag--${right ? 'ok' : 'bad'}">${right ? 'Correta' : 'Incorreta'}</span>` : ''}
  </button>`;
}

function view(state) {
  const t = state.tt;
  const q = TT[t.i];
  const ok = t.rev && t.pick === q.c;
  const fb = t.rev
    ? feedback({ tone: ok ? 'success' : 'error', title: ok ? 'Isso!' : 'Não foi dessa vez.', text: q.e, className: cx('c-act-tt__feedback', fx(state, 'ttReveal') && 'is-in') })
    : '<span class="c-act-card__lead c-act-card__lead--muted">Toque num card ou use as teclas A e B · Enter confirma</span>';
  return `<section class="c-act-card c-act-tt" aria-label="This or that">
    <div class="c-act-card__bar c-act-card__bar--right">
      <div class="c-act-card__pills">${pill({ color: 'grey', label: `${t.i + 1} de ${TT.length}` })}${pill({ color: 'green', iconName: 'check', label: `${t.res.filter(Boolean).length} acertos` })}</div>
    </div>
    <div class="c-act-card__head">
      <span class="c-act-card__kicker">Escolha uma das alternativas</span>
      <h2 class="c-act-card__title c-act-card__title--lg">${esc(q.q)}</h2>
    </div>
    <div class="c-act-tt__cards">${card(state, 'a')}<span class="c-act-tt__or" aria-hidden="true">ou</span>${card(state, 'b')}</div>
    <div class="c-act-tt__fb" aria-live="polite">${fb}</div>
  </section>`;
}

function select(ctx, k) {
  const t = ctx.state.tt;
  if (t.rev || t.pick === k) return;
  sfx('click');
  upd(ctx, 'tt', { pick: k });
}

function act(ctx) {
  const s = ctx.state;
  const t = s.tt;
  const q = TT[t.i];
  if (!t.rev) {
    if (!t.pick) return;
    const ok = t.pick === q.c;
    sfx(ok ? 'correct' : 'wrong');
    const streak = ok ? s.streak + 1 : 0;
    ctx.set({ tt: { ...t, rev: true, res: [...t.res, ok] }, streak, xp: s.xp + (ok ? 10 + streak * 2 : 0), lives: ok ? s.lives : Math.max(0, s.lives - 1), fx: { ttReveal: true } });
    return;
  }
  if (t.i + 1 < TT.length) { sfx('flip'); upd(ctx, 'tt', { i: t.i + 1, pick: null, rev: false }); return; }
  finish(ctx, 11, { xp: 150, coins: 40 });
}

export default {
  id: 11,
  key: 'tt',
  init,
  view,
  actions: { ttSelect: (ctx, el) => select(ctx, el.dataset.k), ttAct: ctx => act(ctx) },
  footer: s => {
    if (s.justDone === 11) return null;
    const t = s.tt;
    return { label: !t.rev ? 'Confirmar' : t.i + 1 >= TT.length ? 'Ver resultado' : 'Próxima', action: 'ttAct', disabled: !t.rev && !t.pick };
  },
  keys: (ctx, e) => {
    const k = e.key.toLowerCase();
    if (['a', '1', 'arrowleft'].includes(k)) { select(ctx, 'a'); return true; }
    if (['b', '2', 'arrowright'].includes(k)) { select(ctx, 'b'); return true; }
    if (k === 'enter' && ctx.state.justDone !== 11) { act(ctx); return true; }
    return false;
  },
  pct: s => s.tt.res.length / TT.length,
  reset: s => (s.status[11] === 'done' ? init() : null),
};
