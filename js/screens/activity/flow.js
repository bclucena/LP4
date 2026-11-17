/* Fluxo da trilha de atividades: status, concluir, avançar, efeitos de uma renderização e helpers de estado. */

import { activities } from '../../data/activity.js';
import { sfx } from '../../core/sound.js';
import { gainIn, gainOut } from './gain.js';

export const ORDER = activities.map(a => a.id);
export const actById = id => activities.find(a => a.id === id);
export const actIndex = id => ORDER.indexOf(id);

/** Status inicial: só a primeira atividade disponível ("current"), as demais bloqueadas. */
export const initialStatus = () => Object.fromEntries(ORDER.map((id, i) => [id, i === 0 ? 'current' : 'locked']));

/** Status mostrado e usado para abrir: com o tweak "desbloquear" (state.tw.unlock) as bloqueadas viram disponíveis. */
export const statusOf = (state, id) => (state.status[id] === 'locked' && state.tw?.unlock ? 'available' : state.status[id]);

/** Atualiza a fatia de estado de uma mecânica: upd(ctx, 'mem', { open: [] }) ou upd(ctx, 'mem', m => ({ ... })). */
export function upd(ctx, key, patch, extra = {}) {
  ctx.set(s => ({ ...extra, [key]: { ...s[key], ...(typeof patch === 'function' ? patch(s[key], s) : patch) } }));
}

/** Sequência de acertos (pill com a chama na barra de desempenho): acerto soma 1, erro zera. Devolve o campo para juntar ao
    ctx.set/upd que a mecânica já faz no acerto ou no erro (assim não há uma renderização a mais). */
export const streakOn = (ctx, ok) => ({ streak: ok ? (ctx.state.streak ?? 0) + 1 : 0 });

/** setTimeout que não roda depois que a tela foi desmontada. */
export const later = (ctx, ms, fn) => setTimeout(() => { if (!ctx.destroyed) fn(); }, ms);

/** Efeito que vale só para a próxima renderização (anima a resposta sem repetir a cada re-render). */
export const fx = (state, key) => !!state.fx?.[key];

/** Próxima atividade depois de `id` que já pode ser aberta (não bloqueada). */
export function nextOpen(state, id = state.view) {
  return ORDER.slice(actIndex(id) + 1).find(k => statusOf(state, k) !== 'locked');
}

/**
 * Conclui a atividade `id`: marca como feita, libera a próxima, soma pontos e moedas e mostra o ganho na barra.
 * `gain` é o que aparece na pílula "+ pts" (no quiz os pontos já entraram a cada resposta, então addXp = 0).
 */
export function finish(ctx, id, { xp = 0, coins = 0, addXp = xp, addCoins = coins } = {}, extra = {}) {
  sfx('victory');
  const status = { ...ctx.state.status, [id]: 'done' };
  // A próxima é a seguinte na trilha (ou, se todas depois dela estiverem feitas, a primeira que faltar).
  const next = ORDER.slice(actIndex(id) + 1).find(k => status[k] !== 'done') ?? ORDER.find(k => status[k] !== 'done');
  for (const k of ORDER) if (status[k] === 'current' && k !== next) status[k] = 'available';
  if (next) status[next] = 'current';
  // gainFrom: o número que a pílula de pontos mostra enquanto o "+ pts" está na tela (total novo menos o ganho); na saída ele
  // gira até o total (js/screens/activity/gain.js).
  const to = ctx.state.xp + addXp;
  ctx.set(s => ({ ...extra, status, justDone: id, xp: to, coins: s.coins + addCoins, gain: xp || null, gainFrom: xp ? to - xp : null, fx: { ...s.fx, ...extra.fx, gain: !!xp } }));
  if (xp) {
    clearTimeout(ctx.gainTimer);
    gainIn(ctx.root);
    // Sai sem refazer a tela (um re-render repetiria as animações de entrada da mecânica).
    ctx.gainTimer = gainOut(ctx, { from: to - xp, to, done: () => { ctx.state.gain = null; ctx.state.gainFrom = null; } });
  }
}

/** Rodapé padrão: "Continuar" para a próxima atividade, liberado quando a atual está concluída. */
export function defaultFooter(state) {
  const done = state.status[state.view] === 'done';
  const after = nextOpen(state);
  return { label: 'Continuar', action: 'goNext', disabled: !done || !after };
}

/** Embaralha (Fisher-Yates) uma cópia da lista. */
export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 0:00 */
export const clock = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
/** 00:00 */
export const clock2 = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

/** Plural simples: plural(3, 'jogada', 'jogadas') → "3 jogadas". */
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Mensagem curta de retorno (pílula). tone: 'idle' | 'ok' | 'bad' | 'warn'. */
export const toast = (text, tone = 'idle', anim = false) =>
  `<span class="c-act-toast c-act-toast--${tone}${anim ? ' is-in' : ''}">${text}</span>`;
