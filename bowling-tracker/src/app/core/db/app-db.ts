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
 * IndexedDB (vía Dexie). Frames y throws van embebidos dentro de `games`.
 * Cambiar el esquema = subir la versión + añadir un `upgrade` + su test
 * (docs/DATA-MODEL.md, docs/adr/0005).
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

/** Handle inyectable; en los tests se sustituye por una BD con nombre desechable. */
export const APP_DB = new InjectionToken<AppDb>('APP_DB', {
  providedIn: 'root',
  factory: () => new AppDb(),
});
