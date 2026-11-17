/* 14. Mosaico: seleciona todos os cards que respondem à questão (os 4 princípios das WCAG). "Confirmar" revela certo,
   errado e o que faltou (em amarelo). Perfeito: +160 pts, +40 moedas; parcial pontua proporcionalmente. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { mosaic as M } from '../../data/activity.js';
import { upd, finish, later, fx, toast, streakOn } from './flow.js';
import { pill } from '../../components/badges.js';
import { head } from './head.js';

const TOTAL = M.cards.filter(c => c.ok).length;
const BADGE = { sel: ['system', 'check'], ok: ['ok', 'check'], bad: ['bad', 'x'], miss: ['warn', 'alert-circle'] };

function view(state) {
  const m = state.mos;
  const n = m.sel.length;
  const okN = m.sel.filter(i => M.cards[i].ok).length;
  const badN = n - okN;
  const missN = M.cards.filter((c, i) => c.ok && !m.sel.includes(i)).length;
  const perfect = m.rev && !badN && !missN;
  const cards = M.cards.map((c, i) => {
    const on = m.sel.includes(i);
    const st = !m.rev ? (on ? 'sel' : 'idle') : on ? (c.ok ? 'ok' : 'bad') : c.ok ? 'miss' : 'off';
    const b = BADGE[st];
    return `<button type="button" class="${cx('c-act-mos__card', `is-${st}`, m.rev && fx(state, 'mosRev') && 'is-anim')}" data-action="mosToggle" data-i="${i}" aria-pressed="${on}" aria-label="${esc(c.l)}${{ sel: ', selecionado', ok: ', correto', bad: ', incorreto', miss: ', correto não selecionado' }[st] ?? ''}" ${m.rev ? 'tabindex="-1"' : ''}>
      <span class="c-act-mos__face">${icon(c.icon, 28)}<span>${esc(c.l)}</span></span>
      ${b ? `<span class="c-act-badge c-act-badge--${b[0]}${fx(state, 'mosRev') || fx(state, `mosSel${i}`) ? ' is-in' : ''}">${icon(b[1], 12)}</span>` : ''}
    </button>`;
  }).join('');
  const msg = !m.rev ? toast(n ? 'Você pode selecionar quantos cards quiser' : 'Toque nos cards para selecioná-los')
    : toast(perfect ? 'Perfeito! Você encontrou os 4 princípios: perceptível, operável, compreensível e robusto.'
      : `Você acertou ${okN} de ${TOTAL}. Os 4 princípios são perceptível, operável, compreensível e robusto${missN ? ' (os que faltaram estão em amarelo)' : ''}.`,
    perfect ? 'ok' : badN ? 'bad' : 'warn', fx(state, 'mosRev'));
  return `<section class="c-act-card c-act-mos" aria-label="Mosaico">
    ${head({ kicker: 'Selecione todos os cards que respondem à questão', title: esc(M.question), aside: pill({ color: n ? 'system' : 'grey', label: `${n} ${n === 1 ? 'selecionado' : 'selecionados'}` }) })}
    <div class="c-act-mos__grid">${cards}</div>
    ${m.rev ? `<div class="c-act-card__center c-act-card__center--wrap">
      ${pill({ color: 'green', html: `<span class="c-act-dot c-act-dot--xs is-ok"></span>${okN} ${okN === 1 ? 'correto' : 'corretos'}` })}
      ${pill({ color: 'red', html: `<span class="c-act-dot c-act-dot--xs is-bad"></span>${badN} ${badN === 1 ? 'incorreto' : 'incorretos'}` })}
      ${pill({ color: 'yellow', html: `<span class="c-act-dot c-act-dot--xs is-warn"></span>${missN} faltando` })}
    </div>` : ''}
    <div class="c-act-msg" aria-live="polite">${msg}</div>
  </section>`;
}

function confirm(ctx) {
  const m = ctx.state.mos;
  if (m.rev || !m.sel.length) return;
  const okN = m.sel.filter(i => M.cards[i].ok).length;
  const badN = m.sel.length - okN;
  const perfect = okN === TOTAL && !badN;
  const pts = perfect ? 160 : Math.round((160 * Math.max(0, okN - badN)) / TOTAL);
  upd(ctx, 'mos', { rev: true }, { ...streakOn(ctx, perfect), fx: { mosRev: true } });
  later(ctx, 900, () => finish(ctx, 14, { xp: pts, coins: perfect ? 40 : 0 }));
}

export default {
  id: 14,
  key: 'mos',
  init: () => ({ sel: [], rev: false }),
  view,
  actions: {
    mosToggle: (ctx, el) => {
      if (ctx.state.mos.rev) return;
      const i = Number(el.dataset.i);
      upd(ctx, 'mos', m => ({ sel: m.sel.includes(i) ? m.sel.filter(x => x !== i) : [...m.sel, i] }), { fx: { [`mosSel${i}`]: true } });
    },
    mosConfirm: ctx => confirm(ctx),
  },
  footer: s => (s.justDone === 14 || s.mos.rev ? null : { label: 'Confirmar', action: 'mosConfirm', disabled: !s.mos.sel.length }),
  pct: s => Math.min(1, s.mos.sel.length / TOTAL) * 0.8,
  reset: s => (s.status[14] === 'done' ? { sel: [], rev: false } : null),
};
