import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { Venue } from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';

@Component({
  selector: 'app-venues',
  imports: [RouterLink, TranslocoDirective, BackLink],
  templateUrl: './venues.html',
  styleUrl: '../arsenal/arsenal.scss',
})
export class Venues {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);

  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.venues.set(await this.repo.listVenues({ includeInactive: true }));
    } catch {
      this.toast.error('errors.loadVenues');
    } finally {
      this.loading.set(false);
    }
  }
}
