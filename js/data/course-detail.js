// Dados de exemplo da tela Curso (fluxo ludos-pro-fluxo, Curso.dc.html). Conteúdo fictício: curso "LGPD Descomplicada".

/** Tipos de atividade: rótulo, ícone (Feather) e mecânicas mostradas no detalhe da atividade. */
export const activityKinds = {
  leitura: { label: 'Leitura', icon: 'book-open', mechs: [['book-open', 'Leitura'], ['image', 'Imagem']] },
  quiz: { label: 'Quiz', icon: 'help-circle', mechs: [['check-square', 'Múltipla escolha'], ['image', 'Imagem']] },
  jogo: { label: 'Atividade', icon: 'grid', mechs: [['grid', 'Caça-palavras'], ['shuffle', 'Misturadinho']] },
  avaliacao: { label: 'Avaliação', icon: 'check-square', mechs: [['check-square', 'Múltipla escolha']] },
  missao: { label: 'Missão', icon: 'target', mechs: [['flag', 'Missão']] },
  prova: { label: 'Prova', icon: 'award', mechs: [['check-square', 'Múltipla escolha'], ['image', 'Imagem']] },
};

export const course = {
  title: 'LGPD Descomplicada: tudo o que você precisa saber para tratar dados pessoais com segurança e clareza',
  fullTitle: 'LGPD Descomplicada: tudo o que você precisa saber para tratar dados pessoais com segurança e clareza', // capa do desktop e card do mobile
  banner: 'assets/fluxo/curso-lgpd.png', // fundo da capa (desktop): a mesma imagem do card lateral, desfocada pelo véu
  subtitle: 'Tudo o que você precisa saber para tratar dados pessoais com segurança no dia a dia.',
  cover: 'assets/fluxo/curso-lgpd.png',
  author: { name: 'Mariana Silva', role: 'Gerente de Recursos Humanos', avatar: 'assets/fluxo/avatar-mariana.png' },
  flags: { novo: true, sugerido: true, obrigatorio: true },
  started: 312,
  updated: '30 set 2026',
  // Certificado do curso concluído (card "Certificado recebido"): nome, data em que foi recebido e carga horária.
  certificate: { name: 'Certificado de conclusão: LGPD Descomplicada', received: '12 out 2026', hours: '4h' },
  points: '3.500',
  coins: '500',
  description: [
    'A segurança da informação é um pilar essencial para empresas e profissionais que lidam com dados sensíveis no ambiente digital. Com o aumento de ataques cibernéticos, vazamentos de dados e novas regulamentações como a LGPD, dominar os fundamentos de proteção de informações tornou-se indispensável para qualquer organização.',
    'Neste curso, você aprenderá desde os conceitos básicos de cibersegurança até práticas avançadas de proteção de redes, criptografia e conformidade regulatória. Abordaremos os principais tipos de ameaças, como phishing, ransomware e engenharia social, além de estratégias de mitigação e resposta a incidentes. Ao final, você estará preparado para implementar políticas de segurança robustas, proteger ativos digitais e contribuir para uma cultura organizacional de segurança.',
  ],
  // Ícone Feather (`icon`) ou LP-Icons (`lp`), como no Figma.
  resources: [
    { label: 'Atividades', icon: 'edit' },
    { label: 'Prova', lp: 'challenge' },
    { label: 'Missões', icon: 'target' },
    { label: 'Materiais de apoio', icon: 'file' },
    { label: 'Tutor.IA', lp: 'ai' },
  ],
  categories: ['Compliance', 'Segurança da informação', 'Jurídico'],
};

/** Módulos e atividades: [tipo, título, minutos]. */
export const modules = [
  { title: 'Fundamentos da LGPD: conceitos, papéis, princípios e as sanções aplicadas pela ANPD às organizações.', acts: [['leitura', 'O que é um dado pessoal', 8], ['quiz', 'Conceitos-chave da LGPD', 6], ['jogo', 'Glossário da proteção de dados', 5], ['leitura', 'Dado pessoal sensível', 7], ['quiz', 'Sensível ou não? Classifique dados de saúde, biometria, religião e opinião política nos casos reais.', 5], ['leitura', 'Quem é quem: titular, controlador e operador', 9], ['jogo', 'Ligue cada papel à sua função', 6], ['leitura', 'Os princípios da LGPD: finalidade, adequação, necessidade, transparência e a segurança no dia a dia!', 10], ['quiz', 'Princípios na prática', 6], ['leitura', 'A ANPD e as sanções: advertência, multas de até 2% do faturamento e o bloqueio dos dados envolvidos.', 8], ['jogo', 'Caça-palavras da LGPD', 5], ['avaliacao', 'Revisão do módulo', 10]] },
  { title: 'Bases legais e consentimento', acts: [['leitura', 'As 10 bases legais', 12], ['jogo', 'O fluxo do consentimento', 7], ['leitura', 'Consentimento livre, informado e inequívoco', 8], ['quiz', 'Legítimo interesse ou consentimento?', 6], ['jogo', 'Ligue a base legal ao caso', 6], ['avaliacao', 'Quando usar cada base', 10]] },
  { title: 'Direitos do titular', acts: [['leitura', 'Os direitos garantidos pela lei', 10], ['jogo', 'Cada direito e seu exemplo', 6], ['missao', 'Atenda uma solicitação de titular', 15]] },
  { title: 'Segurança e resposta a incidentes', acts: [['leitura', 'Boas práticas de segurança', 12], ['jogo', 'Seguro ou arriscado?', 6], ['prova', 'Avaliação final', 21]] },
].map(m => ({ title: m.title, acts: m.acts.map(([kind, title, min]) => ({ kind, title, min })) }));

export const materials = [
  { name: 'Guia rápido da LGPD.pdf', meta: 'PDF · 1,2 MB', link: false },
  { name: 'Checklist de adequação.pdf', meta: 'PDF · 860 KB', link: false },
  { name: 'Modelo de termo de consentimento.pdf', meta: 'PDF · 420 KB', link: false },
  { name: 'Portal da ANPD', meta: 'Link externo · gov.br/anpd', link: true, disabled: true }, // disabled: indisponível (estado do Figma)
];

/** Tweaks de layout (#curso?lista=cards): valores aceitos e o padrão de cada um. "Sobre o curso" fica sempre nos cards da coluna. */
export const layoutTweaks = {
  lista: { values: ['cards', 'linha'], default: 'linha' },
};

/** Estado do curso pelo hash (#curso?estado=andamento): quantas atividades já foram concluídas. */
export const courseStates = {
  'nao-iniciado': { label: 'Não iniciado', done: () => 0 },
  andamento: { label: 'Em andamento', done: () => 5 },
  concluido: { label: 'Concluído', done: total => total },
  // Todas as atividades liberadas e nenhuma concluída (sem ordem obrigatória): cada uma pode ser aberta.
  liberado: { label: 'Todas liberadas', done: () => 0, unlocked: true },
};

/** Duração em texto: 118 → "1h 58min"; 45 → "45 min". */
export const fmtMinutes = n => (n >= 60 ? `${Math.floor(n / 60)}h ${String(n % 60).padStart(2, '0')}min` : `${n} min`);
