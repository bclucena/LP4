import { cx, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createView, closeOnOutside, onEscape } from '../core/view.js';
import { minWidth } from '../core/media.js';
import { tag, pill } from '../components/badges.js';
import { avatar } from '../components/avatar.js';
import { panel, sheetFooter } from '../components/panel.js';
import { pillMenu, radioMenu, filterDivider, singleGroup } from '../components/filters.js';
import { menuTop, menuHeader } from '../shell/shell.js';
import {
  channels, trending, categoryOptions, kindOptions, orderOptions, defaultFeedFilters, filterPosts, createPosts,
} from '../data/feed.js';

/* Feed (handoff 8.Feed): notícias com imagem ou só texto, reações, comentários e respostas. A partir de 1180 há a coluna
   lateral com Canais e Em alta e os filtros em pílulas; abaixo, os canais viram a linha de seções e os filtros um bottom sheet. */

const DESKTOP = 1180;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const filterKeys = ['category', 'kind', 'order']; // os filtros do sheet (o canal fica fora)
const activeCount = f => filterKeys.filter(k => f[k] !== defaultFeedFilters()[k]).length;
const labelOf = (options, id) => options.find(o => o.id === id).label;
const flip = (list, id) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
const fill = (svg, on) => svg.replace('fill="none"', on ? 'fill="currentColor"' : 'fill="none"');

/* ---------- Notícia ---------- */
const bubble = (c, reply = false) =>
  `<div class="${cx('c-fd-comment', reply && 'c-fd-comment--reply')}">${avatar({ size: 'small', use: 'illustration' })}<div class="c-fd-comment__bubble"><b>${esc(c.author)}</b><p>${esc(c.text)}</p></div></div>`;

function comments(post, draft) {
  return `<div class="c-fd-comments">
    ${post.comments.map(c => `<div class="c-fd-thread">${bubble(c)}${c.replies.map(r => bubble(r, true)).join('')}</div>`).join('')}
    <div class="c-fd-form">
      <input class="c-fd-form__input" data-key="comment-${post.id}" data-input="commentInput" data-id="${post.id}" value="${esc(draft)}" placeholder="Escreva um comentário" aria-label="Escreva um comentário" />
      <button type="button" class="c-fd-form__send" ${draft.trim() ? '' : 'disabled'} data-action="sendComment" data-id="${post.id}">Enviar</button>
    </div>
  </div>`;
}

function postCard(post, state) {
  const fav = state.favs.includes(post.id);
  const liked = state.liked.includes(post.id);
  const open = state.openComments.includes(post.id);
  const novo = pill({ label: 'Novo', color: 'blue', iconName: 'award' });
  return `<article class="c-fd-card">
    ${post.image ? `<div class="c-fd-card__image c-cover">
      ${post.novo ? `<span class="c-fd-card__new">${novo}</span>` : ''}
      <span class="c-fd-card__headline">LGPD descomplicada: Tudo o que você precisa saber</span>
    </div>` : ''}
    <div class="c-fd-card__body">
      <div class="c-fd-card__meta">
        ${icon('send', 14)}
        <span class="c-fd-card__when">Publicado há ${post.id + 2} horas · ${esc(post.channel)}</span>
        ${!post.image && post.novo ? novo : ''}
        <button type="button" class="c-fd-card__fav" aria-pressed="${fav}" aria-label="${fav ? 'Remover dos favoritos' : 'Favoritar'}" data-action="toggleFav" data-id="${post.id}">${fill(icon('bookmark', 16), fav)}</button>
      </div>
      <h3 class="c-fd-card__title">${esc(post.title)}</h3>
      <p class="c-fd-card__text">${esc(post.body)}</p>
      <div class="c-fd-card__tags">${tag({ label: post.category, solid: false })}${tag({ label: 'Marketing', solid: false })}${tag({ label: '+3', outlined: true })}</div>
      <div class="c-fd-card__author">${avatar({ size: 'small', use: 'illustration' })}<span><b>Mariana Silva</b><span>Gerente de Recursos Humanos</span></span></div>
      <div class="c-fd-card__actions">
        <button type="button" class="${cx('c-fd-card__action', liked && 'is-on')}" aria-pressed="${liked}" data-action="toggleLike" data-id="${post.id}">${fill(icon('thumbs-up', 16), liked)}${liked ? 'Curtiu' : 'Gostar'} · ${post.likes + (liked ? 1 : 0)}</button>
        <button type="button" class="c-fd-card__action" aria-expanded="${open}" data-action="toggleComments" data-id="${post.id}">${icon('message-square', 16)}Comentar · ${post.comments.length}</button>
      </div>
      ${open ? comments(post, state.drafts[post.id] ?? '') : ''}
    </div>
  </article>`;
}

/* ---------- Canais e Em alta ---------- */
/** Mobile e tablet: linha de chips rolável, abaixo do menu top. */
const channelsBar = state =>
  `<div class="c-fd-channels" data-reveal="menu">
    <b>Seções</b>
    <div class="c-fd-channels__row u-hide-scroll" data-scroll-key="feed-channels">${channels.map(c =>
      `<button type="button" class="${cx('c-fd-channel-chip', state.filters.channel === c && 'is-on')}" aria-pressed="${state.filters.channel === c}" data-action="setChannel" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  </div>`;

/** Coluna lateral do desktop. */
const aside = state =>
  `<aside class="c-fd-aside">
    <section class="c-fd-box">
      <h2>Canais</h2>
      <ul>${channels.map(c => `<li><button type="button" class="${cx('c-fd-aside__channel', state.filters.channel === c && 'is-on')}" aria-pressed="${state.filters.channel === c}" data-action="setChannel" data-value="${esc(c)}">${esc(c)}</button></li>`).join('')}</ul>
    </section>
    <section class="c-fd-box">
      <h2>Em alta!</h2>
      ${trending.map(t => `<div class="c-fd-trend"><b>${esc(t.title)}</b><span>${esc(t.meta)}</span></div>`).join('')}
    </section>
  </aside>`;

/* ---------- Filtros ---------- */
const filterGroups = [
  { key: 'category', title: 'Categoria', options: categoryOptions },
  { key: 'kind', title: 'Tipo de notícia', options: kindOptions },
  { key: 'order', title: 'Ordenar por', options: orderOptions },
];

function filterPills(state) {
  const f = state.filters;
  const defaults = defaultFeedFilters();
  const open = id => state.menu === id;
  return [
    ...filterGroups.map(g => pillMenu({ id: g.key, label: labelOf(g.options, f[g.key]), active: f[g.key] !== defaults[g.key], open: open(g.key), content: radioMenu({ filter: g.key, options: g.options, value: f[g.key] }) })),
    `<button type="button" class="c-clear" data-action="clearFilters" ${same(f, defaults) ? 'disabled' : ''}>Limpar</button>`,
  ].join('');
}

/** Bottom sheet de filtros (GroupsSheet do app antigo): um grupo de chips por filtro, contagem e Limpar/Aplicar. */
function filtersSheet(state) {
  const body = filterGroups.map((g, i) => (i ? filterDivider() : '') + singleGroup({ title: g.title, filter: g.key, options: g.options, value: state.draft[g.key] })).join('');
  const count = filterPosts(state.posts, state.tab, state.favs, { ...state.filters, ...state.draft }).length;
  return panel({ mode: 'sheet', label: 'Filtros', body, footer: sheetFooter({ count }), enter: state.fresh });
}

/* ---------- Tela ---------- */
function view(state) {
  const desktop = minWidth(DESKTOP);
  const list = filterPosts(state.posts, state.tab, state.favs, state.filters);
  const tabs = [
    { id: 'todas', label: 'Todas', count: filterPosts(state.posts, 'todas', state.favs, state.filters).length },
    { id: 'favoritas', label: 'Favoritas', count: filterPosts(state.posts, 'favoritas', state.favs, state.filters).length },
  ];

  let content;
  if (state.loading) content = '<div class="c-fd-skeleton"></div>';
  else if (list.length === 0) content = '<div class="c-fd-empty">Nenhuma notícia encontrada</div>';
  else content = list.map(p => postCard(p, state)).join('');

  return `
    ${menuTop({ title: 'Notícias', tabs, tab: state.tab, filterCount: activeCount(state.filters) })}
    ${channelsBar(state)}
    ${menuHeader({ tabs, tab: state.tab, filters: filterPills(state) })}
    <div class="c-fd-layout" data-reveal="content">
      <div class="c-fd-list">${content}</div>
      ${desktop ? aside(state) : ''}
    </div>
    ${state.sheet ? filtersSheet(state) : ''}`;
}

const closeMenu = ctx => ctx.set({ menu: null });

/** Envia o comentário escrito (se houver texto) como Mariana Santana. */
function sendComment(ctx, id) {
  const text = (ctx.state.drafts[id] ?? '').trim();
  if (!text) return;
  ctx.set({
    posts: ctx.state.posts.map(p => (p.id === id ? { ...p, comments: [...p.comments, { id: Date.now(), author: 'Mariana Santana', text, replies: [] }] } : p)),
    drafts: { ...ctx.state.drafts, [id]: '' },
  });
}

const actions = {
  setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }),
  setChannel: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, channel: el.dataset.value } }),
  toggleFav: (ctx, el) => ctx.set({ favs: flip(ctx.state.favs, Number(el.dataset.id)) }),
  toggleLike: (ctx, el) => ctx.set({ liked: flip(ctx.state.liked, Number(el.dataset.id)) }),
  clearFilters: ctx => ctx.set({ filters: defaultFeedFilters() }),

  // Comentários
  toggleComments: (ctx, el) => ctx.set({ openComments: flip(ctx.state.openComments, Number(el.dataset.id)) }),
  commentInput: (ctx, el) => ctx.set({ drafts: { ...ctx.state.drafts, [el.dataset.id]: el.value } }),
  sendComment: (ctx, el) => sendComment(ctx, Number(el.dataset.id)),

  // Sheet de filtros (mobile e tablet)
  openFilters: ctx => {
    const { category, kind, order } = ctx.state.filters;
    ctx.set({ sheet: true, draft: { category, kind, order }, fresh: true });
  },
  closePanel: ctx => ctx.set({ sheet: false }),
  pickDraft: (ctx, el) => ctx.set({ draft: { ...ctx.state.draft, [el.dataset.filter]: el.dataset.value } }),
  clearDraft: ctx => {
    const { category, kind, order } = defaultFeedFilters();
    ctx.set({ draft: { category, kind, order } });
  },
  applyDraft: ctx => ctx.set({ filters: { ...ctx.state.filters, ...ctx.state.draft }, sheet: false }),

  // Dropdowns do desktop
  toggleMenu: (ctx, el) => (ctx.state.menu === el.dataset.menu ? closeMenu(ctx) : ctx.set({ menu: el.dataset.menu })),
  pick: (ctx, el) => ctx.set({ filters: { ...ctx.state.filters, [el.dataset.filter]: el.dataset.value }, menu: null }),
};

export function mountFeed(root, { loading = true } = {}) {
  return createView(root, {
    state: {
      loading, tab: 'todas', filters: defaultFeedFilters(), posts: createPosts(), favs: [0, 3], liked: [], openComments: [], drafts: {},
      menu: null, sheet: false, draft: null, fresh: false,
    },
    view,
    actions,
    breakpoints: [768, 1180],
    onMount: ctx => {
      closeOnOutside(ctx, '[data-popover]', () => closeMenu(ctx), () => ctx.state.menu !== null);
      onEscape(ctx, () => ctx.set({ sheet: false }), () => ctx.state.sheet);
      // Enter no campo de comentário envia, como o formulário do app antigo.
      ctx.listen('keydown', e => {
        if (e.key === 'Enter' && e.target.dataset?.input === 'commentInput' && ctx.root.contains(e.target)) sendComment(ctx, Number(e.target.dataset.id));
      });
    },
  });
}
