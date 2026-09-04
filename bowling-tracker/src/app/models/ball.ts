import { Id, Timestamps } from './common';

/** A ball in the user's arsenal. */
export interface Ball extends Timestamps {
  id: Id;
  name: string;
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
