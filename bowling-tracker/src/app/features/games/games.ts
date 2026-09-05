import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { gameToRolls, isCleanGame, scoreGame } from '../../core/scoring';
import { sessionTotals } from '../../core/stats/stats';
import { Game, Session, SessionType } from '../../models';

type TypeFilter = SessionType | 'all';

interface SessionRow {
  session: Session;
  competitionName?: string;
  venueName?: string;
  /** Sum of the started games' scores (the session/series total). */
  series: number;
  games: { game: Game; total: number; complete: boolean; started: boolean; clean: boolean; perfect: boolean }[];
}

/** Has anything at all been recorded for this game yet? */
function isStarted(game: Game): boolean {
  if (game.detailLevel === 'total') return game.totalPins !== undefined;
  return gameToRolls(game).length > 0;
}

@Component({
  selector: 'app-games',
  imports: [RouterLink, TranslocoDirective],
  templateUrl: './games.html',
  styleUrl: './games.scss',
})
export class Games {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);

  /** Games per page, not sessions — a session can hold more than one game. */
  static readonly PAGE_SIZE = 10;

  readonly rows = signal<SessionRow[]>([]);
  readonly loading = signal(true);
  readonly typeFilter = signal<TypeFilter>('all');
  readonly typeOptions: TypeFilter[] = ['all', 'practice', 'league', 'tournament', 'social'];
  readonly page = signal(1);

  readonly filteredRows = computed(() => {
    const type = this.typeFilter();
    const rows = this.rows();
    return type === 'all' ? rows : rows.filter((r) => r.session.type === type);
  });

  /**
   * Sessions bucketed into pages of ~PAGE_SIZE *games* (not sessions) each —
   * a session is never split across pages, so a page can slightly exceed the
   * target when a session holds several games.
   */
  readonly pages = computed(() => {
    const pages: SessionRow[][] = [];
    let current: SessionRow[] = [];
    let count = 0;
    for (const row of this.filteredRows()) {
      if (count > 0 && count >= Games.PAGE_SIZE) {
        pages.push(current);
        current = [];
        count = 0;
      }
      current.push(row);
      count += row.games.length;
    }
    if (current.length > 0) pages.push(current);
    return pages.length > 0 ? pages : [[]];
  });

  readonly pageCount = computed(() => this.pages().length);

  readonly pagedRows = computed(() => this.pages()[this.page() - 1] ?? []);

  constructor() {
    void this.load();
  }

  selectType(type: TypeFilter): void {
    this.typeFilter.set(type);
    this.page.set(1);
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  nextPage(): void {
    this.page.update((p) => Math.min(this.pageCount(), p + 1));
  }

  private async load(): Promise<void> {
    try {
      const [sessions, competitions, venues] = await Promise.all([
        this.repo.listSessions(),
        this.repo.listCompetitions({ includeInactive: true }),
        this.repo.listVenues({ includeInactive: true }),
      ]);
      const compName = new Map(competitions.map((c) => [c.id, c.name]));
      const venueName = new Map(venues.map((v) => [v.id, v.name]));

      const rows = await Promise.all(
        sessions.map(async (session) => {
          const games = await this.repo.listGamesBySession(session.id);
          return {
            session,
            competitionName: session.competitionId ? compName.get(session.competitionId) : undefined,
            venueName: session.venueId ? venueName.get(session.venueId) : undefined,
            series: sessionTotals(games).series,
            games: games.map((game) => {
              const s = scoreGame(game);
              return {
                game,
                total: s.total,
                complete: s.complete,
                started: isStarted(game),
                clean: isCleanGame(game),
                perfect: s.complete && s.total === 300,
              };
            }),
          };
        }),
      );
      this.rows.set(rows);
    } catch {
      this.toast.error('errors.loadGames');
    } finally {
      this.loading.set(false);
    }
  }
}
