// Largura da janela. As telas trocam de estrutura (tabela x cards, drawer x sheet) nestes cortes do handoff:
//   768 tablet, 1024 tabela de Gestores, 1180 menu lateral (lg), 1366, 1440 e 2560.

/** true quando a janela tem pelo menos `px` de largura. */
export const minWidth = px => window.matchMedia(`(min-width: ${px}px)`).matches;

/** Chama `callback` quando a janela cruza qualquer um dos cortes. Devolve a função que cancela. */
export function watchBreakpoints(breakpoints, callback) {
  const queries = breakpoints.map(px => window.matchMedia(`(min-width: ${px}px)`));
  queries.forEach(q => q.addEventListener('change', callback));
  return () => queries.forEach(q => q.removeEventListener('change', callback));
}

/** Quem pede menos movimento no sistema não vê as animações de entrada (a menos que a página abra com ?motion=on). */
export const reducedMotion = () => {
  const force = new URLSearchParams(location.search).get('motion') === 'on';
  return !force && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
