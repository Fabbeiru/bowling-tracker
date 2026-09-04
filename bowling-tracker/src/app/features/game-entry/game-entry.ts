import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { scoreGame } from '../../core/scoring';
import { Game } from '../../models';
import { Scoresheet } from '../../shared/components/scoresheet/scoresheet';

@Component({
  selector: 'app-game-entry',
  imports: [FormsModule, RouterLink, TranslocoDirective, Scoresheet],
  templateUrl: './game-entry.html',
  styleUrl: './game-entry.scss',
})
export class GameEntry {
  private readonly repo = inject(Repository);
  private readonly router = inject(Router);

  readonly game = signal<Game | null>(null);
  readonly loading = signal(true);
  readonly totalInput = signal<number | null>(null);

  readonly score = computed(() => {
    const g = this.game();
    return g ? scoreGame(g) : null;
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
    await this.saveTotal();
    await this.router.navigate(['/games']);
  }
}
