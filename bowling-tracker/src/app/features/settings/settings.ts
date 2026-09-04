import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { StorageEstimate, StorageService } from '../../core/storage/storage.service';

/** Human-readable size, e.g. 1536 -> "1,5 KB". Locale `es` per app convention. */
function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exp;
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: value < 10 ? 1 : 0 })} ${units[exp]}`;
}

@Component({
  selector: 'app-settings',
  imports: [TranslocoDirective],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly storage = inject(StorageService);

  readonly loading = signal(true);
  readonly persisted = signal(false);
  readonly usage = signal<StorageEstimate | null>(null);

  readonly usagePct = computed(() => {
    const u = this.usage();
    if (!u || u.quota <= 0) return 0;
    return Math.min(100, Math.round((u.usage / u.quota) * 100));
  });

  readonly usageLabel = computed(() => {
    const u = this.usage();
    return u ? `${formatBytes(u.usage)} de ${formatBytes(u.quota)}` : null;
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const [persisted, usage] = await Promise.all([this.storage.isPersisted(), this.storage.estimate()]);
    this.persisted.set(persisted);
    this.usage.set(usage);
    this.loading.set(false);
  }
}
