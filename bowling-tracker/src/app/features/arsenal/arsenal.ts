import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { Ball, Venue } from '../../models';
import { BallAvatar } from '../../shared/components/ball-avatar/ball-avatar';

@Component({
  selector: 'app-arsenal',
  imports: [RouterLink, TranslocoDirective, BallAvatar],
  templateUrl: './arsenal.html',
  styleUrl: './arsenal.scss',
})
export class Arsenal {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);

  readonly balls = signal<Ball[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const [balls, venues] = await Promise.all([
        this.repo.listBalls({ includeInactive: true }),
        this.repo.listVenues({ includeInactive: true }),
      ]);
      this.balls.set(balls);
      this.venues.set(venues);
    } catch {
      this.toast.error('errors.loadArsenal');
    } finally {
      this.loading.set(false);
    }
  }
}
