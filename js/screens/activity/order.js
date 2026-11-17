/* 8. Ordenadinho: monta a ordem header → nav → main → footer. Toque adiciona a opção ao fim da resposta (ou devolve);
   arrastar solta na posição indicada. Há opções que não fazem parte da resposta. Imagem de apoio ligada por padrão
   (o tweak apoio=0 a esconde e a resposta ocupa a largura toda).
   Ordem perfeita: +160 pts, +40 moedas. */

import { cx, esc } from '../../core/dom.js';
import { icon } from '../../core/icons.js';
import { order as O } from '../../data/activity.js';
import { upd, finish, later, fx, shuffle, toast } from './flow.js';
import { pointerDrag, dragged } from './drag.js';
import { sfx, tones } from '../../core/sound.js';

const text = id => O.items.find(o => o.id === id).t;
const init = () => ({ ans: [], bank: shuffle(O.items.map(o => o.id)), res: null, tries: 0, msg: null });

function view(state) {
  const o = state.ord;
  const img = state.tw?.apoio !== false;
  const allOk = o.res && o.res.every(Boolean) && o.ans.length === O.answer.length;
  const ans = o.ans.map((id, i) => {
    const r = o.res ? o.res[i] : undefined;
    return `<button type="button" class="${cx('c-act-chip-drag c-act-chip-drag--code', r === true && 'is-right', r === false && 'is-wrong', r === false && fx(state, 'ordCheck') && 'is-shake')}" data-action="ordTap" data-id="${id}" data-drag-ord ${o.res ? 'data-fixed' : ''} aria-label="${i + 1}º: ${esc(text(id))}, toque para remover">
      <span class="c-act-chip-drag__num">${i + 1}</span><span>${esc(text(id))}</span>
    </button>`;
  }).join('');
  const bank = o.bank.map(id => `<button type="button" class="c-act-chip-drag c-act-chip-drag--code" data-action="ordTap" data-id="${id}" data-drag-ord ${o.res ? 'data-fixed' : ''} aria-label="${esc(text(id))}, toque para adicionar">${icon('move', 16)}<span>${esc(text(id))}</span></button>`).join('');
  return `<section class="c-act-card c-act-ord" aria-label="Ordenadinho">
    <div class="c-act-card__head">
      <span class="c-act-card__kicker">Arraste as opções para a área de resposta na ordem certa · ou toque para adicionar</span>
      <h2 class="c-act-card__title">${esc(O.question)}</h2>
    </div>
    <div class="${cx('c-act-ord__layout', !img && 'c-act-ord__layout--solo')}">
      ${img ? `<div class="c-act-ord__support"><div class="c-act-placeholder" role="img" aria-label="Imagem de apoio">${icon('image', 32)}<span>Imagem de apoio (opcional)</span></div></div>` : ''}
      <div class="c-act-ord__panel">
        <div class="c-act-ord__head"><b>Sua resposta</b>
          <button type="button" class="c-act-pill c-act-pill--outline c-act-pill--button" data-action="ordClear" ${!o.ans.length || o.res ? 'disabled' : ''}>${icon('rotate-ccw', 14)}Limpar</button>
        </div>
        <div class="${cx('c-act-ord__answer', allOk && 'is-ok', o.res && !allOk && fx(state, 'ordCheck') && 'is-shake')}" data-drop-ord="ans">
          ${ans || `<span class="c-act-zone__empty">${icon('download', 22)}Arraste as opções e solte aqui, na ordem</span>`}
        </div>
        <div class="c-act-ord__bank" data-drop-ord="bank">
          <span class="c-act-ord__label">Opções · ${o.bank.length} disponíveis</span>
          <div class="c-act-ord__chips">${bank || '<span class="c-act-ord__none">Todas as opções estão na resposta</span>'}</div>
        </div>
      </div>
    </div>
    <div class="c-act-msg" aria-live="polite">${o.msg ? toast(esc(o.msg.t), o.msg.ok ? 'ok' : 'bad', fx(state, 'ordCheck')) : ''}</div>
  </section>`;
}

/** Move `id` para a resposta (na posição `idx`, ou no fim) ou de volta para as opções. */
function put(ctx, id, zone, idx = null) {
  const o = ctx.state.ord;
  const ans = o.ans.filter(x => x !== id);
  const bank = o.bank.filter(x => x !== id);
  if (zone === 'ans') ans.splice(idx == null ? ans.length : Math.min(idx, ans.length), 0, id);
  else bank.push(id);
  if (zone === 'bank') tones.toBank();
  else tones.orderAt(ans.indexOf(id));
  upd(ctx, 'ord', { ans, bank, msg: null });
}

/** Posição de inserção pelo ponteiro: antes do primeiro chip que está depois do ponto. */
function insertIndex(zone, el, x, y) {
  const chips = [...zone.querySelectorAll('[data-drag-ord]')].filter(c => c !== el);
  const i = chips.findIndex(c => { const r = c.getBoundingClientRect(); return y < r.top || (y <= r.bottom && x < r.left + r.width / 2); });
  return i < 0 ? chips.length : i;
}

function confirm(ctx) {
  const o = ctx.state.ord;
  if (o.res || !o.ans.length) return;
  const res = o.ans.map((id, i) => O.answer[i] === id);
  const okN = res.filter(Boolean).length;
  const tries = o.tries + 1;
  if (okN === O.answer.length && o.ans.length === O.answer.length) {
    sfx('correct');
    upd(ctx, 'ord', { res, tries, msg: { ok: true, t: 'Ordem perfeita! header → nav → main → footer.' } }, { fx: { ordCheck: true } });
    later(ctx, 1300, () => finish(ctx, 8, { xp: 160, coins: 40 }));
    return;
  }
  const extra = o.ans.filter(id => !O.answer.includes(id)).length;
  const missing = O.answer.filter(id => !o.ans.includes(id)).length;
  const t = `${okN} de ${O.answer.length} na posição certa.${extra ? ` Há ${extra} ${extra > 1 ? 'opções que não fazem' : 'opção que não faz'} parte da resposta.` : missing ? ` ${missing > 1 ? `Faltam ${missing} opções.` : 'Falta 1 opção.'}` : ' Ajuste as marcadas em vermelho.'}`;
  sfx('wrong');
  upd(ctx, 'ord', { res, tries, msg: { ok: false, t } }, { fx: { ordCheck: true } });
  later(ctx, 1600, () => upd(ctx, 'ord', { res: null }));
}

export default {
  id: 8,
  key: 'ord',
  init,
  view,
  actions: {
    ordTap: (ctx, el) => {
      if (dragged(ctx) || el.hasAttribute('data-fixed')) return;
      const id = el.dataset.id;
      put(ctx, id, ctx.state.ord.ans.includes(id) ? 'bank' : 'ans');
    },
    ordClear: ctx => { sfx('click'); upd(ctx, 'ord', o => ({ ans: [], bank: [...o.bank, ...o.ans], msg: null })); },
    ordConfirm: ctx => confirm(ctx),
  },
  footer: s => (s.justDone === 8 ? null : { label: s.ord.res ? 'Conferindo…' : 'Confirmar', action: 'ordConfirm', disabled: !s.ord.ans.length || !!s.ord.res }),
  mount: ctx => pointerDrag(ctx, {
    item: '[data-drag-ord]',
    zone: '[data-drop-ord]',
    enabled: el => ctx.state.view === 8 && !el.hasAttribute('data-fixed'),
    drop: (el, z, e) => {
      if (!z) return;
      const zone = z.dataset.dropOrd;
      put(ctx, el.dataset.id, zone, zone === 'ans' ? insertIndex(z, el, e.clientX, e.clientY) : null);
    },
    ghostClass: 'c-act-ghost--chip',
    hoverSound: true,
  }),
  pct: s => Math.min(s.ord.ans.length, O.answer.length) / O.answer.length,
  reset: s => (s.status[8] === 'done' ? init() : null),
};
