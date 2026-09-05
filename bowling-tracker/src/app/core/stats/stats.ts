import { Game } from '../../models';
import { isSplit, scoreGame } from '../scoring';

export interface Summary {
  games: number;
  sessions: number;
  average: number | null;
  best: number | null;
  worst: number | null;
}

export interface FrameStats {
  /** Completed frame/throw games considered. */
  games: number;
  framesCounted: number;
  strikePct: number | null;
  sparePct: number | null;
  /** Spare conversion when exactly one pin was left (the corner-pin spare). */
  singlePinSparePct: number | null;
  openPct: number | null;
  markPct: number | null;
  firstBallAverage: number | null;
  /** % of non-strike first balls that leave a split (throw detail only). */
  splitPct: number | null;
  /** % of splits converted to a spare (throw detail only). */
  splitConversionPct: number | null;
  /** Average open frames per game. */
  openPerGame: number | null;
  /** Longest run of consecutive strike frames within a single game. */
  bestStrikeStreak: number | null;
  cleanGames: number;
  perfectGames: number;
}

export interface Trend {
  /** How many games each side of the comparison uses. */
  window: number;
  /** Average of the most recent `window` games. */
  recentAvg: number;
  /** Average of the `window` games before those. */
  priorAvg: number;
  /** `recentAvg - priorAvg`, positive = improving. */
  delta: number;
}

export interface StatsResult {
  summary: Summary;
  frames: FrameStats;
  /** Chronological scores of completed games. */
  evolution: number[];
  /** Recent form vs the previous block. `null` until there are `2 * window` games. */
  trend: Trend | null;
  /** Best sum of 3 consecutive games within one session. `null` if no session has 3+. */
  highSeries3: number | null;
}

interface ScoredGame {
  game: Game;
  total: number;
  complete: boolean;
}

/** A game whose score is final (worth counting). */
function finalScore(game: Game): ScoredGame | null {
  const s = scoreGame(game);
  if (game.detailLevel === 'total') {
    return game.totalPins === undefined ? null : { game, total: s.total, complete: true };
  }
  return s.complete ? { game, total: s.total, complete: true } : null;
}

export function computeStats(games: Game[], opts: { minSample?: number } = {}): StatsResult {
  const minSample = opts.minSample ?? 3;

  const scored = games
    .map(finalScore)
    .filter((x): x is ScoredGame => x !== null)
    .sort((a, b) => (a.game.startedAt ?? a.game.createdAt).localeCompare(b.game.startedAt ?? b.game.createdAt));

  const totals = scored.map((x) => x.total);
  const sessions = new Set(scored.map((x) => x.game.sessionId)).size;

  const summary: Summary = {
    games: scored.length,
    sessions,
    average: totals.length ? round(mean(totals)) : null,
    best: totals.length ? Math.max(...totals) : null,
    worst: totals.length ? Math.min(...totals) : null,
  };

  // Frame-level: completed frame/throw games only.
  const frameGames = scored.filter((x) => x.game.detailLevel !== 'total');
  let strikes = 0;
  let spares = 0;
  let opens = 0;
  let framesCounted = 0;
  let firstBallSum = 0;
  let firstBallCount = 0;
  let cleanGames = 0;
  let singlePinAttempts = 0;
  let singlePinConverted = 0;
  let bestStrikeStreak = 0;
  let firstBallsWithPins = 0;
  let splitsLeft = 0;
  let splitsConverted = 0;

  for (const { game } of frameGames) {
    const frames = scoreGame(game).frames;
    let anyOpen = false;
    let streak = 0;
    for (const f of frames) {
      if (f.mark === 'pending') {
        streak = 0;
        continue;
      }
      framesCounted++;
      if (f.mark === 'strike') {
        strikes++;
        streak++;
        bestStrikeStreak = Math.max(bestStrikeStreak, streak);
      } else {
        streak = 0;
        if (f.mark === 'spare') spares++;
        else {
          opens++;
          anyOpen = true;
        }
        // Corner-pin spare: first ball left exactly one pin (frames 1-9).
        if (f.index < 10 && f.rolls.length > 0 && f.rolls[0] === 9) {
          singlePinAttempts++;
          if (f.mark === 'spare') singlePinConverted++;
        }
      }
      if (f.rolls.length > 0) {
        firstBallSum += f.rolls[0];
        firstBallCount++;
      }
    }
    if (!anyOpen) cleanGames++;

    // Splits need the exact pins standing after ball 1 — throw detail only.
    if (game.detailLevel === 'throw') {
      for (const fr of game.frames ?? []) {
        if (fr.index >= 10) continue;
        const t1 = fr.throws?.find((x) => x.index === 1);
        const t2 = fr.throws?.find((x) => x.index === 2);
        if (!t1 || t1.pinsStanding === undefined || t1.pinsKnocked === 10) continue;
        firstBallsWithPins++;
        if (isSplit(t1.pinsStanding)) {
          splitsLeft++;
          if (t2 && t1.pinsKnocked + t2.pinsKnocked === 10) splitsConverted++;
        }
      }
    }
  }

  const perfectGames = scored.filter((x) => x.total === 300).length;
  const enough = frameGames.length >= minSample;

  const trend = computeTrend(totals, 5);
  const highSeries3 = bestSeries(scored, 3);

  const frames: FrameStats = {
    games: frameGames.length,
    framesCounted,
    strikePct: enough && framesCounted ? round((strikes / framesCounted) * 100) : null,
    sparePct: enough && framesCounted - strikes > 0 ? round((spares / (framesCounted - strikes)) * 100) : null,
    singlePinSparePct: enough && singlePinAttempts >= 3 ? round((singlePinConverted / singlePinAttempts) * 100) : null,
    openPct: enough && framesCounted ? round((opens / framesCounted) * 100) : null,
    markPct: enough && framesCounted ? round(((strikes + spares) / framesCounted) * 100) : null,
    firstBallAverage: enough && firstBallCount ? round(firstBallSum / firstBallCount, 1) : null,
    splitPct: enough && firstBallsWithPins >= 10 ? round((splitsLeft / firstBallsWithPins) * 100, 1) : null,
    splitConversionPct: enough && splitsLeft >= 3 ? round((splitsConverted / splitsLeft) * 100) : null,
    openPerGame: enough && frameGames.length ? round(opens / frameGames.length, 1) : null,
    bestStrikeStreak: frameGames.length ? bestStrikeStreak : null,
    cleanGames,
    perfectGames,
  };

  return { summary, frames, evolution: totals, trend, highSeries3 };
}

/** Highest sum of `n` consecutive games within a single session. */
function bestSeries(scored: ScoredGame[], n: number): number | null {
  const bySession = new Map<string, ScoredGame[]>();
  for (const s of scored) {
    const arr = bySession.get(s.game.sessionId) ?? [];
    arr.push(s);
    bySession.set(s.game.sessionId, arr);
  }
  let best: number | null = null;
  for (const arr of bySession.values()) {
    if (arr.length < n) continue;
    arr.sort((a, b) => a.game.index - b.game.index);
    for (let i = 0; i + n <= arr.length; i++) {
      const sum = arr.slice(i, i + n).reduce((acc, g) => acc + g.total, 0);
      best = best === null ? sum : Math.max(best, sum);
    }
  }
  return best;
}

/** Compares the last `window` scores against the `window` before them. */
function computeTrend(totals: number[], window: number): Trend | null {
  if (totals.length < window * 2) return null;
  const recent = totals.slice(-window);
  const prior = totals.slice(-window * 2, -window);
  const recentAvg = round(mean(recent));
  const priorAvg = round(mean(prior));
  return { window, recentAvg, priorAvg, delta: recentAvg - priorAvg };
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function round(n: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
