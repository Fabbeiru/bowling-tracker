import { Injectable, signal } from '@angular/core';

import { SessionType } from '../../models';

export type GamesTypeFilter = SessionType | 'all';

/**
 * Remembers where you were in the Partidas list — page and type filter — so
 * that opening a session and coming back doesn't drop you on page 1 every time.
 * In-memory only (a reload starts fresh, which is fine).
 */
@Injectable({ providedIn: 'root' })
export class GamesNavState {
  readonly page = signal(1);
  readonly typeFilter = signal<GamesTypeFilter>('all');
  /** Filters by `Session.competitionId` / `Session.venueId` / `Game.primaryBallId`. */
  readonly competitionFilter = signal<string>('all');
  readonly venueFilter = signal<string>('all');
  readonly ballFilter = signal<string>('all');

  reset(): void {
    this.page.set(1);
    this.typeFilter.set('all');
    this.competitionFilter.set('all');
    this.venueFilter.set('all');
    this.ballFilter.set('all');
  }
}
