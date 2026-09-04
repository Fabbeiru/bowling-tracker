import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { computeStats } from '../../core/stats/stats';

@Component({
  selector: 'app-stats',
  imports: [TranslocoDirective],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats {
  private readonly repo = inject(Repository);

  readonly loading = signal(true);
  readonly stats = signal(computeStats([]));

  /** Sparkline bar heights (%), most recent last. Scaled to the score range so
   *  real variation is visible. */
  readonly bars = computed(() => {
    const scores = this.stats().evolution.slice(-24);
    if (scores.length === 0) return [];
    const lo = Math.max(0, Math.min(...scores) - 15);
    const hi = Math.max(...scores) + 5;
    const span = Math.max(1, hi - lo);
    return scores.map((s) => Math.max(6, Math.round(((s - lo) / span) * 100)));
  });

  constructor() {
    void this.load();
  }

  pct(value: number | null): string {
    return value === null ? '—' : `${value}%`;
  }

  private async load(): Promise<void> {
    const games = await this.repo.listGames();
    this.stats.set(computeStats(games));
    this.loading.set(false);
  }
}
