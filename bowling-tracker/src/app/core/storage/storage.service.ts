import { Injectable } from '@angular/core';

export interface StorageEstimate {
  usage: number;
  quota: number;
}

/**
 * Wraps the Storage API. Data lives only in this browser (docs/adr/0002), so we
 * ask the browser to keep it (not evict under disk pressure) and expose usage
 * for the Settings screen.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /**
   * Ask for persistent storage. Returns whether it is granted. Some browsers
   * decide by engagement heuristics, others prompt; safe to call at startup.
   */
  async requestPersistence(): Promise<boolean> {
    if (!navigator.storage?.persist) {
      return false;
    }
    if (await navigator.storage.persisted()) {
      return true;
    }
    return navigator.storage.persist();
  }

  async estimate(): Promise<StorageEstimate | null> {
    if (!navigator.storage?.estimate) {
      return null;
    }
    const { usage, quota } = await navigator.storage.estimate();
    return { usage: usage ?? 0, quota: quota ?? 0 };
  }
}
