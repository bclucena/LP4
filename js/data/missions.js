// Dados de exemplo das Missões (handoff 3.Missões). Os cartões são gerados a partir de listas curtas que se repetem.

/** Status da missão: rótulo, cor da pílula (desktop), tom da pílula mobile e ícone (Feather). */
export const statusInfo = {
  novo: { label: 'Novo', color: 'blue', tone: 'info', icon: 'award' },
  devolvido: { label: 'Devolvido', color: 'yellow', tone: 'warning', icon: 'alert-circle' },
  aprovado: { label: 'Aprovado', color: 'green', tone: 'success', icon: 'check-circle' },
  reprovado: { label: 'Reprovado', color: 'red', tone: 'error', icon: 'x-circle' },
  correcao: { label: 'Em correção', color: 'grey', tone: 'subtle', icon: 'refresh-cw' },
};

export const periodLabel = { unico: 'Único', diario: 'Diário', semanal: 'Semanal', mensal: 'Mensal', trimestral: 'Trimestral', anual: 'Anual' };
export const kindLabel = { meta: 'Meta', evidencia: 'Evidência' };

/** Opções de filtro: "todos" + um item por chave do mapa. */
const withAll = (all, labels) => [{ id: 'todos', label: all }, ...Object.entries(labels).map(([id, label]) => ({ id, label }))];

export const scopeOptions = [{ id: 'todos', label: 'Todas as missões' }, { id: 'individual', label: 'Individuais' }, { id: 'equipe', label: 'De equipe' }];
export const kindOptions = withAll('Todos os tipos', kindLabel);
export const statusOptions = withAll('Todos os status', Object.fromEntries(Object.entries(statusInfo).map(([id, s]) => [id, s.label])));
export const orderOptions = [
  { id: 'recentes', label: 'Mais recentes' }, { id: 'antigos', label: 'Mais antigos' }, { id: 'az', label: 'Título A-Z' }, { id: 'za', label: 'Título Z-A' },
];

export const categories = ['Marketing', 'Vendas', 'Liderança', 'Dados'];

const titles = [
  'UX & Design Thinking: Experiência do Usuário nos negócios',
  'Concluir a trilha de compliance do trimestre',
  'Enviar evidência da visita ao cliente',
  'Atingir a meta de atendimentos do mês',
];
const statuses = ['reprovado', 'novo', 'aprovado', 'devolvido', 'correcao'];
const periods = ['trimestral', 'unico', 'diario', 'semanal', 'mensal', 'anual'];

export const missions = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  title: titles[i % titles.length],
  kind: i % 2 === 0 ? 'meta' : 'evidencia',
  period: periods[i % periods.length],
  status: statuses[(i * 3) % statuses.length],
  scope: i % 5 === 4 ? 'equipe' : 'individual',
  category: categories[i % categories.length],
  progress: [0, 40, 100, 70][i % 4],
  ends: `${(i % 30) + 1} dias`,
}));

/** Filtros aplicados. category segue o formato do menu de categorias ({ cat, subs }); os demais são ids de opção. */
export const defaultMissionFilters = () => ({ category: { cat: null, subs: [] }, scope: 'todos', kind: 'todos', status: 'todos', order: 'recentes' });

/** O sheet de filtros trabalha com um rascunho "plano" (só textos); estas duas funções convertem de e para os filtros. */
export const toDraft = f => ({ category: f.category.cat ?? 'todos', scope: f.scope, kind: f.kind, status: f.status, order: f.order });
export const fromDraft = d => ({ category: { cat: d.category === 'todos' ? null : d.category, subs: [] }, scope: d.scope, kind: d.kind, status: d.status, order: d.order });

/** tab: 'todos', 'favoritos' ou o id de um período. */
export function filterMissions(tab, f, favs) {
  let out = missions.filter(m => tab === 'todos' || (tab === 'favoritos' ? favs.includes(m.id) : m.period === tab));
  if (f.category.cat) out = out.filter(m => m.category === f.category.cat);
  if (f.scope !== 'todos') out = out.filter(m => m.scope === f.scope);
  if (f.kind !== 'todos') out = out.filter(m => m.kind === f.kind);
  if (f.status !== 'todos') out = out.filter(m => m.status === f.status);
  const sorters = {
    recentes: (a, b) => a.id - b.id,
    antigos: (a, b) => b.id - a.id,
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    za: (a, b) => b.title.localeCompare(a.title, 'pt-BR'),
  };
  return [...out].sort(sorters[f.order] ?? sorters.recentes);
}
