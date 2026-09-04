import { FrameMark, FrameScore } from './types';

/** Round and clamp a raw pin count to 0..10. */
export function clampPins(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n)));
}

export interface RollScore {
  frames: FrameScore[];
  total: number;
  complete: boolean;
}

/**
 * Ten-pin scoring over an ordered list of deliveries. A strike in frames 1-9 is
 * a single entry of 10. Frame 10 holds 2 or 3 entries. The list may be short
 * (game in progress): frames without a settled score have `points` undefined.
 */
export function scoreRolls(rolls: readonly number[]): RollScore {
  const frames: FrameScore[] = [];
  let i = 0;
  let running = 0;
  let chainAlive = true;

  const settle = (fs: FrameScore, points: number): void => {
    if (chainAlive) {
      running += points;
      fs.points = points;
      fs.cumulative = running;
    } else {
      chainAlive = false;
    }
  };

  for (let f = 1; f <= 10; f++) {
    if (i >= rolls.length) {
      frames.push({ index: f, rolls: [], mark: 'pending' });
      chainAlive = false;
      continue;
    }

    if (f < 10) {
      const a = rolls[i];

      if (a === 10) {
        const b1 = rolls[i + 1];
        const b2 = rolls[i + 2];
        const fs: FrameScore = { index: f, rolls: [10], mark: 'strike' };
        if (b1 !== undefined && b2 !== undefined) {
          settle(fs, 10 + b1 + b2);
        } else {
          chainAlive = false;
        }
        frames.push(fs);
        i += 1;
        continue;
      }

      const b = rolls[i + 1];
      if (b === undefined) {
        frames.push({ index: f, rolls: [a], mark: 'pending' });
        chainAlive = false;
        i += 1;
        continue;
      }

      if (a + b === 10) {
        const bonus = rolls[i + 2];
        const fs: FrameScore = { index: f, rolls: [a, b], mark: 'spare' };
        if (bonus !== undefined) {
          settle(fs, 10 + bonus);
        } else {
          chainAlive = false;
        }
        frames.push(fs);
      } else {
        const fs: FrameScore = { index: f, rolls: [a, b], mark: 'open' };
        settle(fs, a + b);
        frames.push(fs);
      }
      i += 2;
      continue;
    }

    // Frame 10
    const a = rolls[i];
    const b = rolls[i + 1];
    const c = rolls[i + 2];

    if (b === undefined) {
      frames.push({ index: 10, rolls: [a], mark: 'pending' });
      chainAlive = false;
      break;
    }

    const isStrike = a === 10;
    const isSpare = !isStrike && a + b === 10;
    const needsThird = isStrike || isSpare;

    if (needsThird && c === undefined) {
      frames.push({ index: 10, rolls: [a, b], mark: isStrike ? 'strike' : 'spare' });
      chainAlive = false;
      break;
    }

    const usedRolls = needsThird ? [a, b, c] : [a, b];
    const mark: FrameMark = isStrike ? 'strike' : isSpare ? 'spare' : 'open';
    const fs: FrameScore = { index: 10, rolls: usedRolls, mark };
    settle(fs, a + b + (needsThird ? c : 0));
    frames.push(fs);
  }

  while (frames.length < 10) {
    frames.push({ index: frames.length + 1, rolls: [], mark: 'pending' });
  }

  const total = frames.reduce((acc, fr) => (fr.cumulative ?? acc), 0);
  const complete = frames[9].cumulative !== undefined;
  return { frames, total, complete };
}

/**
 * Best reachable final score from the current deliveries: every remaining ball
 * assumed to knock down the maximum (strike, or spare on a second ball).
 */
export function maxPossibleFromRolls(rolls: readonly number[]): number {
  return scoreRolls(fillWithMax([...rolls])).total;
}

function fillWithMax(r: number[]): number[] {
  let i = 0;
  for (let f = 1; f <= 10; f++) {
    if (f < 10) {
      if (i >= r.length) {
        r.push(10);
        i += 1;
        continue;
      }
      if (r[i] === 10) {
        i += 1;
        continue;
      }
      if (i + 1 >= r.length) {
        r.push(10 - r[i]);
      }
      i += 2;
      continue;
    }

    if (i >= r.length) {
      r.push(10);
    }
    const a = r[i];
    if (i + 1 >= r.length) {
      r.push(a === 10 ? 10 : 10 - a);
    }
    const b = r[i + 1];
    if ((a === 10 || a + b === 10) && i + 2 >= r.length) {
      r.push(10);
    }
    i = r.length;
  }
  return r;
}
