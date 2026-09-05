import { Game } from '../../models';
import {
  applyDelivery,
  Delivery,
  entryPosition,
  isComplete,
  resolveDefaultBall,
  undoLastDelivery,
} from './game-builder';
import { scoreGame } from './game-scoring';

function blankGame(detailLevel: Game['detailLevel']): Game {
  return {
    id: 'g',
    sessionId: 's',
    index: 1,
    detailLevel,
    frames: [],
    createdAt: 'x',
    updatedAt: 'x',
  };
}

/** Play a whole game of frame-level deliveries (pin counts per ball). */
function playFrame(balls: number[]): Game {
  return balls.reduce<Game>((g, pins) => applyDelivery(g, { pinsKnocked: pins }), blankGame('frame'));
}

describe('entryPosition', () => {
  it('starts at frame 1, ball 1, full rack', () => {
    const pos = entryPosition(blankGame('frame'));
    expect(pos).toEqual({
      frame: 1,
      ball: 1,
      standingCount: 10,
      standingBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      freshRack: true,
    });
  });

  it('moves to ball 2 after a non-strike first ball', () => {
    const g = applyDelivery(blankGame('frame'), { pinsKnocked: 6 });
    expect(entryPosition(g)).toMatchObject({ frame: 1, ball: 2 });
  });

  it('is not a fresh rack on ball 2 even after missing the first ball entirely', () => {
    // 0 on ball 1 -> all 10 pins standing for ball 2, but clearing them is a
    // spare, not a strike.
    const g = applyDelivery(blankGame('frame'), { pinsKnocked: 0 });
    expect(entryPosition(g)).toMatchObject({ frame: 1, ball: 2, standingCount: 10, freshRack: false });
  });

  it('skips to the next frame after a strike', () => {
    const g = applyDelivery(blankGame('frame'), { pinsKnocked: 10 });
    expect(entryPosition(g)).toMatchObject({ frame: 2, ball: 1 });
  });

  it('is null for total-detail games', () => {
    expect(entryPosition(blankGame('total'))).toBeNull();
  });
});

describe('isComplete — total detail', () => {
  it('is not complete until a total is entered', () => {
    expect(isComplete(blankGame('total'))).toBe(false);
  });

  it('is complete once totalPins is set', () => {
    expect(isComplete({ ...blankGame('total'), totalPins: 150 })).toBe(true);
  });
});

describe('entryPosition — tenth frame', () => {
  it('offers a third ball in the tenth after a strike', () => {
    const g = playFrame([...Array<number>(18).fill(0), 10, 4]);
    expect(entryPosition(g)).toMatchObject({ frame: 10, ball: 3 });
  });

  it('offers a third ball in the tenth after a spare', () => {
    const g = playFrame([...Array<number>(18).fill(0), 5, 5]);
    expect(entryPosition(g)).toMatchObject({ frame: 10, ball: 3 });
  });

  it('ends after an open tenth frame', () => {
    const g = playFrame([...Array<number>(18).fill(0), 4, 3]);
    expect(entryPosition(g)).toBeNull();
    expect(isComplete(g)).toBe(true);
  });

  it('ends after the third ball of the tenth', () => {
    const g = playFrame([...Array<number>(18).fill(0), 10, 10, 10]);
    expect(entryPosition(g)).toBeNull();
  });
});

describe('applyDelivery — frame detail', () => {
  it('builds a perfect game', () => {
    const g = playFrame(Array<number>(12).fill(10));
    expect(scoreGame(g).total).toBe(300);
    expect(isComplete(g)).toBe(true);
  });

  it('records first and second balls of a frame', () => {
    const g = playFrame([7, 2]);
    expect(g.frames?.[0]).toMatchObject({ index: 1, first: 7, second: 2 });
  });

  it('rejects knocking down more than the standing pins', () => {
    const g = applyDelivery(blankGame('frame'), { pinsKnocked: 7 });
    expect(() => applyDelivery(g, { pinsKnocked: 5 })).toThrow();
  });

  it('rejects a delivery once the game is complete', () => {
    const g = playFrame([...Array<number>(18).fill(0), 4, 3]);
    expect(() => applyDelivery(g, { pinsKnocked: 5 })).toThrow();
  });

  it('counts a foul as zero', () => {
    const g = applyDelivery(blankGame('frame'), { pinsKnocked: 9, foul: true });
    expect(g.frames?.[0].first).toBe(0);
  });
});

describe('applyDelivery — throw detail', () => {
  const start = blankGame('throw');

  it('stores a single strike throw and advances the frame', () => {
    const g = applyDelivery(start, { pinsKnocked: 10, pinsStanding: [] });
    expect(g.frames?.[0].throws).toEqual([{ index: 1, pinsKnocked: 10, pinsStanding: [] }]);
    expect(entryPosition(g)).toMatchObject({ frame: 2, ball: 1 });
  });

  it('carries the standing pins into the next ball', () => {
    const d: Delivery = { pinsKnocked: 8, pinsStanding: [7, 10] };
    const g = applyDelivery(start, d);
    expect(entryPosition(g)).toMatchObject({ frame: 1, ball: 2, standingBefore: [7, 10] });
  });

  it('falls back to null standing when the first ball was a bare count', () => {
    const g = applyDelivery(start, { pinsKnocked: 8 });
    expect(entryPosition(g)).toMatchObject({ frame: 1, ball: 2, standingBefore: null });
  });
});

describe('undoLastDelivery', () => {
  it('removes the last ball and reopens the position', () => {
    const g = playFrame([7, 2, 10]);
    const back = undoLastDelivery(g);
    expect(entryPosition(back)).toMatchObject({ frame: 2, ball: 1 });
    expect(back.frames).toHaveLength(1);
  });

  it('drops a frame that becomes empty', () => {
    const g = playFrame([10, 5]);
    const back = undoLastDelivery(undoLastDelivery(g));
    expect(back.frames).toEqual([]);
    expect(entryPosition(back)).toMatchObject({ frame: 1, ball: 1 });
  });

  it('clears the ball tag of the delivery it removes (frame detail)', () => {
    let game = applyDelivery(blankGame('frame'), { pinsKnocked: 6, ballId: 'strike-ball' });
    game = applyDelivery(game, { pinsKnocked: 3, ballId: 'spare-ball' });
    expect(game.frames?.[0]).toMatchObject({ firstBallId: 'strike-ball', secondBallId: 'spare-ball' });
    const back = undoLastDelivery(game);
    expect(back.frames?.[0]).toMatchObject({ first: 6, firstBallId: 'strike-ball' });
    expect(back.frames?.[0].secondBallId).toBeUndefined();
  });
});

describe('resolveDefaultBall', () => {
  const arsenal = ['a', 'b', 'c'];

  it('uses the primary ball on a full rack', () => {
    expect(resolveDefaultBall(10, { primaryBallId: 'a', spareBallId: 'b' }, arsenal)).toBe('a');
  });

  it('uses the spare ball when fewer than 5 pins are standing', () => {
    expect(resolveDefaultBall(3, { primaryBallId: 'a', spareBallId: 'b' }, arsenal)).toBe('b');
    expect(resolveDefaultBall(4, { primaryBallId: 'a', spareBallId: 'b' }, arsenal)).toBe('b');
  });

  it('still uses the primary ball at exactly 5 standing (a big washout)', () => {
    expect(resolveDefaultBall(5, { primaryBallId: 'a', spareBallId: 'b' }, arsenal)).toBe('a');
  });

  it('falls back to the game ball that is set when the other is missing', () => {
    expect(resolveDefaultBall(3, { primaryBallId: 'a' }, arsenal)).toBe('a');
    expect(resolveDefaultBall(10, { spareBallId: 'b' }, arsenal)).toBe('b');
  });

  it('falls back to the first arsenal ball when the game has none set', () => {
    expect(resolveDefaultBall(10, {}, arsenal)).toBe('a');
    expect(resolveDefaultBall(3, {}, arsenal)).toBe('a');
  });

  it('is undefined only when the arsenal is empty', () => {
    expect(resolveDefaultBall(10, { primaryBallId: 'a' }, [])).toBeUndefined();
  });
});

describe('applyDelivery — ball tags', () => {
  it('stores ballId on the throw (throw detail)', () => {
    const g = applyDelivery(blankGame('throw'), {
      pinsKnocked: 8,
      pinsStanding: [7, 10],
      ballId: 'phaze',
    });
    expect(g.frames?.[0].throws?.[0]).toMatchObject({ pinsKnocked: 8, ballId: 'phaze' });
  });

  it('omits ballId when none is given', () => {
    const g = applyDelivery(blankGame('throw'), { pinsKnocked: 8, pinsStanding: [7, 10] });
    expect(g.frames?.[0].throws?.[0].ballId).toBeUndefined();
  });
});
