import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import es from '../app/core/i18n/es.json';

/** Transloco set up with the real `es` translations for component tests. */
export function translocoTestingModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { es },
    translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
    preloadLangs: true,
    ...options,
  });
}
