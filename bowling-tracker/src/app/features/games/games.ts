import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { GamesNavState, GamesTypeFilter } from '../../core/nav/games-nav.state';
import { gameToRolls, isCleanGame, scoreGame } from '../../core/scoring';
import { paginateByItemCount } from '../../core/util/paginate';
import { Ball, Competition, Game, Session, Venue } from '../../models';
import { FilterSelect } from '../../shared/components/filter-select/filter-select';
import { FilterSheet } from '../../shared/components/filter-sheet/filter-sheet';
import { FilterTrigger } from '../../shared/components/filter-trigger/filter-trigger';
import { HorizontalWheelScroll } from '../../shared/directives/horizontal-wheel-scroll.directive';

type TypeFilter = GamesTypeFilter;

interface SessionRow {
  session: Session;
  competitionName?: string;
  venueName?: string;
  games: { game: Game; total: number; complete: boolean; started: boolean; clean: boolean; perfect: boolean }[];
}

/** Has anything at all been recorded for this game yet? */
function isStarted(game: Game): boolean {
  if (game.detailLevel === 'total') return game.totalPins !== undefined;
  return gameToRolls(game).length > 0;
}

@Component({
  selector: 'app-games',
  imports: [RouterLink, TranslocoDirective, HorizontalWheelScroll, FilterTrigger, FilterSheet, FilterSelect],
  templateUrl: './games.html',
  styleUrl: './games.scss',
})
export class Games {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(GamesNavState);

  /** Games per page, not sessions — a session can hold more than one game. */
  static readonly PAGE_SIZE = 10;

  readonly rows = signal<SessionRow[]>([]);
  readonly loading = signal(true);
  readonly typeOptions: TypeFilter[] = ['all', 'practice', 'league', 'tournament', 'social'];
  readonly competitions = signal<Competition[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly balls = signal<Ball[]>([]);

  // Página y filtros viven en GamesNavState (no en el componente), así que al
  // entrar a una sesión y volver siguen donde estaban.
  readonly typeFilter = this.nav.typeFilter;
  readonly competitionFilter = this.nav.competitionFilter;
  readonly venueFilter = this.nav.venueFilter;
  readonly ballFilter = this.nav.ballFilter;
  readonly page = this.nav.page;

  readonly sheetOpen = signal(false);

  readonly activeFilterCount = computed(
    () =>
      (this.competitionFilter() !== 'all' ? 1 : 0) +
      (this.venueFilter() !== 'all' ? 1 : 0) +
      (this.ballFilter() !== 'all' ? 1 : 0),
  );

  readonly competitionOptions = computed(() => this.competitions().map((c) => ({ id: c.id, name: c.name })));
  readonly venueOptions = computed(() => this.venues().map((v) => ({ id: v.id, name: v.name })));
  readonly ballOptions = computed(() => this.balls().map((b) => ({ id: b.id, name: b.name })));

  /**
   * Type/competition/venue narrow which *sessions* show; ball narrows the
   * *games* within a session (a session can mix balls across its games), so
   * a session with no matching game after that drops out entirely.
   */
  readonly filteredRows = computed(() => {
    const type = this.typeFilter();
    const comp = this.competitionFilter();
    const venue = this.venueFilter();
    const ball = this.ballFilter();
    return this.rows()
      .filter((r) => type === 'all' || r.session.type === type)
      .filter((r) => comp === 'all' || r.session.competitionId === comp)
      .filter((r) => venue === 'all' || r.session.venueId === venue)
      .map((r) => (ball === 'all' ? r : { ...r, games: r.games.filter((g) => g.game.primaryBallId === ball) }))
      .filter((r) => r.games.length > 0);
  });

  /**
   * Sessions bucketed into pages of ~PAGE_SIZE *games* (not sessions) each —
   * a session is never split across pages, so a page can exceed the target
   * when a session holds several games (see `paginateByItemCount`).
   */
  readonly pages = computed(() =>
    paginateByItemCount(this.filteredRows(), (r) => r.games.length, Games.PAGE_SIZE),
  );

  readonly pageCount = computed(() => this.pages().length);

  readonly pagedRows = computed(() => {
    const page = Math.min(this.page(), this.pageCount());
    return this.pages()[page - 1] ?? [];
  });

  /** Games shown up to and including the current page — a running total, like "9/21", not just this page's count. */
  readonly shownGamesCount = computed(() => {
    const page = Math.min(this.page(), this.pageCount());
    return this.pages()
      .slice(0, page)
      .reduce((n, rows) => n + rows.reduce((m, r) => m + r.games.length, 0), 0);
  });

  readonly totalGamesCount = computed(() => this.filteredRows().reduce((n, r) => n + r.games.length, 0));

  constructor() {
    void this.load();
  }

  selectType(type: TypeFilter): void {
    this.typeFilter.set(type);
    this.page.set(1);
  }

  openSheet(): void {
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
  }

  clearSheetFilters(): void {
    this.competitionFilter.set('all');
    this.venueFilter.set('all');
    this.ballFilter.set('all');
    this.page.set(1);
  }

  setCompetitionFilter(id: string): void {
    this.competitionFilter.set(id);
    this.page.set(1);
  }

  setVenueFilter(id: string): void {
    this.venueFilter.set(id);
    this.page.set(1);
  }

  setBallFilter(id: string): void {
    this.ballFilter.set(id);
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
      const [sessions, competitions, venues, balls] = await Promise.all([
        this.repo.listSessions(),
        this.repo.listCompetitions({ includeInactive: true }),
        this.repo.listVenues({ includeInactive: true }),
        this.repo.listBalls({ includeInactive: true }),
      ]);
      this.competitions.set(competitions);
      this.venues.set(venues);
      this.balls.set(balls);
      const compName = new Map(competitions.map((c) => [c.id, c.name]));
      const venueName = new Map(venues.map((v) => [v.id, v.name]));

      const rows = await Promise.all(
        sessions.map(async (session) => {
          const games = await this.repo.listGamesBySession(session.id);
          return {
            session,
            competitionName: session.competitionId ? compName.get(session.competitionId) : undefined,
            venueName: session.venueId ? venueName.get(session.venueId) : undefined,
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
