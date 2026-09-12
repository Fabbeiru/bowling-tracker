import { Component, input, output } from '@angular/core';

/** The "Filtros" pill that opens an `app-filter-sheet`, with an active-count badge. */
@Component({
  selector: 'app-filter-trigger',
  template: `
    <button type="button" class="filters-trigger" (click)="opened.emit()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="7" y1="12" x2="17" y2="12"></line>
        <line x1="10" y1="18" x2="14" y2="18"></line>
      </svg>
      {{ label() }}
      @if (count() > 0) {
        <span class="filter-count">{{ count() }}</span>
      }
    </button>
  `,
  styles: `
    .filters-trigger {
      position: relative;
      flex: none;
      display: flex;
      align-items: center;
      gap: 6px;
      min-height: 40px;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface-2);
      color: var(--ink);
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;

      svg {
        width: 15px;
        height: 15px;
        color: var(--ink-soft);
        flex: none;
      }
    }

    .filter-count {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--accent);
      color: var(--accent-ink);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.62rem;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      border: 2px solid var(--bg);
    }
  `,
})
export class FilterTrigger {
  readonly label = input.required<string>();
  readonly count = input(0);

  readonly opened = output<void>();
}
