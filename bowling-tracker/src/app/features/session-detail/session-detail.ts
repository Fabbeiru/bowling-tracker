import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { isCleanGame, scoreGame } from '../../core/scoring';
import { sessionTotals } from '../../core/stats/stats';
import { createGame, Game, Session } from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

interface GameRow {
  game: Game;
  total: number;
  started: boolean;
  complete: boolean;
  clean: boolean;
  perfect: boolean;
}

@Component({
  selector: 'app-session-detail',
  imports: [RouterLink, TranslocoDirective, BackLink, ConfirmDialog],
  templateUrl: './session-detail.html',
  styleUrl: './session-detail.scss',
})
export class SessionDetail {
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly session = signal<Session | null>(null);
  readonly games = signal<Game[]>([]);
  readonly competitionName = signal<string | undefined>(undefined);
  readonly venueName = signal<string | undefined>(undefined);
  readonly confirmingDelete = signal(false);
  readonly addingGame = signal(false);

  readonly rows = computed<GameRow[]>(() =>
    this.games().map((game) => {
      const s = scoreGame(game);
      const started =
        game.detailLevel === 'total' ? game.totalPins !== undefined : (game.frames?.length ?? 0) > 0;
      return {
        game,
        total: s.total,
        started,
        complete: s.complete,
        clean: isCleanGame(game),
        perfect: s.complete && s.total === 300,
      };
    }),
  );

  readonly totals = computed(() => sessionTotals(this.games()));

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    if (id) void this.load(id);
    else this.loading.set(false);
  }

  private async load(id: string): Promise<void> {
    try {
      const [session, games] = await Promise.all([
        this.repo.getSession(id),
        this.repo.listGamesBySession(id),
      ]);
      this.session.set(session ?? null);
      this.games.set(games);
      if (session?.competitionId) {
        this.competitionName.set((await this.repo.getCompetition(session.competitionId))?.name);
      }
      if (session?.venueId) {
        this.venueName.set((await this.repo.getVenue(session.venueId))?.name);
      }
    } catch {
      this.toast.error('errors.loadSession');
    } finally {
      this.loading.set(false);
    }
  }

  async addGame(): Promise<void> {
    const session = this.session();
    if (!session || this.addingGame()) return;
    this.addingGame.set(true);
    try {
      const games = this.games();
      const last = games[games.length - 1];
      const nextIndex = games.reduce((max, g) => Math.max(max, g.index), 0) + 1;
      const game = createGame({
        sessionId: session.id,
        index: nextIndex,
        detailLevel: last?.detailLevel ?? session.defaultDetailLevel,
        primaryBallId: last?.primaryBallId ?? session.defaultPrimaryBallId,
        spareBallId: last?.spareBallId ?? session.defaultSpareBallId,
      });
      await this.repo.saveGame(game);
      await this.router.navigate(['/games', game.id]);
    } catch {
      this.toast.error('errors.addGame');
    } finally {
      this.addingGame.set(false);
    }
  }

  async deleteSession(): Promise<void> {
    const session = this.session();
    this.confirmingDelete.set(false);
    if (!session) return;
    try {
      await this.repo.deleteSession(session.id);
      await this.router.navigate(['/games']);
    } catch {
      this.toast.error('errors.deleteSession');
    }
  }
}
