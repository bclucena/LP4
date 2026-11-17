// Sons de feedback (fluxo ludos-pro-fluxo, Atividades): tons curtos gerados com Web Audio, sem arquivos de áudio.
//
//   sfx('correct')                          → som pronto (click, correct, wrong, flip, pair, tick, victory)
//   tone([[523, 0, 0.08, 0.14]], 'sine')    → tom próprio: [frequência Hz, início s, duração s, volume 0–1]
//
// A escolha de ligar ou desligar fica no navegador (localStorage, chave `lp-sound`); o padrão é ligado, como no protótipo.
// No produto, os mesmos tons podem virar um serviço (SoundService) e a preferência, uma configuração do usuário.

const KEY = 'lp-sound';
let actx = null;

export function soundOn() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSound(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // sem armazenamento (aba privada): a escolha vale só até recarregar
  }
}

/** Toca uma sequência de tons. Não faz nada com o som desligado ou sem Web Audio. */
export function tone(seq, type = 'sine') {
  if (!soundOn()) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const now = actx.currentTime;
    for (const [f, t, d, v] of seq) {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, now + t);
      g.gain.setValueAtTime(v, now + t);
      g.gain.linearRampToValueAtTime(0.001, now + t + d);
      o.connect(g);
      g.connect(actx.destination);
      o.start(now + t);
      o.stop(now + t + d);
    }
  } catch {
    // navegador sem Web Audio: segue sem som
  }
}

const SOUNDS = {
  click: () => tone([[600, 0, 0.05, 0.12]], 'sine'),
  correct: () => tone([523, 659, 784, 1046].map((f, i) => [f, i * 0.08, 0.15, 0.18]), 'triangle'),
  wrong: () => tone([[160, 0, 0.12, 0.2], [110, 0.12, 0.18, 0.2]], 'sawtooth'),
  flip: () => tone([[420, 0, 0.06, 0.1], [640, 0.04, 0.07, 0.08]], 'sine'),
  pair: () => tone([[659, 0, 0.1, 0.16], [988, 0.09, 0.18, 0.16]], 'triangle'),
  tick: () => tone([[800, 0, 0.03, 0.05]], 'square'),
  victory: () => tone([440, 554, 659, 880, 659, 880].map((f, i) => [f, [0, 0.12, 0.24, 0.36, 0.52, 0.68][i], 0.25, 0.2]), 'triangle'),
};

/** Som pronto pelo nome. */
export const sfx = name => SOUNDS[name]?.();

/* Tons próprios das mecânicas (mesmas notas do protótipo). */
export const tones = {
  /** Clique curto ao passar por um encaixe durante o arrasto. */
  hover: () => tone([[700, 0, 0.025, 0.04]], 'sine'),
  /** Peça devolvida ao banco. */
  toBank: () => tone([[392, 0, 0.08, 0.1]], 'sine'),
  /** Peça colocada num lugar (No lugar). */
  placed: () => tone([[523, 0, 0.07, 0.12], [784, 0.06, 0.09, 0.1]], 'sine'),
  /** Item colocado na posição `i` da resposta (Ordenadinho): sobe a cada posição. */
  orderAt: i => tone([[440 + i * 70, 0, 0.07, 0.12], [660 + i * 70, 0.06, 0.09, 0.1]], 'sine'),
  /** Peça encaixada (quebra-cabeça): sobe a cada peça certa. */
  piece: n => tone([[523 + n * 25, 0, 0.06, 0.14], [784 + n * 25, 0.05, 0.1, 0.12]], 'triangle'),
  /** Diferença encontrada (7 erros): sobe a cada achado. */
  found: n => tone([[587 + n * 40, 0, 0.07, 0.15], [880 + n * 40, 0.06, 0.12, 0.13]], 'triangle'),
  /** Letra do caminho (Misturadinho): a nota sobe a cada passo. */
  note: n => tone([[330 * Math.pow(1.0595, n * 2), 0, 0.09, 0.12]], 'sine'),
  /** Enquete enviada. */
  vote: () => tone([[523, 0, 0.08, 0.14], [659, 0.08, 0.08, 0.14], [784, 0.16, 0.16, 0.14]], 'triangle'),
  /** Resposta aberta enviada. */
  sent: () => tone([[523, 0, 0.08, 0.14], [659, 0.08, 0.08, 0.14], [988, 0.16, 0.2, 0.14]], 'triangle'),
};
