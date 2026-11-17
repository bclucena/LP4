// Menu lateral que acompanha a rolagem nos dois sentidos (a partir de 1180):
// - ao descer, sobe junto com a página até a base dele encostar na base da tela; depois fica parado;
// - ao inverter para cima, começa a descer no primeiro movimento, até o topo dele encostar na app bar; depois fica parado.
// O wrapper é sticky logo abaixo da app bar, com a altura útil da tela, e o conteúdo é deslocado por `t`, que soma o delta
// da rolagem limitado entre 0 e (altura do menu - altura útil). Se o menu cabe na tela, `t` fica sempre em 0.

const TOPBAR = 64;

export function stickySide(wrap) {
  const inner = wrap.querySelector('.c-sticky-side__inner');
  if (!inner) return () => {};
  let t = 0;
  let last = window.scrollY;
  let raf = 0;
  const max = () => Math.max(0, inner.offsetHeight - (window.innerHeight - TOPBAR));
  const apply = () => {
    t = Math.min(Math.max(t, 0), max());
    inner.style.transform = `translateY(${-t}px)`;
  };
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const y = window.scrollY;
      t += y - last;
      last = y;
      if (y <= 0) t = 0;
      apply();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', apply);
  const observer = new ResizeObserver(apply);
  observer.observe(inner);
  apply();
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', apply);
    observer.disconnect();
  };
}
