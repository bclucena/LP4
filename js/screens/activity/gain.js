/* Pílula "+ pts" da barra de desempenho: entra abrindo espaço (os outros indicadores deslizam para a esquerda), fica 2000ms e
   sai fechando o espaço (eles voltam para a direita). Na saída, o número da pílula de pontos gira até o total novo (anterior +
   ganho), dígito a dígito, como um contador. Sem animação quando o sistema pede movimento reduzido. */

const MOVE = 400; // abrir e fechar o espaço
const HOLD = 2000; // tempo da pílula na tela
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Quadros da pílula fechada × aberta. A margem negativa anula o gap de 8px da fila, então os vizinhos andam de forma contínua. */
const frames = el => {
  const w = el.getBoundingClientRect().width;
  return [
    { width: '0px', marginLeft: '-8px', paddingLeft: '0px', paddingRight: '0px', borderWidth: '0px', opacity: 0, transform: 'scale(0.6)' },
    { width: `${w}px`, marginLeft: '0px', opacity: 1, transform: 'scale(1)' },
  ];
};

/** Faz a pílula "+ pts" entrar. Chamar logo depois da renderização que a criou. */
export function gainIn(root) {
  const el = root.querySelector('.c-act-hud__gain');
  if (!el || reduced()) return;
  el.style.overflow = 'hidden';
  el.animate(frames(el), { duration: MOVE, easing: EASE }).finished.then(() => { el.style.overflow = ''; }, () => {});
}

/** Gira o número de `from` até `to`: cada dígito é uma coluna que rola do valor antigo ao novo (os que não mudam ficam parados). */
export function roll(el, from, to) {
  if (!el) return;
  const a = String(from);
  const b = String(to);
  if (reduced() || a === b) { el.textContent = b; return; }
  const pad = a.padStart(b.length, ' ');
  let changed = false;
  el.innerHTML = '';
  el.classList.add('c-act-odo');
  el.setAttribute('aria-label', b);
  [...b].forEach((d, i) => {
    const old = pad[i];
    // Depois do primeiro dígito que muda, todos os seguintes giram (como num contador).
    if (old !== d) changed = true;
    const col = document.createElement('span');
    col.className = 'c-act-odo__col';
    col.setAttribute('aria-hidden', 'true');
    if (!changed) { col.textContent = d; el.append(col); return; }
    const start = old === ' ' ? 0 : Number(old);
    // Rola para a frente do dígito antigo até o novo; se forem iguais (casa vizinha mudou), dá uma volta inteira.
    const steps = [start];
    let n = start;
    do { n = (n + 1) % 10; steps.push(n); } while (n !== Number(d));
    const reel = document.createElement('span');
    reel.className = 'c-act-odo__reel';
    reel.innerHTML = steps.map((n, k) => `<span>${k === 0 && old === ' ' ? '&nbsp;' : n}</span>`).join('');
    col.append(reel);
    el.append(col);
    reel.animate([{ transform: 'translateY(0)' }, { transform: `translateY(-${(steps.length - 1) / steps.length * 100}%)` }],
      { duration: 700 + i * 60, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
  });
  // No fim volta a ser texto simples (mais leve e fácil de ler pelo leitor de tela).
  setTimeout(() => { el.textContent = b; el.classList.remove('c-act-odo'); el.removeAttribute('aria-label'); }, 700 + b.length * 60 + 50);
}

/** Agenda a saída: depois de HOLD, fecha a pílula e gira os pontos. `done` limpa o estado. Devolve o timer. */
export function gainOut(ctx, { from, to, done }) {
  return setTimeout(() => {
    if (ctx.destroyed) return;
    roll(ctx.root.querySelector('[data-pts]'), from, to);
    const el = ctx.root.querySelector('.c-act-hud__gain');
    const end = () => { el?.remove(); done(); };
    if (!el || reduced()) return end();
    el.style.overflow = 'hidden';
    el.animate(frames(el).reverse(), { duration: MOVE, easing: EASE, fill: 'forwards' }).finished.then(end, end);
  }, MOVE + HOLD);
}
