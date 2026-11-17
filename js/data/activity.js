/* Dados de exemplo da tela Atividades (fluxo ludos-pro-fluxo, Atividade-Quiz-v2.dc.html).
   Curso "Fundamentos de Web Semântica": 15 mecânicas de exemplo + avaliação final; o menu segue os módulos do curso LGPD. Conteúdo fictício. */

import { modules as boardModules, moduleStarts } from './board.js';
import { course } from './course-detail.js';

const IMG = 'assets/fluxo/';

// Card do curso no menu de atividades: o mesmo título e a mesma capa da página Curso.
export const activityCourse = {
  title: course.title,
  cover: course.cover,
  avatar: `${IMG}avatar-user.png`,
};

/* Atividades na ordem da trilha. `icon` é Feather; `mech` é o rótulo da mecânica no menu. */
export const activities = [
  { id: 1, title: 'Quiz interativo de aquecimento', mech: 'Quiz', xp: 150, icon: 'help-circle' },
  { id: 17, title: 'Quiz com imagem e texto de apoio', mech: 'Quiz', xp: 150, icon: 'help-circle' },
  { id: 2, title: 'Leitura e teoria multimídia', mech: 'Leitura', xp: 100, icon: 'book-open' },
  { id: 16, title: 'Slideshow: HTML e CSS', mech: 'Slideshow', xp: 120, icon: 'monitor' },
  { id: 3, title: 'Caça-palavras de fixação', mech: 'Caça-palavras', xp: 200, icon: 'grid' },
  { id: 4, title: 'Emparedado', mech: 'Emparedado', xp: 250, icon: 'type' },
  { id: 5, title: 'Memória', mech: 'Memória', xp: 200, icon: 'copy' },
  { id: 6, title: 'Misturadinho', mech: 'Misturadinho', xp: 150, icon: 'shuffle' },
  { id: 7, title: 'No lugar', mech: 'No lugar', xp: 180, icon: 'move' },
  { id: 8, title: 'Ordenadinho', mech: 'Ordenadinho', xp: 160, icon: 'list' },
  { id: 9, title: 'Quebra-cabeça', mech: 'Quebra-cabeça', xp: 220, icon: 'image' },
  { id: 10, title: 'Jogo dos 7 erros', mech: 'Jogo dos 7 erros', xp: 200, icon: 'search' },
  { id: 11, title: 'This or that', mech: 'This or that', xp: 150, icon: 'columns' },
  { id: 12, title: 'Enquete', mech: 'Enquete', xp: 50, icon: 'bar-chart-2' },
  { id: 13, title: 'Enquete aberta', mech: 'Enquete aberta', xp: 60, icon: 'message-square' },
  { id: 14, title: 'Mosaico', mech: 'Mosaico', xp: 160, icon: 'layout' },
  { id: 15, title: 'Avaliação final', mech: 'Avaliação', xp: 1000, icon: 'challenge' } // LP-Icon (dois lápis cruzados), o mesmo da avaliação no Curso e no Tabuleiro,
];

export const EXAM_ID = 15;

/** Mecânicas jogáveis do mockup (uma de cada; a avaliação final tem o próprio diálogo). */
const PLAYABLE = activities.filter(a => a.id !== EXAM_ID).map(a => a.id);

/** Quantas mecânicas tem cada atividade do curso, na ordem do curso (cada atividade é um conjunto de 1 a N mecânicas). A 1ª tem
    12; as demais variam. Atividade sem número aqui fica com 1. */
const MECHANICS_PER_ACTIVITY = [12, 3, 1, 4, 2, 5, 1, 3, 2, 6, 1, 4, 2, 3, 1, 5, 2, 1, 3, 2, 4, 1, 3, 2];

/** Menu de atividades: segue os módulos do curso (os mesmos do Tabuleiro e da tela Curso, js/data/board.js — hoje 12, 6, 3 e 3
    atividades). Cada atividade do curso é um grupo recolhível ("Atividade N", com a numeração recomeçando a cada módulo, e o
    título da atividade) com as suas mecânicas (de 1 a N, MECHANICS_PER_ACTIVITY). O mockup tem uma tela de cada mecânica,
    então elas são distribuídas em sequência e se repetem entre as atividades (nunca dentro da mesma). A avaliação final do
    mockup fica fora, no card do fim. */
let nextMech = 0;
export const activityGroups = boardModules.flatMap((m, mi) => m.activities.map(([, title], j) => {
  const n = moduleStarts[mi] + j; // índice da atividade no curso
  const count = Math.min(PLAYABLE.length, MECHANICS_PER_ACTIVITY[n] ?? 1);
  const ids = Array.from({ length: count }, (_, k) => PLAYABLE[(nextMech + k) % PLAYABLE.length]);
  nextMech = (nextMech + count) % PLAYABLE.length;
  return { key: `a${n}`, label: `Atividade ${j + 1}`, name: title, ids };
}));

/** Link da atividade n (0, 1, 2…) do Curso e do Tabuleiro: abre direto a tela de Atividades na 1ª mecânica dela. */
export const activityHref = n => `#atividade?item=${activityGroups[n]?.ids[0] ?? PLAYABLE[n % PLAYABLE.length]}`;

/** Módulos do menu: divisores com "Módulo N • tempo" e o título, cada um com os grupos das suas atividades. */
export const activityModules = boardModules.map((m, i) => ({
  label: `Módulo ${i + 1}`,
  name: m.title,
  min: m.activities.reduce((sum, act) => sum + act[2], 0), // [tipo, título, minutos]
  groups: m.activities.map((_, j) => `a${moduleStarts[i] + j}`),
}));
export const START = { xp: 250, coins: 80, lives: 3 };

/* ---------- 1. Quiz ---------- */
export const quiz = [
  { q: 'Qual tag HTML5 é utilizada para definir a navegação principal de um site?', o: ["<div class='nav'>", '<nav>', '<navigation>', '<menu-bar>'], c: 1, e: 'A tag semanticamente correta para o bloco de navegação principal é a <nav>.' },
  { q: 'Qual propriedade CSS é utilizada para alterar a cor de fundo de um elemento?', o: ['color', 'background-color', 'border-color', 'fill-style'], c: 1, e: "A propriedade 'background-color' define a cor do plano de fundo." },
  { q: 'No Flexbox, qual propriedade alinha os itens no eixo transversal?', o: ['justify-content', 'align-items', 'flex-direction', 'grid-gap'], c: 1, e: "O 'align-items' controla o alinhamento no eixo transversal." },
];
export const QUIZ_TIME = 20;

/* ---------- 17. Quiz com apoio ----------
   Cada pergunta traz antes uma imagem (16:9) e um texto de apoio, no formato dos tópicos do Slideshow: t = título do apoio,
   p = texto (tags entre < > viram código), img/alt = imagem; q, o, c, e = como no quiz. */
export const quizSupport = [
  { t: 'Estrutura semântica da página', img: 'slideshow-img-3.webp', alt: 'Esquema de uma página com cabeçalho, navegação, conteúdo e rodapé',
    p: 'Uma página bem estruturada separa as regiões pelo papel de cada uma: <header> para o cabeçalho, <nav> para a navegação, <main> para o conteúdo principal e <footer> para o rodapé. Assim navegadores, buscadores e leitores de tela entendem o que é cada parte.',
    q: 'Qual elemento deve envolver o conteúdo principal e único da página?', o: ['<section>', '<main>', '<div>', '<article>'], c: 1,
    e: 'O <main> marca o conteúdo principal da página e deve aparecer uma única vez.' },
  { t: 'O modelo de caixa', img: 'slideshow-img-5.webp', alt: 'Diagrama do modelo de caixa com conteúdo, padding, borda e margem',
    p: 'No CSS, todo elemento é uma caixa. De dentro para fora, ela tem o conteúdo, o padding (espaço interno), a borda e a margem (espaço externo, que separa a caixa das vizinhas).',
    q: 'Qual propriedade cria espaço entre o conteúdo e a borda do elemento?', o: ['margin', 'padding', 'gap', 'outline'], c: 1,
    e: 'O padding é o espaço interno, entre o conteúdo e a borda; a margin fica do lado de fora.' },
  { t: 'Layout com Flexbox e Grid', img: 'slideshow-img-6.webp', alt: 'Comparação entre um layout em linha (Flexbox) e um em grade (Grid)',
    p: 'O Flexbox organiza itens em uma direção (linha ou coluna) e é ótimo para barras e listas. O Grid trabalha em duas dimensões ao mesmo tempo (linhas e colunas) e é indicado para o layout da página.',
    q: 'Para montar um layout em linhas e colunas ao mesmo tempo, qual recurso é o mais indicado?', o: ['Flexbox', 'Float', 'Grid', 'Position absolute'], c: 2,
    e: 'O Grid é bidimensional: controla linhas e colunas juntas. O Flexbox trabalha em uma direção por vez.' },
].map(x => ({ ...x, img: `${IMG}slots/${x.img}` }));

/* ---------- 2. Leitura ---------- */
export const reading = {
  gallery: [
    { src: `${IMG}slots/leitura-galeria-1.webp`, alt: 'Estrutura de uma página', caption: 'Estrutura' },
    { src: `${IMG}slots/leitura-galeria-2.webp`, alt: 'Pessoa usando leitor de tela', caption: 'Acessibilidade' },
    { src: `${IMG}slots/leitura-galeria-3.webp`, alt: 'Resultados de busca', caption: 'Encontrabilidade' },
  ],
  figure: { src: `${IMG}slots/atividade-figura-1.webp`, alt: 'Infográfico: fluxo de renderização do DOM', caption: 'Figura 1: representação do fluxo de renderização e análise semântica do DOM.' },
  podcast: { title: 'Resumo narrado · Ep. 3', seconds: 90 },
};

/* ---------- 16. Slideshow ---------- */
export const slides = [
  { t: 'O que é HTML?', img: 'slideshow-img-1.webp', ps: [
    'HTML (HyperText Markup Language) é a linguagem que estrutura o conteúdo da web. Ele não é uma linguagem de programação: em vez de executar lógica, descreve o que cada parte de uma página é — um título, um parágrafo, uma lista, uma imagem ou um link.',
    'Quando você abre um site, o navegador baixa o arquivo HTML, lê suas marcações de cima para baixo e monta uma árvore de objetos chamada DOM (Document Object Model). É a partir dessa árvore que a página é desenhada na tela, estilizada pelo CSS e tornada interativa pelo JavaScript.',
    'Por isso, um HTML bem escrito é a base de tudo: se a estrutura estiver clara, o restante da página fica mais fácil de estilizar, manter e acessar.'] },
  { t: 'Anatomia de um elemento', img: 'atividade-figura-1.webp', ps: [
    'Um elemento HTML costuma ter três partes: a tag de abertura, como <p>; o conteúdo, que é o texto ou outros elementos dentro dele; e a tag de fechamento, como </p>. Juntos, eles dizem ao navegador onde algo começa, onde termina e o que é.',
    'As tags podem receber atributos, que trazem informações extras. Em <a href="/cursos">, o atributo href indica o destino do link. Em <img src="foto.jpg" alt="Equipe reunida">, o alt descreve a imagem para quem usa leitor de tela ou quando ela não carrega.',
    'Alguns elementos são vazios e não têm conteúdo nem tag de fechamento, como <img>, <br> e <input>. Elementos também podem ser aninhados — uma lista <ul> contém vários itens <li> —, e a ordem de abertura e fechamento deve sempre ser respeitada.'] },
  { t: 'Estrutura semântica da página', img: 'slideshow-img-3.webp', ps: [
    'O HTML5 trouxe elementos que descrevem o papel de cada região: <header> para o cabeçalho, <nav> para a navegação principal, <main> para o conteúdo central, <article> para um conteúdo independente, <section> para agrupar um tema, <aside> para informações complementares e <footer> para o rodapé.',
    'Usar essas tags no lugar de <div> genéricas não muda a aparência da página, mas muda o significado. Leitores de tela permitem pular direto para o <main> ou listar os links do <nav>; buscadores entendem melhor o que é conteúdo principal; e quem mantém o código encontra cada parte com mais facilidade.',
    'Os títulos também fazem parte da estrutura: use um único <h1> por página e siga a hierarquia <h2>, <h3> sem pular níveis, como os capítulos e subcapítulos de um livro.'] },
  { t: 'O que é CSS?', img: 'leitura-galeria-3.webp', ps: [
    'CSS (Cascading Style Sheets) é a linguagem que define a aparência do HTML: cores, fontes, espaçamentos, tamanhos e posição dos elementos. Separar estrutura (HTML) de apresentação (CSS) permite mudar todo o visual de um site sem tocar no conteúdo.',
    'Uma regra CSS tem um seletor, que escolhe quais elementos serão estilizados, e um bloco de declarações com pares de propriedade e valor. Em h1 { color: #0E202D; font-size: 32px; }, o seletor h1 aplica a cor e o tamanho a todos os títulos principais.',
    'O "cascata" do nome explica como o navegador resolve conflitos: quando várias regras atingem o mesmo elemento, vence a de maior especificidade — um id pesa mais que uma classe, que pesa mais que uma tag — e, em empate, a que aparece por último. Algumas propriedades, como a cor do texto, ainda são herdadas pelos elementos filhos.'] },
  { t: 'O modelo de caixa', img: 'slideshow-img-5.webp', ps: [
    'Para o CSS, todo elemento é uma caixa retangular formada por quatro camadas. No centro está o content, a área do texto ou da imagem. Em volta dele vem o padding, o respiro interno; depois a border, a borda visível; e, por fim, a margin, o espaço externo que afasta a caixa das vizinhas.',
    'Por padrão, width e height definem apenas o tamanho do content, e o padding e a border são somados por fora — o que costuma gerar caixas maiores do que o esperado. Com box-sizing: border-box, a largura passa a incluir padding e borda, tornando o cálculo muito mais previsível.',
    'Entender o modelo de caixa é o primeiro passo para resolver a maioria dos problemas de alinhamento e espaçamento. As ferramentas de desenvolvedor do navegador mostram cada camada colorida ao inspecionar um elemento.'] },
  { t: 'Layout com Flexbox e Grid', img: 'slideshow-img-6.webp', ps: [
    'Flexbox organiza elementos em uma única direção — em linha ou em coluna. Com display: flex no elemento pai, propriedades como justify-content, align-items e gap distribuem, alinham e espaçam os filhos. É ideal para barras de navegação, grupos de botões e cartões lado a lado.',
    'Grid trabalha em duas dimensões ao mesmo tempo, com linhas e colunas. Com display: grid e grid-template-columns, você desenha a estrutura da página inteira — por exemplo, uma barra lateral fixa e uma área de conteúdo flexível com minmax(0, 1fr).',
    'Os dois se combinam: o Grid define as grandes regiões e o Flexbox organiza o conteúdo dentro de cada uma. Somados a unidades relativas e media queries, eles permitem layouts responsivos que se adaptam do celular a telas largas.'] },
].map(s => ({ ...s, img: `${IMG}slots/${s.img}` }));

/* ---------- 3. Caça-palavras ---------- */
export const words = ['HTML', 'CSS', 'NAV', 'GRID', 'FLEX'];
export const WS_SIZE = 10;

/* ---------- 4. Emparedado ---------- */
export const hangman = {
  question: 'Tags semânticas facilitam a leitura do conteúdo por quais ferramentas de acessibilidade?',
  answer: 'leitores de tela',
  maxErrors: 5,
  hintCost: 20,
  maxHints: 2,
  image: `${IMG}slots/emparedado-personagem.webp`,
};
export const KEY_ROWS = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

/* ---------- 5. Memória ---------- (`tone` vira modificador de cor com tokens) */
export const memoryCards = [
  { id: 'header', label: 'HEADER', tone: 'system', icon: 'layout' },
  { id: 'nav', label: 'NAV', tone: 'emphasis', icon: 'menu' },
  { id: 'article', label: 'ARTICLE', tone: 'warning', icon: 'file-text' },
  { id: 'footer', label: 'FOOTER', tone: 'success', icon: 'align-justify' },
  { id: 'a11y', label: 'ACESSIBILIDADE', tone: 'error', icon: 'eye' },
  { id: 'seo', label: 'SEO', tone: 'dark', icon: 'search' },
];

/* ---------- 6. Misturadinho (grade 5 x 4) ---------- */
export const mix = {
  letters: 'SENTRLMAIXODUCOBEPAG'.split(''),
  answer: 'SEMANTICO',
  path: [0, 1, 6, 7, 2, 3, 8, 13, 14], // caminho da resposta (usado pela dica)
  cols: 5,
  hintCost: 15,
  before: 'Usar tags como <header> e <nav> torna o HTML mais',
  after: ', ajudando leitores de tela e buscadores.',
};

/* ---------- 7. No lugar ---------- */
export const place = {
  question: 'Classifique cada prática conforme o impacto na acessibilidade de uma página.',
  zones: [{ id: 'a', label: 'Ajuda', tone: 'success' }, { id: 'b', label: 'Prejudica', tone: 'error' }],
  items: [
    { id: 'p1', t: 'Usar <nav> para o menu principal', g: 'a' },
    { id: 'p2', t: 'Botões feitos com <div> sem rótulo', g: 'b' },
    { id: 'p3', t: 'Texto alternativo nas imagens', g: 'a' },
    { id: 'p4', t: 'Informação transmitida só por cor', g: 'b' },
    { id: 'p5', t: 'Títulos em ordem hierárquica', g: 'a' },
    { id: 'p6', t: 'Links com o texto “clique aqui”', g: 'b' },
    { id: 'p7', t: 'Bom contraste entre texto e fundo', g: 'a' },
    { id: 'p8', t: 'Pular do <h1> direto para o <h4>', g: 'b' },
  ],
};

/* ---------- 8. Ordenadinho ---------- */
export const order = {
  question: 'Monte a estrutura de uma página semântica na ordem em que aparece, de cima para baixo.',
  items: [
    { id: 'o1', t: '<header>' }, { id: 'o2', t: '<nav>' }, { id: 'o3', t: '<main>' }, { id: 'o4', t: '<footer>' },
    { id: 'x1', t: '<div>' }, { id: 'x2', t: '<span>' },
  ],
  answer: ['o1', 'o2', 'o3', 'o4'],
};

/* ---------- 9. Quebra-cabeça (4 x 3) ---------- */
export const puzzle = { cols: 4, rows: 3, image: `${IMG}curso-lgpd.png`, hintCost: 15 };

/* ---------- 10. Jogo dos 7 erros ----------
   Retângulos em % da imagem. `filter`/`flip` mudam um recorte da própria imagem; `fill` cobre a área com um token de cor. */
export const spot = {
  image: `${IMG}curso-lgpd.png`,
  ratio: 519 / 292,
  hintCost: 15,
  diffs: [
    { x: 54, y: 30, w: 11, h: 18, filter: 'hue-rotate(170deg) saturate(1.4)', n: 'cadeado' },
    { x: 59, y: 55, w: 9, h: 15, filter: 'hue-rotate(200deg) saturate(1.6)', n: 'moedas' },
    { x: 3, y: 5, w: 18, h: 10, flip: true, n: 'logo' },
    { x: 3, y: 92.2, w: 17, h: 3.6, fill: '--color-text-primary', n: 'pontos' },
    { x: 80.9, y: 65, w: 19.1, h: 35, filter: 'hue-rotate(250deg)', clip: 'polygon(100% 5.9%, 3.5% 81.4%, 27.5% 100%, 100% 100%)', n: 'triângulo' },
    { x: 74.5, y: 62, w: 7.5, h: 7, fill: '--color-background-default', radius: '3px', n: 'senha' },
    { x: 86.5, y: 50, w: 3.2, h: 5.7, fill: '--color-icon-warning', radius: '50%', n: 'botão' },
  ],
};

/* ---------- 11. This or that ---------- */
export const thisOrThat = [
  { q: 'Qual tag define o conteúdo principal da página?', a: '<main>', b: '<section>', c: 'a', e: 'Deve existir um único <main> por página, com o conteúdo central.' },
  { q: 'Qual afirmação sobre o atributo alt é verdadeira?', a: 'Descreve a imagem para quem usa leitor de tela', b: 'Serve apenas para melhorar o SEO', c: 'a', e: 'O alt é, antes de tudo, um recurso de acessibilidade.' },
  { q: 'Para marcar o rodapé do site, use:', a: '<div id="footer">', b: '<footer>', c: 'b', e: 'O <footer> comunica o papel do bloco sem depender de classes ou ids.' },
  { q: 'Qual combinação tem melhor legibilidade?', a: 'Texto cinza-claro sobre fundo branco', b: 'Texto escuro sobre fundo claro', c: 'b', e: 'Contraste de pelo menos 4,5:1 garante leitura para mais pessoas.' },
  { q: 'Qual texto de link é mais acessível?', a: 'Clique aqui', b: 'Baixar o relatório de 2026 (PDF)', c: 'b', e: 'O link deve fazer sentido mesmo fora do contexto da frase.' },
];

/* ---------- 12. Enquete ---------- */
export const poll = {
  question: 'Qual recurso de acessibilidade você mais usa ou vê no seu dia a dia?',
  options: [
    { t: 'Legendas em vídeos', v: 412 },
    { t: 'Leitor de tela', v: 138 },
    { t: 'Modo escuro ou alto contraste', v: 305 },
    { t: 'Aumentar o tamanho da fonte', v: 226 },
    { t: 'Navegação apenas pelo teclado', v: 64 },
    { t: 'Descrição de imagens (texto alternativo)', v: 103 },
  ],
};

/* ---------- 13. Enquete aberta ---------- */
export const openPoll = {
  question: 'Conte uma situação em que um site ou app foi difícil de usar para você ou alguém próximo. O que poderia ter sido feito para torná-lo mais acessível?',
  min: 30,
  max: 3000,
  storageKey: 'ludos-atividade-enquete-aberta',
};

/* ---------- 14. Mosaico ---------- */
export const mosaic = {
  question: 'Quais destes são os quatro princípios de acessibilidade na web (WCAG)?',
  cards: [
    { l: 'PERCEPTÍVEL', ok: true, icon: 'eye' },
    { l: 'DECORATIVO', ok: false, icon: 'star' },
    { l: 'OPERÁVEL', ok: true, icon: 'mouse-pointer' },
    { l: 'EXCLUSIVO', ok: false, icon: 'lock' },
    { l: 'COMPREENSÍVEL', ok: true, icon: 'book-open' },
    { l: 'ANIMADO', ok: false, icon: 'film' },
    { l: 'ROBUSTO', ok: true, icon: 'shield' },
    { l: 'INTRANSIGENTE', ok: false, icon: 'slash' },
  ],
};

/* ---------- 15. Avaliação final ---------- */
export const exam = {
  title: 'Avaliação final do módulo',
  intro: 'Avaliação com 10 questões sobre todo o módulo. Responda com atenção: você precisa atingir a performance mínima para concluir.',
  closes: '22:00 · 5 de novembro de 2026',
  minPct: 70,
  maxCoins: 200,
  maxPoints: 1000,
  attempts: 3,
  questions: [
    { q: 'Qual tag HTML representa o conteúdo principal e único de uma página?', o: ['<section>', '<main>', '<div>', '<article>'], c: 1 },
    { q: 'Qual elemento é o mais indicado para agrupar os links de navegação principal?', o: ['<nav>', '<menu>', '<aside>', '<header>'], c: 0 },
    { q: 'Para que serve o atributo alt em uma imagem?', o: ['Definir o tamanho da imagem', 'Descrever a imagem para quem não pode vê-la', 'Criar uma legenda visível', 'Carregar a imagem mais rápido'], c: 1 },
    { q: 'Quais são os quatro princípios das WCAG?', o: ['Rápido, leve, bonito e seguro', 'Perceptível, operável, compreensível e robusto', 'Visível, clicável, legível e responsivo', 'Simples, claro, curto e direto'], c: 1 },
    { q: 'Qual é a forma correta de associar um rótulo a um campo de formulário?', o: ['Escrever o texto ao lado do campo', 'Usar apenas o placeholder', 'Usar <label for="id"> apontando para o id do campo', 'Colocar o texto no atributo title'], c: 2 },
    { q: 'Qual propriedade CSS define a cor do texto?', o: ['font-color', 'text-color', 'color', 'foreground'], c: 2 },
    { q: 'Qual é o contraste mínimo recomendado pelas WCAG (nível AA) para texto normal?', o: ['2:1', '3:1', '4,5:1', '7:1'], c: 2 },
    { q: 'Qual tag deve ser usada para o título mais importante da página?', o: ['<title>', '<header>', '<h1>', '<strong>'], c: 2 },
    { q: 'Por que usar <button> em vez de uma <div> clicável?', o: ['Porque é mais bonito por padrão', 'Porque já é acessível por teclado e leitores de tela', 'Porque carrega mais rápido', 'Não há diferença'], c: 1 },
    { q: 'Qual elemento é indicado para conteúdo complementar, como uma barra lateral?', o: ['<aside>', '<footer>', '<section>', '<span>'], c: 0 },
  ],
};

/** Texto pesquisável de cada atividade (busca do menu). */
export const searchText = {
  1: quiz.map(x => `${x.q} ${x.o.join(' ')} ${x.e}`).join(' '),
  17: quizSupport.map(x => `${x.t} ${x.p} ${x.q} ${x.o.join(' ')} ${x.e}`).join(' '),
  2: 'Fundamentos de Web Semântica e Experiência Interativa. A Web Semântica permite que navegadores e motores de busca compreendam a estrutura e o significado real do conteúdo das páginas. tags estruturadas otimiza o SEO e a acessibilidade. podcast áudio header nav article footer leitores de tela robôs de indexação infográfico DOM videoaula complementar aprendizado multimídia',
  16: slides.map(x => `${x.t} ${x.ps.join(' ')}`).join(' '),
  3: words.join(' '),
  4: `${hangman.question} ${hangman.answer}`,
  5: memoryCards.map(m => m.label).join(' '),
  6: `${mix.before} ${mix.answer} ${mix.after}`,
  7: `${place.question} ${place.items.map(p => p.t).join(' ')}`,
  8: `${order.question} ${order.items.map(o => o.t).join(' ')}`,
  9: 'Monte a imagem do curso de LGPD quebra-cabeça',
  10: 'Encontre os 7 erros entre as imagens LGPD',
  11: thisOrThat.map(x => `${x.q} ${x.a} ${x.b} ${x.e}`).join(' '),
  12: `${poll.question} ${poll.options.map(p => p.t).join(' ')}`,
  13: openPoll.question,
  14: `${mosaic.question} ${mosaic.cards.map(m => m.l).join(' ')}`,
  15: exam.title,
};
