// Dados de exemplo de Certificados (handoff 6.Certificados).

const titles = ['UX & Design Thinking: Experiência do Usuário nos negócios', 'LGPD descomplicada', 'Liderança em tempos de mudança', 'Atendimento que encanta'];
const kinds = ['curso', 'hibrida', 'evento'];

export const certificates = Array.from({ length: 12 }, (_, i) => {
  const kind = kinds[i % 3];
  return {
    id: i,
    title: titles[i % titles.length],
    kind,
    progress: [100, 0, 45, 100, 70, 0][i % 6],
    meta: kind === 'curso' ? '8 Módulos' : kind === 'evento' ? '2 encontros' : '3 Cursos e 15 eventos',
    novo: i % 2 === 0,
  };
});

export const kindInfo = {
  curso: { label: 'Curso', icon: 'book' },
  evento: { label: 'Evento', icon: 'calendar' },
  hibrida: { label: 'Trilha híbrida', icon: 'layers' },
};

export const kindOptions = [
  { id: 'todos', label: 'Todos os certificados' }, { id: 'curso', label: 'Cursos' },
  { id: 'evento', label: 'Eventos' }, { id: 'hibrida', label: 'Trilhas híbridas' },
];

export const orderOptions = [
  { id: 'recentes', label: 'Mais recentes' }, { id: 'antigos', label: 'Mais antigos' },
  { id: 'az', label: 'Título A-Z' }, { id: 'maior', label: 'Maior progresso' },
];

export const defaultCertificateFilters = () => ({ kind: 'todos', order: 'recentes' });

/** Filtra pela aba (todos, andamento, conquistados), pelo tipo e ordena. */
export function filterCertificates(tab, { kind, order }) {
  let out = certificates.filter(c => (tab === 'conquistados' ? c.progress >= 100 : tab === 'andamento' ? c.progress < 100 : true));
  if (kind !== 'todos') out = out.filter(c => c.kind === kind);
  const sorters = {
    recentes: (a, b) => a.id - b.id,
    antigos: (a, b) => b.id - a.id,
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    maior: (a, b) => b.progress - a.progress,
  };
  return [...out].sort(sorters[order]);
}
