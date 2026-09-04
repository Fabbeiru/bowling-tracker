import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  imports: [TranslocoDirective],
  template: `
    <section class="screen" *transloco="let t">
      <header class="screen__head">
        <h1>{{ t('home.title') }}</h1>
        <p>{{ t('home.subtitle') }}</p>
      </header>

      <p class="local-note">{{ t('home.localNote') }}</p>

      <div class="empty-state">
        <p class="empty-state__title">{{ t('home.emptyTitle') }}</p>
        <p class="empty-state__hint">{{ t('home.emptyHint') }}</p>
      </div>
    </section>
  `,
  styles: `
    .local-note {
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      padding: 0.75rem 0.9rem;
      font-size: 0.85rem;
      color: var(--ink-soft);
    }
  `,
})
export class Home {}
