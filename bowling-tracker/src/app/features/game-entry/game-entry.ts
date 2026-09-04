import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { applyDelivery, entryPosition, isComplete, scoreGame, undoLastDelivery } from '../../core/scoring';
import { Game } from '../../models';
import { Scoresheet } from '../../shared/components/scoresheet/scoresheet';
import { PinPad } from '../../shared/components/pin-pad/pin-pad';
import { PinRack, RackDelivery } from '../../shared/components/pin-rack/pin-rack';

@Component({
  selector: 'app-game-entry',
  imports: [FormsModule, RouterLink, TranslocoDirective, Scoresheet, PinPad, PinRack],
  templateUrl: './game-entry.html',
  styleUrl: './game-entry.scss',
})
export class GameEntry {
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);

  readonly game = signal<Game | null>(null);
  readonly loading = signal(true);
  readonly totalInput = signal<number | null>(null);
  /** In "throw" games, enter this ball as a bare count instead of marking pins. */
  readonly countMode = signal(false);

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
    const updated: Game = { ...g, totalPins };
    await this.repo.saveGame(updated);
    this.game.set(updated);
  }

  async finish(): Promise<void> {
    if (this.game()?.detailLevel === 'total') await this.saveTotal();
    await this.router.navigate(['/games']);
  }
}
