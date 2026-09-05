import { Injectable, inject } from '@angular/core';

import {
  AppMeta,
  Ball,
  Competition,
  DEFAULT_META,
  Game,
  Id,
  Session,
  Venue,
} from '../../models';
import { nowLocalIso } from '../util/dates';
import { APP_DB } from '../db/app-db';
import { AppData } from './data-transfer';
import { Repository } from './repository';

@Injectable({ providedIn: 'root' })
export class DexieRepository extends Repository {
  private readonly db = inject(APP_DB);

  // --- Balls ---
  listBalls(opts?: { includeInactive?: boolean }): Promise<Ball[]> {
    return this.listByName(this.db.balls, opts?.includeInactive);
  }
  getBall(id: Id): Promise<Ball | undefined> {
    return this.db.balls.get(id);
  }
  async saveBall(ball: Ball): Promise<void> {
    await this.db.balls.put({ ...ball, updatedAt: nowLocalIso() });
  }
  deactivateBall(id: Id): Promise<void> {
    return this.deactivate(this.db.balls, id);
  }
  async deleteBall(id: Id): Promise<void> {
    await this.db.balls.delete(id);
  }

  // --- Venues ---
  listVenues(opts?: { includeInactive?: boolean }): Promise<Venue[]> {
    return this.listByName(this.db.venues, opts?.includeInactive);
  }
  getVenue(id: Id): Promise<Venue | undefined> {
    return this.db.venues.get(id);
  }
  async saveVenue(venue: Venue): Promise<void> {
    await this.db.venues.put({ ...venue, updatedAt: nowLocalIso() });
  }
  deactivateVenue(id: Id): Promise<void> {
    return this.deactivate(this.db.venues, id);
  }
  async deleteVenue(id: Id): Promise<void> {
    await this.db.venues.delete(id);
  }

  // --- Competitions ---
  listCompetitions(opts?: { includeInactive?: boolean }): Promise<Competition[]> {
    return this.listByName(this.db.competitions, opts?.includeInactive);
  }
  getCompetition(id: Id): Promise<Competition | undefined> {
    return this.db.competitions.get(id);
  }
  async saveCompetition(competition: Competition): Promise<void> {
    await this.db.competitions.put({ ...competition, updatedAt: nowLocalIso() });
  }
  deactivateCompetition(id: Id): Promise<void> {
    return this.deactivate(this.db.competitions, id);
  }
  async deleteCompetition(id: Id): Promise<void> {
    await this.db.competitions.delete(id);
  }

  // --- Sessions ---
  async listSessions(): Promise<Session[]> {
    const all = await this.db.sessions.toArray();
    return all.sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
  }
  getSession(id: Id): Promise<Session | undefined> {
    return this.db.sessions.get(id);
  }
  async saveSession(session: Session): Promise<void> {
    await this.db.sessions.put({ ...session, updatedAt: nowLocalIso() });
  }
  async deleteSession(id: Id): Promise<void> {
    await this.db.transaction('rw', this.db.sessions, this.db.games, async () => {
      await this.db.games.where('sessionId').equals(id).delete();
      await this.db.sessions.delete(id);
    });
  }

  // --- Games ---
  listGames(): Promise<Game[]> {
    return this.db.games.toArray();
  }
  async listGamesBySession(sessionId: Id): Promise<Game[]> {
    const games = await this.db.games.where('sessionId').equals(sessionId).toArray();
    return games.sort((a, b) => a.index - b.index);
  }
  getGame(id: Id): Promise<Game | undefined> {
    return this.db.games.get(id);
  }
  async saveGame(game: Game): Promise<void> {
    await this.db.games.put({ ...game, updatedAt: nowLocalIso() });
  }
  async deleteGame(id: Id): Promise<void> {
    await this.db.games.delete(id);
  }

  // --- Meta ---
  async getMeta(): Promise<AppMeta> {
    return (await this.db.meta.get('app')) ?? DEFAULT_META;
  }
  async saveMeta(meta: AppMeta): Promise<void> {
    await this.db.meta.put({ ...meta, id: 'app' });
  }

  // --- Import / export ---
  private get contentTables() {
    return [this.db.balls, this.db.venues, this.db.competitions, this.db.sessions, this.db.games];
  }

  async exportData(): Promise<AppData> {
    const [balls, venues, competitions, sessions, games] = await Promise.all([
      this.db.balls.toArray(),
      this.db.venues.toArray(),
      this.db.competitions.toArray(),
      this.db.sessions.toArray(),
      this.db.games.toArray(),
    ]);
    return { balls, venues, competitions, sessions, games };
  }

  async replaceData(data: AppData): Promise<void> {
    await this.db.transaction('rw', this.contentTables, async () => {
      await Promise.all(this.contentTables.map((t) => t.clear()));
      await Promise.all([
        this.db.balls.bulkAdd(data.balls),
        this.db.venues.bulkAdd(data.venues),
        this.db.competitions.bulkAdd(data.competitions),
        this.db.sessions.bulkAdd(data.sessions),
        this.db.games.bulkAdd(data.games),
      ]);
    });
  }

  async clearData(): Promise<void> {
    await this.db.transaction('rw', this.contentTables, async () => {
      await Promise.all(this.contentTables.map((t) => t.clear()));
    });
  }

  // --- helpers ---
  private async listByName<T extends { name: string; active: boolean }>(
    table: { toArray(): Promise<T[]> },
    includeInactive?: boolean,
  ): Promise<T[]> {
    const all = await table.toArray();
    return all
      .filter((row) => includeInactive || row.active)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  private async deactivate(
    table: { update(key: Id, changes: object): Promise<number> },
    id: Id,
  ): Promise<void> {
    await table.update(id, { active: false, updatedAt: nowLocalIso() });
  }
}
