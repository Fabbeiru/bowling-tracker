import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { SettingsStore } from '../../core/settings/settings-store';
import { applyDelivery, entryPosition, isComplete, scoreGame, undoLastDelivery } from '../../core/scoring';
import { Game } from '../../models';
import { Scoresheet } from '../../shared/components/scoresheet/scoresheet';
import { PinPad } from '../../shared/components/pin-pad/pin-pad';
import { PinRack, RackDelivery } from '../../shared/components/pin-rack/pin-rack';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-game-entry',
  imports: [FormsModule, RouterLink, TranslocoDirective, Scoresheet, PinPad, PinRack, ConfirmDialog],
  templateUrl: './game-entry.html',
  styleUrl: './game-entry.scss',
})
export class GameEntry {
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);
  readonly settings = inject(SettingsStore);

  readonly game = signal<Game | null>(null);
  readonly loading = signal(true);
  readonly totalInput = signal<number | null>(null);
  readonly notes = signal('');
  readonly countMode = signal(false);
  readonly confirmingDelete = signal(false);

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
    const g = await this.repo.getGame(id);
    this.game.set(g ?? null);
    this.totalInput.set(g?.totalPins ?? null);
    this.notes.set(g?.notes ?? '');
    this.loading.set(false);
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
    await this.repo.saveGame(updated);
  }

  async undo(): Promise<void> {
    const g = this.game();
    if (!g) return;
    const updated = undoLastDelivery(g);
    this.game.set(updated);
    this.countMode.set(false);
    await this.repo.saveGame(updated);
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
    await this.repo.saveGame(updated);
    this.game.set(updated);
  }

  async deleteGame(): Promise<void> {
    const g = this.game();
    this.confirmingDelete.set(false);
    if (!g) return;
    await this.repo.deleteGame(g.id);
    await this.router.navigate(['/games']);
  }

  async finish(): Promise<void> {
    if (this.game()?.detailLevel === 'total') await this.saveTotal();
    await this.router.navigate(['/games']);
  }
}
