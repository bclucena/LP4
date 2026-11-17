/* 15. Avaliação final: apresentação → confirmação (digitar "Iniciar") → 10 questões (teclas 1–4, Enter avança) →
   resultado com medidor e gabarito. Aprovação com 70%: pontos e moedas proporcionais ao desempenho. 3 tentativas. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { exam as E } from '../../data/activity.js';
import { upd, finish, fx, clock2, statusOf } from './flow.js';
import { sfx } from '../../core/sound.js';
import { examInfo } from '../../components/exam-dialog.js';

const Q = E.questions;
export const init = () => ({ started: false, q: 0, sel: null, ans: [], sec: 0, tries: 0, result: null, review: false });

/** Apresentação: a mesma do diálogo da avaliação no Curso e no Tabuleiro (js/components/exam-dialog.js). */
const intro = () => `<section class="c-act-exam" aria-label="Avaliação final">${examInfo()}</section>`;

function question(x) {
  const item = Q[x.q];
  const opts = item.o.map((t, i) => `<button type="button" role="radio" aria-checked="${x.sel === i}" class="${cx('c-act-option', x.sel === i && 'is-selected')}" data-action="examChoose" data-i="${i}">
    <span class="c-act-option__text">${esc(t)}</span><span class="c-act-option__num" aria-hidden="true">${i + 1}</span>
  </button>`).join('');
  return `<section class="c-act-quiz" aria-label="Avaliação · questão">
    <div class="c-act-quiz__head"><span class="c-act-card__kicker">Questão ${x.q + 1} de ${Q.length}</span><h2 class="c-act-quiz__q">${esc(item.q)}</h2></div>
    <div class="c-act-quiz__options" role="radiogroup" aria-label="Alternativas">${opts}</div>
  </section>`;
}

/** Medidor em arco (270°) com a faixa de aprovação e o desempenho. */
function result(x, anim) {
  const r = x.result;
  const left = E.attempts - x.tries;
  const arc = 'M63.43 156.57A80 80 0 1 1 176.57 156.57';
  return `<section class="${cx('c-act-result', r.ok ? 'is-ok' : 'is-bad', anim && 'is-anim')}" aria-label="Avaliação · resultado">
    <div class="c-act-result__gauge">
      <svg viewBox="0 0 240 200" aria-hidden="true">
        <path class="c-act-result__track" d="${arc}" pathLength="100"/>
        <path class="c-act-result__band" d="${arc}" pathLength="100" stroke-dasharray="0 ${E.minPct} ${100 - E.minPct} 0"/>
        <path class="c-act-result__value" d="${arc}" pathLength="100" stroke-dasharray="${Math.max(0.5, r.pct)} 100"/>
        <circle class="c-act-result__cut" cx="184.72" cy="52.98" r="7"/>
      </svg>
      <span class="c-act-result__cutoff"><span class="c-act-dot c-act-dot--xs is-ok"></span>Nota de corte <b>${E.minPct}%</b></span>
      <span class="c-act-result__icon">${icon(r.ok ? 'check' : 'x', 72)}</span>
      <span class="c-act-result__pct"><b>${r.pct}%</b><span>Seu desempenho</span></span>
    </div>
    <h2 class="c-act-result__title">${r.ok ? 'Aprovado!' : 'Não foi dessa vez'}</h2>
    <p class="c-act-result__text">${r.ok ? `Parabéns, você concluiu a avaliação do módulo e ganhou ${r.pts}pts.` : `Você precisa de no mínimo ${E.minPct}% para ser aprovado. ${left > 0 ? `Você ainda tem ${left} ${left === 1 ? 'tentativa' : 'tentativas'}.` : 'Você não tem mais tentativas.'}`}</p>
    <div class="c-act-result__stats">
      <div><span>Desempenho</span><b class="c-act-result__strong">${r.pct}%</b></div>
      <div><span>Acertos</span><b>${r.hits} de ${Q.length}</b></div>
      <div><span>Tempo</span><b>${clock2(r.sec)}</b></div>
    </div>
  </section>`;
}

function review(x) {
  const items = Q.map((item, i) => {
    const a = x.ans[i];
    const ok = a === item.c;
    return `<li class="c-act-review__item">${icon(ok ? 'check-circle' : 'x-circle', 22, ok ? 'c-act-tone--success' : 'c-act-tone--error')}
      <div><span class="c-act-review__n">Questão ${i + 1} · ${ok ? 'Correta' : 'Incorreta'}</span><b>${esc(item.q)}</b>
        <span>Sua resposta: <b class="${ok ? 'c-act-tone--success-strong' : 'c-act-tone--error-strong'}">${a == null ? '—' : esc(item.o[a])}</b></span>
        ${ok ? '' : `<span>Resposta correta: <b class="c-act-tone--success-strong">${esc(item.o[item.c])}</b></span>`}
      </div></li>`;
  }).join('');
  return `<section class="c-act-exam" aria-label="Avaliação · gabarito">
    <div class="c-act-review__head"><h2>Gabarito</h2><p>Você acertou ${x.result.hits} questões.</p></div>
    <ol class="c-act-review">${items}</ol>
  </section>`;
}

function view(state) {
  const x = state.exam;
  if (!x.started) return intro();
  if (!x.result) return question(x);
  return x.review ? review(x) : result(x, fx(state, 'examResult'));
}

function next(ctx) {
  const x = ctx.state.exam;
  if (x.sel == null || x.result || !x.started) return;
  const ans = [...x.ans, x.sel];
  if (ans.length < Q.length) { sfx('click'); upd(ctx, 'exam', { ans, q: x.q + 1, sel: null }); return; }
  const hits = ans.filter((a, i) => a === Q[i].c).length;
  const pct = Math.round((hits / Q.length) * 100);
  const ok = pct >= E.minPct;
  const pts = ok ? Math.round((E.maxPoints * pct) / 100) : 0;
  const coins = ok ? Math.round((E.maxCoins * pct) / 100) : 0;
  const exam = { ...x, ans, sel: null, result: { ok, hits, pct, pts, sec: x.sec } };
  // Uma renderização só, para as animações do resultado rodarem uma vez.
  if (ok) finish(ctx, 15, { xp: pts, coins }, { exam, fx: { examResult: true } });
  else {
    sfx('wrong');
    ctx.set({ exam, fx: { examResult: true } });
  }
}

const actions = {
  examChoose: (ctx, el) => { const x = ctx.state.exam; if (x.started && !x.result) { sfx('click'); upd(ctx, 'exam', { sel: Number(el.dataset.i) }); } },
  examNext: ctx => next(ctx),
  examReview: ctx => upd(ctx, 'exam', x => ({ review: !x.review })),
  openFinal: ctx => { sfx('click'); ctx.set({ finalAsk: true, finalText: '', fx: { dialog: true } }); },
  closeFinal: ctx => ctx.set({ finalAsk: false }),
  startExam: ctx => {
    if (ctx.state.finalText.trim().toLowerCase() !== 'iniciar') return;
    sfx('click');
    ctx.set(s => ({ finalAsk: false, finalText: '', exam: { ...init(), started: true, tries: s.exam.tries + 1 } }));
  },
};

function footer(state) {
  const x = state.exam;
  const left = E.attempts - x.tries;
  const sec = x.result ? { label: x.review ? 'Ver resultado' : 'Ver gabarito', icon: x.review ? 'bar-chart-2' : 'check-square', action: 'examReview' } : null;
  if (!x.started) return { label: 'Iniciar avaliação', action: 'openFinal', disabled: statusOf(state, 15) === 'locked' };
  if (!x.result) return { label: x.q + 1 < Q.length ? 'Continuar' : 'Finalizar avaliação', action: 'examNext', disabled: x.sel == null };
  if (x.result.ok) return { label: 'Avaliação concluída', action: '', disabled: true, secondary: sec };
  return { label: left > 0 ? 'Tentar novamente' : 'Sem tentativas restantes', action: 'openFinal', disabled: left <= 0, secondary: sec };
}

function tick(ctx) {
  const x = ctx.state.exam;
  if (!x.started || x.result) return;
  x.sec += 1;
  if (ctx.state.view !== 15) return;
  const t = ctx.root.querySelector('[data-tick="elapsed"]');
  if (t) t.textContent = clock2(x.sec);
}

export default {
  id: 15,
  key: 'exam',
  init,
  view,
  actions,
  footer,
  tick,
  /** O relógio da avaliação continua mesmo fora da tela (como avisa a apresentação). */
  tickAlways: true,
  elapsed: s => (s.exam.started ? (s.exam.result ? s.exam.result.sec : s.exam.sec) : null),
  keys: (ctx, e) => {
    const x = ctx.state.exam;
    if (!x.started || x.result) return false;
    const n = Number(e.key);
    if (n >= 1 && n <= Q[x.q].o.length) { upd(ctx, 'exam', { sel: n - 1 }); return true; }
    if (e.key === 'Enter') { next(ctx); return true; }
    return false;
  },
  pct: s => (s.exam.started ? s.exam.ans.length / Q.length : 0),
};
