import { subcategories } from './filters.js';

// Dados de exemplo da tela de Cursos (handoff 1.Cursos).

const titles = [
  'UX & Design Thinking: Experiência do Usuário nos negócios',
  'LGPD descomplicada: tudo o que você precisa saber',
  'Liderança em tempos de mudança',
  'Atendimento que encanta: do primeiro contato ao pós-venda',
  'Negociação na prática',
  'Dados para decisões do dia a dia',
];
const categories = ['Marketing', 'Marketing', 'Vendas', 'Liderança', 'Dados', 'Produto'];

export const courses = Array.from({ length: 12 }, (_, i) => {
  const category = categories[i % 6];
  const subs = subcategories[category];
  return {
    id: i,
    kind: i % 3 === 1 ? 'rota' : 'curso',
    title: titles[i % titles.length],
    novo: i % 2 === 0,
    sugerido: i % 3 !== 2,
    obrigatorio: i % 4 === 0 || i % 5 === 0,
    done: i % 4 === 3,
    progress: [0, 25, 60, 100][i % 4],
    meta: i % 3 === 1 ? '2h 10min · 4 Cursos' : '2h 10min · 8 Módulos',
    category,
    sub: subs ? subs[i % subs.length] : null,
    popularity: (i * 37) % 100,
  };
});

export const defaultCourseFilters = () => ({ category: { cat: null, subs: [] }, content: 'todos', progress: 'todos', order: 'recentes' });

export function applyFilters(list, tab, f) {
  let out = list.filter(c => tab === 'todos' || (tab === 'obrigatorios' ? c.obrigatorio : c.sugerido));
  if (f.category.cat) {
    out = out.filter(c => c.category === f.category.cat && (f.category.subs.length === 0 || (c.sub !== null && f.category.subs.includes(c.sub))));
  }
  if (f.content !== 'todos') out = out.filter(c => c.kind === f.content);
  if (f.progress !== 'todos') {
    out = out.filter(c => {
      const status = c.done || c.progress >= 100 ? 'concluido' : c.progress === 0 ? 'nao' : 'andamento';
      return status === f.progress;
    });
  }
  const pct = c => (c.done ? 100 : c.progress);
  const sorters = {
    recentes: (a, b) => a.id - b.id,
    antigos: (a, b) => b.id - a.id,
    maior: (a, b) => pct(b) - pct(a),
    menor: (a, b) => pct(a) - pct(b),
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    za: (a, b) => b.title.localeCompare(a.title, 'pt-BR'),
    populares: (a, b) => b.popularity - a.popularity,
  };
  return [...out].sort(sorters[f.order] ?? sorters.recentes);
}
