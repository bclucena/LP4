/* 5. Memória: 12 cartas (6 pares de tags). Vira duas por vez; par certo fica aberto, errado treme e fecha.
   Combo para pares seguidos. Todos os pares: +200 pts, +50 moedas. O tempo corre na barra de desempenho. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { memoryCards as MEM } from '../../data/activity.js';
import { logo } from '../../shell/shell.js';
import { finish, later, fx, shuffle, plural, toast } from './flow.js';
import { sfx } from '../../core/sound.js';

const init = () => ({ deck: shuffle([...MEM, ...MEM]).map((m, uid) => ({ ...m, uid })), open: [], matched: [], wrong: [], moves: 0, sec: 0, on: false, msg: null, combo: 0 });

function view(state) {
  const m = state.mem;
  const cards = m.deck.map(c => {
    const matched = m.matched.includes(c.id);
    const up = matched || m.open.includes(c.uid);
    const wrong = m.wrong.includes(c.uid);
    const flipping = fx(state, `memFlip${c.uid}`);
    const closing = fx(state, `memClose${c.uid}`);
    return `<button type="button" class="${cx('c-act-mem__card', up && 'is-up', flipping && 'is-flipping', closing && 'is-closing', wrong && 'is-wrong', matched && 'is-matched', fx(state, `memPair${c.id}`) && 'is-pop')}" data-action="memFlip" data-uid="${c.uid}" ${up ? 'aria-disabled="true"' : ''} aria-label="${up ? `${esc(c.label)}${matched ? ', par encontrado' : ', virada'}` : 'Carta virada para baixo'}">
      <span class="c-act-mem__inner">
        <span class="c-act-mem__face c-act-mem__face--back"><span class="c-act-mem__logo">${logo()}</span></span>
        <span class="c-act-mem__face c-act-mem__face--front"><span class="c-act-mem__art c-act-mem__art--${c.tone}">${icon(c.icon, 26)}<span>${esc(c.label)}</span></span>
          ${matched ? `<span class="c-act-badge c-act-badge--ok${fx(state, `memPair${c.id}`) ? ' is-in' : ''}">${icon('check', 12)}</span>` : ''}</span>
      </span>
    </button>`;
  }).join('');
  const msg = m.msg ? toast(esc(m.msg.t), m.msg.ok ? 'ok' : 'bad', fx(state, 'memMsg')) : toast('Vire duas cartas por vez para encontrar os pares');
  return `<section class="c-act-card c-act-mem" aria-label="Jogo da memória">
    <div class="c-act-card__bar c-act-card__bar--end">
      <div class="c-act-card__head"><span class="c-act-card__kicker">Jogo da memória</span><h2 class="c-act-card__title">Encontre os pares de cartas iguais</h2></div>
      <div class="c-act-card__pills">
        <span class="c-act-pill c-act-pill--success">${icon('check', 14)}Pares ${m.matched.length}/${MEM.length}</span>
        <span class="c-act-pill c-act-pill--outline">${plural(m.moves, 'jogada', 'jogadas')}</span>
        <button type="button" class="c-act-pill c-act-pill--system c-act-pill--button" data-action="memReset" title="Embaralhar e recomeçar">${icon('rotate-ccw', 14)}Recomeçar</button>
      </div>
    </div>
    <div class="c-act-msg" aria-live="polite">${msg}</div>
    <div class="c-act-mem__grid">${cards}</div>
  </section>`;
}

function flip(ctx, uid) {
  const m = ctx.state.mem;
  const card = m.deck.find(c => c.uid === uid);
  if (!card || m.open.length >= 2 || m.open.includes(uid) || m.matched.includes(card.id)) return;
  const open = [...m.open, uid];
  sfx('flip');
  if (open.length === 1) {
    ctx.set({ mem: { ...m, open, on: true }, fx: { [`memFlip${uid}`]: true } });
    return;
  }
  const first = m.deck.find(c => c.uid === open[0]);
  const moves = m.moves + 1;
  if (first.id === card.id) {
    const matched = [...m.matched, card.id];
    const combo = m.combo + 1;
    const t = combo > 1 ? `Combo x${combo}! Par ${card.label} encontrado` : `Boa! Par ${card.label} encontrado`;
    ctx.set({ mem: { ...m, open: [], matched, moves, combo, msg: { ok: true, t } }, fx: { [`memFlip${uid}`]: true, memMsg: true } });
    later(ctx, 350, () => sfx('pair'));
    later(ctx, 450, () => ctx.set({ fx: { [`memPair${card.id}`]: true } }));
    if (matched.length === MEM.length) {
      later(ctx, 900, () => {
        ctx.set(s => ({ mem: { ...s.mem, on: false, msg: { ok: true, t: `Todos os pares em ${moves} jogadas!` } }, fx: { memMsg: true } }));
        finish(ctx, 5, { xp: 200, coins: 50 });
      });
    }
    return;
  }
  ctx.set({ mem: { ...m, open, moves, combo: 0 }, fx: { [`memFlip${uid}`]: true } });
  later(ctx, 450, () => sfx('wrong'));
  later(ctx, 450, () => ctx.set(s => ({ mem: { ...s.mem, wrong: open, msg: { ok: false, t: 'Não formam par. Memorize as posições!' } }, fx: { memMsg: true } })));
  later(ctx, 1300, () => ctx.set(s => ({ mem: { ...s.mem, open: [], wrong: [] }, fx: Object.fromEntries(open.map(u => [`memClose${u}`, true])) })));
}

/** Segundos de jogo (sobem enquanto a partida está em andamento). */
function tick(ctx) {
  const m = ctx.state.mem;
  if (!m.on || m.matched.length === MEM.length) return;
  m.sec += 1;
  const t = ctx.root.querySelector('[data-tick="elapsed"]');
  if (t) t.textContent = `${String(Math.floor(m.sec / 60)).padStart(2, '0')}:${String(m.sec % 60).padStart(2, '0')}`;
}

export default {
  id: 5,
  key: 'mem',
  init,
  view,
  actions: {
    memFlip: (ctx, el) => flip(ctx, Number(el.dataset.uid)),
    memReset: ctx => { sfx('click'); ctx.set({ mem: init() }); },
  },
  footer: () => null,
  tick,
  elapsed: s => s.mem.sec,
  pct: s => s.mem.matched.length / MEM.length,
  reset: s => (s.mem.matched.length === MEM.length ? init() : null),
};
