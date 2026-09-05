import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Repository } from '../../core/data/repository';
import {
  AppData,
  ImportSummary,
  MAX_IMPORT_BYTES,
  parseImport,
  serializeExport,
} from '../../core/data/data-transfer';
import { ToastService } from '../../core/errors/toast.service';
import { StorageEstimate, StorageService } from '../../core/storage/storage.service';
import { Theme, ThemeService } from '../../core/theme/theme.service';
import { todayLocalIso } from '../../core/util/dates';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

/** Human-readable size, e.g. 1536 -> "1,5 KB". Locale `es` per app convention. */
function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exp;
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: value < 10 ? 1 : 0 })} ${units[exp]}`;
}

const JSON_TYPES = ['application/json', 'text/json', 'text/plain', ''];

@Component({
  selector: 'app-settings',
  imports: [TranslocoDirective, ConfirmDialog],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly storage = inject(StorageService);
  private readonly themeService = inject(ThemeService);
  private readonly repo = inject(Repository);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly theme = this.themeService.theme;
  readonly loading = signal(true);
  readonly usage = signal<StorageEstimate | null>(null);

  readonly busy = signal<'export' | 'import' | 'clear' | null>(null);
  /** A validated import, waiting for the user to confirm the replace. */
  readonly pendingImport = signal<{ data: AppData; summary: ImportSummary } | null>(null);
  readonly confirmingClear = signal(false);

  setTheme(theme: Theme): void {
    this.themeService.set(theme);
  }

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

  // --- Export ---

  async exportData(): Promise<void> {
    if (this.busy()) return;
    this.busy.set('export');
    try {
      const json = serializeExport(await this.repo.exportData());
      const filename = `bowling-tracker-${todayLocalIso()}.json`;
      const file = new File([json], filename, { type: 'application/json' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      // A cancelled share sheet throws AbortError — not an error worth a toast.
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        this.toast.error('errors.exportFailed');
      }
    } finally {
      this.busy.set(null);
    }
  }

  // --- Import ---

  pickFile(): void {
    if (this.busy()) return;
    this.fileInput().nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow re-picking the same file later
    if (!file) return;

    if (file.size === 0) return this.toast.error('errors.importEmpty');
    if (file.size > MAX_IMPORT_BYTES) return this.toast.error('errors.importTooBig');
    if (!file.name.toLowerCase().endsWith('.json')) return this.toast.error('errors.importNotJson');
    if (!JSON_TYPES.includes(file.type)) return this.toast.error('errors.importNotJson');

    this.busy.set('import');
    try {
      const text = await file.text();
      const result = parseImport(text);
      if (!result.ok) {
        this.toast.error(result.error);
        return;
      }
      this.pendingImport.set({ data: result.data, summary: result.summary });
    } catch {
      this.toast.error('errors.importNotJson');
    } finally {
      this.busy.set(null);
    }
  }

  async confirmImport(): Promise<void> {
    const pending = this.pendingImport();
    if (!pending || this.busy()) return;
    this.busy.set('import');
    try {
      await this.repo.replaceData(pending.data);
      this.pendingImport.set(null);
      await this.reloadHome();
    } catch {
      this.toast.error('errors.importFailed');
      this.busy.set(null);
    }
  }

  // --- Clear ---

  async clearData(): Promise<void> {
    if (this.busy()) return;
    this.busy.set('clear');
    try {
      await this.repo.clearData();
      this.confirmingClear.set(false);
      await this.reloadHome();
    } catch {
      this.toast.error('errors.clearFailed');
      this.busy.set(null);
    }
  }

  /** After a replace/clear, drop every stale in-memory signal by reloading. */
  private async reloadHome(): Promise<void> {
    await this.router.navigateByUrl('/home');
    location.reload();
  }
}
