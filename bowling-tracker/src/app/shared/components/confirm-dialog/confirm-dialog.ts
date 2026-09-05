import { Component, input, output } from '@angular/core';

/** In-app confirmation. Never use the browser's native confirm(). */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  /** Optional extra action (e.g. "Export first"); shown only when set. Does not close the dialog. */
  readonly tertiaryLabel = input('');
  readonly danger = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly tertiary = output<void>();
}
