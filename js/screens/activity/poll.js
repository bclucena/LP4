/* 12. Enquete (escolha única, sem resposta certa: vota e vê o resultado parcial) e
   13. Enquete aberta (texto livre de 30 a 3.000 caracteres, rascunho salvo no navegador, Ctrl/⌘ + Enter envia). */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { poll as P, openPoll as OP } from '../../data/activity.js';
import { upd, finish, later, fx } from './flow.js';
import { sfx, tones } from '../../core/sound.js';

const LETTERS = 'ABCDEF';
const fmt = n => n.toLocaleString('pt-BR');

/* ---------- Enquete ---------- */
function pollView(state) {
  const p = state.poll;
  const voted = p.vote != null;
  const votes = P.options.map((o, i) => o.v + (voted && p.vote === i ? 1 : 0));
  const total = votes.reduce((a, b) => a + b, 0);
  const max = Math.max(...votes);
  const opts = P.options.map((o, i) => {
    const pick = !voted && p.pick === i;
    const mine = voted && p.vote === i;
    const pct = Math.round((votes[i] / total) * 100);
    return `<button type="button" role="radio" aria-checked="${pick || mine}" class="${cx('c-act-poll__opt', (pick || mine) && 'is-selected', voted && 'is-voted', mine && 'is-mine', fx(state, 'pollVote') && 'is-grow')}" data-action="pollPick" data-i="${i}" aria-label="${LETTERS[i]}: ${esc(o.t)}${voted ? `, ${pct}%` : ''}" style="--pct:${voted ? pct : 0}%;--d:${i * 60}ms">
      <span class="c-act-poll__bar" aria-hidden="true"></span>
      <span class="c-act-poll__letter">${LETTERS[i]}</span>
      <span class="c-act-poll__text"><span>${esc(o.t)}</span>${mine ? '<b>Seu voto</b>' : ''}</span>
      ${voted ? `<span class="c-act-poll__pct"><b>${pct}%</b><span>${fmt(votes[i])} votos</span></span>` : ''}
      ${voted && votes[i] === max ? '<span class="c-act-pill c-act-pill--warning c-act-pill--xs">Mais votada</span>' : ''}
    </button>`;
  }).join('');
  const note = voted ? 'Obrigado por participar! Seu voto já está contabilizado.' : p.pick != null ? 'Você pode trocar a escolha antes de votar · Enter confirma' : 'Toque numa alternativa ou use as teclas A a F';
  return `<section class="c-act-card c-act-poll" aria-label="Enquete">
    <div class="c-act-card__head">
      <div class="c-act-card__bar"><span class="c-act-card__kicker">${voted ? 'Resultado parcial da enquete' : 'Escolha uma alternativa'}</span><span class="c-act-pill">${icon('users', 14)}${fmt(total)} votos</span></div>
      <h2 class="c-act-card__title c-act-card__title--lg">${esc(P.question)}</h2>
      <span class="c-act-card__lead c-act-card__lead--muted">Enquete de opinião · não existe resposta certa</span>
    </div>
    <div class="c-act-poll__opts" role="radiogroup" aria-label="Alternativas da enquete">${opts}</div>
    <p class="${cx('c-act-card__lead c-act-card__lead--muted', voted && 'c-act-tone--success-strong')}" aria-live="polite">${note}</p>
  </section>`;
}

function pollAct(ctx) {
  const p = ctx.state.poll;
  if (p.vote == null) {
    if (p.pick == null) return;
    tones.vote();
    upd(ctx, 'poll', { vote: p.pick }, { fx: { pollVote: true } });
    return;
  }
  if (ctx.state.status[12] !== 'done') finish(ctx, 12, { xp: 50, coins: 10 });
}

export const pollMech = {
  id: 12,
  key: 'poll',
  init: () => ({ pick: null, vote: null }),
  view: pollView,
  actions: {
    pollPick: (ctx, el) => { if (ctx.state.poll.vote == null) { sfx('click'); upd(ctx, 'poll', { pick: Number(el.dataset.i) }); } },
    pollAct: ctx => pollAct(ctx),
  },
  footer: s => {
    if (s.justDone === 12 || s.status[12] === 'done') return null;
    const voted = s.poll.vote != null;
    return { label: voted ? 'Concluir' : 'Votar', action: 'pollAct', disabled: !voted && s.poll.pick == null };
  },
  keys: (ctx, e) => {
    const i = 'abcdef'.indexOf(e.key.toLowerCase());
    if (i >= 0 && e.key.length === 1) { if (ctx.state.poll.vote == null) { sfx('click'); upd(ctx, 'poll', { pick: i }); } return true; }
    if (e.key === 'Enter' && ctx.state.status[12] !== 'done') { pollAct(ctx); return true; }
    return false;
  },
  pct: s => (s.poll.vote != null ? 0.9 : s.poll.pick != null ? 0.4 : 0),
};

/* ---------- Enquete aberta ---------- */
const readDraft = () => { try { return localStorage.getItem(OP.storageKey) ?? ''; } catch { return ''; } };
const writeDraft = v => { try { if (v) localStorage.setItem(OP.storageKey, v); else localStorage.removeItem(OP.storageKey); } catch { /* sem armazenamento */ } };

/** Partes que mudam a cada tecla (contador, barra mínima e ajuda): atualizadas direto, sem refazer a tela. */
function helpParts(text) {
  const n = text.length;
  const tn = text.trim().length;
  const ok = tn >= OP.min;
  return {
    ok,
    count: `${fmt(n)}/${fmt(OP.max)}`,
    countTone: n >= OP.max ? 'is-bad' : n >= OP.max * 0.9 ? 'is-warn' : '',
    minPct: Math.min(100, (tn / OP.min) * 100),
    help: ok ? 'Tudo certo para enviar' : tn ? `Faltam ${OP.min - tn} caracteres para enviar` : `Mínimo de ${OP.min} caracteres`,
  };
}

function openView(state) {
  const o = state.open;
  const h = helpParts(o.text);
  const body = o.sentAt
    ? `<div class="c-act-open__sent${fx(state, 'openSent') ? ' is-in' : ''}">
        <div class="c-act-open__sent-head"><span class="c-act-badge c-act-badge--ok c-act-badge--lg">${icon('check', 16)}</span><span><b>Resposta enviada!</b><span>${esc(o.sentAt)}</span></span></div>
        <p class="c-act-open__answer">${esc(o.text)}</p>
      </div>`
    : `<div class="c-act-open__edit">
        <div class="c-act-open__field">
          <textarea class="c-act-open__input" data-input="openType" data-key="act-open" maxlength="${OP.max}" aria-labelledby="act-open-q" aria-describedby="act-open-help" placeholder="Escreva sua resposta aqui…">${esc(o.text)}</textarea>
          <span class="${cx('c-act-open__count', h.countTone)}" data-open="count">${h.count}</span>
        </div>
        <div class="c-act-open__help" id="act-open-help">
          <span class="${cx('c-act-open__min', h.ok && 'is-ok')}" data-open="min"><span class="c-act-open__minbar"><span style="width:${h.minPct}%"></span></span><span data-open="help">${h.help}</span></span>
          <span class="${cx('c-act-open__saved', o.saved && o.text && 'is-on')}" data-open="saved">${icon('check', 14)}Rascunho salvo</span>
        </div>
      </div>`;
  return `<section class="c-act-card c-act-open" aria-label="Enquete aberta">
    <div class="c-act-card__head">
      <span class="c-act-card__kicker">Enquete · questão aberta</span>
      <h2 class="c-act-card__title c-act-card__title--lg" id="act-open-q">${esc(OP.question)}</h2>
    </div>
    ${body}
  </section>`;
}

function submit(ctx) {
  const o = ctx.state.open;
  if (o.text.trim().length < OP.min || o.sentAt) return;
  const d = new Date();
  writeDraft('');
  tones.sent();
  upd(ctx, 'open', { sentAt: `Enviada hoje às ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }, { fx: { openSent: true } });
  if (ctx.state.status[13] !== 'done') later(ctx, 900, () => finish(ctx, 13, { xp: 60, coins: 15 }));
}

export const openMech = {
  id: 13,
  key: 'open',
  init: () => ({ text: readDraft(), saved: false, sentAt: null }),
  view: openView,
  actions: {
    openType: (ctx, el) => {
      const o = ctx.state.open;
      const before = helpParts(o.text).ok;
      o.text = el.value.slice(0, OP.max);
      o.saved = false;
      const h = helpParts(o.text);
      if (h.ok !== before) { ctx.render(); } else {
        const q = k => ctx.root.querySelector(`[data-open="${k}"]`);
        q('count').textContent = h.count;
        q('count').className = cx('c-act-open__count', h.countTone);
        q('min').querySelector('.c-act-open__minbar > span').style.width = `${h.minPct}%`;
        q('help').textContent = h.help;
        q('min').classList.toggle('is-ok', h.ok);
        q('saved').classList.remove('is-on');
      }
      clearTimeout(ctx.openTimer);
      ctx.openTimer = later(ctx, 600, () => {
        writeDraft(ctx.state.open.text);
        ctx.state.open.saved = true;
        ctx.root.querySelector('[data-open="saved"]')?.classList.toggle('is-on', !!ctx.state.open.text);
      });
    },
    openSubmit: ctx => submit(ctx),
  },
  footer: s => {
    if (s.justDone === 13) return null;
    const o = s.open;
    if (o.sentAt) return { label: 'Resposta enviada', action: '', disabled: true };
    return { label: 'Responder', action: 'openSubmit', disabled: !helpParts(o.text).ok };
  },
  keys: (ctx, e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { submit(ctx); return true; }
    return false;
  },
  /** Teclas do textarea também chegam aqui (o Ctrl+Enter vale dentro do campo). */
  keysInFields: true,
  pct: s => (s.open.sentAt ? 0.95 : Math.min(1, s.open.text.trim().length / OP.min) * 0.8),
};
