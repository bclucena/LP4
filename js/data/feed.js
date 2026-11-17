/* Dados de exemplo do Feed (js/screens/feed.js): notícias com reações, comentários e respostas. */

export const channels = [
  'Todos os canais', 'Central de Suporte de TI', 'Atualizações do Projeto', 'Canal de Chat da Equipe',
  'Reuniões Semanais', 'Feedback de Clientes', 'Documentação do Projeto',
];
const cats = ['Marketing', 'Vendas', 'Liderança'];
const body = 'Como a experiência do usuário pode transformar e impulsionar o sucesso dos negócios. A experiência do usuário (UX) e o Design Thinking são elementos fundamentais para o crescimento e a inovação nas empresas modernas. Ao colocar o usuário no centro do processo de criação, as organizações entregam soluções mais úteis.';

/** Cria as notícias de exemplo. Cada tela guarda a sua cópia, porque comentar altera a lista. */
export const createPosts = () => Array.from({ length: 6 }, (_, i) => ({
  id: i,
  title: 'UX & Design Thinking: Experiência do Usuário nos negócios em empresas de telemarketing',
  body,
  channel: channels[1 + (i % 6)],
  category: cats[i % 3],
  image: i % 3 !== 1,
  novo: i % 2 === 0,
  likes: 12 + i * 5,
  comments: i % 2 === 0
    ? [{ id: 1, author: 'Rafael Lima', text: 'Ótimo conteúdo, vou aplicar no meu time.', replies: [{ author: 'Mariana Silva', text: 'Que bom! Conta depois como foi.' }] }]
    : [],
}));

export const trending = [
  { title: 'UX & Design Thinking: Experiência do Usuário nos negócios', meta: 'Cursos · 1.234 Visualizações' },
  { title: 'UX & Design Thinking: Experiência do Usuário nos negócios', meta: 'Módulos · 1.234 Visualizações' },
];

export const categoryOptions = [{ id: 'todos', label: 'Todas as categorias' }, ...cats.map(c => ({ id: c, label: c }))];
export const kindOptions = [{ id: 'todos', label: 'Todas as notícias' }, { id: 'imagem', label: 'Com imagem' }, { id: 'texto', label: 'Só texto' }];
export const orderOptions = [{ id: 'recentes', label: 'Mais recentes' }, { id: 'antigos', label: 'Mais antigos' }, { id: 'curtidas', label: 'Mais curtidas' }];

export const defaultFeedFilters = () => ({ channel: 'Todos os canais', category: 'todos', kind: 'todos', order: 'recentes' });

/** Aplica a aba (todas ou favoritas), os filtros e a ordem. `favs` é uma lista de ids. */
export function filterPosts(posts, tab, favs, f) {
  const all = defaultFeedFilters().channel;
  let out = posts.filter(p => tab !== 'favoritas' || favs.includes(p.id));
  if (f.channel !== all) out = out.filter(p => p.channel === f.channel);
  if (f.category !== 'todos') out = out.filter(p => p.category === f.category);
  if (f.kind !== 'todos') out = out.filter(p => p.image === (f.kind === 'imagem'));
  const sorters = { antigos: (a, b) => b.id - a.id, curtidas: (a, b) => b.likes - a.likes, recentes: (a, b) => a.id - b.id };
  return [...out].sort(sorters[f.order]);
}
