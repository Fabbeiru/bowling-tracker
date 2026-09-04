import { Id } from '../../models';

/** New client-side identifier. */
export function newId(): Id {
  return crypto.randomUUID();
}
