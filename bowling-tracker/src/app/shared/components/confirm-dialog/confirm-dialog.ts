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
  readonly danger = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
