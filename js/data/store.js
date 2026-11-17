/* Dados de exemplo da Loja (js/screens/store.js). Itens para trocar por moedas; o saldo começa em 2.500. */

export const INITIAL_BALANCE = 2500;

const titles = ['Fone de ouvido bluetooth', 'Vale-presente de livraria', 'Day off', 'Kit de brindes Ludos Pro', 'Caneca térmica', 'Curso premium de liderança'];
const cats = ['Eletrônicos', 'Vale-presente', 'Experiências', 'Brindes'];

export const items = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  title: titles[i % titles.length],
  category: cats[i % cats.length],
  price: [1000, 500, 3000, 250, 800, 1500][i % 6],
  soldOut: i % 4 === 3,
  novo: i % 2 === 0,
}));

export const categoryOptions = [{ id: 'todos', label: 'Todas as categorias' }, ...cats.map(c => ({ id: c, label: c }))];
export const orderOptions = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'menor', label: 'Menor preço' },
  { id: 'maior', label: 'Maior preço' },
  { id: 'az', label: 'Título A-Z' },
];

export const defaultStoreFilters = () => ({ category: 'todos', order: 'recentes' });

/** Número no formato brasileiro (2.500). */
export const fmt = n => n.toLocaleString('pt-BR');

/** Itens da categoria escolhida, na ordem escolhida. */
export function filterItems({ category, order }) {
  const sorters = {
    recentes: (a, b) => a.id - b.id,
    menor: (a, b) => a.price - b.price,
    maior: (a, b) => b.price - a.price,
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
  };
  return items.filter(i => category === 'todos' || i.category === category).sort(sorters[order]);
}
