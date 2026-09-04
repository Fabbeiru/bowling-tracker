import { Id, Timestamps } from './common';

/** A bowling alley. */
export interface Venue extends Timestamps {
  id: Id;
  name: string;
  city?: string;
  /** Number of lanes, informational. */
  lanes?: number;
  notes?: string;
  /** `false` = soft-deleted. */
  active: boolean;
}
