import { Game } from '../../models';
import { ballComparisonRows, computeStats, sessionTotals, statsByBall } from './stats';

let seq = 0;
function totalGame(total: number, sessionId = 's'): Game {
  seq++;
  return {
    id: `g${seq}`,
    sessionId,
    index: 1,
    detailLevel: 'total',
    totalPins: total,
    startedAt: `2026-09-04T10:${String(seq).padStart(2, '0')}`,
    createdAt: 'x',
    updatedAt: 'x',
  };
}

function perfectFrameGame(sessionId = 's'): Game {
  seq++;
  return {
    id: `g${seq}`,
    sessionId,
    index: 1,
    detailLevel: 'frame',
    frames: Array.from({ length: 10 }, (_, i) => ({
      index: i + 1,
      first: 10,
      second: i === 9 ? 10 : undefined,
      third: i === 9 ? 10 : undefined,
    })),
    startedAt: `2026-09-04T11:${String(seq).padStart(2, '0')}`,
    createdAt: 'x',
    updatedAt: 'x',
  };
}

describe('computeStats — summary', () => {
  it('averages only games with a final score', () => {
    const games = [totalGame(150), totalGame(200), { ...totalGame(0), totalPins: undefined }];
    const { summary } = computeStats(games);
    expect(summary.games).toBe(2);
    expect(summary.average).toBe(175);
    expect(summary.best).toBe(200);
    expect(summary.worst).toBe(150);
  });

  it('counts distinct sessions', () => {
    const { summary } = computeStats([totalGame(100, 'a'), totalGame(120, 'a'), totalGame(90, 'b')]);
    expect(summary.sessions).toBe(2);
  });

  it('is empty with no games', () => {
    const { summary, evolution } = computeStats([]);
    expect(summary).toEqual({ games: 0, sessions: 0, average: null, best: null, worst: null });
    expect(evolution).toEqual([]);
  });
});

describe('sessionTotals', () => {
  it('sums the series and averages the completed games', () => {
    const t = sessionTotals([totalGame(180), totalGame(210), totalGame(150)]);
    expect(t.games).toBe(3);
    expect(t.startedGames).toBe(3);
    expect(t.completeGames).toBe(3);
    expect(t.series).toBe(540);
    expect(t.average).toBe(180);
    expect(t.allComplete).toBe(true);
  });

  it('ignores games not started and marks the session incomplete', () => {
    const notStarted = { ...totalGame(0), totalPins: undefined };
    const t = sessionTotals([totalGame(200), notStarted]);
    expect(t.startedGames).toBe(1);
    expect(t.completeGames).toBe(1);
    expect(t.series).toBe(200);
    expect(t.average).toBe(200);
    expect(t.allComplete).toBe(false);
  });

  it('is all zeros / null for an empty session', () => {
    expect(sessionTotals([])).toEqual({
      games: 0,
      startedGames: 0,
      completeGames: 0,
      series: 0,
      average: null,
      allComplete: false,
    });
  });
});

describe('computeStats — frame stats', () => {
  it('hides percentages below the minimum sample', () => {
    const { frames } = computeStats([perfectFrameGame(), perfectFrameGame()], { minSample: 5 });
    expect(frames.strikePct).toBeNull();
    expect(frames.perfectGames).toBe(2);
  });

  it('reports 100% strikes and clean games for perfect games', () => {
    const games = Array.from({ length: 5 }, () => perfectFrameGame());
    const { frames } = computeStats(games, { minSample: 3 });
    expect(frames.strikePct).toBe(100);
    expect(frames.openPct).toBe(0);
    expect(frames.markPct).toBe(100);
    expect(frames.cleanGames).toBe(5);
    expect(frames.perfectGames).toBe(5);
    expect(frames.firstBallAverage).toBe(10);
  });

  it('counts a 300 from a total-detail game', () => {
    const { frames, summary } = computeStats([totalGame(300), totalGame(300)]);
    expect(frames.perfectGames).toBe(2);
    expect(summary.best).toBe(300);
  });
});

describe('computeStats — evolution', () => {
  it('lists completed scores in chronological order', () => {
    const a = totalGame(120);
    const b = totalGame(180);
    const { evolution } = computeStats([b, a]);
    expect(evolution).toEqual([120, 180]);
  });
});

function frameGame(balls: number[][], sessionId = 's', index = 1): Game {
  seq++;
  return {
    id: `g${seq}`,
    sessionId,
    index,
    detailLevel: 'frame',
    frames: balls.map((f, i) => ({ index: i + 1, first: f[0], second: f[1], third: f[2] })),
    startedAt: `2026-09-04T12:${String(seq).padStart(2, '0')}`,
    createdAt: 'x',
    updatedAt: 'x',
  };
}

describe('computeStats — new frame metrics', () => {
  it('best strike streak counts consecutive strike frames', () => {
    // 4 strikes, then an open, then 2 strikes
    const g = frameGame([[10], [10], [10], [10], [4, 3], [10], [10], [3, 2], [1, 1], [2, 2, 0]]);
    const { frames } = computeStats([g, g, g], { minSample: 1 });
    expect(frames.bestStrikeStreak).toBe(4);
  });

  it('single-pin spare % = corner-pin conversions', () => {
    // f1: 9 then spare (converted). f2: 9 then miss (open). f3: 9 then spare.
    const g = frameGame([
      [9, 1], [9, 0], [9, 1],
      [5, 3], [5, 3], [5, 3], [5, 3], [5, 3], [5, 3], [5, 3, 0],
    ]);
    const { frames } = computeStats([g, g, g], { minSample: 1 });
    expect(frames.singlePinSparePct).toBe(67); // 6 of 9 converted
  });

  it('open frames per game', () => {
    const g = frameGame([
      [4, 3], [4, 3], [10], [10], [10], [10], [10], [10], [10], [10, 10, 10],
    ]);
    const { frames } = computeStats([g, g, g], { minSample: 1 });
    expect(frames.openPerGame).toBe(2);
  });
});

describe('computeStats — high series', () => {
  it('is null unless a session has 3+ games', () => {
    const games = [totalGame(150, 'a'), totalGame(160, 'a')];
    expect(computeStats(games).highSeries3).toBeNull();
  });

  it('is the best sum of 3 consecutive games in one session', () => {
    const games = [
      { ...totalGame(150, 'a'), index: 1 },
      { ...totalGame(180, 'a'), index: 2 },
      { ...totalGame(170, 'a'), index: 3 },
      { ...totalGame(200, 'a'), index: 4 },
    ] as Game[];
    // best window: games 2+3+4 = 550
    expect(computeStats(games).highSeries3).toBe(550);
  });
});

/** A frame-detail game where only frame 1 matters; frames 2-9 are untagged
 *  filler strikes (no ballId, so they never pollute a ball's stats). */
function taggedFrameGame(
  first: number,
  second: number | undefined,
  firstBallId?: string,
  secondBallId?: string,
  sessionId = 's',
): Game {
  seq++;
  return {
    id: `g${seq}`,
    sessionId,
    index: 1,
    detailLevel: 'frame',
    frames: [
      { index: 1, first, second, firstBallId, secondBallId },
      ...Array.from({ length: 8 }, (_, i) => ({ index: i + 2, first: 10 })),
      { index: 10, first: 10, second: 10, third: 10 },
    ],
    createdAt: 'x',
    updatedAt: 'x',
  };
}

describe('statsByBall', () => {
  it('computes the strike rate per ball from the first ball of each frame', () => {
    const strikes = Array.from({ length: 6 }, () => taggedFrameGame(10, undefined, 'A'));
    const opens = Array.from({ length: 4 }, () => taggedFrameGame(6, 3, 'A'));
    const stats = statsByBall([...strikes, ...opens]);
    expect(stats.get('A')).toMatchObject({ strikeAttempts: 10, strikes: 6, strikePct: 60 });
  });

  it('computes spare conversion per ball from the second ball, only on non-strike frames', () => {
    const converted = Array.from({ length: 7 }, () => taggedFrameGame(6, 4, 'X', 'B'));
    const missed = Array.from({ length: 3 }, () => taggedFrameGame(6, 2, 'X', 'B'));
    const stats = statsByBall([...converted, ...missed]);
    expect(stats.get('B')).toMatchObject({ spareAttempts: 10, sparesConverted: 7, sparePct: 70 });
  });

  it('hides the percentage below the minimum attempts (default 10)', () => {
    const games = Array.from({ length: 5 }, () => taggedFrameGame(10, undefined, 'C'));
    expect(statsByBall(games).get('C')).toMatchObject({ strikeAttempts: 5, strikes: 5, strikePct: null });
  });

  it('does not record a spare attempt when the first ball was a strike', () => {
    const games = Array.from({ length: 10 }, () => taggedFrameGame(10, undefined, 'A', 'A'));
    expect(statsByBall(games).get('A')?.spareAttempts).toBe(0);
  });

  it('ignores the tenth frame', () => {
    const g = taggedFrameGame(4, 3);
    g.frames![9] = { index: 10, first: 10, second: 10, third: 10, firstBallId: 'ghost' };
    expect(statsByBall([g]).has('ghost')).toBe(false);
  });

  it('ignores total-detail games', () => {
    expect(statsByBall([totalGame(200)]).size).toBe(0);
  });

  it('attributes by throw.ballId for throw-detail games', () => {
    seq++;
    const g: Game = {
      id: `g${seq}`,
      sessionId: 's',
      index: 1,
      detailLevel: 'throw',
      frames: [
        {
          index: 1,
          throws: [
            { index: 1, pinsKnocked: 7, ballId: 'D' },
            { index: 2, pinsKnocked: 3, ballId: 'E' },
          ],
        },
        ...Array.from({ length: 8 }, (_, i) => ({ index: i + 2, throws: [{ index: 1, pinsKnocked: 10 }] })),
        {
          index: 10,
          throws: [
            { index: 1, pinsKnocked: 10 },
            { index: 2, pinsKnocked: 10 },
            { index: 3, pinsKnocked: 10 },
          ],
        },
      ],
      createdAt: 'x',
      updatedAt: 'x',
    };
    const stats = statsByBall(Array.from({ length: 10 }, () => g));
    expect(stats.get('D')).toMatchObject({ strikeAttempts: 10 });
    expect(stats.get('E')).toMatchObject({ spareAttempts: 10, sparesConverted: 10 });
  });
});

describe('ballComparisonRows', () => {
  const names = new Map([
    ['A', 'Bola A'],
    ['B', 'Bola de spare'],
  ]);

  it('gives an average to a ball used as primary in 3+ finished games', () => {
    const games = Array.from({ length: 3 }, () => ({ ...totalGame(200), primaryBallId: 'A' }));
    const rows = ballComparisonRows(games, names);
    expect(rows).toEqual([expect.objectContaining({ id: 'A', average: 200, games: 3 })]);
  });

  it('includes a spare-only ball that was never primaryBallId, with average null', () => {
    // 10 frames converted with the second ball 'B', ball 'A' never named primary anywhere.
    const games = Array.from({ length: 10 }, () => taggedFrameGame(6, 4, 'A', 'B'));
    const rows = ballComparisonRows(games, names);
    const row = rows.find((r) => r.id === 'B');
    expect(row).toMatchObject({ average: null, games: 0, sparePct: 100, spareAttempts: 10, sparesConverted: 10 });
  });

  it('excludes a ball with too little data on both fronts', () => {
    const primaryGames = Array.from({ length: 2 }, () => ({ ...totalGame(180), primaryBallId: 'A' }));
    const spareGames = Array.from({ length: 4 }, () => taggedFrameGame(6, 4, 'X', 'A'));
    const rows = ballComparisonRows([...primaryGames, ...spareGames], names);
    expect(rows.find((r) => r.id === 'A')).toBeUndefined();
  });

  it('sorts by average, with average-less balls trailing', () => {
    const primary = Array.from({ length: 3 }, () => ({ ...totalGame(150), primaryBallId: 'A' }));
    const spareOnly = Array.from({ length: 10 }, () => taggedFrameGame(6, 4, undefined, 'B'));
    const rows = ballComparisonRows([...primary, ...spareOnly], names);
    expect(rows.map((r) => r.id)).toEqual(['A', 'B']);
  });
});

describe('computeStats — trend', () => {
  it('is null until there are two full windows of games', () => {
    const games = Array.from({ length: 9 }, () => totalGame(150));
    expect(computeStats(games).trend).toBeNull();
  });

  it('compares the last 5 games against the previous 5', () => {
    const prior = [140, 150, 160, 150, 150]; // avg 150
    const recent = [170, 180, 160, 170, 170]; // avg 170
    const games = [...prior, ...recent].map((s) => totalGame(s));
    const { trend } = computeStats(games);
    expect(trend).toEqual({ window: 5, recentAvg: 170, priorAvg: 150, delta: 20 });
  });

  it('reports a negative delta when form drops', () => {
    const games = [...[180, 180, 180, 180, 180], ...[150, 150, 150, 150, 150]].map((s) => totalGame(s));
    expect(computeStats(games).trend?.delta).toBe(-30);
  });
});
