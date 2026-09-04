import { maxPossibleFromRolls, scoreRolls } from './roll-scoring';

const zeros = (n: number) => Array<number>(n).fill(0);

describe('scoreRolls — full games', () => {
  it('scores a gutter game as 0', () => {
    const s = scoreRolls(zeros(20));
    expect(s.total).toBe(0);
    expect(s.complete).toBe(true);
    expect(s.frames).toHaveLength(10);
  });

  it('scores twenty ones as 20', () => {
    expect(scoreRolls(Array<number>(20).fill(1)).total).toBe(20);
  });

  it('scores a single spare followed by a 3', () => {
    const s = scoreRolls([5, 5, 3, 0, ...zeros(16)]);
    expect(s.frames[0].points).toBe(13);
    expect(s.total).toBe(16);
  });

  it('scores a single strike followed by 3 and 4', () => {
    const s = scoreRolls([10, 3, 4, ...zeros(16)]);
    expect(s.frames[0].points).toBe(17);
    expect(s.total).toBe(24);
  });

  it('scores a turkey then gutters as 60', () => {
    const s = scoreRolls([10, 10, 10, ...zeros(14)]);
    expect(s.frames.slice(0, 3).map((f) => f.points)).toEqual([30, 20, 10]);
    expect(s.total).toBe(60);
  });

  it('scores a perfect game as 300', () => {
    const s = scoreRolls(Array<number>(12).fill(10));
    expect(s.total).toBe(300);
    expect(s.complete).toBe(true);
    expect(s.frames.every((f) => f.mark === 'strike')).toBe(true);
  });

  it('scores all fives (spares) as 150', () => {
    const s = scoreRolls([...Array<number>(21).fill(5)]);
    expect(s.total).toBe(150);
    expect(s.complete).toBe(true);
  });

  it('matches the classic 133 scorecard', () => {
    const rolls = [1, 4, 4, 5, 6, 4, 5, 5, 10, 0, 1, 7, 3, 6, 4, 10, 2, 8, 6];
    const s = scoreRolls(rolls);
    expect(s.total).toBe(133);
    expect(s.frames.map((f) => f.cumulative)).toEqual([5, 14, 29, 49, 60, 61, 77, 97, 117, 133]);
    expect(s.frames.map((f) => f.mark)).toEqual([
      'open', 'open', 'spare', 'spare', 'strike', 'open', 'spare', 'spare', 'strike', 'spare',
    ]);
  });
});

describe('scoreRolls — tenth frame', () => {
  it('scores a strike in the tenth with two bonus balls', () => {
    const s = scoreRolls([...zeros(18), 10, 5, 3]);
    expect(s.total).toBe(18);
    expect(s.frames[9].mark).toBe('strike');
    expect(s.complete).toBe(true);
  });

  it('scores a spare in the tenth with one bonus ball', () => {
    const s = scoreRolls([...zeros(18), 5, 5, 10]);
    expect(s.total).toBe(20);
    expect(s.complete).toBe(true);
  });

  it('scores an open tenth frame with no bonus ball', () => {
    const s = scoreRolls([...zeros(18), 4, 3]);
    expect(s.total).toBe(7);
    expect(s.frames[9].mark).toBe('open');
    expect(s.complete).toBe(true);
  });
});

describe('scoreRolls — games in progress', () => {
  it('leaves a lone opening strike pending', () => {
    const s = scoreRolls([10]);
    expect(s.frames[0].mark).toBe('strike');
    expect(s.frames[0].points).toBeUndefined();
    expect(s.total).toBe(0);
    expect(s.complete).toBe(false);
  });

  it('does not settle a strike until both bonus balls are thrown', () => {
    expect(scoreRolls([10, 10]).frames[0].points).toBeUndefined();
    expect(scoreRolls([10, 10, 4]).frames[0].points).toBe(24);
  });

  it('reports the confirmed running total mid-game', () => {
    // 7 / X 4 ... -> f1 spare + 10 = 20; f2 strike pending
    const s = scoreRolls([7, 3, 10, 4]);
    expect(s.frames[0].cumulative).toBe(20);
    expect(s.frames[1].points).toBeUndefined();
    expect(s.total).toBe(20);
  });

  it('pads to ten frames even with no rolls', () => {
    const s = scoreRolls([]);
    expect(s.frames).toHaveLength(10);
    expect(s.frames.every((f) => f.mark === 'pending')).toBe(true);
  });
});

describe('maxPossibleFromRolls', () => {
  it('is 300 for an empty game', () => {
    expect(maxPossibleFromRolls([])).toBe(300);
  });

  it('is 300 while the game is still all strikes', () => {
    expect(maxPossibleFromRolls([10, 10, 10])).toBe(300);
  });

  it('drops to 290 after an opening gutter ball', () => {
    expect(maxPossibleFromRolls([0])).toBe(290);
  });

  it('equals the actual total once the game is complete', () => {
    const rolls = [1, 4, 4, 5, 6, 4, 5, 5, 10, 0, 1, 7, 3, 6, 4, 10, 2, 8, 6];
    expect(maxPossibleFromRolls(rolls)).toBe(133);
  });

  it('accounts for pins already lost in an open frame', () => {
    // f1 open 4,4 -> 8 lost from a perfect run; ceiling well under 300
    const max = maxPossibleFromRolls([4, 4]);
    expect(max).toBeLessThan(300);
    expect(max).toBeGreaterThan(250);
  });
});
