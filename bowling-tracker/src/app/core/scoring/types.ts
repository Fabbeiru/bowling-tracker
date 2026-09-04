export type FrameMark = 'strike' | 'spare' | 'open' | 'pending';

export interface FrameScore {
  /** 1..10. */
  index: number;
  /** Effective pin counts for this frame's own deliveries (fouls already 0). */
  rolls: number[];
  mark: FrameMark;
  /**
   * Points for this frame including strike/spare bonuses.
   * `undefined` while a needed bonus ball has not been thrown.
   */
  points?: number;
  /** Running total through this frame. `undefined` if `points` is. */
  cumulative?: number;
}

export interface GameScore {
  frames: FrameScore[];
  /** Confirmed running total (last frame with a known cumulative). */
  total: number;
  /** All ten frames scored, including bonus balls. */
  complete: boolean;
  /**
   * Best reachable final score: every remaining delivery assumed to knock down
   * the maximum possible (strikes / spares). Equals `total` when complete.
   */
  maxPossible: number;
}
