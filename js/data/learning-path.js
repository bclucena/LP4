// Dados de exemplo da Rota de aprendizagem (Figma LP-DesignSystem 4.0, página "Rota"). Conteúdo fictício.
import { course } from './course-detail.js';

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
};
