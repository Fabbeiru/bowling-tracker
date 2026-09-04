import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export interface Toast {
  id: number;
  text: string;
  kind: 'error' | 'info';
}

/**
 * Visible feedback for failures (COMPORTAMIENTO-TRANSVERSAL §6): a write that
 * fails must never fail silently.
 *
 * `error`/`info` take an i18n key (e.g. `'errors.saveBall'`), not literal
 * text — the toast text stays in `core/i18n/es.json` like every other
 * user-visible string (ADR 0009).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly i18n = inject(TranslocoService);
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private counter = 0;

  error(key: string): void {
    this.show(this.i18n.translate(key), 'error');
  }

  info(key: string): void {
    this.show(this.i18n.translate(key), 'info');
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private show(text: string, kind: Toast['kind'], ttlMs = 5000): void {
    const id = ++this.counter;
    this._toasts.update((list) => [...list, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), ttlMs);
  }
}
