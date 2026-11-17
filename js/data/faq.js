// Dados de exemplo de Perguntas frequentes e Regulamentos (handoff 10.Perguntas frequentes e Regulamento).

export const faqs = [
  { q: 'Como ganho pontos e moedas?', a: 'Você ganha pontos e moedas ao concluir cursos, missões e eventos. O extrato mostra cada lançamento.' },
  { q: 'Como baixo meu certificado?', a: 'O botão de baixar fica habilitado quando o progresso do curso chega a 100%. Ele está na tela de Certificados.' },
  { q: 'O que acontece se uma missão for reprovada?', a: 'A missão volta com a devolutiva do avaliador e você pode corrigir e enviar uma nova evidência dentro do prazo.' },
  { q: 'Como troco minhas moedas por recompensas?', a: 'Na Loja, escolha o item, toque em Trocar e confirme. O saldo é debitado na hora.' },
  { q: 'Posso cancelar minha inscrição em um evento?', a: 'Sim, enquanto o evento não tiver começado. Abra o evento e toque em Cancelar inscrição.' },
  { q: 'Quem vê o meu desempenho no ranking?', a: 'Os participantes do mesmo ranking, na rodada em andamento e nas finalizadas.' },
  { q: 'Como altero meu idioma ou tema?', a: 'Abra o menu do perfil, no canto superior direito, e escolha o idioma, o tema e o contraste.' },
  { q: 'Posso usar a plataforma no celular?', a: 'Sim. Pelo navegador ou instalando como aplicativo, pelo menu do perfil.' },
];

/** Regulamentos publicados pelo administrador. Com um só, o documento abre direto na tela (Figma "regulamento único"). */
export const regulations = [
  'Regulamento geral da plataforma',
  'Regulamento de pontos e moedas',
  'Regulamento da Loja',
  'Regulamento de missões',
  'Regulamento de rankings',
  'Regulamento de eventos',
];

/** Páginas do documento (o PDF real vem da API). Imagem exportada do Figma, nó "image" do frame regulamento único. */
export const regulationPages = ['assets/regulamento/pagina.png', 'assets/regulamento/pagina.png'];
