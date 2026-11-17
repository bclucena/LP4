import { esc } from '../../core/dom.js';
import { mpill, cardHome, cardCertificado, cardMissao, cardBiblioteca, cardConquista, cardNews, mTabs, textField, maskDate, datePicker, dropdownItem, dropdownMenu, rankingItem, podiumCard, rankingPodium, rankingCard, rankingOptions, progressBlock } from '../../components/mobile.js';
import { progressDonut } from '../../components/progress.js';
import { missionSheet, storeSheet, emptySheet, achievementSheet, certificateSheet, librarySheet, rankingHistorySheet, rankingInfoSheet, managerSheet, commentsSheet, reactionsSheet } from '../../components/mobile-sheets.js';
import { pageTitle, section, specimen, code } from '../layout.js';

/* Mobile: cards da home, tabs, text field, dropdown, ranking e o inventário dos componentes do Figma.
   Os bottom sheets (js/components/mobile-sheets.js) são folhas estáticas de 360; os interativos guardam o estado aqui. */

const NOTE = 'Medidas e cores seguem o Figma (página "componentes mobile"). Fontes de 10px e 8px usam as variáveis xss e xsss.';

/** Favorito de um card: o valor escolhido no catálogo ou o inicial. */
const fav = (state, key, initial) => state.mfav[key] ?? initial;

const allStatus = ['novo', 'devolvido', 'aprovado', 'reprovado', 'emCorrecao'];

export const homeCards = state => `
  ${pageTitle('Cards da home (mobile)', `Card de 168px de largura, radius lg, imagem com 4px de radius e pills sobrepostas. Três variantes: cursos, eventos e loja. ${NOTE}`, '2525:26275')}
  ${section('Cursos', 'Título de duas linhas, linha de turma e frequência, tags e progresso (ex.: 0/100).', specimen('', `${cardHome({ variant: 'cursos' })}${cardHome({ variant: 'cursos', skeleton: true })}`))}
  ${section('Eventos', 'Com pills de novo, encerrado e agora; favorito em bookmark (clique para alternar); data e horário.', specimen('', `${cardHome({ variant: 'eventos', novo: true, encerrado: true, agora: true, fav: fav(state, 'ev1', true), favKey: 'ev1' })}${cardHome({ variant: 'eventos', agora: true, fav: fav(state, 'ev2', false), favKey: 'ev2' })}${cardHome({ variant: 'eventos', encerrado: true, fav: fav(state, 'ev3', false), favKey: 'ev3' })}`))}
  ${section('Loja', "Imagem quadrada, preço com moeda e, opcionalmente, '(a partir)' quando há várias opções.", specimen('', `${cardHome({ variant: 'loja', novo: true, tags: ['RH', 'CEO', 'CTO'] })}${cardHome({ variant: 'loja', multiple: true, tags: ['RH'], extraTags: 0 })}`))}
  ${section('Pills mobile', 'Ícone de 8px, com ou sem texto de 8px semibold.', specimen('', `${mpill({ tone: 'warning', label: 'Devolvido' })}${mpill({ tone: 'subtle', label: 'Minha posição' })}${mpill({ tone: 'success', label: 'Agora' })}`))}
  ${section('Certificados', 'Curso, evento ou híbrido. Pills de novo e certificado; linha com ícone e contagem.', specimen('', ['curso', 'evento', 'hibrido'].map(k => cardCertificado({ kind: k, fav: fav(state, `cert-${k}`, true), favKey: `cert-${k}` })).join('')))}
  ${section('Missões', 'Meta (com donut de progresso) ou evidência (contador). Pills de status: novo, devolvido, aprovado, reprovado e em correção.', specimen('', `${cardMissao({ use: 'meta', status: allStatus, fav: fav(state, 'mis1', true), favKey: 'mis1' })}${cardMissao({ use: 'evidencia', status: allStatus, fav: fav(state, 'mis2', true), favKey: 'mis2' })}${cardMissao({ use: 'meta', status: ['aprovado'], progress: 100, fav: fav(state, 'mis3', true), favKey: 'mis3' })}`))}
  ${section('Biblioteca', 'Cinco tipos de material: arquivo, áudio, vídeo, imagem e link.', specimen('', ['arquivo', 'audio', 'video', 'imagem', 'link'].map(k => cardBiblioteca({ kind: k, fav: fav(state, `bib-${k}`, true), favKey: `bib-${k}` })).join('')))}
  ${section('Conquistas', '112px de largura. Inativa fica em tons de cinza; ativa mostra as cores. Mérito ou épica, com donut de progresso. O emblema é um placeholder; as ilustrações do Figma precisam ser exportadas.', specimen('', `${cardConquista({ kind: 'merito' })}${cardConquista({ kind: 'merito', active: true, progress: 100 })}${cardConquista({ kind: 'epica' })}${cardConquista({ kind: 'epica', active: true, progress: 70 })}`))}
  ${section('News', 'Card de 360px com ou sem imagem, tags, autor e barra de interações (gostar, comentar ou contagem de reações).', specimen('', `${cardNews({ use: 'image', fav: fav(state, 'news1', true), favKey: 'news1' })}${cardNews({ use: 'text', reactions: true, fav: fav(state, 'news2', true), favKey: 'news2' })}`))}
  ${section('Donut de progresso', '14px, usado nos cards de conquistas e missões.', specimen('', [0, 25, 50, 75, 100].map(v => `<span style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--color-text-secondary)">${progressDonut(v)}${v}%</span>`).join('')))}
  ${section('Uso', 'Medidas, cores e tags seguem o Figma. Fotos e ilustrações são placeholders.', code(`cardHome({ variant: 'eventos', novo: true, agora: true, fav })
cardMissao({ use: 'meta', status: ['novo', 'aprovado'] })
cardBiblioteca({ kind: 'video' })`))}`;

export const tabsPage = state => `
  ${pageTitle('Tabs', `Aba de 30px de altura, padding 16x8, texto de 10px. Ativa: extrabold, cor system-default e sublinhado de 1px. Pode levar o ícone de reação (curtir) antes do texto. ${NOTE}`, '3618:32052')}
  ${section('Texto', '', specimen('', mTabs({ items: [{ id: 'todas', label: 'Todas as 255' }, { id: 'novas', label: 'Novas' }, { id: 'salvas', label: 'Salvas' }], value: state.mTabA, action: 'mTabA' })))}
  ${section('Com reação', '', specimen('', mTabs({ items: [{ id: 'curtidas', label: '100', reaction: true }, { id: 'amei', label: '32', reaction: true }], value: state.mTabB, action: 'mTabB' })))}`;

const box = body => `<div class="pg-box pg-box--pad" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${body}</div>`;

export const textFields = state => `
  ${pageTitle('Text field (mobile)', `Container de 8px de radius, padding 12x10, texto de 12/18. Header em 10px bold, texto de apoio e limite de caracteres em 10px. Estados default, hover, pressed e disabled; ícones esquerdo e direito opcionais. ${NOTE}`, '2686:64806')}
  ${section('Estados', '', box(`${textField({ limit: '0/100' })}${textField({ state: 'hover', limit: '0/100' })}${textField({ state: 'pressed', limit: '0/100' })}${textField({ state: 'disabled', limit: '0/100' })}`))}
  ${section('Exemplo interativo', 'Digite para ver o foco e o contador.', specimen('', textField({ header: 'Enviar texto', placeholder: 'Adicione um texto...', value: state.mText, input: 'mText', key: 'm-text', maxlength: 100, iconLeft: null, iconRight: null, support: 'Máximo de 100 caracteres', limit: `${state.mText.length}/100` })))}
  ${section('Variações', 'Sem header, sem ícones e sem rodapé.', box(`${textField({ header: null, support: null })}${textField({ iconLeft: null, iconRight: null, support: 'Sem ícones' })}`))}
  ${section('Date picker', 'Dois campos de data com máscara dd/mm/aaaa e ícone de calendário (2686:65529). Digite para ver a máscara.', specimen('', datePicker({ a: state.mDateA, b: state.mDateB })))}`;

const ddUses = [['checkbox', 'Checkbox'], ['clear', 'Só texto'], ['language', 'Idioma'], ['icon', 'Ícone'], ['radio', 'Radio'], ['radioIcon', 'Radio com seta']];
const ddLabel = u => (u === 'language' ? 'Espanhol' : u === 'icon' ? 'Item' : '1 a 3 horas');

export const dropdowns = state => `
  ${pageTitle('Dropdown (mobile)', `Item de 170px de largura (ou 360px na lista de idioma), padding 8x10, texto de 10px medium. Estados default, hover e press. ${NOTE}`, '2387:74453')}
  ${section('Itens por tipo e estado', '', `<div class="matrix"><table><thead><tr><th></th>${['default', 'hover', 'press'].map(s => `<th>${s}</th>`).join('')}</tr></thead><tbody>
    ${ddUses.map(([u, name]) => `<tr><th>${name}</th><td>${dropdownItem({ use: u, label: ddLabel(u) })}</td><td>${dropdownItem({ use: u, label: ddLabel(u), state: 'hover' })}</td><td>${dropdownItem({ use: u, label: ddLabel(u), state: 'pressed' })}</td></tr>`).join('')}</tbody></table></div>`)}
  ${section('Lista de idioma e download', 'Item largo (360px) com chevron e item de ação em system-strong.', specimen('', `${dropdownItem({ use: 'language-list' })}${dropdownItem({ use: 'download', label: 'Item' })}`))}
  ${section('Menu interativo', 'Seleção múltipla com checkbox e única com radio. Clique para escolher.', specimen('', `${dropdownMenu({ id: 'dd1', items: ['Até 1 hora', '1 a 3 horas', 'Mais de 3 horas'], selected: state.mDd.dd1 ?? [] })}${dropdownMenu({ id: 'dd2', items: ['Semanal', 'Mensal', 'Anual'], use: 'radio', selected: state.mDd.dd2 ?? [] })}`))}`;

export const rankings = state => `
  ${pageTitle('Ranking (mobile)', `Item de lista, pódio com três lugares e card de ranking (ativo ou finalizado). ${NOTE}`, '2356:37493')}
  ${section('Item de ranking', "Posição, avatar de 24px, nome, pontos e variação. 'Meu perfil' usa fundo subtle e pontos em system-emphasis.", specimen('', `${rankingItem()}${rankingItem({ myProfile: true })}${rankingItem({ position: 12, progress: null, username: 'Rafael Gomes', pontos: '9.540' })}`))}
  ${section('Pódio', "Cada lugar tem cor própria: ouro, prata e bronze (vermelho). A posição do usuário recebe a pill 'Minha posição'. No Figma, 2º e 3º lugares ficam mais baixos que o 1º.", `${specimen('', `${podiumCard({ place: 1 })}${podiumCard({ place: 1, myProfile: true })}`)}<div style="margin-top:16px">${specimen('Composição de três lugares', rankingPodium())}</div>`)}
  ${section('Card de ranking', '192px, radius lg. Pressed: fundo system-subtle e borda system-soft. Clique para marcar.', specimen('', [0, 1, 2].map(i => rankingCard({ use: i === 2 ? 'finalizado' : 'ativo', pressed: state.mRankPressed === i, action: 'mRankCard', id: i })).join('')))}
  ${section('Ranking options', 'Ranking selecionado em cima e lista horizontal de rankings (8). O selecionado usa o estado pressed. Role para o lado.', specimen('', rankingOptions({ selected: state.mRankSel })))}
  ${section('Barra de progresso', 'Linha de 8px com preenchimento system-strong, estado concluído em verde e indicador de meta mínima.', `<div class="pg-box pg-box--pad" style="display:flex;flex-direction:column;gap:24px;max-width:330px">${progressBlock({ value: 0 })}${progressBlock({ value: 45 })}${progressBlock({ done: true })}${progressBlock({ label: 'Performance', value: 40, min: 70 })}</div>`)}
  ${section('Pendente', 'Module ranking, display point e a folha de ranking com pódio.', '<span></span>')}`;


const stage = body => `<div class="c-ms-stage">${body}</div>`;

export const bottomSheets = state => `
  ${pageTitle('Bottom sheets', `Folha de 360px com radius de 16px no topo, handle de 32x4, área rolável com padding 16 e rodapé fixo com padding inferior de 32. O conteúdo muda por contexto: missão, loja, biblioteca, conquistas, ranking e outros. ${NOTE}`, '3804:78943')}
  ${section('Missão', 'Versões da missão em acordeão, campos de envio e botão no rodapé. O acordeão é interativo.', stage(missionSheet({ open: state.sMissionOpen })))}
  ${section('Loja', 'Imagem do produto, título e rodapé com preço e ação (3900:39439).', stage(storeSheet()))}
  ${section('Estrutura vazia', 'Use bottomSheet com qualquer conteúdo e rodapé.', stage(emptySheet()))}
  ${section('Conquista', 'Três estados: em progresso, épica (carrossel de emblemas) e concluída (com voltar).', stage(`${achievementSheet({ variant: 'progresso' })}${achievementSheet({ variant: 'epica' })}${achievementSheet({ variant: 'concluido' })}`))}
  ${section('Certificado', 'Botão desabilitado até o progresso chegar a 100%.', stage(`${certificateSheet()}${certificateSheet({ done: true })}`))}
  ${section('Biblioteca', '', stage(librarySheet()))}
  ${section('Ranking: histórico e informações', "Lista de rodadas com pill de status e botão 'Ver ranking' (desabilitado na rodada atual), e a folha de informações do ranking.", stage(`${rankingHistorySheet()}${rankingInfoSheet()}`))}
  ${section('Gestores', 'Dados do colaborador, quatro indicadores e abas de rotas, cursos e certificados.', stage(managerSheet({ tab: state.sManagerTab })))}
  ${section('Feed: comentários e reações', 'Comentários com resposta, estado vazio e lista de reações com abas. O campo habilita o botão ao digitar.', stage(`${commentsSheet({ text: state.sComment })}${commentsSheet({ empty: true, text: state.sCommentEmpty })}${reactionsSheet({ tab: state.sReactionTab })}`))}
  ${section('Pendente', 'FAQ (a folha do Figma mostra só uma lista de banners, sem pergunta e resposta) e filtros.', code(`bottomSheet({ body, footer: mobileButton({ label: 'Enviar' }) })`))}`;

/* ---------- Inventário ---------- */
const mobileGroups = [
  ['Ranking e gamificação', ['ranking item', 'podium', 'ranking podium', 'module ranking', 'ranking card', 'ranking options', 'ranking layout', 'display point', 'progressbar (3 tipos)', 'countdown display']],
  ['Cards da home', ['card home conquistas', 'card home certificados', 'card home eventos', 'card home loja', 'card home missões', 'card home biblioteca', 'card home cursos', 'card news']],
  ['Side cards', ['side card trends', 'side card eventos', 'side card loja', 'side card missões', 'side card cursos', 'side card categorias', 'side card image']],
  ['Conteúdo e missões', ['card content (regulamento, faq, path, mission)', 'mission info', 'mission heading', 'mission status pill', 'module mission', 'module mission historic', 'material card', 'material info', 'card resposta', 'extract item', 'module extract']],
  ['Bottom sheets', ['loja', 'missão', 'biblioteca', 'conquistas', 'certificados', 'ranking', 'ranking histórico', 'feed', 'FAQ', 'gestores', 'info component', 'histórico componente']],
  ['Navegação e filtros', ['navigationbar (mobile e tablet)', 'topbar', 'menu top', 'menu folders', 'folder path', 'tabs e tabs button', 'filtros', 'filtro grupo', 'filter header e title', 'icon area', 'side menu']],
  ['Formulários', ['text field', 'date picker', 'dropdown menu', 'dropdown item', 'input file', 'list options', 'chips', 'chips sublevel']],
  ['Gestores', ['gestor item (mobile e tablet)']],
  ['Telas montadas', ['loja interna (mobile e tablet)', 'cursos e rotas']],
  ['Outros', ['badge', 'image', 'header cards', 'section title', 'info text', 'noticias comentarios', 'modulo comentario']],
];

export const mobileInventory = () => {
  const total = mobileGroups.reduce((n, [, l]) => n + l.length, 0);
  return `
  ${pageTitle('Mobile', `A página "componentes mobile" reúne mais de 80 componentes específicos para celular e tablet. Este inventário lista o que existe no Figma (${total} itens agrupados) e ainda não foi implementado em código. Os componentes básicos (button, tag, pill, avatar, link e pagination) já têm variante mobile na lista de Componentes.`, '2525:26275')}
  ${mobileGroups.map(([g, items]) => section(`${g} (${items.length})`, '', `<div class="chips">${items.map(n => `<span class="chip-label">${esc(n)}</span>`).join('')}</div>`)).join('')}`;
};

/* ---------- Ações das páginas interativas ---------- */
export const mobileActions = {
  mToggleFav: (ctx, el) => {
    const { mfav } = ctx.state;
    const key = el.dataset.key;
    const current = el.getAttribute('aria-pressed') === 'true';
    ctx.set({ mfav: { ...mfav, [key]: !current } });
  },
  mTabA: (ctx, el) => ctx.set({ mTabA: el.dataset.id }),
  mTabB: (ctx, el) => ctx.set({ mTabB: el.dataset.id }),
  mText: (ctx, el) => ctx.set({ mText: el.value }),
  mDateA: (ctx, el) => ctx.set({ mDateA: maskDate(el.value) }),
  mDateB: (ctx, el) => ctx.set({ mDateB: maskDate(el.value) }),
  mDropdown: (ctx, el) => {
    const { menu, value, multiple } = el.dataset;
    const current = ctx.state.mDd[menu] ?? [];
    const next = multiple === 'true' ? (current.includes(value) ? current.filter(x => x !== value) : [...current, value]) : [value];
    ctx.set({ mDd: { ...ctx.state.mDd, [menu]: next } });
  },
  mRankCard: (ctx, el) => ctx.set({ mRankPressed: Number(el.dataset.id) }),
  mRankOption: (ctx, el) => ctx.set({ mRankSel: Number(el.dataset.id) }),
  // Bottom sheets
  sMissionOpen: (ctx, el) => ctx.set({ sMissionOpen: el.dataset.id }),
  sManagerTab: (ctx, el) => ctx.set({ sManagerTab: el.dataset.id }),
  sReactionTab: (ctx, el) => ctx.set({ sReactionTab: el.dataset.id }),
  sComment: (ctx, el) => ctx.set({ sComment: el.value }),
  sCommentEmpty: (ctx, el) => ctx.set({ sCommentEmpty: el.value }),
};
