import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { isCleanGame, scoreGame } from '../../core/scoring';
import { Game, Session, SessionType } from '../../models';

type TypeFilter = SessionType | 'all';

interface SessionRow {
  session: Session;
  competitionName?: string;
  venueName?: string;
  games: { game: Game; total: number; complete: boolean; clean: boolean; perfect: boolean }[];
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

  static readonly PAGE_SIZE = 15;

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

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredRows().length / Games.PAGE_SIZE)),
  );

  readonly pagedRows = computed(() => {
    const start = (this.page() - 1) * Games.PAGE_SIZE;
    return this.filteredRows().slice(start, start + Games.PAGE_SIZE);
  });

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
            games: games.map((game) => {
              const s = scoreGame(game);
              return {
                game,
                total: s.total,
                complete: s.complete,
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
