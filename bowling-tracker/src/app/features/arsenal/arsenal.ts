import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { Ball, Venue } from '../../models';

@Component({
  selector: 'app-arsenal',
  imports: [RouterLink, TranslocoDirective],
  templateUrl: './arsenal.html',
  styleUrl: './arsenal.scss',
})
export class Arsenal {
  private readonly repo = inject(Repository);

  readonly balls = signal<Ball[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const [balls, venues] = await Promise.all([
      this.repo.listBalls({ includeInactive: true }),
      this.repo.listVenues({ includeInactive: true }),
    ]);
    this.balls.set(balls);
    this.venues.set(venues);
    this.loading.set(false);
  }
}
