// Dados de exemplo do Tabuleiro (fluxo ludos-pro-fluxo, Trilha.dc.html): curso "LGPD Descomplicada" com 4 módulos.

/** Tipos de atividade: rótulo e ícone do pin (Feather). */
export const kinds = {
  leitura: { label: 'Leitura', icon: 'book-open' },
  quiz: { label: 'Quiz', icon: 'help-circle' },
  jogo: { label: 'Atividade', icon: 'grid' },
  avaliacao: { label: 'Avaliação', icon: 'check-square' },
  missao: { label: 'Missão', icon: 'target' },
  prova: { label: 'Prova', icon: 'award' },
};

/** Mecânicas mostradas no detalhe da atividade, por tipo. */
export const mechanics = {
  leitura: [['book-open', 'Leitura'], ['image', 'Imagem']],
  quiz: [['check-square', 'Múltipla escolha'], ['image', 'Imagem']],
  jogo: [['grid', 'Caça-palavras'], ['shuffle', 'Misturadinho']],
  avaliacao: [['check-square', 'Múltipla escolha']],
  missao: [['flag', 'Missão']],
  prova: [['check-square', 'Múltipla escolha'], ['image', 'Imagem']],
};

/** Módulos e atividades: [tipo, título, minutos]. `background`: imagem de fundo do módulo (tweak Fundo = Imagem por módulo),
    revelada com a rolagem quando o módulo chega na tela. As 4 padrão (assets/fluxo/modulos/) são as enviadas pelo painel Tweaks
    em 16/11/2026; uma imagem nova enviada pelo painel continua tendo prioridade neste navegador. */
export const modules = [
  { title: 'Fundamentos da LGPD: conceitos, papéis, princípios e as sanções aplicadas pela ANPD às organizações.', background: 'assets/fluxo/modulos/modulo-1.jpg', activities: [['leitura', 'O que é um dado pessoal', 8], ['quiz', 'Conceitos-chave da LGPD', 6], ['jogo', 'Glossário da proteção de dados', 5], ['leitura', 'Dado pessoal sensível', 7], ['quiz', 'Sensível ou não? Classifique dados de saúde, biometria, religião e opinião política nos casos reais.', 5], ['leitura', 'Quem é quem: titular, controlador e operador', 9], ['jogo', 'Ligue cada papel à sua função', 6], ['leitura', 'Os princípios da LGPD: finalidade, adequação, necessidade, transparência e a segurança no dia a dia!', 10], ['quiz', 'Princípios na prática', 6], ['leitura', 'A ANPD e as sanções: advertência, multas de até 2% do faturamento e o bloqueio dos dados envolvidos.', 8], ['jogo', 'Caça-palavras da LGPD', 5], ['avaliacao', 'Revisão do módulo', 10]] },
  { title: 'Bases legais e consentimento', background: 'assets/fluxo/modulos/modulo-2.jpg', activities: [['leitura', 'As 10 bases legais', 12], ['jogo', 'O fluxo do consentimento', 7], ['leitura', 'Consentimento livre, informado e inequívoco', 8], ['quiz', 'Legítimo interesse ou consentimento?', 6], ['jogo', 'Ligue a base legal ao caso', 6], ['avaliacao', 'Quando usar cada base', 10]] },
  { title: 'Direitos do titular', background: 'assets/fluxo/modulos/modulo-3.jpg', activities: [['leitura', 'Os direitos garantidos pela lei', 10], ['jogo', 'Cada direito e seu exemplo', 6], ['missao', 'Atenda uma solicitação de titular', 15]] },
  { title: 'Segurança e resposta a incidentes', background: 'assets/fluxo/modulos/modulo-4.jpg', activities: [['leitura', 'Boas práticas de segurança', 12], ['jogo', 'Seguro ou arriscado?', 6], ['prova', 'Avaliação final', 21]] },
];

/** Todas as atividades em sequência, com o índice do módulo. */
export const activities = modules.flatMap((m, mi) => m.activities.map(([kind, title, min]) => ({ mi, kind, title, min })));

/** Índice da primeira atividade de cada módulo. */
export const moduleStarts = modules.map((_, mi) => modules.slice(0, mi).reduce((sum, m) => sum + m.activities.length, 0));

/** Estrelas de cada atividade concluída (repete o padrão). */
export const starsPattern = [3, 2, 3, 3, 1, 2, 3, 2, 3, 3, 2, 3];

/** Progresso do aluno: atividades concluídas (estado "Em andamento" do protótipo). 0 = não iniciado, 12 = concluído. */
export const doneCount = 5;

export const course = {
  title: 'LGPD Descomplicada: tudo o que você precisa saber para tratar dados pessoais com segurança e clareza',
  summary: 'Tudo o que você precisa saber para tratar dados pessoais com segurança no dia a dia.',
  cover: 'assets/fluxo/curso-lgpd.png',
  author: { name: 'Mariana Silva', role: 'Gerente de Recursos Humanos', avatar: 'assets/fluxo/avatar-mariana.png' },
  started: 312,
  updated: '30 set 2026',
  points: '3.500',
  coins: '500',
  categories: ['Compliance', 'Segurança da informação', 'Jurídico'],
  resources: [['grid', 'Atividades'], ['check-square', 'Prova'], ['target', 'Missões'], ['file-text', 'Materiais de apoio'], ['message-circle', 'Tutor IA']],
  description: [
    'A segurança da informação é um pilar essencial para empresas e profissionais que lidam com dados sensíveis no ambiente digital. Com o aumento de ataques cibernéticos, vazamentos de dados e novas regulamentações como a LGPD, dominar os fundamentos de proteção de informações tornou-se indispensável para qualquer organização.',
    'Neste curso, você aprenderá desde os conceitos básicos de cibersegurança até práticas avançadas de proteção de redes, criptografia e conformidade regulatória. Abordaremos os principais tipos de ameaças, como phishing, ransomware e engenharia social, além de estratégias de mitigação e resposta a incidentes. Ao final, você estará preparado para implementar políticas de segurança robustas, proteger ativos digitais e contribuir para uma cultura organizacional de segurança.',
  ],
};

/** Imagem do tweak "Fundo: Imagem" (a mesma do espaço de imagem "trilha-fundo" do protótipo). */
/** Imagens dos pins (tweak "Imagens nos pins", só com os pins da Versão B): uma por atividade, repetindo a lista. */
export const pinImages = [
  'assets/fluxo/slots/leitura-galeria-1.webp', 'assets/fluxo/slots/slideshow-img-1.webp', 'assets/fluxo/slots/atividade-figura-1.webp',
  'assets/fluxo/slots/leitura-galeria-2.webp', 'assets/fluxo/slots/slideshow-img-3.webp', 'assets/fluxo/slots/emparedado-personagem.webp',
  'assets/fluxo/slots/slideshow-img-5.webp', 'assets/fluxo/slots/leitura-galeria-3.webp', 'assets/fluxo/slots/slideshow-img-6.webp',
];

export const boardBackground = 'assets/fluxo/slots/leitura-galeria-3.webp';

/** Materiais de apoio: link = true abre em nova aba; os demais são downloads. */
export const materials = [
  { name: 'Guia rápido da LGPD.pdf', meta: 'PDF · 1,2 MB', link: false },
  { name: 'Checklist de adequação.pdf', meta: 'PDF · 860 KB', link: false },
  { name: 'Modelo de termo de consentimento.pdf', meta: 'PDF · 420 KB', link: false },
  { name: 'Portal da ANPD', meta: 'Link externo · gov.br/anpd', link: true },
];

/** Duração em texto: "1h 58min" ou "45 min". */
export const formatDuration = min => (min >= 60 ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}min` : `${min} min`);
