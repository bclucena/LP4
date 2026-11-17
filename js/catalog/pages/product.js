import { esc } from '../../core/dom.js';
import { breakpoints, figmaLink, statusInfo, statusOrder } from '../../data/product.js';
import { getAreas, setAreaStatus, statusBadge, statusSummary, countBy } from '../status.js';
import { pageTitle, section } from '../layout.js';

/* Produto: mapa de produto, telas por área, layout e responsividade, e a tela de Cursos em vários tamanhos. */

const groupOrder = ['Onboarding', 'Aprender', 'Engajamento', 'Recompensas', 'Social', 'Apoio', 'Gestão'];

/** Endereço do mockup da área (a casca navegável, app.html). */
export const mockupUrl = (areaId, extra = '') => `app.html?motion=on${extra}#${areaId === 'gestores' ? 'time' : areaId}`;

const thumb = shot => `<figure class="thumb">
  <a href="${esc(shot.src)}" target="_blank" rel="noreferrer"><img src="${esc(shot.src)}" alt="${esc(shot.label)}" loading="lazy" /></a>
  <figcaption class="cap"><b>${esc(shot.label)}</b>${shot.node ? `<a href="${figmaLink(shot.node)}" target="_blank" rel="noreferrer">Figma ${shot.node}</a>` : ''}</figcaption>
</figure>`;

/** Mockup ao vivo da área: a casca navegável em um iframe do tamanho do breakpoint, reduzido para caber (fitFrames faz a escala). */
const liveShot = (shot, areaId) => `<figure class="liveshot">
  <div class="liveshot__frame" data-fit data-w="${shot.w}" data-h="${shot.h}"><iframe title="Mockup ${esc(areaId)} ${esc(shot.label)}" src="${mockupUrl(areaId)}" loading="lazy" style="width:${shot.w}px;height:${shot.h}px"></iframe></div>
  <figcaption class="cap"><b>${esc(shot.label)}</b><span><a href="${mockupUrl(areaId)}" target="_blank" rel="noreferrer">Abrir mockup</a>${shot.node ? `<a href="${figmaLink(shot.node)}" target="_blank" rel="noreferrer">Figma ${shot.node}</a>` : ''}</span></figcaption>
</figure>`;

/** Reduz cada quadro com iframe para a largura disponível (roda depois de cada renderização). */
export function fitFrames(root) {
  root.querySelectorAll('[data-fit]').forEach(el => {
    const w = Number(el.dataset.w);
    const h = Number(el.dataset.h);
    const scale = Math.min(1, el.clientWidth / w);
    el.style.height = `${h * scale}px`;
    const iframe = el.querySelector('iframe');
    if (iframe) iframe.style.transform = `scale(${scale})`;
  });
  // Comparação de tamanhos (Tela de Cursos): a mesma escala para todos os quadros, limitada a 60%.
  const group = root.querySelector('[data-compare]');
  if (group) {
    const frames = [...group.querySelectorAll('[data-pw]')];
    const gap = 24;
    const sum = frames.reduce((n, f) => n + Number(f.dataset.pw), 0);
    const scale = Math.min(0.6, (group.clientWidth - gap * (frames.length - 1)) / sum);
    frames.forEach(f => {
      const w = Number(f.dataset.pw);
      const h = Number(f.dataset.ph);
      f.style.width = `${w * scale}px`;
      f.style.height = `${h * scale}px`;
      f.querySelector('iframe').style.transform = `scale(${scale})`;
    });
  }
  const single = root.querySelector('[data-single]');
  if (single) {
    const w = Number(single.dataset.pw);
    const h = Number(single.dataset.ph);
    const scale = Math.min(1, single.parentElement.clientWidth / w);
    single.style.width = `${w * scale}px`;
    single.style.height = `${h * scale}px`;
    single.querySelector('iframe').style.transform = `scale(${scale})`;
  }
}

/* ---------- Mapa de produto ---------- */
const shell = [
  ['Topbar', 'Logo, busca (cursos, trilhas, missões), notificações, mensagens e menu do usuário. 64 de altura; no mobile são duas linhas de 44.'],
  ['Menu lateral (desktop)', 'Cartão do usuário (nível, pontos, moedas, "Ver extrato"), Home e Meu time, e seções Aprendizado, Engajamento, Recompensas e Social, mais Perguntas frequentes.'],
  ['Navigation bar (mobile e tablet)', 'Home, Cursos, Biblioteca, Feed e Mais. Aparece abaixo de 1180 de largura e some ao rolar a página.'],
  ['Menu top (mobile)', 'Título da página e filtros ou abas (Todos, Obrigatórios, Sugeridos). Aceita swipe lateral.'],
  ['Bottom sheet e modal', 'Detalhes e filtros: bottom sheet no mobile, modal ou drawer no desktop, sobre um scrim.'],
];

const missing = [
  'Topbar, menu lateral e navigation bar',
  'Menu top mobile e filtros (dropdown de categoria, conteúdo, progresso e ordem)',
  'Card de curso desktop (cardCourse, 343 de largura mínima)',
  'Modal, scrim e scroll',
  'Skeleton loader de página e estado vazio',
  'Navdrawer (conquistas, certificados, biblioteca, ranking)',
  'Cabeçalho de lista e tabela de gestores',
  'Gráficos do perfil do gestor (horas de estudo e competências)',
];

export const productMap = () => {
  const areas = getAreas();
  return `
  ${pageTitle('Mapa de produto', 'Áreas da plataforma segundo o Figma de handoff. Cada área tem telas em 360 e 1440 de largura, e os cursos têm todos os breakpoints. As capturas estão em <code>assets/handoff</code>.')}
  ${section('Áreas', '', groupOrder.map(g => {
    const list = areas.filter(a => a.group === g);
    return `<div style="margin-bottom:32px"><div class="group-head"><h3>${g}</h3>${statusSummary(list)}</div>
      <div class="area-grid">${list.map(a => `<a class="area-card" href="#produto-telas?area=${a.id}">
        <div class="area-card__imgs"><img src="${esc(a.mobile.src)}" alt="" loading="lazy" />${a.desktop ? `<img src="${esc(a.desktop.src)}" alt="" loading="lazy" />` : ''}</div>
        <div><div class="area-card__title"><b>${esc(a.label)}</b>${statusBadge(a.status, undefined, true)}</div><p>${esc(a.summary)}</p></div>
      </a>`).join('')}</div></div>`;
  }).join(''))}
  ${section('Estrutura da aplicação', '', `<div class="pg-box kv">${shell.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div>`)}
  ${section('O que falta no catálogo para montar as telas', 'Peças que aparecem nas telas do handoff e ainda não foram implementadas em código.', `<ul class="bullets">${missing.map(m => `<li>${m}</li>`).join('')}</ul>`)}
  ${section('Fora do handoff', 'Telas que existem só no arquivo anterior (LP-DesignSystem 4.0): busca geral no mobile. Home, Login, Tela de introdução e Termômetro emocional estão vazios nesse arquivo.',
    `<div class="shots">${['resultados', 'vazio', 'ultimas', 'nao-encontrado'].map(s => `<a href="assets/telas/m-busca-${s}.png" target="_blank" rel="noreferrer"><img src="assets/telas/m-busca-${s}.png" alt="Busca: ${s}" loading="lazy" /><span>Busca: ${s.replace('-', ' ')}</span></a>`).join('')}</div>`)}`;
};

/* ---------- Telas por área ---------- */
export const screensPage = state => {
  const areas = getAreas();
  const a = areas.find(x => x.id === state.areaId) ?? areas[0];
  const counts = countBy(areas);
  const shown = areas.filter(x => state.areaFilter === 'todas' || x.status === state.areaFilter || x.id === a.id);
  return `
  ${pageTitle('Telas por área', 'Mockup navegável de cada área em desktop e mobile, com o estado dela. As telas ainda sem código mostram a captura do handoff dentro da casca real; as demais capturas, abaixo, abrem em tamanho original.')}
  <div class="pills">
    ${['todas', ...statusOrder].map(k => `<button type="button" class="pill-btn ${state.areaFilter === k ? 'is-on' : ''}" aria-pressed="${state.areaFilter === k}" data-action="setAreaFilter" data-id="${k}">${k === 'todas' ? `Todas ${areas.length}` : `${statusInfo[k].label} ${counts[k]}`}</button>`).join('')}
    <span class="pills__right">${statusSummary(areas)}</span>
  </div>
  <div class="pills pills--areas">${shown.map(x => `<button type="button" class="pill-btn pill-btn--rect ${x.id === a.id ? 'is-on' : ''}" data-action="setArea" data-id="${x.id}"><span class="pill-btn__dot pill-btn__dot--${x.status}"></span>${esc(x.label)}</button>`).join('')}</div>
  <header class="area-head">
    <div class="area-head__row">
      <h2>${esc(a.label)}</h2>${statusBadge(a.status, a.updated)}
      <div role="group" aria-label="Estado da tela" class="seg-control">${statusOrder.map(k => `<button type="button" class="${a.status === k ? 'is-on' : ''}" aria-pressed="${a.status === k}" title="${esc(statusInfo[k].hint)}" data-action="setStatus" data-id="${a.id}" data-status="${k}">${statusInfo[k].label}</button>`).join('')}</div>
      ${a.built ? `<a class="built-link" href="${mockupUrl(a.id)}" target="_blank" rel="noreferrer">Implementada no mockup</a>` : ''}
    </div>
    ${a.status === 'construcao' ? '<p class="area-head__warn">Em construção: o design pode mudar. Evite copiar medidas e textos desta tela por enquanto.</p>' : ''}
    <p class="area-head__summary">${esc(a.summary)}</p>
    <p class="area-head__meta">Grupo: <b>${a.group}</b> · Página do Figma: <b>${esc(a.page)}</b> · Layout de cards: <b>${a.layout === '—' ? 'não informado no Layout design' : a.layout}</b></p>
  </header>
  <div class="live-grid ${a.desktop ? 'live-grid--two' : 'live-grid--one'}">
    ${a.desktop ? liveShot(a.desktop, a.id) : ''}${liveShot(a.mobile, a.id)}
  </div>
  ${a.extras ? section('Outros breakpoints e estados', '', `<div class="thumb-grid">${a.extras.map(thumb).join('')}</div>`) : ''}`;
};

export const productActions = {
  setAreaFilter: (ctx, el) => ctx.set({ areaFilter: el.dataset.id }),
  setArea: (ctx, el) => {
    history.replaceState(null, '', `#produto-telas?area=${el.dataset.id}`);
    ctx.set({ areaId: el.dataset.id });
  },
  setStatus: (ctx, el) => {
    setAreaStatus(el.dataset.id, el.dataset.status);
    ctx.render();
  },
  // Preview de Cursos
  setPreviewSize: (ctx, el) => ctx.set({ previewCompare: false, previewI: Number(el.dataset.i) }),
  setPreviewCompare: ctx => ctx.set({ previewCompare: true }),
  reloadPreview: ctx => ctx.set({ previewRun: ctx.state.previewRun + 1 }),
  togglePreviewSlow: ctx => ctx.set({ previewSlow: !ctx.state.previewSlow }),
};

/* ---------- Layout e responsividade ---------- */
const gridLayouts = [
  ['Layout A (3 a 4 colunas)', 'Cursos, Missões, Certificados e Eventos', 'Cards em auto layout com quebra de linha e 16 de espaço. Largura mínima de 343, sem máximo, e os cards preenchem a linha. Em 1062 de conteúdo (frame de 1440) cabem 3 por linha; em 1420 (frame de 1920), 4.', 'assets/handoff/layout-a.png'],
  ['Layout B (4 a 5 colunas)', 'Biblioteca, Conquistas e Loja', 'Mesmo auto layout, com largura mínima de 253,5 e máxima de 271,2. Em 1062 cabem 4 por linha; em 1420, 5. O máximo mantém a proporção do card.', 'assets/handoff/layout-b.png'],
  ['Layout C (1 coluna)', 'Áreas não listadas no documento', 'Uma coluna de conteúdo, com frames em 1440 e 1920. O documento do Figma não diz quais áreas usam este layout.', 'assets/handoff/layout-c.png'],
];

export const layoutPage = () => `
  ${pageTitle('Layout e responsividade', 'Regras do handoff para quebra de telas, grids de cards e comportamento mobile. Fonte: páginas "Layout design" e "[mobile] Comportamento" do Figma de handoff.')}
  ${section('Breakpoints e estrutura da página', 'A navegação troca entre 1179 e 1180: abaixo, navigation bar; a partir de 1180, menu lateral.', `
    <div class="bp-table"><table><thead><tr>${['Frame', 'Navegação', 'Topbar', 'Menu lateral', 'Área de conteúdo'].map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${breakpoints.map(b => `<tr><td>${b.frame}</td><td>${b.nav}</td><td>${b.topbar}</td><td>${b.side}</td><td>${b.content}</td></tr>`).join('')}</tbody></table></div>
    <p class="pg-note" style="max-width:672px">Os valores de largura vêm dos frames do Figma. Os tokens de breakpoint foram alinhados a estes: md 768, lg 1180, xl 1366, 2xl 1440 e 3xl 2560 (antes eram 768, 1024, 1280 e 1536, da página Size e Spacing do arquivo de design system).</p>`)}
  ${section('Grid de cards', '', `<div class="layout-grid">${gridLayouts.map(([t, where, desc, src]) => `<div class="layout-card">
    <a href="${src}" target="_blank" rel="noreferrer"><img src="${src}" alt="${t}" loading="lazy" /></a>
    <div><b>${t}</b><div class="where">${where}</div><p>${desc}</p></div></div>`).join('')}</div>`)}
  ${section('Comportamento mobile', 'Transcrito da página [mobile] Comportamento. Confira os tempos no Figma antes de implementar.', `<div class="layout-grid layout-grid--two">
    <div class="behavior">
      <div><h3>Skeleton loader</h3><p>No primeiro carregamento depois do login, a página monta os componentes em sequência, 200ms após o carregamento e só depois que o skeleton termina de sumir:</p>
        <ol><li>Skeleton some (200ms)</li><li>App bar aparece (100ms)</li><li>Search (100ms)</li><li>Menu e navigation bar (200ms)</li><li>Background (200ms)</li><li>Componentes da área, como cards de cursos, biblioteca e ranking (200ms)</li></ol>
        <p style="margin-top:4px">Nas demais páginas, o skeleton aparece só nos componentes da área. App bar, Search, Menu e navigation bar ficam fixos.</p></div>
      <div><h3>Scroll</h3><p>A página carregada mostra todos os componentes. Ao rolar, a ordem do movimento é:</p>
        <ol><li>App bar fica estática</li><li>Search sobe e passa por baixo da app bar</li><li>Menu sobe e ocupa o espaço do Search</li><li>Navigation bar desce e sai da área visível</li></ol>
        <p style="margin-top:4px">A navigation bar fica escondida enquanto a rolagem continua e só volta quando o usuário rola no sentido contrário.</p></div>
      <div><h3>Swipe</h3><p>O menu de cada página aceita swipe lateral para mostrar itens fora da tela. Os componentes da tela também podem ter swipe, e isso altera o que é mostrado. A navigation bar não sofre swipe.</p></div>
    </div>
    <a href="assets/handoff/mobile-comportamento.png" target="_blank" rel="noreferrer" class="behavior"><img src="assets/handoff/mobile-comportamento.png" alt="Comportamento mobile" loading="lazy" style="width:100%;border-radius:16px;background:#fff" /></a>
  </div>`)}`;

/* ---------- Tela de Cursos (exemplo) ---------- */
const sizes = [
  { w: 360, h: 800, note: 'Mobile: topbar de duas linhas, navigation bar, cards compactos em 2 colunas' },
  { w: 768, h: 1024, note: 'Tablet: topbar de 64, navigation bar de 532, cards compactos em 3 colunas' },
  { w: 1179, h: 768, note: 'Ainda sem menu lateral: navigation bar e cards compactos' },
  { w: 1180, h: 768, note: 'A partir daqui: menu lateral de 240 e card de curso desktop' },
  { w: 1366, h: 768, note: 'Menu lateral de 272' },
  { w: 1440, h: 900, note: 'Menu lateral de 306; 3 cards por linha (conteúdo de 1062)' },
  { w: 2560, h: 1440, note: 'Miolo limitado a 1366 e centralizado' },
];

const behavior = [
  ['Skeleton loader', 'Primeiro carregamento: 200ms de skeleton, que some em 200ms; depois entram app bar (100ms), search (100ms), menu e navigation bar (200ms), background (200ms) e os cards (200ms).'],
  ['Navegação entre páginas', 'Tocar em um item da navigation bar ou do menu lateral mostra o skeleton só nos cards, por 900ms. App bar, search, menu e navigation bar ficam fixos.'],
  ['Scroll', 'A app bar fica fixa; a busca sobe por baixo dela; o menu sobe e fica fixo no lugar da busca; a navigation bar sai da tela ao rolar para baixo e volta ao rolar para cima.'],
  ['Swipe', 'O menu (Filtro, Todos, Obrigatórios, Sugeridos) rola na horizontal com snap. Um swipe horizontal sobre os cards troca de aba. A navigation bar não responde a swipe.'],
  ['Reduzir movimento', 'Com a preferência do sistema ligada, a página abre já montada, sem a sequência. O quadro de revisão ignora essa preferência (?motion=on) para a animação aparecer.'],
];

const frame = (w, h, state, attr) => `<div class="liveshot__frame preview-frame" ${attr} data-pw="${w}" data-ph="${h}"><iframe title="Cursos ${w}x${h}" src="app.html?run=${state.previewRun}&motion=on${state.previewSlow ? '&slow=5' : ''}#cursos" style="width:${w}px;height:${h}px"></iframe></div>`;

export const coursesPreview = state => {
  const s = sizes[state.previewI];
  const group = [sizes[0], sizes[1], sizes[5]];
  const btn = (on, attrs, text) => `<button type="button" class="pill-btn pill-btn--rect ${on ? 'is-on' : ''}" ${attrs}>${text}</button>`;
  return `
  ${pageTitle('Tela de Cursos (exemplo)', 'A tela de Cursos montada com o shell do handoff: topbar, menu lateral, navigation bar, menu de filtros e cards. Cada quadro abaixo é a mesma página em um iframe da largura indicada, então ela responde de verdade às media queries.')}
  <div class="pills">
    ${btn(state.previewCompare, 'data-action="setPreviewCompare"', 'Comparar 360 / 768 / 1440')}
    ${sizes.map((x, k) => btn(!state.previewCompare && state.previewI === k, `data-action="setPreviewSize" data-i="${k}"`, x.w)).join('')}
    <button type="button" class="pill-btn pill-btn--rect pills__right" data-action="reloadPreview">Recarregar (primeiro carregamento)</button>
    <label class="cap" style="gap:6px"><input type="checkbox" ${state.previewSlow ? 'checked' : ''} data-change="togglePreviewSlow" /> Câmera lenta (5x)</label>
    <a class="built-link" href="visualizador.html?tela=cursos&w=1440" target="_blank" rel="noreferrer">Abrir em página inteira</a>
  </div>
  <div style="width:100%">${state.previewCompare
    ? `<div data-compare style="display:flex;align-items:flex-start;gap:24px">${group.map(g => `<figure class="liveshot" style="flex:none">${frame(g.w, g.h, state, '')}<figcaption class="cap"><b>${g.w} x ${g.h}</b></figcaption></figure>`).join('')}</div>`
    : `<figure class="liveshot">${frame(s.w, s.h, state, 'data-single')}<figcaption class="cap"><span><b>${s.w} x ${s.h}</b> · ${s.note}</span></figcaption></figure>`}</div>
  ${section('Comportamento mobile implementado', 'Role dentro do quadro de 360 ou 768 para ver o scroll. O swipe responde a toque (ou ao modo de dispositivo do navegador).', `<div class="pg-box kv">${behavior.map(([k, v]) => `<div><b style="width:160px">${k}</b><span>${v}</span></div>`).join('')}</div>`)}
  ${section('O que muda em cada largura', '', `<div class="pg-box kv">${sizes.map(x => `<div><b style="width:96px">${x.w} x ${x.h}</b><span>${x.note}</span></div>`).join('')}</div>`)}`;
};
