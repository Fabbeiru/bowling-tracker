import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { scoreGame } from '../../core/scoring';
import { Game, Session, SessionType } from '../../models';

type TypeFilter = SessionType | 'all';

interface SessionRow {
  session: Session;
  competitionName?: string;
  venueName?: string;
  games: { game: Game; total: number; complete: boolean }[];
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

  readonly rows = signal<SessionRow[]>([]);
  readonly loading = signal(true);
  readonly typeFilter = signal<TypeFilter>('all');
  readonly typeOptions: TypeFilter[] = ['all', 'practice', 'league', 'tournament', 'social'];

  readonly filteredRows = computed(() => {
    const type = this.typeFilter();
    const rows = this.rows();
    return type === 'all' ? rows : rows.filter((r) => r.session.type === type);
  });

  constructor() {
    void this.load();
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
              return { game, total: s.total, complete: s.complete };
            }),
          };
        }),
      );
      this.rows.set(rows);
    } catch {
      this.toast.error('No se pudieron cargar tus partidas.');
    } finally {
      this.loading.set(false);
    }
  }
}
