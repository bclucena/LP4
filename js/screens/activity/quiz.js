/* Quiz: perguntas com 20s cada. Escolhe (clique ou teclas 1–4), confirma em "Continuar", vê certo/errado no rodapé.
   Acerto soma 30 + 5 por sequência e 10 moedas; erro ou tempo esgotado tira uma vida.
   Dois quizzes usam o mesmo modelo (makeQuiz):
   - 1. Quiz de aquecimento: só a pergunta e as alternativas.
   - 17. Quiz com apoio: antes da pergunta, uma imagem e um texto de apoio (kicker, título e parágrafo), como no Slideshow. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { quiz as QUIZ, quizSupport as QUIZ_SUPPORT, QUIZ_TIME } from '../../data/activity.js';
import { upd, finish, fx } from './flow.js';
import { figure, code } from './reading.js';
import { sfx } from '../../core/sound.js';

function makeQuiz({ id, key, items, label }) {
  const A = { choose: `${key}Choose`, go: `${key}Continue` }; // nomes das ações (únicos entre as mecânicas)
  const init = () => ({ qi: 0, answered: false, picked: null, sel: null, timer: QUIZ_TIME, correct: 0 });
  const current = q => items[Math.min(q.qi, items.length - 1)];

  /** Apoio da pergunta (só no quiz com apoio): imagem 16:9 e texto, no mesmo formato dos tópicos do Slideshow. */
  const support = (item, q) => (item.img ? `<div class="c-act-quiz__support">
      ${figure({ src: item.img, alt: item.alt ?? item.t }, 'c-act-figure--wide')}
      <div class="c-act-slide__text">
        <span class="c-act-read__kicker c-act-read__kicker--system">Pergunta ${q.qi + 1} de ${items.length}</span>
        <h3 class="c-act-slide__title">${esc(item.t)}</h3>
        <p class="c-act-read__p">${code(item.p)}</p>
      </div>
    </div>` : '');

  function view(state) {
    const q = state[key];
    const item = current(q);
    const options = item.o.map((text, i) => {
      const right = q.answered && i === item.c;
      const wrong = q.answered && i === q.picked && i !== item.c;
      const sel = !q.answered && q.sel === i;
      const pulse = fx(state, `${key}Answer`) && i === q.picked;
      return `<button type="button" role="radio" aria-checked="${sel || (q.answered && i === q.picked)}" class="${cx('c-act-option', sel && 'is-selected', right && 'is-right', wrong && 'is-wrong', q.answered && !right && !wrong && 'is-dim', pulse && 'is-pulse')}" data-action="${A.choose}" data-i="${i}" ${q.answered ? 'tabindex="-1"' : ''}>
        <span class="c-act-option__text">${esc(text)}</span>
        ${right ? icon('check-circle', 20, 'c-act-option__mark') : wrong ? icon('x-circle', 20, 'c-act-option__mark') : `<span class="c-act-option__num" aria-hidden="true">${i + 1}</span>`}
      </button>`;
    }).join('');
    // Mesmo card e cabeçalho das demais mecânicas: instrução (kicker) e pergunta (título) à esquerda, na largura da coluna.
    const kicker = item.img ? 'Escolha uma alternativa' : `Pergunta ${q.qi + 1} de ${items.length} · Escolha uma alternativa`;
    return `<section class="${cx('c-act-card c-act-quiz', item.img && 'c-act-quiz--support')}" aria-label="${label}">
      ${support(item, q)}
      <div class="c-act-card__head"><span class="c-act-card__kicker">${kicker}</span><h2 class="c-act-card__title c-act-quiz__q">${esc(item.q)}</h2></div>
      <div class="c-act-quiz__options" role="radiogroup" aria-label="Alternativas">${options}</div>
    </section>`;
  }

  function pick(ctx, i) {
    const s = ctx.state;
    const q = s[key];
    if (q.answered) return;
    const ok = i === current(q).c;
    sfx(ok ? 'correct' : 'wrong');
    const streak = ok ? s.streak + 1 : 0;
    ctx.set({
      [key]: { ...q, answered: true, picked: i, correct: q.correct + (ok ? 1 : 0) },
      streak,
      xp: s.xp + (ok ? 30 + streak * 5 : 0),
      coins: s.coins + (ok ? 10 : 0),
      lives: ok ? s.lives : Math.max(0, s.lives - 1),
      fx: { [`${key}Answer`]: true },
    });
  }

  function next(ctx) {
    const s = ctx.state;
    const q = s[key];
    sfx('click');
    if (q.qi + 1 < items.length && s.lives > 0) {
      upd(ctx, key, { qi: q.qi + 1, answered: false, picked: null, sel: null, timer: QUIZ_TIME });
      if (items[0].img) window.scrollTo({ top: 0 }); // com apoio, a próxima pergunta começa pela imagem
    } else finish(ctx, id, { xp: q.correct * 30, coins: q.correct * 10, addXp: 0, addCoins: 0 });
  }

  function proceed(ctx) {
    const q = ctx.state[key];
    if (q.answered) next(ctx);
    else if (q.sel != null) pick(ctx, q.sel);
  }

  const actions = {
    [A.choose]: (ctx, el) => { if (!ctx.state[key].answered) { sfx('click'); upd(ctx, key, { sel: Number(el.dataset.i) }); } },
    [A.go]: ctx => proceed(ctx),
  };

  function footer(state) {
    if (state.justDone === id) return null;
    const q = state[key];
    const item = current(q);
    if (!q.answered) return { label: 'Continuar', action: A.go, disabled: q.sel == null };
    const ok = q.picked === item.c;
    const last = q.qi + 1 >= items.length || state.lives === 0;
    return {
      label: last ? 'Finalizar quiz' : 'Continuar',
      action: A.go,
      tone: ok ? 'success' : 'error',
      feedback: { tone: ok ? 'success' : 'error', icon: ok ? undefined : q.picked === -1 ? 'clock' : undefined, title: ok ? 'Excelente!' : q.picked === -1 ? 'Tempo esgotado!' : 'Incorreto.', text: item.e },
    };
  }

  /** Relógio regressivo: só re-renderiza quando o tempo acaba (no resto, atualiza o texto direto). */
  function tick(ctx) {
    const s = ctx.state;
    const q = s[key];
    if (q.answered || s.justDone === id || s.status[id] === 'done') return;
    q.timer -= 1;
    if (q.timer > 0 && q.timer <= 5) sfx('tick');
    if (q.timer <= 0) {
      sfx('wrong');
      ctx.set({ [key]: { ...q, timer: 0, answered: true, picked: -1 }, streak: 0, lives: Math.max(0, s.lives - 1) });
      return;
    }
    const box = ctx.root.querySelector('[data-tick-box="quiz"]');
    // Pill do design system: cinza no tempo normal, vermelha nos últimos 5 segundos.
    box?.classList.toggle('c-pill--red', q.timer <= 5);
    box?.classList.toggle('c-pill--grey', q.timer > 5);
    if (box && q.timer <= 5) { box.classList.remove('is-beat'); void box.offsetWidth; box.classList.add('is-beat'); }
    const t = ctx.root.querySelector('[data-tick="quiz"]');
    if (t) t.textContent = `00:${String(q.timer).padStart(2, '0')}`;
  }

  function keys(ctx, e) {
    const q = ctx.state[key];
    const n = Number(e.key);
    if (n >= 1 && n <= current(q).o.length) { if (!q.answered) upd(ctx, key, { sel: n - 1 }); return true; }
    if (e.key === 'Enter' && ctx.state.justDone !== id) { proceed(ctx); return true; }
    return false;
  }

  return {
    id,
    key,
    init,
    view,
    actions,
    footer,
    tick,
    keys,
    pct: s => (s[key].qi + (s[key].answered ? 1 : 0)) / items.length,
    timer: s => (s.status[id] === 'done' ? null : s[key].timer),
    reset: () => init(),
    resetAlways: true,
  };
}

export default makeQuiz({ id: 1, key: 'quiz', items: QUIZ, label: 'Quiz' });
export const quizSupportMech = makeQuiz({ id: 17, key: 'quizApoio', items: QUIZ_SUPPORT, label: 'Quiz com apoio' });
