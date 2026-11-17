// Dados de exemplo e regras de ordenação da tela Gestores (Meu time). Portado de _legado/react-tailwind/src/shell/Team.tsx.
// Só funções puras e constantes: nada de HTML aqui.

/* ---------- Usuários ---------- */
const people = ['Mariana Silva', 'Ana Beatriz Lima', 'Rafael Costa', 'Camila Torres', 'João Pedro Alves', 'Beatriz Nunes', 'Lucas Ferreira', 'Diego Martins'];

const baseMembers = people.map((name, i) => ({
  id: i,
  name,
  email: `${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.')}@ludospro.com.br`,
  progress: [100, 85, 60, 42, 100, 30, 72, 15][i],
  performance: [100, 85, 70, 40, 95, 30, 66, 10][i],
  courses: [128, 110, 76, 40, 128, 22, 90, 8][i],
  certs: [128, 100, 76, 30, 120, 12, 80, 4][i],
  missions: [128, 90, 76, 20, 110, 10, 70, 2][i],
  last: `${30 - i} Out. 2027 · 20:00`,
}));

/** Filtro por curso (menu do header no desktop e sheet "Curso" abaixo de 1180). */
export const courseOptions = [
  { id: 'todos', label: 'Todos os cursos' },
  { id: '1', label: 'LGPD na prática' },
  { id: '2', label: 'UX & Design Thinking' },
  { id: '3', label: 'Liderança em tempos de mudança' },
];

/** "Ordenar por" da lista no mobile (sem cabeçalhos de tabela): critério e sentido juntos. */
export const userOrderOptions = [
  { id: 'name-asc', label: 'Nome A-Z' }, { id: 'name-desc', label: 'Nome Z-A' },
  { id: 'progress-desc', label: 'Maior progresso' }, { id: 'progress-asc', label: 'Menor progresso' },
  { id: 'performance-desc', label: 'Maior performance' }, { id: 'performance-asc', label: 'Menor performance' },
  { id: 'last-asc', label: 'Acesso mais recente' }, { id: 'last-desc', label: 'Acesso mais antigo' },
];

/** 'progress-desc' vira { key: 'progress', dir: 'desc' }. */
export const toSort = id => {
  const i = id.lastIndexOf('-');
  return { key: id.slice(0, i), dir: id.slice(i + 1) };
};

/** Usuários do curso escolhido (cada curso reduz o progresso e a performance), já ordenados. */
export function listMembers(course, sort) {
  const shift = course === 'todos' ? 0 : Number(course) * 9;
  const out = baseMembers.map(m => ({ ...m, progress: Math.max(0, m.progress - shift), performance: Math.max(0, m.performance - shift) }));
  const k = sort.key;
  const cmp = (a, b) => (k === 'name' ? a.name.localeCompare(b.name, 'pt-BR') : k === 'last' ? a.id - b.id : a[k] - b[k]);
  return out.sort((a, b) => (sort.dir === 'asc' ? cmp(a, b) : cmp(b, a)));
}

/** Um usuário pelo id (os números ficam os mesmos de "Todos os cursos"). */
export const memberById = id => baseMembers.find(m => m.id === id);

/* ---------- Conteúdo navegável: rota > curso > módulo > atividade ---------- */
export const kindLabel = { rota: 'Rotas de aprendizagem', curso: 'Curso', modulo: 'Módulo', atividade: 'Atividade' };
export const kindIcon = { rota: 'layers', curso: 'book', modulo: 'box', atividade: 'activity' };
export const plural = { rota: 'Rotas', curso: 'Cursos', modulo: 'Módulos', atividade: 'Atividades' };
export const singular = { rota: 'Rota de aprendizagem', curso: 'Curso', modulo: 'Módulo', atividade: 'Atividade' };
export const childOf = { rota: 'curso', curso: 'modulo', modulo: 'atividade', atividade: null };

const names = [
  'UX & Design Thinking: A importância da Experiência do Usuário', 'LGPD aplicada a pequenas e médias empresas', 'Liderança em tempos de mudança',
  'Atendimento que encanta', 'Negociação na prática', 'Dados para decisões do dia a dia', 'Cultura de feedback',
];

/** Número estável (0 a 100) a partir do caminho do item: serve de progresso, performance e prazo de exemplo. */
export const stat = (path, salt) => ((path.reduce((a, b) => a * 7 + b, 3) + salt) * 13) % 101;

/** Itens do próximo nível (7 por nível). `kind` é o tipo do item pai. */
export const children = (kind, path) => {
  const next = childOf[kind];
  if (!next) return [];
  return Array.from({ length: 7 }, (_, i) => ({ title: names[(i + path.length) % names.length], kind: next, path: [...path, i + 1] }));
};

/** Itens do primeiro nível de cada aba (Rota de aprendizagem ou Cursos). */
export const rootItems = kind => Array.from({ length: 7 }, (_, i) => ({ title: names[i % names.length], kind, path: [i + 1] }));

export const requiredOf = path => stat(path, 3) % 2 === 0;
export const dueDay = path => String((stat(path, 9) % 28) + 1).padStart(2, '0');
export const plays = path => (stat(path, 2) % 9) + 1;

export const defaultDir = { perf: 'desc', prog: 'desc', nome: 'asc', prazo: 'asc' };
/** Opções do "Ordenar por" do conteúdo: critério e sentido juntos. */
export const optLabels = {
  perf: { desc: 'Maior performance', asc: 'Menor performance' },
  prog: { desc: 'Maior progresso', asc: 'Menor progresso' },
  nome: { asc: 'Título A-Z', desc: 'Título Z-A' },
  prazo: { asc: 'Prazo mais próximo', desc: 'Prazo mais distante' },
};
const optOrder = [['perf', 'desc'], ['perf', 'asc'], ['prog', 'desc'], ['prog', 'asc'], ['nome', 'asc'], ['nome', 'desc'], ['prazo', 'asc'], ['prazo', 'desc']];
/** Opções do sheet de ordenação; o prazo só existe para cursos. */
export const contentSortOptions = withPrazo =>
  optOrder.filter(([k]) => k !== 'prazo' || withPrazo).map(([k, d]) => ({ id: `${k}-${d}`, label: optLabels[k][d] }));

/** Ordena e filtra os itens do nível atual. `memberProgress` é o progresso do usuário (entra no cálculo de "Progressão"). */
export function sortContent(items, { by, dir }, memberProgress) {
  const sorters = {
    perf: (a, b) => stat(a.path, 5) - stat(b.path, 5),
    nome: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    prazo: (a, b) => (stat(a.path, 9) % 28) - (stat(b.path, 9) % 28),
    prog: (a, b) => stat(a.path, memberProgress) - stat(b.path, memberProgress),
  };
  return [...items].sort((x, y) => sorters[by](x, y) * (dir === 'asc' ? 1 : -1));
}

/* ---------- Certificados ---------- */
export const certs = [
  { title: 'UX & Design Thinking: A importância da Experiência do Usuário para o sucesso dos negócios. O essencial para criar soluções eficazes.', date: '2026-05-30' },
  { title: 'LGPD aplicada a pequenas e médias empresas: do mapeamento de dados ao relatório de impacto', date: '2026-04-12' },
  { title: 'Liderança em tempos de mudança: como conduzir times em transformação', date: '2026-03-21' },
  { title: 'Atendimento que encanta: do primeiro contato ao pós-venda', date: '2026-02-08' },
  { title: 'Negociação na prática: técnicas para fechar acordos melhores', date: '2025-12-15' },
  { title: 'Dados para decisões do dia a dia', date: '2025-11-03' },
  { title: 'Cultura de feedback: conversas difíceis sem perder a relação', date: '2025-09-19' },
  { title: 'Compliance em dia: o essencial para todos os colaboradores', date: '2025-07-01' },
];

export const certOrderOptions = [
  { id: 'recent', label: 'Mais recentes' }, { id: 'old', label: 'Mais antigos' },
  { id: 'az', label: 'Título A-Z' }, { id: 'za', label: 'Título Z-A' },
];
export const certOrderLabel = id => certOrderOptions.find(o => o.id === id).label;

const months = ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'];
/** '2026-05-30' vira '30 Mai. 2026'. */
export const fmtDate = iso => {
  const [y, m, d] = iso.split('-');
  return `${d} ${months[Number(m) - 1]} ${y}`;
};

export function sortCerts(order) {
  const list = [...certs];
  if (order === 'az') list.sort((x, y) => x.title.localeCompare(y.title, 'pt-BR'));
  else if (order === 'za') list.sort((x, y) => y.title.localeCompare(x.title, 'pt-BR'));
  else if (order === 'old') list.sort((x, y) => x.date.localeCompare(y.date));
  else list.sort((x, y) => y.date.localeCompare(x.date));
  return list;
}

/* ---------- Missões ---------- */
export const missionStates = [
  { id: 'andamento', label: 'Em andamento' },
  { id: 'aprovada', label: 'Aprovada' },
  { id: 'nao', label: 'Não iniciada' },
  { id: 'reprovada', label: 'Reprovada' },
];
export const missionList = Array.from({ length: 12 }, (_, i) => ({ id: i, state: missionStates[(i + Math.floor(i / 4)) % 4] }));
export const missionTitle = 'UX & Design Thinking: A importância da Experiência do Usuário para o sucesso dos negócios';
/** Missões que passam pelo filtro de status (lista vazia = todas). */
export const filterMissions = sel => missionList.filter(m => sel.length === 0 || sel.includes(m.state.id));

/** Degradês dos selos de conquista (de cima para baixo). */
export const badgeTones = [
  ['var(--color-purple-500)', '#4338ca'], ['var(--color-yellow-400)', '#ea580c'], ['var(--color-purple-400)', '#a21caf'],
  ['var(--color-red-500)', '#be123c'], ['#38bdf8', 'var(--color-blue-600)'],
];
