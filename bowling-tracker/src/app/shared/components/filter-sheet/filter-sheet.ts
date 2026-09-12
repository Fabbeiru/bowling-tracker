import { Component, HostListener, input, output } from '@angular/core';

/**
 * Bottom sheet shell for a screen's non-always-visible filters (Estadísticas,
 * Partidas): backdrop + slide-up panel, header with a close button, a footer
 * with "Limpiar"/"Cerrar". The caller projects one `app-filter-select` per
 * filter as the body; this component only owns the chrome (open/close,
 * Escape, backdrop click) and the shared frame styling.
 */
@Component({
  selector: 'app-filter-sheet',
  templateUrl: './filter-sheet.html',
  styleUrl: './filter-sheet.scss',
})
export class FilterSheet {
  readonly open = input.required<boolean>();
  readonly heading = input.required<string>();
  readonly clearLabel = input.required<string>();
  readonly closeLabel = input.required<string>();

  readonly closeSheet = output<void>();
  readonly clearFilters = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closeSheet.emit();
  }
}
