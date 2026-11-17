import { esc } from '../../core/dom.js';
import { button, buttonBadge, buttonIcon } from '../../components/button.js';
import { tag, pill } from '../../components/badges.js';
import { avatar, avatarGroup } from '../../components/avatar.js';
import { categoryChip, link, tooltip } from '../../components/misc.js';
import { pageButton, pagination } from '../../components/pagination.js';
import { searchField } from '../../components/search.js';
import { feedback } from '../../components/feedback.js';
import { pageTitle, section, specimen, matrix, code } from '../layout.js';

/* Componentes: botões, chips, tags, pills, avatar, link, paginação e tooltips. Os estados hover, pressed e disabled da
   matriz são forçados por data-state; no resto da página valem os estados reais do navegador. */

const states = ['default', 'hover', 'pressed', 'disabled'];
const st = s => (s === 'default' ? undefined : s);

export const buttons = () => {
  const uses = [['filled', 'primary'], ['outlined', 'stroked'], ['ghost', 'basic']];
  return `
  ${pageTitle('Buttons', 'Cinco famílias: button (filled, outlined, ghost), button badge, button icon, button menu e botões de navegação mobile. Cada uma tem os estados default, hover, pressed e disabled. Os nomes das variantes seguem o produto: filled é <code>primary</code>, outlined é <code>stroked</code> e ghost é <code>basic</code>.', '1927:46267')}
  ${section('Button', 'Tamanho padrão: px 12 / py 10, radius xl (12px), body-bold 14/20. Ícones de 16px à esquerda e/ou à direita.', `
    ${matrix({ cols: uses.map(u => u[0]), rows: states, render: (row, col) => button({ label: 'Button', variant: uses.find(u => u[0] === col)[1], state: st(row), iconStart: 'star' }) })}
    <div style="margin-top:16px">${specimen('Com ícone à direita', `${button({ label: 'Continuar', iconEnd: 'arrow-right' })}${button({ label: 'Continuar', variant: 'stroked', iconEnd: 'arrow-right' })}`)}
    ${specimen('Mobile (px 8 / py 6, 12/16)', `${button({ label: 'Button', size: 'mobile' })}${button({ label: 'Button', size: 'mobile', variant: 'stroked' })}${button({ label: 'Button', size: 'mobile', variant: 'basic' })}`)}</div>
    ${code(`button({ label: 'Salvar', iconStart: 'star' })                      // primary (filled)
button({ label: 'Cancelar', variant: 'stroked', disabled: true })
button({ label: 'Mais', variant: 'basic', iconEnd: 'arrow-right' })`)}`)}
  ${section('Button badge', 'Botão de filtro com contador. O badge muda de cor em pressed e disabled.', matrix({ cols: ['com badge', 'sem badge'], rows: states, render: (row, col) => buttonBadge({ state: st(row), count: col === 'com badge' ? 2 : undefined }) }))}
  ${section('Button icon', 'large e small (com ou sem contorno), filled e ghost. Ícone de 16px.', matrix({
    cols: ['large', 'large sem contorno', 'small', 'small sem contorno', 'filled', 'ghost'], rows: states,
    render: (row, col) => buttonIcon({ style: col.startsWith('large') ? 'large' : col.startsWith('small') ? 'small' : col, outlined: !col.includes('sem'), state: st(row) }),
  }))}
  ${section('Outros botões', 'Button menu (desktop e mobile, 274x36 / 34x34), button menu top, navigation bar button e button single icon: ainda não implementados. Veja Mobile.', specimen('Atalho de uso', `${buttonIcon({ name: 'filter', label: 'Filtrar' })}${buttonIcon({ name: 'search', label: 'Buscar', style: 'filled' })}`))}`;
};

const cats = ['Todos', 'Cursos', 'Missões', 'Biblioteca'];

export const chips = state => `
  ${pageTitle('Chips', 'Chip de categoria (24px de altura, radius lg). Existe também o chips sublevel, com estados default, active, expanded e expanded-active (ainda não implementado).', '1982:47848')}
  ${section('Estados', '', matrix({ cols: ['chip'], rows: states, render: row => categoryChip({ state: st(row) }) }))}
  ${section('Exemplo interativo', 'Hover e clique reais; o selecionado usa o estilo de pressed.', specimen('', cats.map(c => categoryChip({ label: c, state: c === state.chip ? 'pressed' : undefined, action: 'setChip', id: c })).join('')))}`;

export const tags = () => `
  ${pageTitle('Tags', 'Três variações: sólida, sólida com contorno e escura (sem solid). Radius lg, caption-semibold, ícone opcional de 16px.', '1982:39388')}
  ${section('Variações', '', `${specimen('Desktop', `${tag({ label: 'Tag', iconName: 'clock' })}${tag({ label: 'Tag', iconName: 'clock', outlined: true })}${tag({ label: 'Tag', iconName: 'clock', solid: false })}${tag({ label: 'Sem ícone' })}`)}
    ${specimen('Mobile (10/12)', `${tag({ label: 'Tag', size: 'mobile' })}${tag({ label: 'Tag', size: 'mobile', outlined: true })}${tag({ label: 'Tag', size: 'mobile', solid: false })}`)}`)}`;

const pillColors = ['system', 'blue', 'green', 'red', 'yellow', 'grey', 'white', 'disabled'];

export const pills = () => `
  ${pageTitle('Pills', 'Oito cores semânticas, três formatos (ícone + texto, só texto, só ícone) e contorno opcional.', '1962:53307')}
  ${section('Cores e formatos', '', matrix({
    cols: ['ícone + texto', 'só texto', 'só ícone', 'com contorno'], rows: pillColors,
    render: (row, col) => pill({ color: row, label: 'Label', iconName: col === 'só texto' ? undefined : 'file', iconOnly: col === 'só ícone', outline: col === 'com contorno' }),
  }))}`;

export const avatars = () => `
  ${pageTitle('Avatar', 'Tamanhos small (24), medium (32), large (92) e user profile (76), nos usos imagem, ilustração e inicial. Small reaction inclui o badge de curtir. As imagens do Figma são fotos de exemplo; aqui o espaço mostra um placeholder.', '1909:37184')}
  ${section('Tamanhos e usos', '', matrix({
    cols: ['large', 'user profile', 'medium', 'small', 'small reaction'], rows: ['image', 'illustration', 'initial'],
    render: (row, col) => avatar({ use: row, size: col === 'user profile' ? 'profile' : col === 'small reaction' ? 'small' : col, reaction: col === 'small reaction' }),
  }))}
  ${section('Avatar group', 'Spacing assemble (sobreposto) e spaced.', `${specimen('', `${avatarGroup({ names: ['A', 'B', 'C', 'D'] })}${avatarGroup({ names: ['A', 'B', 'C', 'D'], spaced: true })}`)}
    <p class="pg-note">Avatar block (single, duo, hero, profile): ainda não implementado.</p>`)}`;

export const links = () => `
  ${pageTitle('Link', 'Link de texto com seta. Large: body-extrabold 14/20. Small: caption-bold 12/16. Cor padrão system-accent.', '1993:68422')}
  ${section('Estados', '', `${matrix({ cols: ['large', 'small'], rows: states, render: (row, col) => link({ state: st(row), font: col }) })}
    <div style="margin-top:16px">${specimen('Seta à esquerda', link({ label: 'Voltar', iconLeft: true, iconRight: false }))}</div>`)}`;

export const paginations = state => `
  ${pageTitle('Pagination', 'Botão de página de 36x36 com quatro estados, lista com reticências e setas de anterior e próxima. Há versões de seção (desktop, mobile e bottom) e variantes mobile de 28px.', '1993:78381')}
  ${section('Página', '', specimen('', states.map(s => pageButton({ n: 1, state: st(s) })).join('')))}
  ${section('Lista interativa', '', specimen('', pagination({ page: state.page, pages: 12 })))}`;

export const tooltips = () => `
  ${pageTitle('Tooltips', 'Fundo background/tooltip, radius lg, padding 12, sombra md, título em bold e texto em regular (12/16). Quatro posições da seta.', '1982:13748')}
  ${section('Posições', '', specimen('', ['top', 'bottom', 'right', 'left'].map(p => `<div style="margin:12px">${tooltip({ placement: p })}</div>`).join('')))}`;

export const searches = () => `
  ${pageTitle('Search', 'Campo de busca da app bar: lupa de 18, texto 14/20 medium, borda border/default (system/soft no foco), radius xl (12), padding 8, 38 de altura. Com o botão de fechar (button icon small sem contorno), o padding cai para 4 e a altura se mantém. Ocupa a largura do pai; na app bar, 274.')}
  ${section('Variações', '', `${specimen('Padrão', `<div style="width:274px">${searchField({ placeholder: 'Buscar cursos, trilhas, missões…' })}</div>`)}
    ${specimen('Com fechar (menu de atividades)', `<div style="width:300px">${searchField({ placeholder: 'Buscar', clear: { label: 'Fechar busca' } })}</div>`)}`)}`;

export const feedbacks = () => `
  ${pageTitle('Feedback', 'Resposta de acerto e erro das mecânicas. Ícone Feather de 24 numa caixa de 40 (radius xl, background/default), título subtitle 16/24 bold na cor do status e texto body 14/20. Cores fixas de status (success e error), não derivam da primária. Inline: caixa com borda e fundo do status, dentro do card. Banner: sem moldura, na faixa do rodapé da atividade (que pinta o fundo e a borda do status).')}
  ${section('Inline', '', `<div style="display:grid;gap:12px;max-width:640px">${feedback({ tone: 'success', title: 'Excelente!', text: 'A tag semanticamente correta para o bloco de navegação principal é a <nav>.' })}${feedback({ tone: 'error', title: 'Incorreto.', text: 'O <main> marca o conteúdo principal da página e deve aparecer uma única vez.' })}${feedback({ tone: 'error', iconName: 'clock', title: 'Tempo esgotado!', text: 'O <main> marca o conteúdo principal da página e deve aparecer uma única vez.' })}</div>`)}
  ${section('Banner (rodapé)', '', `<div style="display:grid;gap:12px">${['success', 'error'].map(t => `<div style="padding:24px;border-top:1px solid var(--color-border-${t});background:var(--color-background-${t})">${feedback({ tone: t, variant: 'banner', title: t === 'success' ? 'Excelente!' : 'Incorreto.', text: 'Texto de apoio da resposta.' })}</div>`).join('')}</div>`)}`;

/** Ações das páginas interativas: chips (setChip) e paginação (goPage). */
export const componentActions = {
  setChip: (ctx, el) => ctx.set({ chip: el.dataset.id }),
  goPage: (ctx, el) => ctx.set({ page: Number(el.dataset.page) }),
};
