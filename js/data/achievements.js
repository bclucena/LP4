// Dados de exemplo de Conquistas (handoff 5.Conquistas).

const names = ['UX & Design Thinking', 'LGPD na prática', 'Liderança em ação', 'Atendimento nota 10', 'Negociação avançada', 'Dados para decisão', 'Cultura de feedback', 'Compliance em dia'];

export const achievements = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  title: names[i],
  kind: i % 4 === 0 || i % 4 === 3 ? 'epica' : 'merito',
  progress: [100, 60, 0, 100, 30, 100, 0, 80][i],
  novo: i % 2 === 0,
  points: 100 + i * 50,
  coins: 20 + i * 10,
  description: 'Conclua os cursos e as missões da trilha para desbloquear esta conquista e receber as recompensas.',
}));

export const kindLabel = { merito: 'Mérito', epica: 'Épica' };

export const progressOptions = [
  { id: 'todos', label: 'Todos os progressos' }, { id: 'nao', label: 'Não iniciadas' },
  { id: 'andamento', label: 'Em andamento' }, { id: 'concluido', label: 'Concluídas' },
];

export const orderOptions = [
  { id: 'recentes', label: 'Mais recentes' }, { id: 'antigos', label: 'Mais antigos' },
  { id: 'az', label: 'Título A-Z' }, { id: 'maior', label: 'Maior progresso' },
];

export const defaultAchievementFilters = () => ({ progress: 'todos', order: 'recentes' });

/** Filtra pela aba (todos, merito, epica), pelo progresso e ordena. */
export function filterAchievements(tab, { progress, order }) {
  let out = achievements.filter(a => tab === 'todos' || a.kind === tab);
  if (progress !== 'todos') {
    out = out.filter(a => (progress === 'concluido' ? a.progress >= 100 : progress === 'nao' ? a.progress === 0 : a.progress > 0 && a.progress < 100));
  }
  const sorters = {
    recentes: (a, b) => a.id - b.id,
    antigos: (a, b) => b.id - a.id,
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    maior: (a, b) => b.progress - a.progress,
  };
  return [...out].sort(sorters[order]);
}
