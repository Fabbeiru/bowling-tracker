/** UUID generated on the client (`crypto.randomUUID()`). */
export type Id = string;

/** Local calendar date, no timezone: `YYYY-MM-DD`. */
export type IsoDate = string;

/** Local date-time, no timezone: `YYYY-MM-DDTHH:mm`. */
export type IsoDateTime = string;

export interface Timestamps {
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/** How much detail a game is recorded with. Fixed when the game is created. */
export type DetailLevel = 'total' | 'frame' | 'throw';

export type SessionType = 'practice' | 'league' | 'tournament' | 'social';

/** What a ball is mainly for. Drives the defaults when starting a game. */
export type BallRole = 'strike' | 'spare';

export type CompetitionType = 'league' | 'tournament';
