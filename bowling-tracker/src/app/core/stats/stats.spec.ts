import { Game } from '../../models';
import { computeStats } from './stats';

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
