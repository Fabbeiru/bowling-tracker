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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
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
