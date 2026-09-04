import { CompetitionType, Id, IsoDate, Timestamps } from './common';

/** A league or tournament that groups sessions. */
export interface Competition extends Timestamps {
  id: Id;
  type: CompetitionType;
  name: string;
  season?: string;
  startDate?: IsoDate;
  endDate?: IsoDate;
  notes?: string;
  /** `false` = soft-deleted. */
  active: boolean;
}
