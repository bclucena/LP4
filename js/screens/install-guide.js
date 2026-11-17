import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, onEscape } from '../core/view.js';
import { button } from '../components/button.js';
import { logo } from '../shell/shell.js';

/* Passo a passo para instalar a plataforma (PWA) no iPhone pelo Safari. Aparece uma vez, no primeiro acesso em iPhone fora do app instalado.
   Só mobile: tela cheia, um passo por vez, com a ilustração do que o usuário vai ver no Safari e o ponto do toque em destaque.
   Para revisar fora do iPhone, abra app.html#instalar-pwa (aparece em qualquer largura). No primeiro acesso (`auto: true`)
   some a partir de 768. */

const KEY = 'lp-install-guide-seen';

/** iPhone, no Safari comum (não dentro do app já instalado) e que ainda não viu o passo a passo. */
export function shouldShowInstallGuide() {
  try {
    const iphone = /iPhone|iPod/.test(navigator.userAgent);
    const standalone = navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    return iphone && !standalone && !localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

/** Guarda que o usuário já viu o guia (sem armazenamento, ele volta no próximo acesso). */
export function markInstallGuideSeen() {
  try {
    localStorage.setItem(KEY, '1');
  } catch { /* sem armazenamento: o guia volta no próximo acesso */ }
}

/* ---------- Ilustrações ---------- */

/** Anel pulsante que marca onde tocar. */
const spot = (content, className = '') => `<span class="${cx('c-ig-spot', className)}"><span class="c-ig-spot__ring" aria-hidden="true"></span>${content}</span>`;

const frame = content => `<div class="c-ig-frame" aria-hidden="true">${content}</div>`;

/** Abertura: o ícone do app com aviso de notificação e o que o usuário ganha ao instalar. */
function benefits() {
  const items = [['bell', 'Novidades e notificações em tempo real'], ['zap', 'Acesso rápido, direto da tela inicial'], ['award', 'Missões, prazos e conquistas sempre à mão']];
  return frame(`<div class="c-ig-art">
    <span class="c-ig-app">${logo('c-ig-app__logo')}<span class="c-ig-app__badge">3</span></span>
    <ul class="c-ig-benefits">${items.map(([name, label]) => `<li><span class="c-ig-benefits__icon">${icon(name, 16)}</span>${label}</li>`).join('')}</ul>
  </div>`);
}

function safariToolbar() {
  return frame(`<div class="c-ig-art c-ig-art--gap">
    <div class="c-ig-page"><span style="width:66%"></span><span style="width:50%"></span><span style="width:75%"></span></div>
    <div class="c-ig-toolbar">
      <span class="c-ig-toolbar__icon">${icon('chevron-left', 20)}</span>
      <span class="c-ig-toolbar__icon">${icon('chevron-right', 20)}</span>
      ${spot(`<span class="c-ig-toolbar__icon c-ig-toolbar__icon--on">${icon('share', 20)}</span>`)}
      <span class="c-ig-toolbar__icon">${icon('book-open', 20)}</span>
      <span class="c-ig-toolbar__icon">${icon('copy', 20)}</span>
    </div>
  </div>`);
}

function shareSheet() {
  return frame(`<div class="c-ig-card">
    <div class="c-ig-row c-ig-row--dim"><span>Copiar</span>${icon('copy', 18)}</div>
    <div class="c-ig-card__rule"></div>
    <div class="c-ig-row c-ig-row--dim"><span>Adicionar aos Favoritos</span>${icon('star', 18)}</div>
    <div class="c-ig-card__rule"></div>
    <div class="c-ig-row c-ig-row--on"><span>Adicionar à Tela de Início</span>${icon('plus-square', 18)}</div>
  </div>`);
}

function addDialog() {
  return frame(`<div class="c-ig-card">
    <div class="c-ig-dialog__head">
      <span class="c-ig-dialog__cancel">Cancelar</span>
      <b class="c-ig-dialog__title">Adicionar à Tela de Início</b>
      ${spot('<b class="c-ig-dialog__add">Adicionar</b>')}
    </div>
    <div class="c-ig-dialog__body">
      <span class="c-ig-dialog__icon">${logo('c-ig-dialog__logo')}</span>
      <span class="c-ig-dialog__info"><b>Ludos Pro</b><span>plataforma.ludospro.com.br</span></span>
    </div>
  </div>`);
}

const steps = [
  { intro: true, title: 'Instale o app da Ludos Pro', text: 'Receba as novidades e as notificações da sua plataforma sem perder nada. Leva menos de um minuto.', art: benefits },
  { title: 'Toque no botão Compartilhar', text: 'É o ícone de um quadrado com uma seta apontando para cima, na barra do Safari.', art: safariToolbar },
  { title: 'Selecione “Adicionar à Tela de Início”', text: 'Procure essa opção na lista que abriu.', tip: 'Se a opção não aparecer de imediato, role o menu para baixo ou procure em “Editar Ações”, conforme a versão do iOS.', art: shareSheet },
  { title: 'Confirme em “Adicionar”', text: 'O ícone será criado na tela inicial. A partir daí, você poderá abrir a plataforma diretamente por ele.', art: addDialog },
];

/* ---------- Tela ---------- */
function view(state) {
  if (state.closed) return '';
  const i = state.step;
  const last = i === steps.length - 1;
  const s = steps[i];
  return `<div class="${cx('c-ig', state.auto && 'c-ig--auto')}" role="dialog" aria-modal="true" aria-label="Como instalar a plataforma no iPhone">
    <div class="c-ig__bar">
      ${logo('c-ig__logo')}
      <button type="button" class="c-ig__skip" aria-label="Fechar o passo a passo" data-action="closeGuide">Pular${icon('x', 16)}</button>
    </div>
    <div class="c-ig__scroll">
      <div class="c-ig__step">
        ${s.art()}
        <div class="c-ig__text">
          ${s.intro ? '' : `<span class="c-ig__counter">Passo ${i} de ${steps.length - 1}</span>`}
          ${s.intro ? `<h1 class="c-ig__title c-ig__title--intro">${esc(s.title)}</h1>` : `<h2 class="c-ig__title">${esc(s.title)}</h2>`}
          <p class="c-ig__desc">${esc(s.text)}</p>
          ${s.tip ? `<p class="c-ig__tip">${icon('info', 14)}${esc(s.tip)}</p>` : ''}
        </div>
      </div>
    </div>
    <div class="c-ig__foot">
      <div class="c-ig__dots" role="presentation">${steps.map((_, n) => `<span class="${cx('c-ig__dot', n === i && 'is-on')}"></span>`).join('')}</div>
      <div class="c-ig__buttons">
        ${i > 0 ? button({ label: 'Voltar', variant: 'stroked', iconStart: 'chevron-left', action: 'prev', className: 'c-ig__back' }) : ''}
        ${button({ label: last ? 'Concluir' : s.intro ? 'Ver como instalar' : 'Próximo', iconEnd: last ? undefined : 'chevron-right', action: last ? 'closeGuide' : 'next', className: 'c-ig__next' })}
      </div>
    </div>
  </div>`;
}

/**
 * Monta o passo a passo.
 * - `auto: true` (primeiro acesso no iPhone): some a partir de 768. Sem ele (revisão em #instalar-pwa) aparece em qualquer largura.
 * - `onClose` (opcional): chamado ao fechar. Sem ele, na revisão a tela volta para #cursos.
 */
export function mountInstallGuide(root, { loading = true, auto = false, onClose } = {}) {
  const close = ctx => {
    markInstallGuideSeen();
    ctx.set({ closed: true });
    if (onClose) onClose();
    else if (!auto && location.hash.slice(1).split('?')[0] === 'instalar-pwa') location.hash = 'cursos';
  };
  return createView(root, {
    state: { loading, auto, step: 0, closed: false },
    view,
    breakpoints: [],
    actions: {
      next: ctx => ctx.set({ step: Math.min(ctx.state.step + 1, steps.length - 1) }),
      prev: ctx => ctx.set({ step: Math.max(ctx.state.step - 1, 0) }),
      closeGuide: ctx => close(ctx),
    },
    onMount: ctx => onEscape(ctx, () => close(ctx), () => !ctx.state.closed),
  });
}
