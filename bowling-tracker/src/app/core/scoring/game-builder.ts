import { Frame, Game, Id, Throw } from '../../models';
import { framePins } from './game-scoring';
import { clampPins } from './roll-scoring';

export const ALL_PINS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Default ball for a delivery, before the user overrides it:
 * fewer than 5 pins standing → the spare ball (a small pickup); otherwise —
 * a full rack included — the primary ball.
 *
 * When the game has no primary/spare set, falls back to the game's other ball
 * and finally to the first arsenal ball, so there is always a sensible pick as
 * long as the arsenal is not empty (only then is it `undefined`).
 */
export function resolveDefaultBall(
  standingCount: number,
  game: Pick<Game, 'primaryBallId' | 'spareBallId'>,
  arsenalBallIds: readonly Id[],
): Id | undefined {
  if (arsenalBallIds.length === 0) return undefined;
  const fallback = arsenalBallIds[0];
  const primary = game.primaryBallId ?? game.spareBallId ?? fallback;
  const spare = game.spareBallId ?? game.primaryBallId ?? fallback;
  return standingCount < 5 ? spare : primary;
}

export interface EntryPosition {
  /** 1..10. */
  frame: number;
  /** 1, 2 or 3. */
  ball: 1 | 2 | 3;
  /** How many pins are standing before this ball (always known). */
  standingCount: number;
  /**
   * Which pins are standing (1..10), or `null` when unknown (frame-level
   * detail, or the previous ball was recorded as a count without pin marks).
   */
  standingBefore: number[] | null;
  /**
   * True when this ball faces a completely fresh rack (the first ball of any
   * frame, or a tenth-frame bonus ball after a strike/spare). Knocking down
   * all `standingCount` pins here is a strike ("Pleno"); when false, clearing
   * them completes a spare ("Semipleno") even though `standingCount` can also
   * be 10 (e.g. after missing the first ball entirely).
   */
  freshRack: boolean;
}

export interface Delivery {
  pinsKnocked: number;
  /** Pins still standing after this ball (throw-level detail). */
  pinsStanding?: number[];
  /** Ball used on this delivery (already resolved by the caller). */
  ballId?: Id;
  foul?: boolean;
}

function sortedFrames(game: Pick<Game, 'frames'>): Frame[] {
  return [...(game.frames ?? [])].sort((a, b) => a.index - b.index);
}

function frameAt(frames: Frame[], index: number): Frame | undefined {
  return frames.find((f) => f.index === index);
}

/** Standing pins after ball `ball` (1-based) of a frame, or null if not marked. */
function standingAfter(fr: Frame | undefined, ball: number): number[] | null {
  const t = fr?.throws?.find((x) => x.index === ball);
  return t?.pinsStanding ?? null;
}

/** Where entry currently sits, or `null` when the game is finished. */
export function entryPosition(game: Pick<Game, 'detailLevel' | 'frames'>): EntryPosition | null {
  if (game.detailLevel === 'total') return null;
  const frames = sortedFrames(game);

  for (let index = 1; index <= 10; index++) {
    const fr = frameAt(frames, index);
    const pins = fr ? framePins(fr) : [];

    if (index < 10) {
      if (pins.length === 0) {
        return { frame: index, ball: 1, standingCount: 10, standingBefore: [...ALL_PINS], freshRack: true };
      }
      if (pins[0] === 10) continue; // strike
      if (pins.length === 1) {
        return {
          frame: index,
          ball: 2,
          standingCount: 10 - pins[0],
          standingBefore: standingAfter(fr, 1),
          freshRack: false,
        };
      }
      continue; // open or spare, frame done
    }

    // Frame 10
    if (pins.length === 0) {
      return { frame: 10, ball: 1, standingCount: 10, standingBefore: [...ALL_PINS], freshRack: true };
    }
    const a = pins[0];
    if (pins.length === 1) {
      const fresh = a === 10;
      return {
        frame: 10,
        ball: 2,
        standingCount: fresh ? 10 : 10 - a,
        standingBefore: fresh ? [...ALL_PINS] : standingAfter(fr, 1),
        freshRack: fresh,
      };
    }
    const b = pins[1];
    if (pins.length === 2) {
      if (a === 10) {
        const fresh = b === 10;
        return {
          frame: 10,
          ball: 3,
          standingCount: fresh ? 10 : 10 - b,
          standingBefore: fresh ? [...ALL_PINS] : standingAfter(fr, 2),
          freshRack: fresh,
        };
      }
      if (a + b === 10) {
        return { frame: 10, ball: 3, standingCount: 10, standingBefore: [...ALL_PINS], freshRack: true };
      }
      return null; // open tenth, done
    }
    return null; // three balls recorded
  }

  return null;
}

export function isComplete(game: Pick<Game, 'detailLevel' | 'frames' | 'totalPins'>): boolean {
  if (game.detailLevel === 'total') return game.totalPins !== undefined;
  return entryPosition(game) === null;
}

/** Append a delivery, returning a new game. Throws if the input is invalid. */
export function applyDelivery(game: Game, delivery: Delivery): Game {
  if (game.detailLevel === 'total') {
    throw new Error('applyDelivery is not valid for total-detail games');
  }

  const pos = entryPosition(game);
  if (!pos) throw new Error('Game is already complete');

  const pinsKnocked = clampPins(delivery.foul ? 0 : delivery.pinsKnocked);
  if (pinsKnocked > pos.standingCount) {
    throw new Error(`Cannot knock down ${pinsKnocked} of ${pos.standingCount} standing pins`);
  }

  const frames = sortedFrames(game).map((f) => cloneFrame(f));
  let target = frameAt(frames, pos.frame);
  if (!target) {
    target = { index: pos.frame };
    frames.push(target);
    frames.sort((a, b) => a.index - b.index);
  }

  if (game.detailLevel === 'throw') {
    target.throws = [...(target.throws ?? [])];
    const entry: Throw = { index: pos.ball, pinsKnocked };
    if (delivery.pinsStanding) entry.pinsStanding = [...delivery.pinsStanding].sort((a, b) => a - b);
    if (delivery.ballId) entry.ballId = delivery.ballId;
    if (delivery.foul) entry.foul = true;
    target.throws.push(entry);
  } else {
    if (pos.ball === 1) {
      target.first = pinsKnocked;
      target.firstBallId = delivery.ballId;
    } else if (pos.ball === 2) {
      target.second = pinsKnocked;
      target.secondBallId = delivery.ballId;
    } else {
      target.third = pinsKnocked;
      target.thirdBallId = delivery.ballId;
    }
  }

  return { ...game, frames };
}

/** Remove the most recent delivery. */
export function undoLastDelivery(game: Game): Game {
  if (game.detailLevel === 'total') return game;
  const frames = sortedFrames(game).map((f) => cloneFrame(f));

  for (let i = frames.length - 1; i >= 0; i--) {
    const fr = frames[i];
    if (fr.throws && fr.throws.length > 0) {
      fr.throws = fr.throws.slice(0, -1);
      if (fr.throws.length === 0) frames.splice(i, 1);
      return { ...game, frames };
    }
    if (fr.third !== undefined) {
      fr.third = undefined;
      fr.thirdBallId = undefined;
      return { ...game, frames };
    }
    if (fr.second !== undefined) {
      fr.second = undefined;
      fr.secondBallId = undefined;
      return { ...game, frames };
    }
    if (fr.first !== undefined) {
      frames.splice(i, 1);
      return { ...game, frames };
    }
    frames.splice(i, 1);
  }

  return { ...game, frames };
}

function cloneFrame(f: Frame): Frame {
  return {
    ...f,
    throws: f.throws?.map((t) => ({ ...t, pinsStanding: t.pinsStanding ? [...t.pinsStanding] : undefined })),
  };
}
