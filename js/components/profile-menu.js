import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { lpIcon } from '../core/lp-icons.js';
import { avatar } from './avatar.js';

/* Menu do perfil (referência design-ref/topbar-menu-ludospro.html, DS menuTopbar → dropdownMenumaster).
   Pílula do perfil na app bar (avatar + chevron, que gira ao abrir) e o dropdown de 288px alinhado à direita, 8px abaixo:
   Minha conta · Histórico de atividades · Regulamento · Idioma da plataforma (bandeira + check) · Sons da plataforma (liga e
   desliga os efeitos sonoros das atividades) · Tema (claro, escuro, sistema) + "Melhorar contraste" · Instalar como aplicativo
   · Sair · Versão 4.0.

   É um disclosure (botão com aria-expanded que abre um painel de botões), não um role="menu": assim Tab e Enter funcionam
   sem precisar de navegação por setas. Ações: toggleProfile, pickLang, toggleSound, pickTheme, toggleContrast; os itens que levam a
   outra área usam data-action="navigate" (tratado pela casca). Regra do projeto: nunca mostrar lápis de edição ao lado do nome. */

export const LANGS = [
  { id: 'pt-BR', flag: 'br', label: 'Português' },
  { id: 'pt-PT', flag: 'pt', label: 'Português (PT)' },
  { id: 'en', flag: 'us', label: 'English' },
  { id: 'es', flag: 'es', label: 'Español' },
];

const THEMES = [
  { id: 'light', label: 'Tema claro', icon: () => icon('sun', 16) },
  { id: 'dark', label: 'Tema escuro', icon: () => icon('moon', 16) },
  { id: 'system', label: 'Tema do sistema', icon: () => lpIcon('stepper-i', 16) },
];

/** Linha do menu: ícone 18 + texto 14/500, 44px de altura. `id` leva a outra área (navigate); sem `id` é só demonstração. */
const row = ({ iconHtml, label, id, action }) =>
  `<button type="button" class="c-profile-menu__row" ${id ? `data-action="navigate" data-id="${id}"` : `data-action="${action ?? 'closeProfile'}"`}>${iconHtml}<span>${esc(label)}</span></button>`;

const divider = () => '<div class="c-profile-menu__divider" role="separator"></div>';

function langs(current) {
  return `<div class="c-profile-menu__group" role="radiogroup" aria-labelledby="profile-lang">
    ${LANGS.map(l => {
      const on = l.id === current;
      return `<button type="button" role="radio" aria-checked="${on}" class="${cx('c-profile-menu__row c-profile-menu__lang', on && 'is-active')}" data-action="pickLang" data-id="${l.id}">
        <img class="c-profile-menu__flag" src="assets/flags/${l.flag}.svg" alt="" />
        <span>${esc(l.label)}</span>
        ${on ? icon('check', 16, 'c-profile-menu__check') : ''}
      </button>`;
    }).join('')}
  </div>`;
}

/** Sons da plataforma: chave liga/desliga dos efeitos sonoros das atividades (js/core/sound.js), no mesmo modelo de
    "Tema" + "Melhorar contraste": ícone e nome em cima, a chave com a situação embaixo e uma linha de ajuda. */
function sounds(on) {
  return `<div class="c-profile-menu__sound">
    <span class="c-profile-menu__theme-label">${icon(on ? 'volume-2' : 'volume-x', 18)}<span id="profile-sound">Sons da plataforma</span></span>
    <button type="button" role="switch" aria-checked="${on}" aria-labelledby="profile-sound" aria-describedby="profile-sound-help" class="c-profile-menu__switch" data-action="toggleSound">
      <span class="c-switch" aria-hidden="true"><span class="c-switch__knob"></span></span>
      <span>${on ? 'Ligados' : 'Desligados'}</span>
    </button>
    <span class="c-profile-menu__help" id="profile-sound-help">Efeitos sonoros ao responder, acertar e concluir as atividades.</span>
  </div>`;
}

function theme(mode, contrast) {
  return `<div class="c-profile-menu__theme">
    <span class="c-profile-menu__theme-label">${lpIcon('wand', 18)}<span id="profile-theme">Tema</span></span>
    <div class="c-profile-menu__seg" role="radiogroup" aria-labelledby="profile-theme">
      ${THEMES.map(t => `<button type="button" role="radio" aria-checked="${t.id === mode}" aria-label="${t.label}" title="${t.label}" class="${cx('c-profile-menu__seg-btn', t.id === mode && 'is-active')}" data-action="pickTheme" data-id="${t.id}">${t.icon()}</button>`).join('')}
    </div>
  </div>
  <div class="c-profile-menu__contrast">
    <button type="button" role="switch" aria-checked="${contrast}" aria-describedby="profile-contrast-help" class="c-profile-menu__switch" data-action="toggleContrast">
      <span class="c-switch" aria-hidden="true"><span class="c-switch__knob"></span></span>
      <span>Melhorar contraste</span>
    </button>
    <span class="c-profile-menu__help" id="profile-contrast-help">Quando ativado, o contraste entre os textos, os controles e seus fundos é aumentado.</span>
  </div>`;
}

/**
 * profileMenu({ open, enter, small, lang, mode, contrast, id })
 * small: pílula compacta do mobile (app bar de 44). id: sufixo único do painel (há uma pílula no mobile e outra no desktop).
 * enter: anima a entrada (só na renderização que abriu o menu, para não repetir ao trocar tema ou idioma).
 */
export function profileMenu({ open = false, enter = false, small = false, lang = 'pt-BR', mode = 'light', contrast = false, sound = true, id = 'profile' }) {
  const panelId = `${id}-menu`;
  return `<div class="c-profile" data-profile>
    <button type="button" class="${cx('c-user-pill', small && 'c-user-pill--small', open && 'is-open')}" aria-label="Menu do perfil de Mariana Santana" title="Mariana Santana" aria-haspopup="true" aria-expanded="${open}" aria-controls="${panelId}" data-action="toggleProfile" data-key="${id}-pill">
      ${avatar({ size: 'small', use: 'illustration' })}${icon('chevron-down', small ? 16 : 18, 'c-user-pill__chevron')}
    </button>
    ${open ? `<div class="${cx('c-profile-menu', enter && 'is-entering')}" id="${panelId}" aria-label="Menu do perfil">
      ${row({ iconHtml: icon('user', 18), label: 'Minha conta' })}
      ${divider()}
      ${row({ iconHtml: icon('clock', 18), label: 'Histórico de atividades' })}
      ${divider()}
      ${row({ iconHtml: lpIcon('check-square', 18), label: 'Regulamento', id: 'regulamento' })}
      ${divider()}
      <span class="c-profile-menu__heading" id="profile-lang">${lpIcon('language-select', 18)}Idioma da plataforma</span>
      ${langs(lang)}
      ${divider()}
      ${sounds(sound)}
      ${divider()}
      ${theme(mode, contrast)}
      ${divider()}
      ${row({ iconHtml: icon('download', 18), label: 'Instalar como aplicativo', id: 'instalar-pwa' })}
      ${divider()}
      ${row({ iconHtml: icon('log-out', 18), label: 'Sair' })}
      ${divider()}
      <span class="c-profile-menu__version">Versão 4.0</span>
    </div>` : ''}
  </div>`;
}
