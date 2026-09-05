import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import {
  applyDelivery,
  entryPosition,
  isComplete,
  resolveDefaultBall,
  scoreGame,
  undoLastDelivery,
} from '../../core/scoring';
import { Ball, createGame, Game, Session } from '../../models';
import { Scoresheet } from '../../shared/components/scoresheet/scoresheet';
import { PinPad } from '../../shared/components/pin-pad/pin-pad';
import { PinRack, RackDelivery } from '../../shared/components/pin-rack/pin-rack';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { BackLink } from '../../shared/components/back-link/back-link';

const SAVE_ERROR = 'errors.saveGame';

@Component({
  selector: 'app-game-entry',
  imports: [FormsModule, TranslocoDirective, Scoresheet, PinPad, PinRack, ConfirmDialog, BackLink],
  templateUrl: './game-entry.html',
  styleUrl: './game-entry.scss',
})
export class GameEntry {
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly game = signal<Game | null>(null);
  readonly loading = signal(true);
  readonly totalInput = signal<number | null>(null);
  readonly notes = signal('');
  readonly confirmingDelete = signal(false);
  readonly addingGame = signal(false);

  /** Arsenal balls, for tagging which ball was used on each delivery. */
  readonly arsenalBalls = signal<Ball[]>([]);
  readonly strikeBalls = computed(() =>
    this.arsenalBalls().filter((b) => (b.role ?? 'strike') === 'strike'),
  );
  readonly spareBalls = computed(() => this.arsenalBalls().filter((b) => b.role === 'spare'));

  /** Session context, so it's clear "add another game" stays in the same session. */
  readonly session = signal<Session | null>(null);
  readonly sessionGameCount = signal(1);
  readonly competitionName = signal<string | undefined>(undefined);
  readonly venueName = signal<string | undefined>(undefined);

  readonly score = computed(() => {
    const g = this.game();
    return g ? scoreGame(g) : null;
  });

  readonly position = computed(() => {
    const g = this.game();
    return g ? entryPosition(g) : null;
  });

  readonly complete = computed(() => {
    const g = this.game();
    return g ? isComplete(g) : false;
  });

  /**
   * Ball selected for the current delivery. Recomputes to the default whenever
   * the entry position changes (i.e. after each recorded ball); the user can
   * override it via the picker until the next ball is recorded.
   */
  readonly selectedBallId = linkedSignal<
    { pos: ReturnType<typeof entryPosition>; ballCount: number },
    string | undefined
  >({
    // Recompute the default whenever the entry position changes (i.e. after each
    // recorded ball) or the arsenal finishes loading; a manual pick via the
    // dropdown overrides it until the next ball is recorded.
    source: () => ({ pos: this.position(), ballCount: this.arsenalBalls().length }),
    computation: ({ pos }) => {
      const g = this.game();
      if (!pos || !g) return undefined;
      return resolveDefaultBall(
        pos.standingCount,
        g,
        this.arsenalBalls().map((b) => b.id),
      );
    },
  });


  /** Whether the total-detail input holds a value worth saving (0..300). */
  readonly validTotal = computed(() => {
    const raw = this.totalInput();
    return raw !== null && !Number.isNaN(raw) && raw >= 0 && raw <= 300;
  });

  /** Guards against a slow load resolving after a newer one has started (e.g. rapid navigation between games). */
  private loadingId: string | null = null;

  constructor() {
    // `games/:id` is the same route for every game, so navigating from one
    // game to another (e.g. "add another game to this session") reuses this
    // component instead of recreating it — a snapshot read here would only
    // ever see the first id. Subscribe to paramMap so a route change always
    // reloads.
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('id');
        if (id) void this.load(id);
        else this.loading.set(false);
      });
  }

  private async load(id: string): Promise<void> {
    this.loadingId = id;
    this.loading.set(true);
    this.confirmingDelete.set(false);
    try {
      const [g, balls] = await Promise.all([
        this.repo.getGame(id),
        this.repo.listBalls({ includeInactive: true }),
      ]);
      if (this.loadingId !== id) return; // a newer navigation has since started loading
      this.game.set(g ?? null);
      this.arsenalBalls.set(balls);
      this.totalInput.set(g?.totalPins ?? null);
      this.notes.set(g?.notes ?? '');
      if (g) await this.loadSessionContext(g, id);
    } catch {
      this.toast.error('errors.loadGame');
    } finally {
      if (this.loadingId === id) this.loading.set(false);
    }
  }

  private async loadSessionContext(g: Game, id: string): Promise<void> {
    const [session, siblings] = await Promise.all([
      this.repo.getSession(g.sessionId),
      this.repo.listGamesBySession(g.sessionId),
    ]);
    if (this.loadingId !== id) return;
    this.session.set(session ?? null);
    this.sessionGameCount.set(siblings.length);
    const [competition, venue] = await Promise.all([
      session?.competitionId ? this.repo.getCompetition(session.competitionId) : undefined,
      session?.venueId ? this.repo.getVenue(session.venueId) : undefined,
    ]);
    if (this.loadingId !== id) return;
    this.competitionName.set(competition?.name);
    this.venueName.set(venue?.name);
  }

  chooseBall(id: string): void {
    if (id) this.selectedBallId.set(id);
  }

  async record(pins: number): Promise<void> {
    await this.apply({ pinsKnocked: pins, ballId: this.selectedBallId() });
  }

  async recordRack(d: RackDelivery): Promise<void> {
    await this.apply({
      pinsKnocked: d.pinsKnocked,
      pinsStanding: d.pinsStanding,
      ballId: this.selectedBallId(),
    });
  }

  private async apply(delivery: {
    pinsKnocked: number;
    pinsStanding?: number[];
    ballId?: string;
  }): Promise<void> {
    const g = this.game();
    if (!g) return;
    const updated = applyDelivery(g, delivery);
    this.game.set(updated);
    try {
      await this.repo.saveGame(updated);
    } catch {
      this.toast.error(SAVE_ERROR);
    }
  }

  async undo(): Promise<void> {
    const g = this.game();
    if (!g) return;
    const updated = undoLastDelivery(g);
    this.game.set(updated);
    try {
      await this.repo.saveGame(updated);
    } catch {
      this.toast.error(SAVE_ERROR);
    }
  }

  async saveTotal(): Promise<void> {
    const g = this.game();
    if (!g) return;
    const raw = this.totalInput();
    const totalPins =
      raw === null || Number.isNaN(raw) ? undefined : Math.max(0, Math.min(300, Math.round(raw)));
    await this.persist({ ...g, totalPins });
  }

  async saveNotes(): Promise<void> {
    const g = this.game();
    if (!g) return;
    const notes = this.notes().trim();
    await this.persist({ ...g, notes: notes || undefined });
  }

  private async persist(updated: Game): Promise<void> {
    try {
      await this.repo.saveGame(updated);
      this.game.set(updated);
    } catch {
      this.toast.error(SAVE_ERROR);
    }
  }

  async deleteGame(): Promise<void> {
    const g = this.game();
    this.confirmingDelete.set(false);
    if (!g) return;
    try {
      await this.repo.deleteGame(g.id);
      const s = this.session();
      await this.router.navigate(s ? ['/sessions', s.id] : ['/games']);
    } catch {
      this.toast.error('errors.deleteGame');
    }
  }

  /** Starts a new game in the same session (e.g. the next game of a league series). */
  async addAnotherGame(): Promise<void> {
    const g = this.game();
    if (!g || this.addingGame()) return;
    this.addingGame.set(true);
    try {
      const siblings = await this.repo.listGamesBySession(g.sessionId);
      const nextIndex = siblings.reduce((max, s) => Math.max(max, s.index), 0) + 1;
      const next = createGame({
        sessionId: g.sessionId,
        index: nextIndex,
        detailLevel: g.detailLevel,
        primaryBallId: g.primaryBallId,
        spareBallId: g.spareBallId,
      });
      await this.repo.saveGame(next);
      await this.router.navigate(['/games', next.id]);
    } catch {
      this.toast.error('errors.addGame');
    } finally {
      this.addingGame.set(false);
    }
  }

  async finish(): Promise<void> {
    if (this.game()?.detailLevel === 'total') await this.saveTotal();
    const s = this.session();
    await this.router.navigate(s ? ['/sessions', s.id] : ['/games']);
  }
}
