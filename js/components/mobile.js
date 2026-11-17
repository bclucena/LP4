import { attrs, cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { tag } from './badges.js';
import { avatar } from './avatar.js';
import { progressDonut, infoLine } from './progress.js';

/* Componentes mobile do Figma (página "componentes mobile"): cards da home, tabs, text field, dropdown e ranking.
   Medidas e cores seguem o Figma. Fotos e ilustrações são placeholders. Os cards com favorito disparam `mToggleFav`
   (data-key); quem usa guarda o estado e passa `fav` já resolvido. */

export const bullet = () => '<span class="c-m-bullet" aria-hidden="true"></span>';

/** Pill mobile: ícone de 8px com texto opcional de 8px. tone: info, error, success, warning, subtle ou system. */
export const mpill = ({ tone = 'system', iconName, iconHtml, label } = {}) =>
  `<span class="c-m-pill c-m-pill--${tone} ${label ? 'c-m-pill--label' : ''}">${iconHtml ?? (iconName ? icon(iconName, 8) : '')}${label ? esc(label) : ''}</span>`;

const TITLE = 'UX & Design Thinking: Experiência do Usuário nos negócios';

export const tagRow = (tags, extra = 0) =>
  `<div class="c-m-tags">${tags.map(t => tag({ label: t, size: 'mobile' })).join('')}${extra > 0 ? tag({ label: `+${extra}`, size: 'mobile', outlined: true }) : ''}</div>`;

const favButton = (key, on, small = false) =>
  `<button type="button" class="c-m-fav ${on ? 'is-on' : ''}" aria-label="Favoritar" aria-pressed="${on}" data-action="mToggleFav" data-key="${key}">${icon('bookmark', small ? 14 : 14).replace('fill="none"', on ? 'fill="currentColor"' : 'fill="none"')}</button>`;

/* ---------- Base dos cards ---------- */
function cardBase({ pills = '', title = TITLE, fav, favKey, line, progress = '', tags, ratio = 'wide' }) {
  return `<div class="c-m-card">
    <div class="c-m-card__top">
      ${pills ? `<div class="c-m-card__pills"><div>${pills}</div></div>` : ''}
      <div class="c-m-image c-m-image--${ratio}"></div>
    </div>
    <div class="c-m-card__body">
      <div class="c-m-card__title-row"><p class="c-m-card__title">${esc(title)}</p>${fav !== undefined ? favButton(favKey, fav) : ''}</div>
      ${line}
      <div class="c-m-card__foot">${tags ?? tagRow(['RH', 'CEO', 'CTO'], 9)}${progress}</div>
    </div>
  </div>`;
}

const count = '<span class="c-m-count">0/100</span>';

/** Card da home (168 de largura). variant: cursos, eventos ou loja. */
export function cardHome({ variant = 'cursos', title = TITLE, novo = false, agora = false, encerrado = false, fav = false, favKey = '', tags = ['RH', 'CEO'], extraTags = 9, progress = '0/100', date = '30 dez 2026 - 02 jan 2027', time = '14:00 - 18:00', price = '1.000', multiple = false, skeleton = false } = {}) {
  if (skeleton) {
    return `<div class="c-m-card"><div class="c-m-card__top"><div class="c-m-bone c-m-bone--img"></div></div><div class="c-m-card__body">
      <div class="c-m-skel-lines"><span class="c-m-bone" style="width:100%"></span><span class="c-m-bone" style="width:132px"></span></div>
      <div class="c-m-skel-info"><span class="c-m-bone c-m-bone--sq"></span><div><span class="c-m-bone" style="width:32px"></span><span class="c-m-bone" style="width:40px"></span></div></div>
      <div class="c-m-card__foot"><div class="c-m-tags"><span class="c-m-bone c-m-bone--tag"></span><span class="c-m-bone c-m-bone--tag"></span><span class="c-m-bone c-m-bone--tag" style="width:18px"></span></div><span class="c-m-bone c-m-bone--dot"></span></div></div></div>`;
  }
  const pills = [novo && mpill({ tone: 'info', iconName: 'award' }), encerrado && mpill({ tone: 'error', iconName: 'x-circle' }), agora && mpill({ tone: 'success', iconName: 'radio' })].filter(Boolean).join('');
  const line = variant === 'eventos'
    ? infoLine(icon('calendar', 8), `<span>${esc(date)}</span>`, `<span>${esc(time)}</span>`)
    : variant === 'cursos'
      ? infoLine(icon('users', 8), 'Entre turmas', 'Semanal')
      : `<div class="c-m-price"><span class="c-m-price__icon">${icon('dollar-sign', 8)}</span><b>${esc(price)}</b>${multiple ? `${bullet()}<span>(a partir)</span>` : ''}</div>`;
  return cardBase({
    pills, title, fav: variant === 'eventos' ? fav : undefined, favKey, line, ratio: variant === 'loja' ? 'square' : 'wide',
    tags: tagRow(tags, extraTags), progress: variant !== 'loja' ? `<span class="c-m-count">${esc(progress)}</span>` : '',
  });
}

/** Card de certificado. kind: curso, evento ou hibrido. */
export function cardCertificado({ kind = 'curso', novo = true, certificado = true, fav = true, favKey = '' } = {}) {
  const map = { curso: ['book', '3 Cursos'], evento: ['calendar', '2 Eventos'], hibrido: ['layers', '3 Cursos e 2 eventos'] }[kind];
  return cardBase({ fav, favKey, pills: `${novo ? mpill({ tone: 'info', iconName: 'award' }) : ''}${certificado ? mpill({ tone: 'success', iconName: 'check-circle' }) : ''}`, line: infoLine(icon(map[0], 8), map[1]), progress: count });
}

const statusPill = {
  novo: mpill({ tone: 'info', iconName: 'award' }),
  devolvido: mpill({ tone: 'warning', iconName: 'corner-up-left' }),
  aprovado: mpill({ tone: 'success', iconName: 'check-circle' }),
  reprovado: mpill({ tone: 'error', iconName: 'x-circle' }),
  emCorrecao: mpill({ tone: 'subtle', iconName: 'clock' }),
};

/** Card de missão. use: meta (donut de progresso) ou evidencia (contador). status: lista de novo, devolvido, aprovado, reprovado, emCorrecao. */
export const cardMissao = ({ use = 'meta', status = ['novo'], fav = true, favKey = '', progress = 40 } = {}) =>
  cardBase({
    fav, favKey, pills: status.map(s => statusPill[s]).join(''),
    line: infoLine(icon(use === 'meta' ? 'flag' : 'clipboard', 8), use === 'meta' ? 'Meta' : 'Evidência', `<span class="c-m-inline">Individual ${bullet()} Trimestral</span>`),
    progress: use === 'meta' ? progressDonut(progress) : count,
  });

const libKinds = { arquivo: ['Arquivo', 'file'], audio: ['Áudio', 'music'], video: ['Vídeo', 'video'], imagem: ['Imagem', 'image'], link: ['Link', 'link'] };

/** Card de biblioteca. kind: arquivo, audio, video, imagem ou link. */
export const cardBiblioteca = ({ kind = 'arquivo', fav = true, favKey = '' } = {}) =>
  cardBase({ fav, favKey, pills: mpill({ tone: 'info', iconName: 'award' }), line: infoLine(icon(libKinds[kind][1], 8), libKinds[kind][0]), tags: tagRow(['RH', 'CEO', 'CTO']) });

/** Emblema de exemplo (as ilustrações do Figma precisam ser exportadas). */
export function emblem({ kind = 'merito', active = false, size = 80 } = {}) {
  const main = active ? (kind === 'merito' ? 'var(--color-red-500)' : 'var(--color-yellow-400)') : 'var(--color-gray-400)';
  const dark = active ? (kind === 'merito' ? 'var(--color-gray-900)' : 'var(--color-purple-800)') : 'var(--color-gray-600)';
  const star = active ? 'var(--color-yellow-200)' : 'var(--color-gray-200)';
  return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true">
    <polygon points="40,4 70,21 70,59 40,76 10,59 10,21" fill="${dark}"/><polygon points="40,12 63,25 63,55 40,68 17,55 17,25" fill="${main}"/>
    ${kind === 'merito' ? '<text x="40" y="49" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">5</text>' : `<polygon points="40,22 45,35 59,35 48,43 52,57 40,49 28,57 32,43 21,35 35,35" fill="${star}"/>`}</svg>`;
}

/** Card de conquista (112 de largura). Inativa fica em tons de cinza. kind: merito ou epica. */
export const cardConquista = ({ kind = 'merito', active = false, novo = true, label = 'Conexões em movimento', progress = 50 } = {}) =>
  `<div class="c-m-card c-m-card--achievement"><div class="c-m-card__top">
    ${novo ? `<div class="c-m-card__new">${mpill({ tone: 'info', iconName: 'award' })}</div>` : ''}
    <div class="c-m-emblem">${emblem({ kind, active })}</div></div>
    <div class="c-m-card__body"><p class="c-m-card__title c-m-card__title--center">${esc(label)}</p>
    <div class="c-m-card__spread">${infoLine(icon(kind === 'merito' ? 'award' : 'star', 8), kind === 'merito' ? 'Mérito' : 'Épica')}${progressDonut(progress)}</div></div></div>`;

const reactionDot = (tone, name) => `<span class="c-m-reaction c-m-reaction--${tone}">${icon(name, 8)}</span>`;

/** Card de news (360 de largura), com ou sem imagem. */
export function cardNews({ use = 'image', reactions = false, fav = true, favKey = '' } = {}) {
  return `<div class="c-m-news">
    ${use === 'image' ? '<div class="c-m-card__top"><div class="c-m-image c-m-image--wide"></div></div>' : ''}
    <div class="c-m-news__body ${use === 'text' ? 'c-m-news__body--text' : ''}">
      <div class="c-m-card__spread c-m-card__spread--top">${infoLine(icon('clock', 8), `<span class="c-m-inline">Publicado há 2 horas ${mpill({ tone: 'info', iconName: 'award' })}</span>`)}${favButton(favKey, fav)}</div>
      <p class="c-m-news__title">${TITLE}</p>
      <p class="c-m-news__text">Aprendizagem corporativa é o conjunto de ações e estratégias que as empresas utilizam para capacitar seus colaboradores e melhorar resultados.</p>
      <div class="c-m-indent">${tagRow(['RH', 'CEO', 'CTO', 'CFO', 'PSTU', 'BDSM'])}</div>
      <div class="c-m-author">${avatar({ size: 'small', use: 'illustration' })}<span class="c-m-inline"><b>Mariana Silva</b>${bullet()}<span>Gerente de Recursos Humanos</span></span></div>
      <div class="c-m-rule"></div>
      <div class="c-m-news__actions"><span class="c-m-inline c-m-inline--gap2"><span class="c-m-inline">${icon('thumbs-up', 14)}${reactions ? '300 reações' : 'Gostar'}</span>${bullet()}<span class="c-m-inline">${icon('message-square', 14)}${reactions ? '22 comentários' : 'Comentar'}</span></span>
      ${reactions ? `<span class="c-m-reactions">${reactionDot('info', 'thumbs-up')}${reactionDot('error', 'heart')}${reactionDot('success', 'smile')}</span>` : ''}</div>
    </div></div>`;
}

/* ---------- Tabs ---------- */
/** Abas de 30 de altura, texto de 10px. items: [{ id, label, reaction? }]. Dispara `action` (data-action) com data-id. */
export const mTabs = ({ items, value, action }) =>
  `<div role="tablist" class="c-m-tabs">${items.map(i => `<button type="button" role="tab" class="c-m-tab ${i.id === value ? 'is-active' : ''}" aria-selected="${i.id === value}" data-action="${action}" data-id="${i.id}">${i.reaction ? `<span class="c-m-tab__reaction">${icon('thumbs-up', 8).replace('stroke-width="1"', 'stroke-width="3"')}</span>` : ''}${esc(i.label)}</button>`).join('')}</div>`;

/* ---------- Text field ---------- */
/** Campo de texto. state: hover, pressed ou disabled (forçado, catálogo). `input` liga a digitação ao handler (data-input). */
export function textField({ header = 'header', placeholder = 'text', support = 'support text', limit, iconLeft = 'activity', iconRight = 'search', state, value, input, maxlength, key } = {}) {
  const disabled = state === 'disabled';
  return `<label class="c-m-field ${disabled ? 'is-disabled' : ''}" ${state && state !== 'default' ? `data-state="${state}"` : ''}>
    ${header ? `<span class="c-m-field__header">${esc(header)}</span>` : ''}
    <span class="c-m-field__box">${iconLeft ? icon(iconLeft, 16) : ''}
      <input ${attrs({ placeholder, value: value ?? (state && state !== 'default' ? 'text' : undefined), disabled, maxlength, 'data-input': input, 'data-key': key })} />
    ${iconRight ? icon(iconRight, 16) : ''}</span>
    ${support || limit ? `<span class="c-m-field__support"><span>${esc(support ?? '')}</span>${limit ? `<span>${esc(limit)}</span>` : ''}</span>` : ''}
  </label>`;
}

const mask = v => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2}\/\d{2})(\d)/, '$1/$2');
export const maskDate = mask;

/** Date picker: dois campos de data com máscara dd/mm/aaaa. */
export const datePicker = ({ title = 'Período de corte', a = '', b = '' } = {}) =>
  `<div class="c-m-date"><span class="c-m-date__title">${esc(title)}</span><div class="c-m-date__row">
    <div>${textField({ header: 'Data inicial', placeholder: 'dd/mm/aaaa', support: null, iconLeft: null, iconRight: 'calendar', value: a, input: 'mDateA', key: 'm-date-a' })}</div>
    <div>${textField({ header: 'Data final', placeholder: 'dd/mm/aaaa', support: null, iconLeft: null, iconRight: 'calendar', value: b, input: 'mDateB', key: 'm-date-b' })}</div></div></div>`;

/* ---------- Dropdown ---------- */
/** Item de dropdown. use: checkbox, clear, language, icon, radio, radioIcon, language-list ou download. state: hover/pressed forçado. */
export function dropdownItem({ use = 'checkbox', label = '1 a 3 horas', state, checked, action, data = {} } = {}) {
  const on = checked ?? state === 'pressed';
  const dataAttrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  const click = action ? `data-action="${action}" ${dataAttrs}` : '';
  if (use === 'download') return `<button type="button" class="c-m-dd c-m-dd--download" ${click}>${icon('log-in', 16)}<span class="c-m-dd__label">${esc(label)}</span></button>`;
  const mark = use === 'checkbox'
    ? `<span class="c-m-dd__mark c-m-dd__mark--check ${on ? 'is-on' : ''}">${on ? '<span></span>' : ''}</span>`
    : use === 'radio' || use === 'radioIcon'
      ? `<span class="c-m-dd__mark c-m-dd__mark--radio ${on ? 'is-on' : ''}">${on ? '<span></span>' : ''}</span>`
      : use === 'icon' ? icon('box', 16, 'c-m-dd__icon')
        : use === 'language' ? '<span class="c-m-dd__flag">★</span>' : '';
  const body = use === 'language-list'
    ? `<span class="c-m-inline">${icon('globe', 16)}<span class="${on ? '' : 'is-dark'}">Idioma da plataforma</span>${bullet()}<span class="c-m-dd__flag c-m-dd__flag--green">●</span><span class="is-dark">Português</span></span>${icon('chevron-down', 16)}`
    : `<span class="c-m-dd__label ${(use === 'icon' || use === 'language') && !on ? 'is-dark' : ''}">${esc(label)}</span>`;
  return `<button type="button" class="c-m-dd ${use === 'language-list' ? 'c-m-dd--wide' : ''} ${on ? 'is-on' : ''}" ${state ? `data-state="${state}"` : ''} ${click}>${mark}${body}${use === 'icon' || use === 'radioIcon' ? icon('chevron-right', 16, 'c-m-dd__icon') : ''}</button>`;
}

/** Menu de dropdown interativo; `selected` é a lista escolhida e `id` identifica o menu em data-menu. */
export const dropdownMenu = ({ id, items, use = 'checkbox', selected = [] }) =>
  `<div class="c-m-ddmenu">${items.map(i => dropdownItem({ use, label: i, checked: selected.includes(i), action: 'mDropdown', data: { menu: id, value: i, multiple: use === 'checkbox' } })).join('')}</div>`;

/* ---------- Ranking ---------- */
/** Item de ranking: posição, avatar de 24, nome, pontos e variação. */
export const rankingItem = ({ position = 4, username = 'Mariana Santana', pontos = '15.000', progress = '+2', myProfile = false } = {}) =>
  `<div class="c-m-rank ${myProfile ? 'is-mine' : ''}"><div class="c-m-rank__row">
    <div class="c-m-rank__pos">${position}</div>
    <div class="c-m-rank__main"><div class="c-m-rank__who">${avatar({ size: 'small', use: 'illustration' })}<span>${esc(username)}</span></div>
      <div class="c-m-rank__points"><span class="c-m-inline c-m-inline--gap4"><b>${esc(pontos)}</b><small>Pontos</small></span>${progress ? `<span class="c-m-rank__delta">${icon('chevron-up', 16)}${esc(progress)}</span>` : ''}</div></div></div></div>`;

const podiumTone = { 1: ['gold', 'Primeiro lugar'], 2: ['silver', 'Segundo lugar'], 3: ['bronze', 'Terceiro lugar'] };

export const podiumCard = ({ place = 1, username = 'Mariana Santana', pontos = '15.425', myProfile = false } = {}) => {
  const [tone, label] = podiumTone[place];
  return `<div class="c-m-podium ${place !== 1 ? 'c-m-podium--low' : ''} c-m-podium--${tone}"><div class="c-m-podium__content">
    <div class="c-m-podium__who">${avatar({ size: 'medium', use: 'illustration', px: 40, className: `c-m-podium__avatar ${myProfile ? 'is-mine' : ''}` })}<span class="c-m-podium__name">${esc(username)}</span><small>${label}</small></div>
    <div class="c-m-podium__score"><span class="c-m-podium__place">${place}</span><b>${esc(pontos)}</b><small>Pontos</small>${myProfile ? `<span class="c-m-podium__mine">${icon('award', 8)} Minha posição</span>` : ''}</div></div><div class="c-m-podium__base"></div></div>`;
};

export const rankingPodium = () =>
  `<div class="c-m-podiums">${podiumCard({ place: 2, username: 'Carlos Lima', pontos: '14.980' })}${podiumCard({ place: 1 })}${podiumCard({ place: 3, username: 'Joana Reis', pontos: '13.870', myProfile: true })}</div>`;

/** Card de ranking (192). use: ativo ou finalizado. `pressed` marca o selecionado. */
export const rankingCard = ({ use = 'ativo', pressed = false, title = TITLE, action, id } = {}) =>
  `<button type="button" class="c-m-rankcard" ${pressed ? 'data-state="pressed"' : ''} ${action ? `data-action="${action}" data-id="${id}"` : ''}>
    <p>${esc(title)}</p>${infoLine(icon('users', 8), 'Entre turmas', 'Semanal')}
    <div class="c-m-rankcard__people"><span>${['A', 'B', 'C'].map(() => avatar({ size: 'small', use: 'illustration', className: 'c-avatar--ring' })).join('')}</span><small>+120</small></div>
    ${infoLine(icon(use === 'ativo' ? 'check-circle' : 'x-circle', 8), use === 'ativo' ? `<span class="c-m-inline">Ativo ${bullet()} 5ª rodada</span>` : 'Finalizado')}
  </button>`;

/** Ranking selecionado em cima e lista horizontal de 8 rankings. */
export const rankingOptions = ({ selected = 0 } = {}) =>
  `<div class="c-m-options"><div class="c-m-options__top"><div class="c-m-options__current"><p>${TITLE}</p>${infoLine(icon('users', 8), 'Entre turmas', 'Semanal')}</div></div><div class="c-m-options__rule"></div>
    <div class="c-m-options__list"><h4>Rankings (8)</h4><div class="c-m-options__row u-thin-scroll">${Array.from({ length: 8 }, (_, i) => rankingCard({ use: i === 7 ? 'finalizado' : 'ativo', pressed: selected === i, action: 'mRankOption', id: i })).join('')}</div></div></div>`;

/* ---------- Progresso ---------- */
/** Barra de progresso de 8 com rótulo; `min` mostra o indicador de meta mínima. */
export const progressBlock = ({ label, value = 0, done = false, min } = {}) =>
  `<div class="c-m-progress"><div class="c-m-progress__head"><span>${esc(label ?? (done ? 'Concluído!' : 'Progresso'))}</span><span>${done ? 100 : value}%</span></div>
    <div class="c-m-progress__line ${min !== undefined ? 'has-min' : ''}"><div class="c-m-progress__fill ${done ? 'is-done' : ''}" style="width:${done ? 100 : value}%"></div>
    ${min !== undefined ? `<div class="c-m-progress__min" style="left:${min}%"><i></i><span>Mín. ${min}%</span></div>` : ''}</div></div>`;
