import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { computeStats } from '../../core/stats/stats';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslocoDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly repo = inject(Repository);

  readonly loading = signal(true);
  readonly stats = signal(computeStats([]));
  readonly hasGames = computed(() => this.stats().summary.games > 0);
  readonly last = computed(() => this.stats().evolution.at(-1) ?? null);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.stats.set(computeStats(await this.repo.listGames()));
    this.loading.set(false);
  }
}
