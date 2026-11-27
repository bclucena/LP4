// Dados de exemplo da Rota de aprendizagem (Figma LP-DesignSystem 4.0, página "Rota"). Conteúdo fictício.
import { course } from './course-detail.js';
import { channels } from './feed.js';

const carla = { name: 'Carla Silva', avatar: 'assets/fluxo/avatar-carla.png' };
const mariana = { name: 'Mariana Silva', avatar: 'assets/fluxo/avatar-mariana.png' };

export const route = {
  title: 'LGPD Descomplicada: Tudo o que você precisa saber',
  kicker: 'Rota de aprendizagem',
  banner: 'assets/fluxo/curso-lgpd.png', // a mesma imagem do card lateral
  cover: 'assets/fluxo/curso-lgpd.png',
  flags: { novo: true },
  sequential: true, // "Rota de aprendizagem sequencial": cada curso libera o seguinte
  started: 312,
  updated: '30 set 2026',
  points: '3.500',
  coins: '500',
  description: course.description,
  // Certificado da rota: nome e data em que foi recebido (formato "10 Nov. 2026").
  certificate: { name: 'Certificado de conclusão: LGPD Descomplicada', received: '10 Nov. 2026' },
  categories: ['Atividades', 'Prova', 'Missões', 'Materiais de apoio', 'Tutor.IA'],
};

/** Cursos da rota, na ordem em que devem ser feitos. `min`: duração em minutos; `deadline`: selo escuro sobre a imagem. */
export const routeCourses = [
  { title: course.title, min: 118, modules: 4, tags: ['Compliance'], extraTags: 2, author: mariana, novo: true, sugerido: true, obrigatorio: true },
  { title: 'Segurança da informação no dia a dia', min: 80, modules: 5, tags: ['Segurança'], extraTags: 1, author: carla, novo: true, sugerido: true, obrigatorio: false, deadline: 'Encerra em 50min' },
  { title: 'Engenharia social: como reconhecer golpes', min: 50, modules: 3, tags: ['Segurança'], extraTags: 0, author: carla, novo: false, sugerido: true, obrigatorio: true },
  { title: 'Resposta a incidentes de dados', min: 130, modules: 8, tags: ['Compliance'], extraTags: 3, author: mariana, novo: true, sugerido: false, obrigatorio: true },
];

/** Estado pelo hash (#rota?estado=andamento): cursos concluídos e o progresso do curso atual. */
export const routeStates = {
  'nao-iniciado': { done: () => 0, currentPct: 0 },
  andamento: { done: () => 1, currentPct: 40 },
  concluido: { done: total => total, currentPct: 0 },
  // Liberada: nada concluído e todas as etapas disponíveis, em qualquer ordem (sem cadeado e sem etapa "atual").
  liberada: { done: () => 0, currentPct: 0, open: true },
};

/** Tipos de etapa da rota: rótulo, ícone (Feather) e a área do app que a etapa abre. Os rótulos e ícones de cada tipo seguem as
    próprias áreas (Missões, Feed, Biblioteca, Eventos). */
export const stepKinds = {
  curso: { label: 'Curso', icon: 'book-open', href: '#curso' },
  noticia: { label: 'Notícia', icon: 'globe', href: '#feed' },
  material: { label: 'Biblioteca', icon: 'file-text', href: '#biblioteca' },
  missao: { label: 'Missão', icon: 'flag', href: '#missoes' },
  evento: { label: 'Evento', icon: 'calendar', href: '#eventos' },
};

/** Etapas da rota, na ordem: os cursos intercalados com uma notícia, um material da Biblioteca, uma missão e um evento.
    Cada tipo traz os dados que o card dele mostra (ver stepCard em js/screens/learning-path.js). */
export const routeSteps = [
  { kind: 'curso', ...routeCourses[0] },
  { kind: 'noticia', excerpt: 'A LGPD mudou a forma como as empresas coletam, guardam e usam os dados dos clientes no atendimento. Agora, cada informação pedida precisa ter uma finalidade clara, e o cliente pode saber o que é feito com os seus dados, pedir a correção ou a exclusão a qualquer momento. Veja o que muda na rotina das equipes de atendimento e como evitar os erros mais comuns.', image: 'assets/fluxo/slots/slideshow-img-3.webp', title: 'LGPD na prática: o que muda no atendimento aos clientes', channel: channels[2], published: 'Publicado há 2 dias', readMin: 4, tags: ['Compliance'], extraTags: 1, author: mariana, novo: true, likes: 24, comments: 6 },
  { kind: 'curso', ...routeCourses[1] },
  { kind: 'material', image: 'assets/fluxo/slots/leitura-galeria-3.webp', title: 'Guia rápido: as bases legais da LGPD', material: 'arquivo', date: '12 Set. 2026', tags: ['Compliance'], extraTags: 2, likes: 128, views: 342 },
  { kind: 'missao', image: 'assets/fluxo/slots/slideshow-img-1.webp', title: 'Mapeie os dados pessoais tratados no seu setor', mission: 'evidencia', scope: 'Individual', period: 'unico', ends: 'Encerra em 12 dias', tags: ['Compliance'], extraTags: 0, novo: true },
  { kind: 'curso', ...routeCourses[2] },
  { kind: 'evento', image: 'assets/fluxo/slots/atividade-figura-1.webp', title: 'Workshop ao vivo: como agir em um vazamento de dados', mode: 'online', place: 'Online', date: '10 Dez. 2026 · 14:00 - 16:00', slots: 100, taken: 64, tags: ['Segurança'], extraTags: 0 },
  { kind: 'curso', ...routeCourses[3] },
];
