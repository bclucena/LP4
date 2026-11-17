/* 6. Misturadinho: grade 5 x 4 de letras. Pressiona a 1ª letra e arrasta pelas vizinhas (inclusive diagonais) até formar a
   palavra que completa a frase. Voltar uma letra desfaz o último passo. Dica (15 moedas, até 2) destaca o começo do caminho.
   Acerto: +150 pts, +40 moedas. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { mix as M } from '../../data/activity.js';
import { upd, finish, later, fx, plural, toast } from './flow.js';
import { sfx, tones } from '../../core/sound.js';

const COLS = M.cols;
const ROWS = M.letters.length / COLS;
const adj = (a, b) => a !== b && Math.abs((a % COLS) - (b % COLS)) <= 1 && Math.abs(Math.floor(a / COLS) - Math.floor(b / COLS)) <= 1;
const point = i => `${(i % COLS) * 100 + 50},${Math.floor(i / COLS) * 100 + 50}`;
const init = () => ({ path: [], state: null, tries: 0, hint: 0, msg: null });

function view(state) {
  const x = state.mix;
  const ok = x.state === 'ok';
  const bad = x.state === 'bad';
  const hinted = x.hint > 0 && !ok ? M.path.slice(0, x.hint) : [];
  const blanks = Array.from({ length: M.answer.length }, (_, i) => {
    const ch = x.path[i] != null ? M.letters[x.path[i]] : '';
    return `<span class="${cx('c-act-mix__blank', ch && 'is-filled')}" data-blank="${i}"><span>${esc(ch)}</span></span>`;
  }).join('');
  const cells = M.letters.map((l, i) => `<span class="c-act-mix__cell"><span class="${cx('c-act-mix__letter', x.path.includes(i) && 'is-on', hinted.includes(i) && !x.path.includes(i) && 'is-hint')}" data-mix="${i}">${esc(l)}</span></span>`).join('');
  const msg = x.msg ? toast(esc(x.msg.t), x.msg.ok ? 'ok' : 'bad', fx(state, 'mixMsg'))
    : toast(hinted.length ? 'Dica: comece pela letra destacada' : 'Pressione a 1ª letra e arraste até a última');
  const hintOff = ok || x.hint >= 2 || state.coins < M.hintCost;
  return `<section class="c-act-card c-act-mix" aria-label="Misturadinho">
    <div class="c-act-card__bar">
      <span class="c-act-card__lead c-act-card__lead--muted">Arraste sobre as letras vizinhas para formar a palavra</span>
      <div class="c-act-card__pills"><span class="c-act-pill">${M.answer.length} letras</span><span class="c-act-pill">${plural(x.tries, 'tentativa errada', 'tentativas erradas')}</span></div>
    </div>
    <p class="c-act-mix__sentence">${esc(M.before)} <span class="${cx('c-act-mix__blanks', ok && 'is-ok', bad && 'is-bad', fx(state, 'mixBad') && 'is-shake')}">${blanks}</span>${esc(M.after)}</p>
    <div class="c-act-msg" aria-live="polite">${msg}</div>
    <div class="${cx('c-act-mix__board', ok && 'is-ok', bad && 'is-bad', fx(state, 'mixBad') && 'is-shake')}" data-mix-board style="--cols:${COLS};--rows:${ROWS}">
      <svg class="c-act-mix__line" viewBox="0 0 ${COLS * 100} ${ROWS * 100}" aria-hidden="true"><polyline points="${x.path.map(point).join(' ')}"/></svg>
      <div class="c-act-mix__grid">${cells}</div>
    </div>
    <div class="c-act-card__center">
      <button type="button" class="c-act-pill c-act-pill--warning c-act-pill--button c-act-pill--lg" data-action="mixHint" ${hintOff ? 'disabled' : ''}>${icon('help-circle', 16)}${x.hint >= 2 ? 'Dicas esgotadas' : x.hint === 1 ? `Mais uma letra · ${M.hintCost} moedas` : `Dica · ${M.hintCost} moedas`}</button>
    </div>
  </section>`;
}

/** Desenho do caminho: pinta letras, linha e lacunas direto no DOM; ao soltar, confere e atualiza o estado. */
function mount(ctx) {
  let path = null;
  let last = null;
  let blocked = null; // última letra recusada (o tique toca uma vez por letra)
  const at = (px, py) => {
    const el = document.elementFromPoint(px, py)?.closest('[data-mix]');
    return el && ctx.root.contains(el) ? Number(el.dataset.mix) : null;
  };
  const draw = () => {
    ctx.root.querySelectorAll('[data-mix]').forEach(el => {
      const i = Number(el.dataset.mix);
      el.classList.toggle('is-on', path.includes(i));
      el.classList.toggle('is-last', path[path.length - 1] === i);
      el.classList.toggle('is-near', !path.includes(i) && adj(path[path.length - 1], i));
    });
    ctx.root.querySelector('.c-act-mix__line polyline')?.setAttribute('points', path.map(point).join(' '));
    ctx.root.querySelectorAll('[data-blank]').forEach(el => {
      const i = Number(el.dataset.blank);
      const ch = path[i] != null ? M.letters[path[i]] : '';
      el.classList.toggle('is-filled', !!ch);
      el.firstElementChild.textContent = ch;
    });
    ctx.root.querySelector('[data-mix-board]')?.classList.add('is-drag');
  };
  const step = i => {
    const tail = path[path.length - 1];
    if (i == null || i === tail) return false;
    if (path.length > 1 && i === path[path.length - 2]) { path.pop(); tones.note(path.length - 1); return true; }
    if (path.includes(i)) return false;
    if (!adj(tail, i)) {
      if (blocked !== i) { blocked = i; sfx('tick'); }
      const el = ctx.root.querySelector(`[data-mix="${i}"]`);
      el?.classList.remove('is-blocked'); void el?.offsetWidth; el?.classList.add('is-blocked');
      return false;
    }
    path.push(i);
    blocked = null;
    tones.note(path.length - 1);
    return true;
  };

  ctx.listen('pointerdown', e => {
    const x = ctx.state.mix;
    if (ctx.state.view !== 6 || x.state === 'ok' || x.state === 'bad') return;
    const i = at(e.clientX, e.clientY);
    if (i == null) return;
    e.preventDefault();
    tones.note(0);
    path = [i];
    last = { x: e.clientX, y: e.clientY };
    ctx.state.mix.msg = null;
    draw();
  }, ctx.root);

  ctx.listen('pointermove', e => {
    if (!path) return;
    // Interpola entre os pontos para não pular células em movimentos rápidos.
    const n = Math.max(1, Math.ceil(Math.hypot(e.clientX - last.x, e.clientY - last.y) / 8));
    let changed = false;
    for (let k = 1; k <= n; k++) changed = step(at(last.x + ((e.clientX - last.x) * k) / n, last.y + ((e.clientY - last.y) * k) / n)) || changed;
    last = { x: e.clientX, y: e.clientY };
    if (changed) draw();
  }, window);

  ctx.listen('pointerup', () => {
    if (!path) return;
    const p = path;
    path = null;
    const x = ctx.state.mix;
    if (p.length < 2) { upd(ctx, 'mix', { path: [], state: null }); return; }
    const word = p.map(i => M.letters[i]).join('');
    if (word === M.answer) {
      sfx('correct');
      upd(ctx, 'mix', { path: p, state: 'ok', msg: { ok: true, t: `Isso! A palavra é ${M.answer}.` } }, { fx: { mixMsg: true } });
      later(ctx, 1100, () => finish(ctx, 6, { xp: 150, coins: 40 }));
      return;
    }
    const t = M.answer.startsWith(word) ? `${word} é o começo certo, continue até o fim!`
      : word.length !== M.answer.length ? `${word} tem ${word.length} letras · a resposta tem ${M.answer.length}`
        : `${word} não completa a frase. Tente outro caminho`;
    sfx('wrong');
    upd(ctx, 'mix', { path: p, state: 'bad', tries: x.tries + 1, msg: { ok: false, t } }, { fx: { mixMsg: true, mixBad: true } });
    later(ctx, 700, () => upd(ctx, 'mix', { path: [], state: null }));
  }, window);
}

export default {
  id: 6,
  key: 'mix',
  init,
  view,
  actions: {
    mixHint: ctx => {
      const x = ctx.state.mix;
      if (x.state === 'ok' || x.hint >= 2 || ctx.state.coins < M.hintCost) return;
      sfx('click');
      upd(ctx, 'mix', { hint: x.hint + 1, msg: null }, { coins: ctx.state.coins - M.hintCost });
    },
  },
  footer: () => null,
  mount,
  pct: s => {
    const x = s.mix;
    if (x.state === 'ok') return 1;
    let k = 0;
    while (k < x.path.length && M.letters[x.path[k]] === M.answer[k]) k++;
    return k / M.answer.length;
  },
  reset: s => (s.mix.state === 'ok' ? init() : null),
};
