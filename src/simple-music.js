const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

// Compare adjacent evaluations from the mover's perspective. This is an
// evaluation swing, not a best-move search or a claim of exact points lost.
export function moveEvaluationLoss(before, after, color) {
  if (![before?.blackWinrate, after?.blackWinrate].every(Number.isFinite) || !["B", "W"].includes(color)) return null;
  const sign = color === "B" ? 1 : -1;
  const winrateLoss = Math.max(0, sign * (before.blackWinrate - after.blackWinrate));
  const scoreLoss = [before.blackScoreLead, after.blackScoreLead].every(Number.isFinite)
    ? Math.max(0, sign * (before.blackScoreLead - after.blackScoreLead)) : null;
  const strength = Math.max(clamp((winrateLoss - 0.05) / 0.25, 0, 1), scoreLoss === null ? 0 : clamp((scoreLoss - 1.5) / 6.5, 0, 1));
  return { winrateLoss, scoreLoss, strength, dramatic: winrateLoss > 0.45 + 1e-9 };
}

export function createSimpleRhythm() {
  return { target: null, debt: 0, previousRatio: 1 };
}

export function shapeSimpleTiming({ target, requested = target, phrase, notes, stagger, loss, pass = false, legato = false }, state) {
  if (state.target !== target) Object.assign(state, { target, debt: 0, previousRatio: 1 });
  const melodic = notes.filter(note => Number.isFinite(note.midi));
  const density = Math.min(0.08, Math.max(0, melodic.length - 1) * 0.025);
  const slowAttack = melodic.some(note => note.instrument === "cello") ? 0.035 : 0;
  const cadence = phrase.cadence ? phrase.phraseCadence ? 0.09 : phrase.barCadence ? 0.045 : 0.02 : 0;
  const quietFlow = !phrase.cadence && melodic.length <= 1 && !pass ? 0.035 : 0;
  const desired = 1 + (requested / target - 1) * 0.35 + density + slowAttack + cadence
    + (legato ? 0.015 : 0) + (pass ? 0.04 : 0) + (loss?.strength || 0) * 0.1 - quietFlow;
  // Pay back expressive holds gradually; never rush the following move to
  // recover a pause. The speed slider remains the long-term timing target.
  const corrected = clamp(desired - state.debt / (target * 6), 0.84, 1.2);
  const ratio = clamp(state.previousRatio * 0.45 + corrected * 0.55, state.previousRatio - 0.1, state.previousRatio + 0.1);
  const pace = target * ratio;
  const pause = loss?.dramatic ? 0.1 : 0;
  state.debt += pace + pause - target;
  state.previousRatio = ratio;
  const lastOnset = Math.max(0, ...notes.map((note, index) => index * stagger + (note.delay || 0)));
  return { pace, pause, delayScale: lastOnset ? Math.min(1, pace * 0.45 / lastOnset) : 1 };
}
