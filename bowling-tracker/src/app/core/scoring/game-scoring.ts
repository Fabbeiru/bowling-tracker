import { Frame, Game } from '../../models';
import { clampPins, maxPossibleFromRolls, scoreRolls } from './roll-scoring';
import { GameScore } from './types';

/** Ordered list of effective deliveries for a game (fouls counted as 0). */
export function gameToRolls(game: Pick<Game, 'frames'>): number[] {
  const frames = [...(game.frames ?? [])].sort((a, b) => a.index - b.index);
  const rolls: number[] = [];

  for (const fr of frames) {
    const isTenth = fr.index === 10;
    const pins = framePins(fr);

    if (!isTenth && pins.length > 0 && pins[0] === 10) {
      rolls.push(10);
    } else {
      rolls.push(...pins);
    }
  }

  return rolls;
}

/** Effective deliveries of a single frame, from either detail level (fouls 0). */
export function framePins(fr: Frame): number[] {
  if (fr.throws && fr.throws.length > 0) {
    return [...fr.throws]
      .sort((a, b) => a.index - b.index)
      .map((t) => (t.foul ? 0 : clampPins(t.pinsKnocked)));
  }
  const values = fr.index === 10 ? [fr.first, fr.second, fr.third] : [fr.first, fr.second];
  return values.filter((v): v is number => v !== undefined).map(clampPins);
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(300, Math.round(n)));
}

/** Full score of a game: per-frame cumulative, total, completeness, ceiling. */
export function scoreGame(game: Game): GameScore {
  if (game.detailLevel === 'total') {
    const total = clampScore(game.totalPins ?? 0);
    return {
      frames: [],
      total,
      complete: game.totalPins !== undefined,
      maxPossible: total,
    };
  }

  const rolls = gameToRolls(game);
  const { frames, total, complete } = scoreRolls(rolls);
  return {
    frames,
    total,
    complete,
    maxPossible: maxPossibleFromRolls(rolls),
  };
}
