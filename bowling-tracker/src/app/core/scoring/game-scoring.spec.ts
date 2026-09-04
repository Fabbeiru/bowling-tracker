import { Frame, Game } from '../../models';
import { gameToRolls, isCleanGame, scoreGame } from './game-scoring';

function game(detailLevel: Game['detailLevel'], extra: Partial<Game>): Game {
  return {
    id: 'g1',
    sessionId: 's1',
    index: 1,
    detailLevel,
    createdAt: '2026-09-04T10:00',
    updatedAt: '2026-09-04T10:00',
    ...extra,
  };
}

function frameLevel(rows: Array<Partial<Frame>>): Game {
  return game('frame', {
    frames: rows.map((r, i) => ({ index: i + 1, ...r })),
  });
}

function throwLevel(rows: number[][]): Game {
  return game('throw', {
    frames: rows.map((pins, i) => ({
      index: i + 1,
      throws: pins.map((p, ti) => ({ index: ti + 1, pinsKnocked: p })),
    })),
  });
}

describe('scoreGame — total detail', () => {
  it('returns the stored total as-is', () => {
    const s = scoreGame(game('total', { totalPins: 187 }));
    expect(s).toEqual({ frames: [], total: 187, complete: true, maxPossible: 187 });
  });

  it('is incomplete when no total is stored', () => {
    const s = scoreGame(game('total', {}));
    expect(s.total).toBe(0);
    expect(s.complete).toBe(false);
  });

  it('clamps an out-of-range total', () => {
    expect(scoreGame(game('total', { totalPins: 999 })).total).toBe(300);
  });
});

describe('gameToRolls — frame detail', () => {
  it('emits a single 10 for a strike in frames 1-9', () => {
    const g = frameLevel([{ first: 10 }, { first: 3, second: 4 }]);
    expect(gameToRolls(g)).toEqual([10, 3, 4]);
  });

  it('keeps all three balls of the tenth frame', () => {
    const rows: Array<Partial<Frame>> = [
      ...Array<Partial<Frame>>(9).fill({ first: 0, second: 0 }),
      { first: 10, second: 5, third: 3 },
    ];
    expect(gameToRolls(frameLevel(rows)).slice(18)).toEqual([10, 5, 3]);
  });

  it('ignores frames beyond what has been entered', () => {
    const g = frameLevel([{ first: 7, second: 2 }, { first: 5 }]);
    expect(gameToRolls(g)).toEqual([7, 2, 5]);
  });
});

describe('scoreGame — frame detail', () => {
  it('scores a perfect game entered frame by frame', () => {
    const rows: Array<Partial<Frame>> = [
      ...Array<Partial<Frame>>(9).fill({ first: 10 }),
      { first: 10, second: 10, third: 10 },
    ];
    const s = scoreGame(frameLevel(rows));
    expect(s.total).toBe(300);
    expect(s.complete).toBe(true);
  });

  it('reports running total and ceiling for a game in progress', () => {
    const s = scoreGame(frameLevel([{ first: 10 }, { first: 7, second: 3 }, { first: 4 }]));
    expect(s.frames[0].cumulative).toBe(20); // 10 + 7 + 3
    expect(s.complete).toBe(false);
    expect(s.maxPossible).toBeGreaterThan(s.total);
    expect(s.maxPossible).toBeLessThanOrEqual(300);
  });
});

describe('gameToRolls / scoreGame — throw detail', () => {
  it('emits a single 10 for a strike throw in frames 1-9', () => {
    const g = throwLevel([[10], [3, 4]]);
    expect(gameToRolls(g)).toEqual([10, 3, 4]);
  });

  it('scores a foul as zero regardless of pins knocked', () => {
    const g = game('throw', {
      frames: [
        { index: 1, throws: [{ index: 1, pinsKnocked: 10, foul: true }, { index: 2, pinsKnocked: 5 }] },
      ],
    });
    expect(gameToRolls(g)).toEqual([0, 5]);
    expect(scoreGame(g).frames[0].mark).toBe('open');
  });

  it('scores a tenth-frame strike with two bonus throws', () => {
    const rows = [...Array<number[]>(9).fill([0, 0]), [10, 7, 2]];
    const s = scoreGame(throwLevel(rows));
    expect(s.total).toBe(19);
    expect(s.complete).toBe(true);
  });
});

describe('isCleanGame', () => {
  it('is true for a perfect game', () => {
    const rows: Array<Partial<Frame>> = [
      ...Array<Partial<Frame>>(9).fill({ first: 10 }),
      { first: 10, second: 10, third: 10 },
    ];
    expect(isCleanGame(frameLevel(rows))).toBe(true);
  });

  it('is true for an all-spares game with no strikes', () => {
    const rows: Array<Partial<Frame>> = [
      ...Array<Partial<Frame>>(9).fill({ first: 5, second: 5 }),
      { first: 5, second: 5, third: 5 },
    ];
    expect(isCleanGame(frameLevel(rows))).toBe(true);
  });

  it('is false as soon as one frame is open', () => {
    const rows: Array<Partial<Frame>> = [
      { first: 4, second: 3 },
      ...Array<Partial<Frame>>(8).fill({ first: 10 }),
      { first: 10, second: 10, third: 10 },
    ];
    expect(isCleanGame(frameLevel(rows))).toBe(false);
  });

  it('is false while the game is still in progress', () => {
    expect(isCleanGame(frameLevel([{ first: 10 }, { first: 10 }]))).toBe(false);
  });

  it('is false for total-detail games, even a 300', () => {
    expect(isCleanGame(game('total', { totalPins: 300 }))).toBe(false);
  });
});
