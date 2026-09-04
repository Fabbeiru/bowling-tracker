import {
  AppMeta,
  Ball,
  Competition,
  Game,
  Id,
  Session,
  Venue,
} from '../../models';

/**
 * Data access contract. Features depend on this, never on Dexie directly, so a
 * future sync layer (Fase II) can be added without touching them. See
 * docs/adr/0002.
 *
 * Implementations stamp `updatedAt` on every write; callers set `createdAt`
 * (and the `id`) when creating a record.
 */
export abstract class Repository {
  // --- Balls ---
  abstract listBalls(opts?: { includeInactive?: boolean }): Promise<Ball[]>;
  abstract getBall(id: Id): Promise<Ball | undefined>;
  abstract saveBall(ball: Ball): Promise<void>;
  /** Soft delete: sets `active = false`. */
  abstract deactivateBall(id: Id): Promise<void>;

  // --- Venues ---
  abstract listVenues(opts?: { includeInactive?: boolean }): Promise<Venue[]>;
  abstract getVenue(id: Id): Promise<Venue | undefined>;
  abstract saveVenue(venue: Venue): Promise<void>;
  abstract deactivateVenue(id: Id): Promise<void>;

  // --- Competitions ---
  abstract listCompetitions(opts?: { includeInactive?: boolean }): Promise<Competition[]>;
  abstract getCompetition(id: Id): Promise<Competition | undefined>;
  abstract saveCompetition(competition: Competition): Promise<void>;
  abstract deactivateCompetition(id: Id): Promise<void>;

  // --- Sessions ---
  abstract listSessions(): Promise<Session[]>;
  abstract getSession(id: Id): Promise<Session | undefined>;
  abstract saveSession(session: Session): Promise<void>;
  /** Hard delete: removes the session and all its games. */
  abstract deleteSession(id: Id): Promise<void>;

  // --- Games ---
  abstract listGames(): Promise<Game[]>;
  abstract listGamesBySession(sessionId: Id): Promise<Game[]>;
  abstract getGame(id: Id): Promise<Game | undefined>;
  abstract saveGame(game: Game): Promise<void>;
  abstract deleteGame(id: Id): Promise<void>;

  // --- Meta ---
  abstract getMeta(): Promise<AppMeta>;
  abstract saveMeta(meta: AppMeta): Promise<void>;
}
