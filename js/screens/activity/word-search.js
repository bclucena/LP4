/* 3. Caça-palavras: grade 10 x 10 com 5 palavras (na horizontal, vertical e diagonais). Arrasta da primeira à última letra;
   a seleção segue em linha reta. Achar todas conclui a atividade (+200 pts, +50 moedas). */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { words as WORDS, WS_SIZE as N } from '../../data/activity.js';
import { upd, finish, later, streakOn } from './flow.js';
import { sfx } from '../../core/sound.js';
import { pill } from '../../components/badges.js';
import { head } from './head.js';

/** Monta a grade: palavras em ordem de leitura (→, ↓, ↘, ↗) e letras aleatórias no resto. */
function buildGrid() {
  const g = Array.from({ length: N }, () => Array(N).fill(''));
  const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  const pref = [2, 3, 0, 1];
  WORDS.forEach((w, wi) => {
    const L = w.length;
    for (let t = 0; t < 400; t++) {
      const [dr, dc] = dirs[t < 120 ? pref[wi % 4] : Math.floor(Math.random() * 4)];
      const rMin = dr < 0 ? L - 1 : 0;
      const rMax = dr > 0 ? N - L : N - 1;
      const cMax = dc > 0 ? N - L : N - 1;
      const r = rMin + Math.floor(Math.random() * (rMax - rMin + 1));
      const c = Math.floor(Math.random() * (cMax + 1));
      let ok = true;
      for (let i = 0; i < L; i++) { const v = g[r + dr * i][c + dc * i]; if (v && v !== w[i]) { ok = false; break; } }
      if (ok) { for (let i = 0; i < L; i++) g[r + dr * i][c + dc * i] = w[i]; break; }
    }
  });
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return g.map(row => row.map(v => v || A[Math.floor(Math.random() * 26)]));
}

const init = () => ({ grid: buildGrid(), found: [], cells: {} });

function view(state) {
  const ws = state.ws;
  const cells = ws.grid.map((row, r) => row.map((l, c) =>
    `<span class="${cx('c-act-ws__cell', ws.cells[`${r}-${c}`] && 'is-found')}" data-r="${r}" data-c="${c}">${esc(l)}</span>`).join('')).join('');
  const list = WORDS.map(w => {
    const f = ws.found.includes(w);
    return `<li class="${cx('c-act-ws__word', f && 'is-found')}">${esc(w)}${icon(f ? 'check-circle' : 'circle', 16)}</li>`;
  }).join('');
  return `<section class="c-act-card c-act-ws" aria-label="Caça-palavras">
    ${head({ kicker: 'Clique e arraste da <b>primeira</b> até a <b>última letra</b> da palavra', title: `Encontre as ${WORDS.length} palavras ocultas`, aside: pill({ color: 'yellow', iconName: 'award', label: `Palavras ${ws.found.length}/${WORDS.length}` }) })}
    <div class="c-act-ws__layout">
      <div class="c-act-ws__grid" data-ws-grid role="grid" aria-label="Grade de letras">${cells}</div>
      <div class="c-act-ws__words"><span class="c-act-ws__words-title">Palavras ocultas</span><ul>${list}</ul></div>
    </div>
  </section>`;
}

/** Seleção por ponteiro: pinta as células direto no DOM e só atualiza o estado ao soltar. */
function mount(ctx) {
  let start = null;
  let path = [];
  const cellAt = (x, y) => {
    const el = document.elementFromPoint(x, y)?.closest('[data-r]');
    return el && el.closest('[data-ws-grid]') ? { r: Number(el.dataset.r), c: Number(el.dataset.c) } : null;
  };
  const paint = (cls, on) => path.forEach(p => ctx.root.querySelector(`[data-r="${p.r}"][data-c="${p.c}"]`)?.classList.toggle(cls, on));

  ctx.listen('pointerdown', e => {
    if (ctx.state.view !== 3 || !e.target.closest('[data-ws-grid]')) return;
    const p = cellAt(e.clientX, e.clientY);
    if (!p) return;
    e.preventDefault();
    sfx('click');
    start = p;
    path = [p];
    paint('is-path', true);
  }, ctx.root);

  ctx.listen('pointermove', e => {
    if (!start) return;
    const p = cellAt(e.clientX, e.clientY);
    if (!p) return;
    const dr = p.r - start.r;
    const dc = p.c - start.c;
    if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return;
    const n = Math.max(Math.abs(dr), Math.abs(dc));
    paint('is-path', false);
    path = Array.from({ length: n + 1 }, (_, i) => ({ r: start.r + i * Math.sign(dr), c: start.c + i * Math.sign(dc) }));
    paint('is-path', true);
  }, window);

  ctx.listen('pointerup', () => {
    if (!start) return;
    start = null;
    const ws = ctx.state.ws;
    const word = path.map(p => ws.grid[p.r][p.c]).join('');
    const rev = [...word].reverse().join('');
    const match = [word, rev].find(w => WORDS.includes(w) && !ws.found.includes(w));
    if (match) {
      sfx('correct');
      const cells = { ...ws.cells };
      path.forEach(p => { cells[`${p.r}-${p.c}`] = 1; });
      const found = [...ws.found, match];
      upd(ctx, 'ws', { found, cells }, streakOn(ctx, true));
      if (found.length === WORDS.length) later(ctx, 300, () => finish(ctx, 3, { xp: 200, coins: 50 }));
    } else if (path.length > 1) {
      const wrong = path;
      sfx('wrong');
      paint('is-wrong', true);
      later(ctx, 380, () => { wrong.forEach(p => ctx.root.querySelector(`[data-r="${p.r}"][data-c="${p.c}"]`)?.classList.remove('is-path', 'is-wrong')); ctx.set(streakOn(ctx, false)); });
    } else paint('is-path', false);
    path = [];
  }, window);
}

export default {
  id: 3,
  key: 'ws',
  init,
  view,
  actions: {},
  footer: () => null,
  mount,
  pct: s => s.ws.found.length / WORDS.length,
  reset: s => (s.ws.found.length === WORDS.length ? init() : null),
};
