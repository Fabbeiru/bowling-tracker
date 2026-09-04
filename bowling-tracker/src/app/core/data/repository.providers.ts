import { Provider } from '@angular/core';

import { DexieRepository } from './dexie-repository';
import { Repository } from './repository';

/** Binds the {@link Repository} contract to the IndexedDB implementation. */
export function provideRepository(): Provider[] {
  return [{ provide: Repository, useExisting: DexieRepository }];
}
