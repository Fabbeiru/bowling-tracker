import { Component, input, output } from '@angular/core';

/** One labeled `<select>` section inside an `app-filter-sheet` body. */
@Component({
  selector: 'app-filter-select',
  template: `
    <div class="sheet-section">
      <div class="sheet-section__label">{{ label() }}</div>
      <select
        class="sheet-select"
        [class.sheet-select--set]="value() !== 'all'"
        [attr.aria-label]="allLabel()"
        [value]="value()"
        (change)="valueChange.emit($any($event.target).value)"
      >
        <option value="all">{{ allLabel() }}</option>
        @for (o of options(); track o.id) {
          <option [value]="o.id">{{ o.name }}</option>
        }
      </select>
    </div>
  `,
  styles: `
    .sheet-section__label {
      font-family: var(--font-label);
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-soft);
      margin-bottom: 6px;
    }

    .sheet-select {
      width: 100%;
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      min-height: 46px;
      padding: 0.6rem 0.8rem;
      font: inherit;
      font-size: 0.9rem;
      color: var(--ink);

      &--set {
        border-color: var(--secondary);
        font-weight: 600;
      }
    }
  `,
})
export class FilterSelect {
  readonly label = input.required<string>();
  readonly allLabel = input.required<string>();
  readonly value = input.required<string>();
  readonly options = input.required<{ id: string; name: string }[]>();

  readonly valueChange = output<string>();
}
