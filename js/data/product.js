// Dados de produto extraídos do Figma de handoff "Ludos Pro 4.0 - handoff" (fileKey bm9Ln7x6EXYVuxdzi2Ye3A).
export const HANDOFF_FILE = 'bm9Ln7x6EXYVuxdzi2Ye3A'
export const figmaLink = node =>
  `https://www.figma.com/design/${HANDOFF_FILE}/Ludos-Pro-4.0---handoff?node-id=${node.replace(':', '-')}`

export const statusInfo = {
  construcao: { label: 'Em construção', hint: 'Em montagem; pode mudar a qualquer momento', tone: 'construcao' },
  revisao: { label: 'Em revisão', hint: 'Pronta, aguardando validação', tone: 'revisao' },
  finalizada: { label: 'Pronto para desenvolvimento', hint: 'Aprovada e liberada para o time de dev; mudanças só com registro', tone: 'finalizada' },
}
export const statusOrder = ['construcao', 'revisao', 'finalizada']


const img = name => `assets/handoff/${name}.png`

export const areas = [
  {
    id: 'instalar-pwa', label: 'Instalar o app (iPhone)', group: 'Onboarding', page: 'Sem frame no Figma (tela criada no catálogo)', layout: '—',
    status: 'construcao', updated: '2026-10-28', built: 'exemplo-cursos?p=instalar-pwa',
    summary: 'Só mobile. Aparece uma vez, no primeiro login no iPhone: abertura com os benefícios de instalar o app e 3 passos para adicionar a plataforma à tela inicial pelo Safari (Compartilhar, Adicionar à Tela de Início, Adicionar).',
    mobile: { label: '390 x 844', src: img('instalar-pwa-390'), w: 390, h: 844, node: '' },
  },
  {
    id: 'cursos', label: 'Cursos', group: 'Aprender', page: '1.Cursos (40:30679)', layout: 'A',
    status: 'revisao', updated: '2026-10-26', built: 'exemplo-cursos',
    summary: 'Listagem de cursos e rotas de aprendizagem. Abas Todos, Obrigatórios e Sugeridos; filtros por categoria, conteúdo, progresso e ordem. Tem estado vazio e skeleton loader.',
    desktop: { label: '1440 x 900', src: img('cursos-1440'), w: 1440, h: 900, node: '904:161456' },
    mobile: { label: '360 x 800', src: img('cursos-360'), w: 360, h: 800, node: '904:161159' },
    extras: [
      { label: '2560 x 1440', src: img('cursos-2560'), w: 2560, h: 1440, node: '904:161488' },
      { label: '1366 x 768', src: img('cursos-1366'), w: 1366, h: 768, node: '904:161424' },
      { label: '1180 x 768', src: img('cursos-1180'), w: 1180, h: 768, node: '904:161248' },
      { label: '1179 x 768', src: img('cursos-1179'), w: 1179, h: 768, node: '904:161221' },
      { label: '768 x 1024', src: img('cursos-768'), w: 768, h: 1024, node: '904:161191' },
      { label: 'Estado vazio', src: img('cursos-empty'), w: 1440, h: 1024, node: '500:4659' },
      { label: 'Skeleton loader', src: img('cursos-skeleton'), w: 1440, h: 1024, node: '502:5353' },
    ],
  },
  {
    id: 'biblioteca', label: 'Biblioteca', group: 'Aprender', page: '2.Biblioteca (3:11)', layout: 'B',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=biblioteca',
    summary: 'Materiais de apoio (arquivo, áudio, vídeo, imagem e link) com navegação por subníveis de pasta.',
    desktop: { label: '1440 x 900', src: img('biblioteca-1440'), w: 1440, h: 900, node: '905:18189' },
    mobile: { label: '360 x 800', src: img('biblioteca-360'), w: 360, h: 800, node: '905:17704' },
    extras: [{ label: '1440 x 900, subnível', src: img('biblioteca-1440-subnivel'), w: 1440, h: 900, node: '984:230195' }],
  },
  {
    id: 'missoes', label: 'Missões', group: 'Engajamento', page: '3.Missões (3:2155)', layout: 'A',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=missoes',
    summary: 'Missões do tipo meta e evidência, com rodadas e status (novo, devolvido, aprovado, reprovado, em correção).',
    desktop: { label: '1440 x 900', src: img('missoes-1440'), w: 1440, h: 900, node: '908:43246' },
    mobile: { label: '360 x 800', src: img('missoes-360'), w: 360, h: 800, node: '908:42784' },
  },
  {
    id: 'ranking', label: 'Ranking', group: 'Engajamento', page: '4.Ranking (3:2156)', layout: '—',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=ranking',
    summary: 'Rankings ativos e finalizados, pódio, posição do usuário, histórico de rodadas e regras.',
    desktop: { label: '1440 x 900', src: img('ranking-1440'), w: 1440, h: 900, node: '908:66459' },
    mobile: { label: '360 x 800', src: img('ranking-360'), w: 360, h: 800, node: '908:66358' },
  },
  {
    id: 'conquistas', label: 'Conquistas', group: 'Recompensas', page: '5.Conquistas (18:1639)', layout: 'B',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=conquistas',
    summary: 'Conquistas de mérito e épicas, com progresso e recompensas. O detalhe abre em bottom sheet (mobile) ou drawer lateral (desktop).',
    desktop: { label: '1440 x 900', src: img('conquistas-1440'), w: 1440, h: 900, node: '908:81892' },
    mobile: { label: '360 x 800', src: img('conquistas-360'), w: 360, h: 800, node: '908:81734' },
  },
  {
    id: 'certificados', label: 'Certificados', group: 'Recompensas', page: '6.Certificados (18:1640)', layout: 'A',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=certificados',
    summary: 'Certificados de cursos, eventos e trilhas híbridas. O botão de baixar só habilita com 100% de progresso.',
    desktop: { label: '1440 x 900', src: img('certificados-1440'), w: 1440, h: 900, node: '908:95323' },
    mobile: { label: '360 x 800', src: img('certificados-360'), w: 360, h: 800, node: '908:94877' },
  },
  {
    id: 'loja', label: 'Loja', group: 'Recompensas', page: '7.Loja (18:1641)', layout: 'B',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=loja',
    summary: 'Itens para trocar por moedas, com preço, filtros e fluxo de finalizar compra.',
    desktop: { label: '1440 x 900', src: img('loja-1440'), w: 1440, h: 900, node: '908:119251' },
    mobile: { label: '360 x 800', src: img('loja-360'), w: 360, h: 800, node: '908:119102' },
  },
  {
    id: 'feed', label: 'Feed', group: 'Social', page: '8.Feed (18:1642)', layout: '—',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=feed',
    summary: 'Notícias com imagem ou só texto, reações, comentários e respostas.',
    desktop: { label: '1440 x 900', src: img('feed-1440'), w: 1440, h: 900, node: '909:130308' },
    mobile: { label: '360 x 800', src: img('feed-360'), w: 360, h: 800, node: '909:130162' },
  },
  {
    id: 'eventos', label: 'Eventos', group: 'Social', page: '9.Eventos (18:1643)', layout: 'A',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=eventos',
    summary: 'Eventos online e presenciais, com data, local, inscrição e adição à agenda.',
    desktop: { label: '1440 x 900', src: img('eventos-1440'), w: 1440, h: 900, node: '911:150106' },
    mobile: { label: '360 x 800', src: img('eventos-360'), w: 360, h: 800, node: '911:149707' },
  },
  {
    id: 'faq', label: 'Perguntas frequentes e regulamento', group: 'Apoio', page: '10.Perguntas frequentes e Regulamento (18:1644)', layout: '—',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=faq',
    summary: 'Perguntas em acordeão e regulamentos: um único (abre direto) ou vários (lista que abre modal com o PDF).',
    desktop: { label: '1440 x 900', src: img('faq-1440'), w: 1440, h: 900, node: '911:160655' },
    mobile: { label: '360 x 800', src: img('faq-360'), w: 360, h: 800, node: '911:160471' },
    extras: [
      { label: 'Regulamento, 1440 x 900', src: img('regulamento-1440'), w: 1440, h: 900, node: '911:160674' },
      { label: 'Regulamento, 360 x 800', src: img('regulamento-360'), w: 360, h: 800, node: '911:160492' },
    ],
  },
  {
    id: 'extrato', label: 'Extrato', group: 'Apoio', page: 'A.Extrato (18:27602)', layout: '—',
    status: 'construcao', updated: '2026-10-26',
    summary: 'Histórico de pontos e moedas com filtro por período e abas Todos, Pontos e Moedas.',
    desktop: { label: '1440 x 900', src: img('extrato-1440'), w: 1440, h: 900, node: '913:170463' },
    mobile: { label: '360 x 800', src: img('extrato-360'), w: 360, h: 800, node: '913:170284' },
  },
  {
    id: 'gestores', label: 'Gestores', group: 'Gestão', page: 'B.Gestores (18:29710) e B.Gestores [Interna] (939:181916)', layout: '—',
    status: 'construcao', updated: '2026-10-26', built: 'exemplo-cursos?p=time',
    summary: 'Visão do gestor: lista de pessoas do time e perfil individual com conquistas, horas de estudo, cursos e competências.',
    desktop: { label: '1440 x 900', src: img('gestores-1440'), w: 1440, h: 900, node: '921:175213' },
    mobile: { label: '360 x 800', src: img('gestores-360'), w: 360, h: 800, node: '921:175120' },
    extras: [
      { label: 'Interna, 1440 (perfil)', src: img('gestores-interna-1440'), w: 1440, h: 1654, node: '1262:74338' },
      { label: 'Bottom sheet, 360', src: img('gestores-sheet-360'), w: 360, h: 800, node: '939:181918' },
    ],
  },
]

export const breakpoints = [
  { frame: '360 x 800', nav: 'Navigation bar (296 de largura)', topbar: '88 (duas linhas de 44)', side: 'não tem', content: '360, cards de 168 em 2 colunas' },
  { frame: '768 x 1024', nav: 'Navigation bar (532)', topbar: '64', side: 'não tem', content: '768, padding 24' },
  { frame: '1179 x 768', nav: 'Navigation bar (532)', topbar: '64', side: 'não tem', content: '1179, padding 24' },
  { frame: '1180 x 768', nav: 'Menu lateral', topbar: '64', side: '240 (coluna de 264)', content: '876, padding 16' },
  { frame: '1366 x 768', nav: 'Menu lateral', topbar: '64', side: '272 (coluna de 296)', content: '1022, padding 24' },
  { frame: '1440 x 900', nav: 'Menu lateral', topbar: '64', side: '306 (coluna de 330)', content: '1062, padding 24' },
  { frame: '2560 x 1440', nav: 'Menu lateral', topbar: '64', side: '306 (coluna de 330)', content: '1366 fixo, centralizado' },
]
