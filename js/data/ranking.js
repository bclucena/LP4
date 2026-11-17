// Dados de exemplo do Ranking (handoff 4.Ranking).

const periods = ['Trimestral', 'Semanal', 'Mensal', 'Anual'];

export const rankings = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  title: 'UX & Design Thinking: Experiência do Usuário nos negócios',
  scope: i % 2 === 0 ? 'Entre turmas' : 'Entre pessoas',
  period: periods[i % 4],
  active: i % 3 !== 2,
  round: 5 - (i % 3),
}));

export const rounds = ['31 Ago. - 04 Set. 2026', '24 Ago. - 28 Ago. 2026', '17 Ago. - 21 Ago. 2026'];

const names = ['Mariana Santana', 'Rafael Lima', 'Camila Torres', 'João Pedro Alves', 'Beatriz Nunes', 'Lucas Ferreira', 'Ana Paula Souza', 'Diego Martins'];

/** Os três primeiros empatam em 15.425; do 4º em diante cada posição perde 450 pontos. */
export const entries = names.map((name, i) => ({ name, points: 15425 - i * (i < 3 ? 0 : 450) }));

/** Pontos mostrados na lista a partir do 4º lugar (o exemplo do app antigo desconta 425 do valor do pódio). */
export const listPoints = e => e.points - 15425 + 15000;

export const fmt = n => n.toLocaleString('pt-BR');

export const scopeOptions = [{ id: 'todos', label: 'Todos os rankings' }, { id: 'turmas', label: 'Entre turmas' }, { id: 'pessoas', label: 'Entre pessoas' }];
export const typeOptions = [{ id: 'todos', label: 'Todos os tipos' }, ...periods.map(p => ({ id: p, label: p }))];
export const orderOptions = [{ id: 'recentes', label: 'Mais recentes' }, { id: 'antigos', label: 'Mais antigos' }, { id: 'az', label: 'Título A-Z' }];

export const defaultRankingFilters = () => ({ scope: 'todos', type: 'todos', order: 'recentes' });

/** tab: 'todos', 'ativos' ou 'finalizados'. */
export function filterRankings(tab, f) {
  let out = rankings.filter(r => (tab === 'ativos' ? r.active : tab === 'finalizados' ? !r.active : true));
  if (f.scope !== 'todos') out = out.filter(r => r.scope === (f.scope === 'turmas' ? 'Entre turmas' : 'Entre pessoas'));
  if (f.type !== 'todos') out = out.filter(r => r.period === f.type);
  if (f.order === 'antigos') return [...out].reverse();
  if (f.order === 'az') return [...out].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  return out;
}
