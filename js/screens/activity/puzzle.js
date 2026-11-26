/* 9. Quebra-cabeça: a capa do curso em 12 peças (4 x 3). Toca em duas peças (ou arrasta uma sobre a outra) para trocá-las;
   peça no lugar certo trava com ✓. "Segure para espiar" mostra a imagem inteira; "Encaixar uma" custa 15 moedas.
   Imagem completa: +220 pts, +55 moedas. O tempo corre na barra de desempenho. */

import { cx } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { puzzle as Z } from '../../data/activity.js';
import { upd, finish, later, fx, plural, toast, streakOn, verdict, defaultFooter } from './flow.js';
import { pointerDrag, dragged } from './drag.js';
import { sfx, tones } from '../../core/sound.js';
import { button } from '../../components/button.js';
import { pill } from '../../components/badges.js';
import { head } from './head.js';

const N = Z.cols * Z.rows;
const pos = p => `${((p % Z.cols) / (Z.cols - 1)) * 100}% ${(Math.floor(p / Z.cols) / (Z.rows - 1)) * 100}%`;

/** Embaralha só as peças fora do lugar, garantindo que nenhuma caia na própria posição. */
function scramble(keep) {
  const o = keep ? [...keep] : Array.from({ length: N }, (_, i) => i);
  const free = o.map((_, i) => i).filter(i => !keep || o[i] !== i);
  let ps = free.map(i => o[i]);
  for (let t = 0; t < 50; t++) { ps = ps.sort(() => Math.random() - 0.5); if (ps.every((p, k) => p !== free[k])) break; }
  free.forEach((i, k) => { o[i] = ps[k]; });
  return o;
}

const init = () => ({ order: scramble(), moves: 0, sel: null, sec: 0, on: false, msg: null, snap: [], done: false });

function view(state) {
  const z = state.puz;
  const n = z.order.filter((p, i) => p === i).length;
  const cells = z.order.map((p, i) => {
    const locked = p === i;
    return `<button type="button" class="${cx('c-act-puz__piece', locked && 'is-locked', z.sel === i && 'is-selected', fx(state, 'puzSnap') && z.snap.includes(i) && 'is-snap')}" data-action="puzTap" data-slot="${i}" data-drag-puz data-drop-puz="${i}" ${locked || z.done ? 'data-fixed' : ''} aria-label="Peça na posição ${i + 1}${locked ? ', no lugar certo' : z.sel === i ? ', selecionada' : ''}" style="background-image:url('${Z.image}');background-position:${pos(p)}">
      ${locked ? `<span class="c-act-badge c-act-badge--ok c-act-badge--sm${fx(state, 'puzSnap') && z.snap.includes(i) ? ' is-in' : ''}">${icon('check', 10)}</span>` : ''}
    </button>`;
  }).join('');
  return `<section class="c-act-card c-act-puz" aria-label="Quebra-cabeça">
    ${head({ mech: 'Quebra-cabeça', task: 'Monte a imagem', how: 'Arraste uma peça sobre outra ou toque em duas peças para trocá-las', title: 'Reorganize as peças e monte a imagem do curso de LGPD', aside: `${pill({ color: 'green', iconName: 'check', label: `${n}/${N} no lugar` })}${pill({ color: 'grey', outline: true, label: plural(z.moves, 'troca', 'trocas') })}` })}
    <div class="c-act-card__center">
      <div class="${cx('c-act-puz__board', z.done && 'is-done', z.done && fx(state, 'puzSnap') && 'is-glow')}" data-puz-board>
        <div class="c-act-puz__grid">${cells}</div>
        <div class="c-act-puz__peek" aria-hidden="true" style="background-image:url('${Z.image}')"></div>
      </div>
    </div>
  </section>`;
}

function swap(ctx, a, b, hint = false) {
  const z = ctx.state.puz;
  const o = [...z.order];
  if (o[a] === a || o[b] === b) { sfx('tick'); upd(ctx, 'puz', { sel: null }); return; }
  [o[a], o[b]] = [o[b], o[a]];
  const newly = [a, b].filter(i => o[i] === i);
  const left = N - o.filter((p, i) => p === i).length;
  if (newly.length) tones.piece(N - left);
  else sfx('flip');
  const moves = z.moves + (hint ? 0 : 1);
  const msg = !left ? { ok: true, t: `Imagem completa em ${moves} trocas!` }
    : newly.length ? { ok: true, t: `${hint ? 'Dica usada: ' : newly.length === 2 ? 'Duas de uma vez! ' : 'Encaixou! '}Faltam ${left} ${left > 1 ? 'peças' : 'peça'}.` }
      : { ok: false, t: 'Trocou, mas nenhuma ficou no lugar. Observe bordas e cores vizinhas.' };
  // Sequência: troca que encaixa peça soma, troca que não encaixa nenhuma zera; a dica não conta.
  const streak = hint ? {} : streakOn(ctx, newly.length > 0);
  upd(ctx, 'puz', { order: o, sel: null, moves, snap: newly, msg, on: true, done: !left }, { ...streak, fx: { puzSnap: true } });
  if (!left) {
    later(ctx, 300, () => sfx('victory'));
    later(ctx, 1600, () => finish(ctx, 9, { xp: 220, coins: 55 }));
  }
}

const actions = {
  puzTap: (ctx, el) => {
    if (dragged(ctx) || el.hasAttribute('data-fixed')) return;
    const i = Number(el.dataset.slot);
    const sel = ctx.state.puz.sel;
    if (sel == null) { sfx('click'); upd(ctx, 'puz', { sel: i, on: true }); }
    else if (sel === i) { sfx('click'); upd(ctx, 'puz', { sel: null }); }
    else swap(ctx, sel, i);
  },
  puzHint: ctx => {
    const z = ctx.state.puz;
    if (z.done || ctx.state.coins < Z.hintCost) return;
    const wrong = z.order.map((_, i) => i).filter(i => z.order[i] !== i);
    if (!wrong.length) return;
    const target = wrong[Math.floor(Math.random() * wrong.length)];
    ctx.state.coins -= Z.hintCost;
    swap(ctx, z.order.indexOf(target), target, true);
  },
  puzShuffle: ctx => { sfx('flip'); upd(ctx, 'puz', z => ({ order: scramble(z.order), sel: null, msg: null })); },
};

function mount(ctx) {
  pointerDrag(ctx, {
    item: '[data-drag-puz]',
    zone: '[data-drop-puz]',
    enabled: el => ctx.state.view === 9 && !el.hasAttribute('data-fixed'),
    drop: (el, z) => { if (z && z !== el) swap(ctx, Number(el.dataset.slot), Number(z.dataset.dropPuz)); },
    ghostClass: 'c-act-ghost--piece',
    hoverSound: true,
  });
  // "Segure para espiar": mostra a imagem inteira enquanto o botão estiver pressionado.
  const peek = on => ctx.root.querySelector('[data-puz-board]')?.classList.toggle('is-peek', on);
  ctx.listen('pointerdown', e => { if (e.target.closest('[data-peek]')) peek(true); }, ctx.root);
  ctx.listen('pointerup', () => peek(false), window);
  ctx.listen('pointercancel', () => peek(false), window);
}

function tick(ctx) {
  const z = ctx.state.puz;
  if (!z.on || z.done) return;
  z.sec += 1;
  const t = ctx.root.querySelector('[data-tick="elapsed"]');
  if (t) t.textContent = `${String(Math.floor(z.sec / 60)).padStart(2, '0')}:${String(z.sec % 60).padStart(2, '0')}`;
}

/** Ajudas no rodapé: Segure para espiar (o toque é tratado em mount: [data-peek]), Encaixar uma e Reembaralhar. */
function aux(state) {
  const z = state.puz;
  return [
    { icon: 'eye', label: 'Segure para espiar', data: { peek: '' } },
    { icon: 'help-circle', action: 'puzHint', disabled: z.done || state.coins < Z.hintCost, label: `Encaixar uma · ${Z.hintCost} moedas` },
    { icon: 'shuffle', label: 'Reembaralhar', action: 'puzShuffle', disabled: z.done },
  ];
}

export default {
  id: 9,
  aux,
  key: 'puz',
  init,
  view,
  actions,
  footer: s => (s.puz.msg ? { ...defaultFooter(s), ...verdict(s.puz.msg.ok, { title: s.puz.done ? 'Concluído!' : undefined, why: s.puz.msg.t }) } : null),
  mount,
  tick,
  elapsed: s => s.puz.sec,
  pct: s => s.puz.order.filter((x, i) => x === i).length / N,
  reset: s => (s.puz.done ? init() : null),
};
