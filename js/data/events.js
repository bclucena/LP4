/* Dados de exemplo dos Eventos (js/screens/events.js): online, presenciais e híbridos, com data, local e vagas. */

/** Tipos de evento: rótulo e ícone (Feather). */
export const modeInfo = {
  presencial: { label: 'Presencial', icon: 'map-pin' },
  online: { label: 'Online', icon: 'monitor' },
  hibrido: { label: 'Híbrido', icon: 'shuffle' },
};
const modes = ['presencial', 'hibrido', 'online'];
const cats = ['Marketing', 'Vendas', 'Liderança'];

export const events = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  title: 'UX & Design Thinking: Experiência do Usuário nos negócios',
  mode: modes[i % 3],
  category: cats[i % 3],
  place: modes[i % 3] === 'presencial' ? 'São Paulo' : modes[i % 3] === 'online' ? 'Online' : 'Híbrido',
  date: '30 Dez. 2027 - 02 Jan. 2028 · 14:00 - 18:00',
  slots: i % 3 === 1 ? null : 100, // null = vagas ilimitadas
  taken: i % 3 === 2 ? 100 : i % 4,
  ended: i % 4 === 0,
  novo: i % 2 === 0,
}));

export const categoryOptions = [{ id: 'todos', label: 'Todas as categorias' }, ...cats.map(c => ({ id: c, label: c }))];
export const modeOptions = [{ id: 'todos', label: 'Todos os tipos' }, ...modes.map(m => ({ id: m, label: modeInfo[m].label }))];
export const orderOptions = [{ id: 'recentes', label: 'Mais recentes' }, { id: 'antigos', label: 'Mais antigos' }, { id: 'az', label: 'Título A-Z' }];

export const defaultEventFilters = () => ({ category: 'todos', mode: 'todos', order: 'recentes' });

/** Sem vagas: o limite existe e já foi atingido. */
export const isFull = e => e.slots !== null && e.taken >= e.slots;

/** Aplica a aba (todos, favoritos, em breve, encerrados), os filtros e a ordem. `favs` é uma lista de ids. */
export function filterEvents(tab, f, favs) {
  let out = events.filter(e => (tab === 'favoritos' ? favs.includes(e.id) : tab === 'encerrados' ? e.ended : tab === 'embreve' ? !e.ended : true));
  if (f.category !== 'todos') out = out.filter(e => e.category === f.category);
  if (f.mode !== 'todos') out = out.filter(e => e.mode === f.mode);
  const sorters = {
    antigos: (a, b) => b.id - a.id,
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    recentes: (a, b) => a.id - b.id,
  };
  return [...out].sort(sorters[f.order]);
}
