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
  readonly usage = signal<StorageEstimate | null>(null);

  /** Just the space used — the browser's "quota" figure is an estimate of
   * free disk space, not a meaningful promise, and varies wildly by device
   * (huge on desktop, small and stricter on mobile); showing it invites the
   * wrong read, so we only surface what's actually stored. */
  readonly usageLabel = computed(() => {
    const u = this.usage();
    return u ? formatBytes(u.usage) : null;
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.usage.set(await this.storage.estimate());
    this.loading.set(false);
  }
}
