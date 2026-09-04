import { DetailLevel, Id, IsoDate, SessionType, Timestamps } from './common';

/**
 * A visit to the alley: a league round, a tournament block or a practice.
 * Container for one or more games. Even a quick single game creates one.
 */
export interface Session extends Timestamps {
  id: Id;
  type: SessionType;
  date: IsoDate;
  /** Only when `type` is `league` or `tournament`. */
  competitionId?: Id;
  venueId?: Id;
  /** Free text, e.g. "12-13". */
  lanes?: string;
  notes?: string;
  /** Suggested detail level for new games in this session. */
  defaultDetailLevel: DetailLevel;
  defaultPrimaryBallId?: Id;
  defaultSpareBallId?: Id;
}
