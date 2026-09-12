import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { computeStats } from '../../core/stats/stats';
import { hasVisitedSettings } from '../../core/util/visited-settings';
import { Tile } from '../../shared/components/tile/tile';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslocoDirective, Tile],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly repo = inject(Repository);

  readonly loading = signal(true);
  readonly stats = signal(computeStats([]));
  readonly hasGames = computed(() => this.stats().summary.games > 0);
  readonly last = computed(() => this.stats().evolution.at(-1) ?? null);

  /** First-steps checklist — each item checks off against real data, not
   *  just "you clicked once": adding a ball/venue and later deleting it all
   *  correctly un-checks it again. Visiting Ajustes is the one exception
   *  (nothing to count), tracked as a one-way "seen it" flag instead. */
  readonly hasBalls = signal(false);
  readonly hasVenues = signal(false);
  readonly visitedSettings = signal(false);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const [games, balls, venues] = await Promise.all([
      this.repo.listGames(),
      this.repo.listBalls({ includeInactive: true }),
      this.repo.listVenues({ includeInactive: true }),
    ]);
    this.stats.set(computeStats(games));
    this.hasBalls.set(balls.length > 0);
    this.hasVenues.set(venues.length > 0);
    this.visitedSettings.set(hasVisitedSettings());
    this.loading.set(false);
  }
}
