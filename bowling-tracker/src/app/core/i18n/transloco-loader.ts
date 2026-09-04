import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

import es from './es.json';

/**
 * Single-language app: translations are bundled, not fetched. When a second
 * language is added, register it here (or switch to an HTTP loader).
 */
@Injectable({ providedIn: 'root' })
export class BundledTranslocoLoader implements TranslocoLoader {
  private readonly translations: Record<string, Translation> = { es };

  getTranslation(lang: string): Promise<Translation> {
    return Promise.resolve(this.translations[lang] ?? this.translations['es']);
  }
}
