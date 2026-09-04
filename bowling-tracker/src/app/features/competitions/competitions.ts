import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import { ToastService } from '../../core/errors/toast.service';
import { Competition } from '../../models';
import { BackLink } from '../../shared/components/back-link/back-link';

@Component({
  selector: 'app-competitions',
  imports: [RouterLink, TranslocoDirective, BackLink],
  templateUrl: './competitions.html',
  styleUrl: '../arsenal/arsenal.scss',
})
export class Competitions {
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);

  readonly competitions = signal<Competition[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.competitions.set(await this.repo.listCompetitions({ includeInactive: true }));
    } catch {
      this.toast.error('errors.loadCompetitions');
    } finally {
      this.loading.set(false);
    }
  }
}
