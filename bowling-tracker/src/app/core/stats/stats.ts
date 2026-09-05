import { Game } from '../../models';
import { scoreGame } from '../scoring';

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
  openPct: number | null;
  markPct: number | null;
  firstBallAverage: number | null;
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
  const minSample = opts.minSample ?? 5;

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

  for (const { game } of frameGames) {
    const frames = scoreGame(game).frames;
    let anyOpen = false;
    for (const f of frames) {
      if (f.mark === 'pending') continue;
      framesCounted++;
      if (f.mark === 'strike') strikes++;
      else if (f.mark === 'spare') spares++;
      else {
        opens++;
        anyOpen = true;
      }
      if (f.rolls.length > 0) {
        firstBallSum += f.rolls[0];
        firstBallCount++;
      }
    }
    if (!anyOpen) cleanGames++;
  }

  const perfectGames = scored.filter((x) => x.total === 300).length;
  const enough = frameGames.length >= minSample;

  const trend = computeTrend(totals, 5);

  const frames: FrameStats = {
    games: frameGames.length,
    framesCounted,
    strikePct: enough && framesCounted ? round((strikes / framesCounted) * 100) : null,
    sparePct: enough && framesCounted - strikes > 0 ? round((spares / (framesCounted - strikes)) * 100) : null,
    openPct: enough && framesCounted ? round((opens / framesCounted) * 100) : null,
    markPct: enough && framesCounted ? round(((strikes + spares) / framesCounted) * 100) : null,
    firstBallAverage: enough && firstBallCount ? round(firstBallSum / firstBallCount, 1) : null,
    cleanGames,
    perfectGames,
  };

  return { summary, frames, evolution: totals, trend };
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
