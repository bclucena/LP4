// Dados de exemplo do Extrato (handoff A.Extrato). Os tipos e os textos vêm da captura; os valores e as datas são exemplos.

/** Tipos de lançamento: ícone, texto da ação e rótulo do filtro. */
export const kinds = {
  compra: { icon: 'shopping-bag', action: 'Comprou o item', label: 'Compras' },
  missao: { icon: 'target', action: 'Completou a missão', label: 'Missões' },
  conquista: { icon: 'award', action: 'Recebeu a conquista', label: 'Conquistas' },
  pesquisa: { icon: 'smile', action: 'Respondeu à pesquisa', label: 'Pesquisas' },
  bonus: { icon: 'plus-circle', action: 'Bônus', label: 'Bônus' },
  curso: { icon: 'check-circle', action: 'Concluiu o curso', label: 'Cursos' },
};

export const kindOptions = [{ id: 'todos', label: 'Todas as categorias' }, ...Object.entries(kinds).map(([id, k]) => ({ id, label: k.label }))];

export const orderOptions = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'antigos', label: 'Mais antigos' },
];

export const tabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'pontos', label: 'Pontos' },
  { id: 'moedas', label: 'Moedas' },
];

/** Lançamentos: data ISO (aaaa-mm-dd), pontos e moedas (negativo = gasto). `removed` = conteúdo removido pelo administrador. */
export const entries = [
  { id: 1, kind: 'compra', name: 'Fone de ouvido sem fio', date: '2026-12-18', points: 0, coins: -300 },
  { id: 2, kind: 'missao', name: 'Visita aos clientes da semana', date: '2026-12-15', points: 100, coins: 300 },
  { id: 3, kind: 'compra', name: 'Vale-café', date: '2026-12-11', points: 0, coins: -150 },
  { id: 4, kind: 'conquista', name: 'Conexões em movimento', date: '2026-12-09', points: 100, coins: 300 },
  { id: 5, kind: 'pesquisa', name: 'Termômetro emocional', date: '2026-12-05', points: 100, coins: 300, removed: true },
  { id: 6, kind: 'bonus', name: 'Bônus de fim de ano', date: '2026-12-02', points: 100, coins: 300 },
  { id: 7, kind: 'curso', name: 'Negociação avançada', date: '2026-11-27', points: 250, coins: 0 },
  { id: 8, kind: 'missao', name: 'Meta de vendas de novembro', date: '2026-11-21', points: 150, coins: 400 },
  { id: 9, kind: 'compra', name: 'Caneca Ludos Pro', date: '2026-11-14', points: 0, coins: -200 },
  { id: 10, kind: 'pesquisa', name: 'Pesquisa de clima', date: '2026-11-08', points: 50, coins: 100 },
  { id: 11, kind: 'conquista', name: 'Primeiros passos', date: '2026-10-29', points: 100, coins: 200 },
  { id: 12, kind: 'bonus', name: 'Bônus manual', date: '2026-10-20', points: -100, coins: 0 },
  { id: 13, kind: 'curso', name: 'Atendimento ao cliente', date: '2026-10-12', points: 200, coins: 0 },
  { id: 14, kind: 'missao', name: 'Indique um colega', date: '2026-10-03', points: 80, coins: 250 },
];

export const defaultExtractFilters = () => ({ kind: 'todos', order: 'recentes', from: '', to: '' });

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "dd/mm/aaaa" vira "aaaa-mm-dd" (ou '' se a data estiver incompleta ou inválida). */
export function parseDate(text) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return '';
  const [, d, mo, y] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  const valid = date.getFullYear() === Number(y) && date.getMonth() === Number(mo) - 1 && date.getDate() === Number(d);
  return valid ? `${y}-${mo}-${d}` : '';
}

/** "2026-12-18" vira "18 dez 2026" (ou "18 Dez. 2026" no desktop). */
export function formatDate(iso, desktop = false) {
  const [y, m, d] = iso.split('-');
  const month = MONTHS[Number(m) - 1];
  return desktop ? `${Number(d)} ${month[0].toUpperCase()}${month.slice(1)}. ${y}` : `${Number(d)} ${month} ${y}`;
}

/** Título do grupo: "Dez 2026". */
export const monthLabel = iso => {
  const month = MONTHS[Number(iso.slice(5, 7)) - 1];
  return `${month[0].toUpperCase()}${month.slice(1)} ${iso.slice(0, 4)}`;
};

/** Aplica tipo, período e aba (pontos/moedas mostram só quem tem o valor) e ordena. */
export function filterEntries(filters, tab = 'todos') {
  const from = parseDate(filters.from);
  const to = parseDate(filters.to);
  const list = entries.filter(e =>
    (filters.kind === 'todos' || e.kind === filters.kind)
    && (!from || e.date >= from)
    && (!to || e.date <= to)
    && (tab === 'todos' || (tab === 'pontos' ? e.points !== 0 : e.coins !== 0)));
  list.sort((a, b) => (filters.order === 'antigos' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  return list;
}

/** Agrupa por mês, mantendo a ordem da lista: [{ label, items }]. */
export function groupByMonth(list) {
  const groups = [];
  for (const e of list) {
    const label = monthLabel(e.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  }
  return groups;
}
