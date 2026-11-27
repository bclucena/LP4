import { activities } from './activity.js';
import { modules as boardModules } from './board.js';

/* Tweaks do mockup (como no protótipo ludos-pro-fluxo): variações de cada tela para revisão de design. Não fazem parte do
   produto. Cada tweak vira um parâmetro do endereço (#curso?estado=concluido), então o link compartilhado já abre a variação.
   O valor padrão não vai para o endereço e é sempre o que a tela mostra sem tweak. Para criar um tweak: acrescente aqui e faça
   a tela ler o parâmetro (e reagir ao evento hashchange, porque trocar só o parâmetro não remonta a tela).

   Tipos: 'choice' (poucas opções, botões), 'select' (muitas opções, lista), 'switch' (liga/desliga; valor "1"; com
   `default: true` o valor desligado vai como "0") e 'range' (número entre min e max). `section` agrupa no painel. 'images' envia uma imagem por item de `slots` (não vai para o endereço:
   fica no navegador, ver js/data/module-images.js). */

const courseStates = [
  { value: 'nao-iniciado', label: 'Não iniciado' },
  { value: 'andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
];

const versions = [{ value: 'a', label: 'Versão A' }, { value: 'b', label: 'Versão B' }];

export const tweaks = {
  curso: [
    { id: 'estado', section: 'Curso', label: 'Estado do curso', type: 'choice', options: [...courseStates, { value: 'liberado', label: 'Todas liberadas' }], default: 'andamento' },
    { id: 'certificado', section: 'Curso', label: 'Certificado', hint: 'Aparece com o curso concluído. Em andamento: o curso faz parte de um conjunto de cursos que libera o certificado', type: 'choice', default: 'recebido',
      options: [{ value: 'recebido', label: 'Recebido' }, { value: 'andamento', label: 'Em andamento' }] },
    { id: 'vazio', section: 'Curso', label: 'Estados vazios', hint: 'Sem atividades e materiais', type: 'switch' },
    { id: 'fundo', section: 'Fundo', label: 'Fundo', type: 'choice', default: 'imagem',
      options: [{ value: 'cor', label: 'Cor' }, { value: 'imagem', label: 'Imagem' }] },
    // Imagem do fundo: padrão = a do 1º módulo do Tabuleiro; dá para trocar (fica neste navegador, ver module-images.js).
    { id: 'imagemFundo', section: 'Fundo', label: 'Imagem do fundo', type: 'images', store: 'lp-curso-bg', fundo: 'imagem',
      slots: [{ label: 'Fundo', title: 'Imagem atrás da página do curso', fallback: boardModules[0].background }] },
    { id: 'escurecer', section: 'Fundo', label: 'Escurecer o fundo', type: 'range', min: 0, max: 80, step: 5, unit: '%', default: '0' },
    { id: 'lista', section: 'Lista', label: 'Lista de atividades', type: 'choice', default: 'linha',
      options: [{ value: 'linha', label: 'Linha do tempo' }, { value: 'cards', label: 'Cards' }] },
  ],
  rota: [
    { id: 'estado', section: 'Rota', label: 'Estado da rota', hint: 'Liberada: nada concluído e todas as etapas disponíveis, em qualquer ordem', type: 'choice', options: [...courseStates, { value: 'liberada', label: 'Liberada' }], default: 'andamento' },
  ],
  tabuleiro: [
    { id: 'estado', section: 'Curso', label: 'Estado do curso', hint: 'Trilha liberada: nada concluído e todos os pins (atividades, avaliações e missões) disponíveis, em qualquer ordem', type: 'choice', options: [...courseStates, { value: 'liberado', label: 'Trilha liberada' }], default: 'andamento' },
    { id: 'certificado', section: 'Curso', label: 'Certificado', hint: 'Aparece com o curso concluído. Em andamento: o curso faz parte de um conjunto de cursos que libera o certificado', type: 'choice', default: 'recebido',
      options: [{ value: 'recebido', label: 'Recebido' }, { value: 'andamento', label: 'Em andamento' }] },
    { id: 'layout', section: 'Trilha', label: 'Layout', hint: 'Moderno: trilha larga, nomes nos pins e o cartão da próxima atividade', type: 'choice', default: 'classico',
      options: [{ value: 'classico', label: 'Clássico' }, { value: 'moderno', label: 'Moderno' }] },
    { id: 'painel', section: 'Painel', label: 'Menu lateral', hint: 'Float: ícones que abrem um cartão flutuante. Barra integrada: as informações numa barra em cima da trilha. Dock: um cartão compacto no canto, com a próxima atividade, que recolhe numa pílula', type: 'choice', default: 'dock',
      options: [{ value: 'dock', label: 'Dock recolhível' }, { value: 'barra', label: 'Barra integrada' }, { value: 'fixo', label: 'Coluna fixa' }, { value: 'float', label: 'Versão float' }] },
    { id: 'trilha', section: 'Trilha', label: 'Desenho da trilha', hint: 'C: estrada fina com setas de sentido e as estrelas em cima dos pins. D: a trilha na horizontal, rolando para o lado. E: faixa colorida em zigue-zague, com um cartão com imagem por módulo. No mobile e no tablet a trilha é sempre vertical (Versão C)', type: 'choice', options: [...versions, { value: 'c', label: 'Versão C' }, { value: 'd', label: 'Versão D' }, { value: 'e', label: 'Versão E' }], default: 'e' },
    { id: 'cores', section: 'Trilha', label: 'Cores dos módulos', hint: 'Vale para a Versão E', type: 'choice', default: 'modulos',
      options: [{ value: 'modulos', label: 'Uma por módulo' }, { value: 'marca', label: 'Cor da marca' }] },
    { id: 'pins', section: 'Trilha', label: 'Pins', type: 'choice', options: versions, default: 'b' },
    { id: 'imagens', section: 'Trilha', label: 'Imagens nos pins', hint: 'Vale com os pins da Versão B', type: 'switch', default: true },
    { id: 'fundo', section: 'Fundo', label: 'Fundo', type: 'choice', default: 'modulos',
      options: [{ value: 'cor', label: 'Cor' }, { value: 'imagem', label: 'Imagem' }, { value: 'modulos', label: 'Imagem por módulo' }] },
    { id: 'cor', section: 'Fundo', label: 'Cor do fundo', hint: 'Vale quando o fundo é Cor', type: 'choice', default: 'subtle',
      options: [{ value: 'subtle', label: 'Lilás claro' }, { value: 'default', label: 'Branco' }, { value: 'marca', label: 'Marca suave' }, { value: 'escuro', label: 'Escuro' }] },
    { id: 'escurecer', section: 'Fundo', label: 'Escurecer o fundo', type: 'range', min: 0, max: 80, step: 1, unit: '%', default: '32' },
    { id: 'imagensModulos', section: 'Fundo', label: 'Imagens dos módulos', type: 'images',
      hint: 'Uma imagem por módulo, revelada com a rolagem. Enviar uma imagem liga o fundo "Imagem por módulo".',
      slots: boardModules.map((m, i) => ({ label: `Módulo ${i + 1}`, title: m.title, fallback: m.background })) },
  ],
  atividade: [
    // Estado da trilha (25/11/2026): os mesmos estados do Curso. "Todas liberadas" substitui o antigo switch "Desbloquear todas".
    { id: 'estado', section: 'Trilha', label: 'Estado da trilha', hint: 'Não iniciado: só a 1ª atividade do módulo 1 liberada. Em andamento: até a 5ª atividade do módulo 1. Concluído: todas liberadas. Todas liberadas: todas abertas, com a lista de mecânicas', type: 'choice', default: 'nao-iniciado',
      options: [...courseStates, { value: 'liberado', label: 'Todas liberadas' }] },
    { id: 'tipografia', section: 'Layout', label: 'Tipografia', hint: 'LP 4.0: tamanhos de fonte, alturas de linha e espaçamentos dos estilos do design system LP 4.0 no Figma', type: 'choice', options: [...versions, { value: 'c', label: 'LP 4.0' }], default: 'a' },
    { id: 'apoio', section: 'Ordenadinho', label: 'Imagem de apoio', type: 'switch', default: true },
  ],
  regulamento: [
    { id: 'unico', section: 'Regulamentos', label: 'Regulamento único', hint: 'Um só regulamento abre direto na tela', type: 'switch' },
  ],
};
