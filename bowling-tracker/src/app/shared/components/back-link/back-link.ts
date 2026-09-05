import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Consistent "‹ back" affordance for secondary screens (forms, game entry). */
@Component({
  selector: 'app-back-link',
  imports: [RouterLink],
  template: `
    <a class="back-link" [routerLink]="to()">
      <span aria-hidden="true">‹</span>
      {{ label() }}
    </a>
  `,
  styles: `
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      min-height: 40px;
      margin-bottom: 0.4rem;
      color: var(--ink-soft);
      text-decoration: none;
      font-size: 0.85rem;
      font-family: var(--font-label);
    }
    .back-link span {
      font-size: 1.1rem;
      line-height: 1;
    }
  `,
})
export class BackLink {
  readonly to = input.required<string | unknown[]>();
  readonly label = input.required<string>();
}
