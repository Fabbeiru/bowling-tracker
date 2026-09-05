import { IsoDateTime } from './common';

export interface AppSettings {
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
    locale: 'es',
  },
};
