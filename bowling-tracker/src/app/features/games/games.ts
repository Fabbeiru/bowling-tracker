import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { scoreGame } from '../../core/scoring';
import { Game, Session } from '../../models';

interface SessionRow {
  session: Session;
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

  readonly rows = signal<SessionRow[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const sessions = await this.repo.listSessions();
    const rows = await Promise.all(
      sessions.map(async (session) => {
        const games = await this.repo.listGamesBySession(session.id);
        return {
          session,
          games: games.map((game) => {
            const s = scoreGame(game);
            return { game, total: s.total, complete: s.complete };
          }),
        };
      }),
    );
    this.rows.set(rows);
    this.loading.set(false);
  }
}
