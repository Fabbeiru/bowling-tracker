import { DetailLevel, Id, IsoDateTime, Timestamps } from './common';

/** A single delivery. Only stored when `detailLevel` is `throw`. */
export interface Throw {
  /** 1..3 within the frame. */
  index: number;
  /** Pins knocked down on this delivery, 0..10. Source of truth for scoring. */
  pinsKnocked: number;
  /** Pin numbers (1..10) left standing after this throw. Optional — enables
   *  split detection and first-ball accuracy. */
  pinsStanding?: number[];
  /** Ball used, only when different from the game's primary/spare ball. */
  ballId?: Id;
  foul?: boolean;
}

export interface Frame {
  /** 1..10. */
  index: number;
  /** `frame` detail level: pins per delivery. */
  first?: number;
  second?: number;
  /** Frame 10 only. */
  third?: number;
  /** `throw` detail level: per-delivery detail. */
  throws?: Throw[];
}

/** A game of ten frames. Frames (and their throws) are embedded. */
export interface Game extends Timestamps {
  id: Id;
  sessionId: Id;
  /** 1..n within the session. */
  index: number;
  /** Fixed on creation, never changed. */
  detailLevel: DetailLevel;
  startedAt?: IsoDateTime;
  notes?: string;
  primaryBallId?: Id;
  spareBallId?: Id;
  /** `total` detail level: just the final score, 0..300. */
  totalPins?: number;
  /** `frame` and `throw` detail levels. */
  frames?: Frame[];
}
