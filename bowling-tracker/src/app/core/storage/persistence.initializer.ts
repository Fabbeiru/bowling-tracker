import {
  EnvironmentProviders,
  inject,
  provideAppInitializer,
} from '@angular/core';

import { StorageService } from './storage.service';

/** Requests persistent storage once, on startup. Never blocks bootstrap. */
export function providePersistenceRequest(): EnvironmentProviders {
  return provideAppInitializer(() => {
    void inject(StorageService)
      .requestPersistence()
      .catch(() => undefined);
  });
}
