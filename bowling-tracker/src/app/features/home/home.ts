import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslocoDirective],
  template: `
    <section class="screen" *transloco="let t">
      <header class="screen__head">
        <h1>{{ t('home.title') }}</h1>
        <p>{{ t('home.subtitle') }}</p>
      </header>

      <p class="local-note">{{ t('home.localNote') }}</p>

      <a class="record" routerLink="/games/new">{{ t('home.record') }}</a>

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
    .record {
      display: block;
      margin-top: 1rem;
      text-align: center;
      text-decoration: none;
      background: var(--accent);
      color: var(--accent-ink);
      font-family: var(--font-display);
      font-weight: 700;
      padding: 0.8rem;
      border-radius: var(--radius-sm);
    }
  `,
})
export class Home {}
