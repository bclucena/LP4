/* 4. Emparedado (forca): descubra "leitores de tela" letra a letra. Cada erro sobe o muro em frente ao personagem;
   5 erros = emparedado (perde uma vida e pode tentar de novo). Dica revela uma letra por 20 moedas (até 2).
   Funciona com o teclado na tela e com o teclado físico. Vitória: +250 pts, +60 moedas. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { hangman as H, KEY_ROWS } from '../../data/activity.js';
import { finish, later, fx, plural } from './flow.js';
import { sfx } from '../../core/sound.js';
import { button } from '../../components/button.js';
import { pill } from '../../components/badges.js';

const ANSWER = H.answer.toUpperCase();
const LETTERS = ANSWER.replace(/ /g, '');
const init = () => ({ guessed: [], won: false, last: null, hints: 0 });
const errorsOf = g => g.filter(k => !ANSWER.includes(k)).length;

function view(state) {
  const h = state.hang;
  const err = errorsOf(h.guessed);
  const lost = err >= H.maxErrors;
  const left = H.maxErrors - err;
  const L = h.last;
  const missFx = fx(state, 'hangKey') && L && !L.hit;
  const revealed = [...LETTERS].filter(c => h.guessed.includes(c)).length;
  const hintOff = h.won || lost || state.coins < H.hintCost || h.hints >= H.maxHints;
  const wall = h.won ? 8 : 14 + (err / H.maxErrors) * 86;

  let idx = -1;
  const slots = H.answer.split(' ').map(word => `<span class="c-act-hang__word">${[...word].map(ch => {
    idx += 1;
    const C = ch.toUpperCase();
    const shown = h.guessed.includes(C);
    const fresh = fx(state, 'hangKey') && L?.hit && L.k === C;
    return `<span class="${cx('c-act-hang__slot', shown && 'is-shown', lost && !shown && 'is-missed', h.won && 'is-won', fresh && 'is-fresh')}" style="--i:${idx}"><span>${shown || lost ? esc(ch) : ''}</span></span>`;
  }).join('')}</span>`).join('');

  const keyboard = KEY_ROWS.map(row => `<div class="c-act-keys__row" style="--n:${row.length}">${[...row].map(k => {
    const used = h.guessed.includes(k);
    const hit = used && ANSWER.includes(k);
    const off = used || lost || h.won;
    return `<button type="button" class="${cx('c-act-key', hit && 'is-hit', used && !hit && 'is-miss', (lost || h.won) && !used && 'is-off', fx(state, 'hangKey') && L?.k === k && 'is-pressed')}" data-action="hangGuess" data-k="${k}" ${off ? 'disabled' : ''} aria-label="${k}${hit ? ', correta' : used ? ', errada' : ''}">${k}</button>`;
  }).join('')}</div>`).join('');

  const toastHtml = !L
    ? '<span class="c-act-hang__idle">Toque nas teclas ou use o teclado do computador</span>'
    : !h.won && !lost
      ? `<span class="${cx('c-act-toast', L.hit ? 'c-act-toast--ok' : 'c-act-toast--bad', fx(state, 'hangKey') && 'is-in')}">${icon(L.hit ? 'check-circle' : 'x-circle', 16)}${L.hit ? `${L.hint ? 'Dica: ' : 'Boa! '}a letra ${L.k} aparece ${L.count > 1 ? `${L.count} vezes` : '1 vez'}` : `Não tem ${L.k} · o muro subiu`}</span>`
      : '';

  return `<section class="c-act-card c-act-hang" aria-label="Emparedado">
    <div class="c-act-card__head">
      <span class="c-act-card__kicker">Descubra a palavra</span>
      <h2 class="c-act-card__title">${esc(H.question)}</h2>
      <div class="c-act-card__bar">
        <div class="c-act-card__pills">
          ${pill({ color: 'grey', label: `${H.answer.split(' ').length} palavras · ${LETTERS.length} letras` })}
          ${pill({ color: 'grey', label: `${revealed}/${LETTERS.length} descobertas` })}
        </div>
        ${button({ variant: 'stroked', size: 'mobile', iconStart: 'help-circle', action: 'hangHint', disabled: hintOff, title: 'Revela uma letra da resposta', label: h.hints >= H.maxHints ? 'Dicas esgotadas' : `Dica · ${H.hintCost} moedas` })}
      </div>
    </div>
    <div class="c-act-hang__layout">
      <div class="c-act-hang__stage">
        <div class="${cx('c-act-hang__frame', lost && 'is-lost', h.won && 'is-won', !lost && !h.won && left === 1 && 'is-warn', missFx && 'is-shake')}">
          <div class="c-act-hang__scene">
            <img class="c-act-hang__hero" src="${esc(H.image)}" alt="Personagem" />
            <div class="c-act-hang__wall" style="height:${wall}%"></div>
            ${missFx ? '<div class="c-act-hang__flash"></div>' : ''}
            ${h.won ? `<span class="c-act-hang__escaped">${icon('check', 14)}Você escapou!</span>` : ''}
          </div>
        </div>
        <div class="c-act-hang__tries">
          <span class="c-act-dots" aria-hidden="true">${Array.from({ length: H.maxErrors }, (_, i) => `<span class="${cx('c-act-dot', i < err && 'is-bad', !lost && left === 1 && i >= err && 'is-pulse')}"></span>`).join('')}</span>
          <span class="${cx('c-act-hang__left', (lost || left === 1) && 'is-bad', !lost && left === 2 && 'is-warn')}">${lost ? 'Sem tentativas' : left === 1 ? 'Última chance!' : plural(left, 'tentativa restante', 'tentativas restantes')}</span>
        </div>
      </div>
      <div class="c-act-hang__play">
        <div class="c-act-hang__words" aria-label="Palavra secreta">${slots}</div>
        <div class="c-act-hang__toast" aria-live="polite">${toastHtml}</div>
        <div class="c-act-keys">${keyboard}</div>
        ${lost ? `<div class="c-act-alert c-act-alert--error"><b>Emparedado!</b> A resposta era “${esc(H.answer)}”.</div>` : ''}
      </div>
    </div>
  </section>`;
}

function guess(ctx, k, hint = false) {
  const s = ctx.state;
  const h = s.hang;
  if (h.guessed.includes(k) || h.won || errorsOf(h.guessed) >= H.maxErrors) return;
  const g = [...h.guessed, k];
  const hit = ANSWER.includes(k);
  const count = [...ANSWER].filter(c => c === k).length;
  const won = [...LETTERS].every(ch => g.includes(ch));
  const lost = errorsOf(g) >= H.maxErrors;
  sfx(hit ? 'correct' : 'wrong');
  ctx.set({
    hang: { ...h, guessed: g, won, last: { k, hit, count, hint } },
    streak: hit ? s.streak + 1 : 0,
    lives: lost ? Math.max(0, s.lives - 1) : s.lives,
    fx: { hangKey: true },
  });
  if (won) later(ctx, 500, () => finish(ctx, 4, { xp: 250, coins: 60 }));
}

const actions = {
  hangGuess: (ctx, el) => guess(ctx, el.dataset.k),
  hangHint: ctx => {
    const s = ctx.state;
    const h = s.hang;
    const left = [...new Set(LETTERS)].filter(c => !h.guessed.includes(c));
    if (!left.length || s.coins < H.hintCost || h.hints >= H.maxHints || h.won || errorsOf(h.guessed) >= H.maxErrors) return;
    s.coins -= H.hintCost;
    h.hints += 1;
    guess(ctx, left[Math.floor(Math.random() * left.length)], true);
  },
  hangRetry: ctx => { sfx('click'); ctx.set({ hang: init() }); },
};

export default {
  id: 4,
  key: 'hang',
  init,
  view,
  actions,
  footer: s => (errorsOf(s.hang.guessed) >= H.maxErrors && s.justDone !== 4 ? { label: 'Tentar de novo', action: 'hangRetry' } : null),
  keys: (ctx, e) => {
    if (!/^[a-z0-9]$/i.test(e.key)) return false;
    guess(ctx, e.key.toUpperCase());
    return true;
  },
  pct: s => [...LETTERS].filter(c => s.hang.guessed.includes(c)).length / LETTERS.length,
  reset: s => (s.hang.won ? init() : null),
};
