import { paginateByItemCount } from './paginate';

function row(games: number): { games: number } {
  return { games };
}
const n = (r: { games: number }) => r.games;

describe('paginateByItemCount', () => {
  it('packs several small rows onto one page up to the target size', () => {
    const pages = paginateByItemCount([row(3), row(3), row(3)], n, 10);
    expect(pages).toEqual([[row(3), row(3), row(3)]]);
  });

  it('starts a new page instead of overshooting when the next row would not fit', () => {
    // 3 sessions of 3 games (9 total), then one of 6 — adding it would make 15.
    const rows = [row(3), row(3), row(3), row(6)];
    const pages = paginateByItemCount(rows, n, 10);
    expect(pages).toEqual([[row(3), row(3), row(3)], [row(6)]]);
  });

  it('never splits a single row, even one bigger than the page size', () => {
    const rows = [row(4), row(15), row(2)];
    const pages = paginateByItemCount(rows, n, 10);
    // The oversized row gets its own page rather than being dropped or cut.
    expect(pages).toEqual([[row(4)], [row(15)], [row(2)]]);
  });

  it('an oversized row still starts the very first page on its own', () => {
    const pages = paginateByItemCount([row(15), row(3)], n, 10);
    expect(pages).toEqual([[row(15)], [row(3)]]);
  });

  it('returns a single empty page for no rows', () => {
    expect(paginateByItemCount<{ games: number }>([], n, 10)).toEqual([[]]);
  });

  it('exact fit lands on one page, the next row starts a new one', () => {
    const pages = paginateByItemCount([row(5), row(5), row(1)], n, 10);
    expect(pages).toEqual([[row(5), row(5)], [row(1)]]);
  });
});
