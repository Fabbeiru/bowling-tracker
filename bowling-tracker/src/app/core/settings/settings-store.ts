import { computed, inject, Injectable, signal } from '@angular/core';

import { Repository } from '../data/repository';
import { AppMeta, DEFAULT_META } from '../../models';

/** App-wide settings backed by the `meta` record. */
@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly repo = inject(Repository);
  private readonly meta = signal<AppMeta>(DEFAULT_META);

  readonly hideMaxProjection = computed(() => this.meta().settings.hideMaxProjection);

  constructor() {
    void this.repo.getMeta().then((m) => this.meta.set(m));
  }

  async setHideMaxProjection(hide: boolean): Promise<void> {
    const next: AppMeta = {
      ...this.meta(),
      settings: { ...this.meta().settings, hideMaxProjection: hide },
    };
    this.meta.set(next);
    await this.repo.saveMeta(next);
  }

  toggleHideMaxProjection(): Promise<void> {
    return this.setHideMaxProjection(!this.hideMaxProjection());
  }
}
