import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { BundledTranslocoLoader } from './core/i18n/transloco-loader';
import { provideRepository } from './core/data/repository.providers';
import { providePersistenceRequest } from './core/storage/persistence.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideRepository(),
    providePersistenceRequest(),
    provideTransloco({
      config: {
        availableLangs: ['es'],
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: false,
        prodMode: !isDevMode(),
      },
      loader: BundledTranslocoLoader,
    }),
  ],
};
