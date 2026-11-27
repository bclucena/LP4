import { esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { avatar } from './avatar.js';
import { infoLine } from './progress.js';
import { bullet, mpill, tagRow, emblem, progressBlock, textField } from './mobile.js';

/* Conteúdos dos bottom sheets do mobile (Figma "componentes mobile"). Aqui o sheet é uma folha estática de 360 de largura,
   para mostrar no catálogo; no produto o mesmo conteúdo entra no painel (`js/components/panel.js`).
   Estado dos sheets interativos (acordeão da missão, abas, campo de comentário) fica em quem usa. */

const lorem = 'Participe de um encontro exclusivo que reúne líderes visionários e especialistas renomados do setor de saúde para discutir as transformações que a tecnologia está promovendo no cuidado ao paciente.';
const longTitle = 'UX & Design Thinking: A importância da Experiência do Usuário para o sucesso dos negócios. O essencial para criar soluções eficazes.';

/** Folha de 360 com handle, área rolável (padding 16) e rodapé fixo (padding inferior de 32). */
export const bottomSheet = ({ body, footer = '', height = 494 }) =>
  `<div class="c-ms" style="height:${height}px"><div class="c-ms__handle"><span></span></div><div class="c-ms__body">${body}</div>${footer ? `<div class="c-ms__footer">${footer}</div>` : ''}</div>`;

/** Botão do rodapé (fundo de ação). `iconName` à direita; disabled usa o visual de desabilitado. */
export const mobileButton = ({ label, iconName, disabled = false, action, data = '' } = {}) =>
  `<button type="button" class="c-ms-btn" ${disabled ? 'disabled' : ''} ${action ? `data-action="${action}"` : ''} ${data}>${esc(label)}${iconName ? icon(iconName, 16) : ''}</button>`;

const divider = () => '<div class="c-ms-divider"></div>';
const imageBox = (ratio, extra = '') => `<div class="c-m-image c-m-image--${ratio} c-ms-img" ${extra}></div>`;
const bookmarkOn = () => icon('bookmark', 14, 'c-ms-bookmark').replace('fill="none"', 'fill="currentColor"');

/* ---------- Missão ---------- */
function missionVersion({ title, date, pill = '', open, id, body = '' }) {
  return `<div class="c-ms-version"><div class="c-ms-version__head">
    <div class="c-ms-version__main"><span class="c-m-inline">${icon('send', 12)}<b>${title}</b>${bullet()}<span>${date}</span></span>${pill}</div>
    <button type="button" class="c-ms-version__toggle" aria-label="Expandir" aria-expanded="${open}" data-action="sMissionOpen" data-id="${id}">${icon('chevron-down', 16, open ? 'is-open' : '')}</button></div>
    ${open && body ? `${divider()}<div class="c-ms-version__body">${body}</div>` : ''}</div>`;
}

/** Missão: versões em acordeão (a 2ª aberta tem link, texto e arquivo) e o botão Enviar. */
export const missionSheet = ({ open = 'v2' } = {}) => bottomSheet({
  footer: mobileButton({ label: 'Enviar', iconName: 'arrow-right' }),
  body: `<div class="c-ms-col1"><span class="c-ms-strong">Rodada 23</span><span class="c-ms-meta">26 Jul. - 3 Ago. 2026</span></div>
    ${infoLine(icon('info', 12), 'Para concluir sua missão, envie aqui sua evidência.')}${divider()}
    <div class="c-ms-col2">
      ${missionVersion({ title: '1ª Versão', date: '26 Jul. 2026', pill: mpill({ tone: 'warning', iconName: 'corner-up-left', label: 'Devolvido' }), open: open === 'v1', id: 'v1' })}
      ${missionVersion({ title: '2ª Versão', date: '26 Jul. - 3 Ago. 2026', open: open === 'v2', id: 'v2', body: `
        ${textField({ header: 'Enviar link', placeholder: 'Adicione um link', support: null, iconLeft: 'link-2', iconRight: null })}
        ${textField({ header: 'Enviar texto', placeholder: 'Adicione um texto...', support: null, limit: '0/100', iconLeft: null, iconRight: null })}
        <div class="c-ms-upload"><span class="c-ms-upload__icon">${icon('upload', 16)}</span><span class="c-ms-upload__text"><b>Adicione um arquivo</b><span>ou arraste um arquivo aqui (PDF, imagem ou vídeo, até 25MB)</span></span></div>
        ${infoLine(icon('info', 12), 'Adicione ao menos um link, texto ou arquivo antes de enviar.')}` })}
    </div>`,
});

/* ---------- Loja ---------- */
export const storeSheet = () => bottomSheet({
  footer: `<div class="c-ms-price"><span>${icon('dollar-sign', 20, 'c-ms-price__icon')}1.000</span><button type="button" class="c-ms-btn c-ms-btn--auto">Finalizar compra</button></div>`,
  body: `${imageBox('square')}<p class="c-ms-title">UX &amp; Design Thinking: A importância da Experiência do Usuário</p>`,
});

/* ---------- Conquista ---------- */
const rewards = () => `<div class="c-ms-rewards">Recompensas<span>${icon('star', 12)} 3.500</span><span>${icon('dollar-sign', 12)} 500</span></div>`;

/** Conquista. variant: progresso, epica (carrossel de emblemas) ou concluido (com voltar). */
export const achievementSheet = ({ variant = 'progresso' } = {}) => bottomSheet({
  body: `${variant === 'concluido' ? `<button type="button" class="c-ms-back">${icon('corner-up-left', 12)} Voltar</button>` : ''}
    <div class="c-ms-center">${emblem({ kind: variant === 'epica' ? 'epica' : 'merito', active: true, size: variant === 'epica' ? 140 : 110 })}</div>
    ${variant === 'epica' ? `<div class="c-ms-carousel"><div>${[0, 1, 2, 3].map(() => emblem({ active: true, size: 24 })).join('')}</div><div class="c-ms-dots"><i class="is-on"></i><i></i><i></i></div></div>` : progressBlock({ done: variant === 'concluido', value: 0 })}
    <p class="c-ms-title">Acessar 5 dias consecutivos</p><p class="c-ms-text">${lorem}</p>${rewards()}`,
});

/* ---------- Certificado e biblioteca ---------- */
/** Certificado: o botão de baixar só habilita com 100% de progresso (`done`). */
export const certificateSheet = ({ done = false } = {}) => bottomSheet({
  footer: mobileButton({ label: 'Baixar certificado', iconName: 'download', disabled: !done }),
  body: `${imageBox('wide')}<div class="c-ms-titlerow"><p class="c-ms-title">${longTitle}</p>${bookmarkOn()}</div>${tagRow(['Marketing', 'Marketing', 'Marketing'], 3)}
    ${progressBlock({ done, value: 0 })}<div class="c-ms-rule"></div><p class="c-ms-h">Conteúdo do certificado</p><p class="c-ms-text">${lorem}</p>`,
});

export const librarySheet = () => bottomSheet({
  footer: mobileButton({ label: 'Baixar', iconName: 'download' }),
  body: `${imageBox('wide', 'style="width:80%;margin:0 auto"')}<div class="c-ms-titlerow"><p class="c-ms-title">${longTitle}</p>${bookmarkOn()}</div>${tagRow(['Marketing', 'Marketing', 'Marketing'], 3)}
    <p class="c-ms-h">Sobre o arquivo</p><p class="c-ms-text">${lorem}</p>`,
});

/* ---------- Ranking ---------- */
const rounds = [['atual', 'Atual'], ['concluido', 'Concluído'], ['encerrado', 'Encerrado'], ['encerrado', 'Encerrado']];

/** Histórico de rodadas; `title` mostra o cabeçalho "Histórico" com o fechar. O botão "Ver ranking" é desabilitado na rodada atual. */
export const rankingHistorySheet = ({ title = true } = {}) => bottomSheet({
  height: title ? 710 : 534,
  body: `${title ? `<div class="c-ms-head">Histórico ${icon('x', 16)}</div>` : ''}
    ${infoLine(icon('info', 12), 'Veja o resultado das rodadas anteriores deste ranking e a rodada em andamento.')}<div class="c-ms-rule"></div>
    ${rounds.map(([s, label]) => `<div class="c-ms-round"><div class="c-ms-round__top"><span class="c-ms-round__icon">${icon('calendar', 16)}</span><span class="c-ms-round__date">15 jul 2026 – 01 out 2026</span>${mpill({ tone: s === 'atual' ? 'info' : s === 'concluido' ? 'success' : 'subtle', iconName: s === 'encerrado' ? 'x' : 'check-circle', label })}</div>
      <span class="c-ms-round__info"><b>${s === 'atual' ? 'Posição atual' : 'Posição final'}</b>${bullet()}12º Lugar${bullet()}18.200pts</span>
      <button type="button" class="c-ms-round__btn" ${s === 'atual' ? 'disabled' : ''}>Ver ranking</button></div>`).join('')}`,
});

export const rankingInfoSheet = () => bottomSheet({
  height: 534,
  body: `<p class="c-ms-title">${longTitle}</p><p class="c-ms-text c-ms-text--default">${lorem}</p>
    <div class="c-ms-grid2"><div class="c-ms-card">${infoLine(icon('users', 12), '<b class="c-ms-k">Entre turmas</b>', 'Disputa turma contra turma')}</div><div class="c-ms-card">${infoLine(icon('calendar', 12), '<b class="c-ms-k">Reinicia todo ano</b>', 'Atualiza no início do ano')}</div></div>
    <div class="c-ms-note">${infoLine(icon('info', 12), '<b>Critério de desempate</b>', 'Em caso de empate na pontuação, vence quem somou mais pontos na primeira jogada de cada atividade.')}</div>
    <div class="c-ms-rule"></div><p class="c-ms-h">Conteúdo do ranking</p>`,
});

/* ---------- Gestores ---------- */
const managerTabs = [['rotas', 'Rotas e aprendizagem'], ['cursos', 'Cursos'], ['cert', 'Certificados']];

/** Gestores: dados do colaborador, quatro indicadores e abas de rotas, cursos e certificados. */
export const managerSheet = ({ tab = 'rotas' } = {}) => bottomSheet({
  height: 534,
  body: `<div class="c-ms-person">${avatar({ size: 'medium', use: 'illustration' })}<div><b>Mariana Silva</b><span>mariana.silva@ludospro.com.br</span></div></div>
    ${infoLine(icon('log-in', 12), '<b class="c-ms-k2">Último acesso</b> 31 Dez. 2027')}
    <p class="c-ms-title">Dados gerais</p>
    <div class="c-ms-grid2">${[['Progresso', '50%', 'target'], ['Performance', '0%', 'trending-up'], ['Cursos', '0/20', 'book'], ['Certificados', '0/10', 'award']].map(([k, v, i]) => `<div class="c-ms-card">${infoLine(icon(i, 12), `<span class="c-ms-k">${k}</span>`, v)}</div>`).join('')}</div>
    <div class="c-ms-tabs">${managerTabs.map(([id, l]) => `<button type="button" class="${tab === id ? 'is-on' : ''}" data-action="sManagerTab" data-id="${id}">${l}</button>`).join('')}</div>
    ${[1, 2].map(n => `<div class="c-ms-line"><span class="c-ms-line__n">${n}</span><span class="c-ms-line__text"><b>UX &amp; Design Thinking: A importância da Experiência</b><span>Progressão 50% · Performance 0%</span></span>${icon('chevron-right', 16, 'c-ms-line__chev')}</div>`).join('')}`,
});

/* ---------- Feed: comentários e reações ---------- */
const comment = ({ name, time, text, reply = false }) =>
  `<div class="c-ms-comment"><div class="c-ms-comment__head">${avatar({ size: 'small', use: 'illustration' })}<b>${name}</b>${bullet()}<span>${time}</span>${icon('more-vertical', 12, 'c-ms-comment__more')}</div>
    <p>${text}</p>${reply ? '' : `<span class="c-ms-comment__reply">${icon('thumbs-up', 12)} Responder</span>`}</div>`;

/** Comentários com resposta, ou o estado vazio; o botão "Comentar" habilita ao digitar (`text`). */
export const commentsSheet = ({ empty = false, text = '' } = {}) => bottomSheet({
  height: empty ? 330 : 494,
  footer: `<div class="c-ms-compose">${textField({ header: null, support: null, iconLeft: null, iconRight: null, placeholder: 'Participar da conversa...', value: text, input: empty ? 'sCommentEmpty' : 'sComment', key: empty ? 's-comment-empty' : 's-comment' })}${mobileButton({ label: 'Comentar', disabled: !text })}</div>`,
  body: empty
    ? `<div class="c-ms-empty"><span>${icon('message-square', 16)}</span><b>Não há nenhum comentário ainda</b><small>Seja a primeira pessoa a comentar</small></div>`
    : `<b class="c-ms-sort">Mais relevantes ▾</b>
       ${comment({ name: 'Rafael Costa', time: '2h', text: 'Que notícia incrível! Trabalho em uma startup de fintech aqui em Florianópolis e acompanho de perto como a tecnologia está transformando o mercado financeiro.' })}
       <div style="padding-left:28px">${comment({ name: 'Ana Beatriz Lima', time: '45min', text: 'Muito legal! Fintech é um mercado que está passando por transformações enormes.', reply: true })}</div>`,
});

const reactionTabs = [['todas', 'Todas as 300'], ['like', '100'], ['heart', '85'], ['clap', '65'], ['smile', '45']];
const people = ['Mariana Silva · 5min', 'Ana Beatriz Lima · 45min', 'Rafael Costa · 2h', 'Mariana Silva · 2h', 'Ana Beatriz Lima · 1d'];

export const reactionsSheet = ({ tab = 'todas' } = {}) => bottomSheet({
  body: `<div class="c-ms-rtabs">${reactionTabs.map(([id, l]) => `<button type="button" class="${tab === id ? 'is-on' : ''}" data-action="sReactionTab" data-id="${id}">${l}</button>`).join('')}</div>
    ${people.map(p => `<div class="c-ms-person-row">${avatar({ size: 'small', use: 'illustration', reaction: true })}<b>${p.split(' · ')[0]}</b>${bullet()}<span>${p.split(' · ')[1]}</span></div>`).join('')}`,
});

/** Estrutura vazia: use `bottomSheet` com qualquer conteúdo e rodapé. */
export const emptySheet = () => bottomSheet({ height: 260, footer: mobileButton({ label: 'Aplicar' }), body: infoLine('', 'Conteúdo da folha') });

