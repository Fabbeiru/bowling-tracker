// Test environment setup (Vitest + jsdom).
// jsdom has no IndexedDB; fake-indexeddb provides an in-memory implementation
// so the Dexie repository can be tested without a browser.
import 'fake-indexeddb/auto';
