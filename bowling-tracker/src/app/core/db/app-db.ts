import { InjectionToken } from '@angular/core';
import Dexie, { Table } from 'dexie';

import {
  AppMeta,
  Ball,
  Competition,
  Game,
  Session,
  Venue,
} from '../../models';

/**
 * IndexedDB database. Six object stores; frames and throws are embedded in
 * `games`. Schema changes must bump the version and add an upgrade function
 * (with a test). See docs/DATA-MODEL.md and docs/adr/0005.
 */
export class AppDb extends Dexie {
  readonly balls!: Table<Ball, string>;
  readonly venues!: Table<Venue, string>;
  readonly competitions!: Table<Competition, string>;
  readonly sessions!: Table<Session, string>;
  readonly games!: Table<Game, string>;
  readonly meta!: Table<AppMeta, string>;

  constructor(name = 'bowling-tracker') {
    super(name);

    this.version(1).stores({
      balls: 'id, active',
      venues: 'id, active',
      competitions: 'id, active, type',
      sessions: 'id, date, competitionId',
      games: 'id, sessionId',
      meta: 'id',
    });
  }
}

/** Injectable handle to the database. Override in tests with a throwaway name. */
export const APP_DB = new InjectionToken<AppDb>('APP_DB', {
  providedIn: 'root',
  factory: () => new AppDb(),
});
