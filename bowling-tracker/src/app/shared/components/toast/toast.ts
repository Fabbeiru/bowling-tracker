import { Component, inject } from '@angular/core';

import { ToastService } from '../../../core/errors/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastHost {
  protected readonly toast = inject(ToastService);
}
