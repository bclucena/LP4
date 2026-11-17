// Dados de exemplo dos filtros (handoff 1.Cursos). Só as subcategorias de Marketing vêm do Figma; as outras são exemplos.

export const categories = ['Marketing', 'Vendas', 'Liderança', 'Dados', 'Produto', 'Suporte', 'Desenvolvimento', 'Finanças'];

export const subcategories = {
  Marketing: ['Conteúdo', 'Performance', 'Branding'],
  Vendas: ['Prospecção', 'Negociação', 'Pós-venda'],
  Liderança: ['Gestão de pessoas', 'Feedback', 'Comunicação'],
};

/** Categoria escolhida: { cat: string | null, subs: string[] } (subs vazio = todas as subcategorias). */
export const emptyCategory = () => ({ cat: null, subs: [] });

export const contentOptions = [
  { id: 'todos', label: 'Todos os conteúdos' },
  { id: 'curso', label: 'Cursos' },
  { id: 'rota', label: 'Rotas de aprendizagem' },
];

export const progressOptions = [
  { id: 'todos', label: 'Todos os progressos' },
  { id: 'nao', label: 'Não iniciados' },
  { id: 'andamento', label: 'Em andamento' },
  { id: 'concluido', label: 'Concluídos' },
];

export const courseOrderOptions = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'antigos', label: 'Mais antigos' },
  { id: 'maior', label: 'Maior progresso' },
  { id: 'menor', label: 'Menor progresso' },
  { id: 'az', label: 'Título A-Z' },
  { id: 'za', label: 'Título Z-A' },
  { id: 'populares', label: 'Mais populares' },
];

export const categoryLabel = value => {
  if (!value.cat) return 'Todas as categorias';
  return value.subs.length ? `${value.cat}: ${value.subs.join(', ')}` : value.cat;
};
