import { BallRole, Id, Timestamps } from './common';

/** A ball in the user's arsenal. */
export interface Ball extends Timestamps {
  id: Id;
  name: string;
  /** Strike ball or spare ball. Absent on balls created before this existed —
   *  treat `undefined` as `'strike'`. */
  role?: BallRole;
  brand?: string;
  weightLb?: number;
  coverstock?: string;
  layout?: string;
  /** URL of a photo of the ball; shown in the arsenal list when present. */
  imageUrl?: string;
  notes?: string;
  /** `false` = soft-deleted: hidden from pickers, kept for history. */
  active: boolean;
}
