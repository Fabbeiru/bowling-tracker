/**
 * New client-side identifier.
 *
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS, or localhost).
 * When testing over the LAN with plain HTTP (e.g. `http://192.168.x.x:4200`)
 * it is `undefined`, which used to make every save silently throw. Fall back
 * to building a UUID v4 from `crypto.getRandomValues`, which has no such
 * restriction.
 */
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}
