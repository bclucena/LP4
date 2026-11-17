import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { exam as E, EXAM_ID } from '../data/activity.js';

/* Diálogo da avaliação, usado no Curso e no Tabuleiro ao clicar numa avaliação, e as duas partes que a tela de Atividades
   também usa (apresentação e confirmação, js/screens/activity/exam.js e parts.js). Estilos: c-act-dialog* e c-act-exam*
   em css/screens/activity.css.

   Passos: 'info' (apresentação: encerramento, performance mínima, moedas, pontos e o aviso do tempo; Cancelar ou Iniciar
   avaliação) → 'confirm' (regras e digitar "Iniciar"; Agora não ou Começar avaliação). Começar leva à tela de Atividades
   com a avaliação já iniciada (#atividade?item=15&iniciar=1).

   Quem usa: guarda `examDialog: null | { step, text, fresh }` no estado, espalha `examDialogActions` nas ações, chama
   `openExamDialog(ctx)` no clique e fecha com Esc (`ctx.state.examDialog` aberto → `closeExamDialog(ctx)`). */

export const EXAM_HREF = `#atividade?item=${EXAM_ID}&iniciar=1`;

const infoCard = (iconName, tone, label, value, unit = '') =>
  `<div class="c-act-exam__info">${icon(iconName, 22, `c-act-tone--${tone}`)}<span><span class="c-act-exam__info-label">${label}</span><b>${value}${unit ? ` <small>${unit}</small>` : ''}</b></span></div>`;

/** Apresentação da avaliação (a mesma da tela de Atividades). `titleId`: id do título, para o aria-labelledby do diálogo. */
export const examInfo = ({ titleId = '' } = {}) => `<div class="c-act-exam__title">
      <span class="c-act-exam__flag">${icon('flag', 22)}</span>
      <h2 ${titleId ? `id="${titleId}"` : ''}>Avaliação</h2>
    </div>
    <p class="c-act-exam__sub">${esc(E.title)}</p>
    <p class="c-act-exam__text">${esc(E.intro)}</p>
    ${infoCard('calendar', 'muted', 'Encerramento', esc(E.closes))}
    <div class="c-act-exam__infos">
      ${infoCard('check', 'success', 'Performance mínima', `${E.minPct}%`)}
      ${infoCard('dollar-sign', 'warning', 'Máximo de moedas', E.maxCoins, 'moedas')}
      ${infoCard('star', 'warning', 'Pontuação máxima', E.maxPoints, 'pontos')}
    </div>
    <div class="c-act-exam__note" role="note">${icon('info', 22)}<span>Caso seja interrompida, a avaliação continuará computando o tempo.</span></div>`;

export const examTextOk = text => text.trim().toLowerCase() === 'iniciar';

/** Confirmação (digitar "Iniciar"). `attempt`: número desta tentativa; `input`/`cancel`/`start`: ações de quem usa. */
export const examConfirm = ({ text = '', attempt = 1, input, cancel, start, label }) => {
  const ok = examTextOk(text);
  return `<span class="c-act-dialog__badge">${icon('flag', 24)}</span>
      <div class="c-act-dialog__text">
        <h2 class="c-act-dialog__title" id="${label}-title">Iniciar a avaliação agora?</h2>
        <p id="${label}-desc">Ao começar, o tempo passa a contar e esta tentativa fica registrada.</p>
      </div>
      <ul class="c-act-dialog__rules">
        <li>${icon('check', 20, 'c-act-tone--success')}<span>Você precisa de <b>no mínimo ${E.minPct}%</b> de acertos para ser aprovado.</span></li>
        <li>${icon('rotate-ccw', 20, 'c-act-tone--system')}<span>Você tem <b>${E.attempts} tentativas</b>. Esta será a ${Math.min(E.attempts, attempt)}ª.</span></li>
        <li>${icon('clock', 20, 'c-act-tone--warning')}<span>Se você sair no meio, <b>o tempo continua contando</b>.</span></li>
      </ul>
      <label class="c-act-dialog__field">
        <span>Para confirmar, digite <b>Iniciar</b> abaixo.</span>
        <input class="${cx('c-act-input', ok && 'is-valid')}" type="text" autocomplete="off" spellcheck="false" data-input="${input}" data-key="${label}-input" data-autofocus value="${esc(text)}" placeholder="Digite aqui" />
      </label>
      <div class="c-act-dialog__actions">
        <button type="button" class="c-act-btn c-act-btn--stroked" data-action="${cancel}">Agora não</button>
        <button type="button" class="c-act-btn c-act-btn--default" data-action="${start}" ${ok ? '' : 'disabled'}>Começar avaliação</button>
      </div>`;
};

/** Diálogo completo (Curso e Tabuleiro). */
export function examDialog(d) {
  if (!d) return '';
  const label = 'exam-dlg';
  const body = d.step === 'confirm'
    ? examConfirm({ text: d.text, attempt: 1, input: 'examDialogInput', cancel: 'examDialogClose', start: 'examDialogStart', label })
    : `<div class="c-act-exam c-exam-dialog__info">${examInfo({ titleId: `${label}-title` })}</div>
      <p class="u-sr-only" id="${label}-desc">${esc(E.intro)}</p>
      <div class="c-act-dialog__actions">
        <button type="button" class="c-act-btn c-act-btn--stroked" data-action="examDialogClose">Cancelar</button>
        <button type="button" class="c-act-btn c-act-btn--default" data-action="examDialogNext" data-autofocus>Iniciar avaliação</button>
      </div>`;
  return `<div class="c-act-dialog c-exam-dialog" data-dialog>
    <div class="c-act-dialog__scrim" data-action="examDialogClose"></div>
    <div class="${cx('c-act-dialog__box', d.step === 'info' && 'c-exam-dialog__box--info', d.fresh && 'is-in')}" role="alertdialog" aria-modal="true" aria-labelledby="${label}-title" aria-describedby="${label}-desc">${body}</div>
  </div>`;
}

const focusIn = ctx => ctx.root.querySelector('.c-exam-dialog [data-autofocus]')?.focus();

export function openExamDialog(ctx, returnKey) {
  ctx.examReturnKey = returnKey;
  ctx.set({ examDialog: { step: 'info', text: '', fresh: true } });
  focusIn(ctx);
}

export function closeExamDialog(ctx) {
  ctx.set({ examDialog: null });
  const key = ctx.examReturnKey;
  ctx.examReturnKey = null;
  if (key) ctx.root.querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
}

export const examDialogActions = {
  examDialogClose: ctx => closeExamDialog(ctx),
  examDialogNext: ctx => {
    ctx.set({ examDialog: { step: 'confirm', text: '', fresh: true } });
    focusIn(ctx);
  },
  examDialogInput: (ctx, el) => ctx.set({ examDialog: { ...ctx.state.examDialog, text: el.value, fresh: false } }),
  examDialogStart: ctx => {
    if (!examTextOk(ctx.state.examDialog?.text ?? '')) return;
    ctx.set({ examDialog: null });
    location.hash = EXAM_HREF;
  },
};
