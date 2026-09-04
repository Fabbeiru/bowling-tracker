import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { SettingsStore } from '../../core/settings/settings-store';
import { applyDelivery, entryPosition, isComplete, scoreGame, undoLastDelivery } from '../../core/scoring';
import { createGame, Game } from '../../models';
import { Scoresheet } from '../../shared/components/scoresheet/scoresheet';
import { PinPad } from '../../shared/components/pin-pad/pin-pad';
import { PinRack, RackDelivery } from '../../shared/components/pin-rack/pin-rack';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { BackLink } from '../../shared/components/back-link/back-link';

const SAVE_ERROR = 'No se pudo guardar. Comprueba la conexión e inténtalo de nuevo.';

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
  readonly settings = inject(SettingsStore);

  readonly game = signal<Game | null>(null);
  readonly loading = signal(true);
  readonly totalInput = signal<number | null>(null);
  readonly notes = signal('');
  readonly countMode = signal(false);
  readonly confirmingDelete = signal(false);
  readonly addingGame = signal(false);

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

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    if (id) void this.load(id);
    else this.loading.set(false);
  }

  private async load(id: string): Promise<void> {
    try {
      const g = await this.repo.getGame(id);
      this.game.set(g ?? null);
      this.totalInput.set(g?.totalPins ?? null);
      this.notes.set(g?.notes ?? '');
    } catch {
      this.toast.error('No se pudo cargar la partida.');
    } finally {
      this.loading.set(false);
    }
  }

  async record(pins: number): Promise<void> {
    await this.apply({ pinsKnocked: pins });
  }

  async recordRack(d: RackDelivery): Promise<void> {
    await this.apply({ pinsKnocked: d.pinsKnocked, pinsStanding: d.pinsStanding });
  }

  private async apply(delivery: { pinsKnocked: number; pinsStanding?: number[] }): Promise<void> {
    const g = this.game();
    if (!g) return;
    const updated = applyDelivery(g, delivery);
    this.game.set(updated);
    this.countMode.set(false);
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
    this.countMode.set(false);
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
    const totalPins = raw === null ? undefined : Math.max(0, Math.min(300, Math.round(raw)));
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
      await this.router.navigate(['/games']);
    } catch {
      this.toast.error('No se pudo borrar la partida.');
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
      this.toast.error('No se pudo añadir la partida.');
    } finally {
      this.addingGame.set(false);
    }
  }

  async finish(): Promise<void> {
    if (this.game()?.detailLevel === 'total') await this.saveTotal();
    await this.router.navigate(['/games']);
  }
}
