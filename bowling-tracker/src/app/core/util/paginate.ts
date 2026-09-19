/**
 * Buckets rows into pages of ~`pageSize` *items* (via `itemCount`), without
 * ever splitting a single row's items across two pages — a row here is a
 * session, its items are that session's games.
 *
 * The cut is decided *before* adding a row, not after: a row is refused only
 * when the page already has something AND adding it would push the running
 * count past `pageSize`. So a row bigger than `pageSize` on its own still
 * always lands somewhere (never dropped) — it just starts a fresh page
 * instead of tipping over one that's already filling up.
 */
export function paginateByItemCount<T>(rows: T[], itemCount: (row: T) => number, pageSize: number): T[][] {
  const pages: T[][] = [];
  let current: T[] = [];
  let count = 0;
  for (const row of rows) {
    const n = itemCount(row);
    if (current.length > 0 && count + n > pageSize) {
      pages.push(current);
      current = [];
      count = 0;
    }
    current.push(row);
    count += n;
  }
  if (current.length > 0) pages.push(current);
  return pages.length > 0 ? pages : [[]];
}
