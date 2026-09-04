/** New client-side identifier. */
export function newId(): string {
  return crypto.randomUUID();
}
