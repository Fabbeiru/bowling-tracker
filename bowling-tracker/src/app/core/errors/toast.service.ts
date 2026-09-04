import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'error' | 'info';
}

/**
 * Visible feedback for failures (COMPORTAMIENTO-TRANSVERSAL §6): a write that
 * fails must never fail silently.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private counter = 0;

  error(text: string): void {
    this.show(text, 'error');
  }

  info(text: string): void {
    this.show(text, 'info');
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
