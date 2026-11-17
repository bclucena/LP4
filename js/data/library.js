// Dados de exemplo da Biblioteca (handoff 2.Biblioteca). As contagens das seções vêm do Figma.

export const materialInfo = {
  arquivo: { label: 'Arquivo', icon: 'file' },
  audio: { label: 'Áudio', icon: 'headphones' },
  video: { label: 'Vídeo', icon: 'video' },
  imagem: { label: 'Imagem', icon: 'image' },
  link: { label: 'Link', icon: 'link' },
};

export const materialOptions = [
  { id: 'todos', label: 'Todos os materiais' },
  ...Object.entries(materialInfo).map(([id, m]) => ({ id, label: m.label })),
];

export const orderOptions = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'antigos', label: 'Mais antigos' },
  { id: 'az', label: 'Título A-Z' },
  { id: 'za', label: 'Título Z-A' },
  { id: 'populares', label: 'Mais curtidos' },
];

export const sections = [
  { name: 'Aprendizado', count: 21 }, { name: 'Estudo de caso', count: 2 }, { name: 'Podcasts & vídeos', count: 4 },
  { name: 'Treinamentos obrigatórios', count: 11 }, { name: 'Liderança', count: 11 }, { name: 'Cultura interna', count: 6 },
  { name: 'Onboarding', count: 2 }, { name: 'Compliance', count: 7 }, { name: 'Conformidade Regulatória', count: 10 },
  { name: 'Políticas Internas', count: 8 }, { name: 'Aplicação de Normas', count: 24 }, { name: 'Conformidade Legal', count: 2 },
  { name: 'Roadmap', count: 6 },
];

/** Seções que aparecem no mobile (a tela de 360 mostra uma linha de chips simples). */
export const mobileSections = ['Tecnologia', 'Saúde e Bem-estar', 'Educação', 'Entretenimento', 'Viagens'];

const titles = [
  'UX & Design Thinking: Experiência do Usuário nos negócios',
  'Guia de boas práticas de atendimento',
  'Política de segurança da informação',
  'Podcast: liderar em tempos de mudança',
  'Checklist de onboarding do time comercial',
  'Mapa de jornada do cliente',
];
const kinds = ['arquivo', 'video', 'audio', 'imagem', 'link', 'arquivo'];
const categories = ['Marketing', 'Vendas', 'Liderança', 'Dados', 'Produto', 'Suporte'];

export const items = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  title: titles[i % titles.length],
  kind: kinds[(i * 5) % kinds.length],
  date: `${String(30 - (i % 9)).padStart(2, '0')} Set. 2027`,
  novo: i % 3 === 0,
  likes: 300 - i * 7,
  views: 101 + i * 13,
  category: categories[i % categories.length],
  section: sections[i % sections.length].name,
}));

export const about =
  'Participe de um encontro exclusivo que reúne líderes visionários e especialistas renomados do setor de saúde para discutir as transformações que a tecnologia está promovendo no cuidado ao paciente. Este evento abrangente oferece uma programação rica, incluindo palestras inspiradoras, painéis interativos e workshops práticos focados em temas como inteligência artificial aplicada à medicina, avanços em telemedicina e o uso de prontuários eletrônicos inteligentes.';

/** Título da descrição: "Sobre este ..." no drawer e "Sobre o ..." no bottom sheet. */
export const aboutTitle = {
  arquivo: ['Sobre este arquivo', 'Sobre o arquivo'],
  audio: ['Sobre este áudio', 'Sobre o áudio'],
  video: ['Sobre este vídeo', 'Sobre o vídeo'],
  imagem: ['Sobre esta imagem', 'Sobre a imagem'],
  link: ['Sobre este link', 'Sobre o link'],
};

/** Ação principal: arquivo e imagem baixam, link abre o site; áudio e vídeo não têm botão. */
export const mainAction = {
  arquivo: { drawer: 'Baixar arquivo', sheet: 'Baixar', icon: 'download' },
  imagem: { drawer: 'Baixar arquivo', sheet: 'Baixar', icon: 'download' },
  link: { drawer: 'Acessar site', sheet: 'Acessar site', icon: 'external-link' },
};

export const defaultLibraryFilters = () => ({ category: { cat: null, subs: [] }, material: 'todos', section: null, order: 'recentes' });

export function filterItems(filters, tab, favs) {
  let out = items.filter(i => tab !== 'favoritos' || favs.includes(i.id));
  if (filters.category.cat) out = out.filter(i => i.category === filters.category.cat);
  if (filters.material !== 'todos') out = out.filter(i => i.kind === filters.material);
  if (filters.section) out = out.filter(i => i.section === filters.section);
  const sorters = {
    recentes: (a, b) => a.id - b.id,
    antigos: (a, b) => b.id - a.id,
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    za: (a, b) => b.title.localeCompare(a.title, 'pt-BR'),
    populares: (a, b) => b.likes - a.likes,
  };
  return [...out].sort(sorters[filters.order] ?? sorters.recentes);
}
