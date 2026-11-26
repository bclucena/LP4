/* Passagem entre telas sem o esqueleto: quem sai com animação própria (o Tabuleiro, com fade out, ao abrir uma atividade) pede
   que a próxima tela já entre pronta, porque o fade in da tela seguinte faz o papel do carregamento. Vale uma vez. */
let skip = false;

/** Pede que a próxima troca de tela não mostre o esqueleto. */
export const skipNextSkeleton = () => { skip = true; };

/** Lê e consome o pedido (app.js, na troca de tela). */
export const takeSkipSkeleton = () => {
  const s = skip;
  skip = false;
  return s;
};

/** Saída animada para outra tela (Curso e Tabuleiro → apresentação da atividade): a tela atual some em LEAVE_MS (classe
    is-route-leaving, css/shell.css) e só então o endereço muda; a próxima tela entra pronta, sem o esqueleto. Com movimento
    reduzido, vai direto. `ctx` é o da tela que sai (evita dois cliques seguidos). */
export const LEAVE_MS = 320;

export function leaveTo(ctx, href) {
  const screen = ctx.root.firstElementChild;
  if (!screen || matchMedia('(prefers-reduced-motion: reduce)').matches) { location.hash = href; return; }
  if (ctx.leaving) return;
  ctx.leaving = true;
  screen.classList.add('is-route-leaving');
  setTimeout(() => { skipNextSkeleton(); location.hash = href; }, LEAVE_MS);
}
