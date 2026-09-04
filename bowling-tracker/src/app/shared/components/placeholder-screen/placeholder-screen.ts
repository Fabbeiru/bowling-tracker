import { Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

/**
 * Temporary screen for sections not built yet: localized header + empty state.
 * `scope` is the i18n key prefix (e.g. "games" -> games.title, games.subtitle,
 * games.emptyTitle, games.emptyHint).
 */
@Component({
  selector: 'app-placeholder-screen',
  imports: [TranslocoDirective],
  template: `
    <section class="screen" *transloco="let t">
      <header class="screen__head">
        <h1>{{ t(scope() + '.title') }}</h1>
        <p>{{ t(scope() + '.subtitle') }}</p>
      </header>

      <div class="empty-state">
        <p class="empty-state__title">{{ t(scope() + '.emptyTitle') }}</p>
        <p class="empty-state__hint">{{ t(scope() + '.emptyHint') }}</p>
      </div>
    </section>
  `,
})
export class PlaceholderScreen {
  readonly scope = input.required<string>();
}
