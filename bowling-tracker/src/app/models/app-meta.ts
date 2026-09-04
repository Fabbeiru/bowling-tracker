import { IsoDateTime } from './common';

export interface AppSettings {
  /** Hide the "maximum possible score" projection during a game. */
  hideMaxProjection: boolean;
  locale: 'es';
}

/** Single record (id `'app'`) with schema version and preferences. */
export interface AppMeta {
  id: 'app';
  schemaVersion: number;
  lastBackupAt?: IsoDateTime;
  settings: AppSettings;
}

export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_META: AppMeta = {
  id: 'app',
  schemaVersion: CURRENT_SCHEMA_VERSION,
  settings: {
    hideMaxProjection: false,
    locale: 'es',
  },
};
