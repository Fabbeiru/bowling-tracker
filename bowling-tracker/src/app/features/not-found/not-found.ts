import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslocoDirective],
  template: `
    <section class="screen" *transloco="let t">
      <div class="empty-state">
        <h1 class="empty-state__title">{{ t('notFound.title') }}</h1>
        <p class="empty-state__hint">{{ t('notFound.hint') }}</p>
        <a routerLink="/home" class="back">{{ t('notFound.back') }}</a>
      </div>
    </section>
  `,
  styles: `
    .back {
      margin-top: 0.6rem;
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 0 1rem;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      color: var(--secondary);
      text-decoration: none;
      font-weight: 600;
    }
  `,
})
export class NotFound {}
