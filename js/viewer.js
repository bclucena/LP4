/* Visualizador de telas: o mockup (app.html) em um iframe do tamanho escolhido, reduzido para caber na janela.
   Parâmetros do endereço: tela (id da página), w (largura; "fit" usa a janela toda), slow (câmera lenta). */

const sizes = [
  { w: 360, h: 800 },
  { w: 768, h: 1024 },
  { w: 1179, h: 768 },
  { w: 1180, h: 768 },
  { w: 1366, h: 768 },
  { w: 1440, h: 900 },
  { w: 2560, h: 1440 },
];

const pages = [
  ['home', 'Home'], ['time', 'Meu time'], ['cursos', 'Cursos'], ['biblioteca', 'Biblioteca'], ['missoes', 'Missões'],
  ['ranking', 'Rankings'], ['conquistas', 'Conquistas'], ['certificados', 'Certificados'], ['loja', 'Loja'], ['feed', 'Feed'],
  ['eventos', 'Eventos'], ['faq', 'Perguntas frequentes'], ['regulamento', 'Regulamentos'], ['extrato', 'Extrato'],
  ['instalar-pwa', 'Instalar no iPhone'], ['curso', 'Curso'], ['tabuleiro', 'Tabuleiro'], ['atividade', 'Atividades'],
];

const q = new URLSearchParams(location.search);
const state = { tela: q.get('tela') || 'cursos', w: q.get('w') || '1440', slow: q.get('slow') === '1', run: 0 };

const $ = id => document.getElementById(id);
const frame = $('frame');
const stage = $('stage');

$('tela').innerHTML = pages.map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
$('sizes').innerHTML = [...sizes.map(s => `<button type="button" data-w="${s.w}">${s.w}</button>`), '<button type="button" data-w="fit">Ajustar</button>'].join('');

/** Escolhe o tamanho: a largura é fixa e a altura vem do quadro; em "Ajustar" o iframe ocupa a janela. */
function size() {
  // 32 de padding do palco mais 2 da borda do quadro, para não criar barra de rolagem no palco
  const room = { w: stage.clientWidth - 34, h: stage.clientHeight - 34 };
  if (state.w === 'fit') return { w: room.w, h: room.h, scale: 1 };
  const base = sizes.find(s => String(s.w) === state.w) ?? sizes[5];
  const scale = Math.min(1, room.w / base.w);
  // a altura do quadro ocupa o espaço que sobra, para a página rolar dentro dele como numa janela real
  return { w: base.w, h: Math.max(base.h, Math.round(room.h / scale)), scale };
}

function apply() {
  const { w, h, scale } = size();
  frame.style.width = `${w}px`;
  frame.style.height = `${h}px`;
  frame.style.transform = `scale(${scale})`;
  frame.parentElement.style.setProperty('--vw', `${Math.floor(w * scale)}px`);
  frame.parentElement.style.setProperty('--vh', `${Math.floor(h * scale)}px`);
  $('info').textContent = `${w} × ${h}${scale < 1 ? ` · ${Math.round(scale * 100)}%` : ''}`;
  $('sizes').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.w === state.w)));
}

function load(reload) {
  // run muda a cada recarga para o app repetir a sequência de primeiro carregamento
  if (reload) state.run += 1;
  frame.src = `app.html?run=${state.run}&motion=on${state.slow ? '&slow=5' : ''}#${state.tela}`;
}

function sync() {
  const p = new URLSearchParams({ tela: state.tela, w: state.w });
  if (state.slow) p.set('slow', '1');
  history.replaceState(null, '', `?${p}`);
}

// "tela" pode trazer tweaks (curso?estado=concluido, vindo do painel Tweaks): a lista mostra só a página.
$('tela').value = state.tela.split('?')[0];
$('slow').checked = state.slow;
$('sizes').addEventListener('click', e => {
  const b = e.target.closest('button[data-w]');
  if (!b) return;
  state.w = b.dataset.w;
  apply();
  sync();
});
$('tela').addEventListener('change', e => { state.tela = e.target.value; sync(); load(false); });
$('slow').addEventListener('change', e => { state.slow = e.target.checked; sync(); load(true); });
$('reload').addEventListener('click', () => load(true));
window.addEventListener('resize', apply);

apply();
load(false);
