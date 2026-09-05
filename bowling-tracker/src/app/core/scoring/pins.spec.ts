import { isSplit } from './pins';

describe('isSplit', () => {
  it('is a split for the 7-10 (bedposts)', () => {
    expect(isSplit([7, 10])).toBe(true);
  });

  it('is a split for the big four (4-6-7-10)', () => {
    expect(isSplit([4, 6, 7, 10])).toBe(true);
  });

  it('is a split for the 5-7', () => {
    expect(isSplit([5, 7])).toBe(true);
  });

  it('is a split for the 3-10 (baby split)', () => {
    expect(isSplit([3, 10])).toBe(true);
  });

  it('is NOT a split when the headpin is still standing', () => {
    expect(isSplit([1, 2, 4, 7])).toBe(false);
  });

  it('is NOT a split for a single pin', () => {
    expect(isSplit([10])).toBe(false);
    expect(isSplit([7])).toBe(false);
  });

  it('is NOT a split when the standing pins are all adjacent (a bucket)', () => {
    // 2-4-5-8: one connected cluster on the left
    expect(isSplit([2, 4, 5, 8])).toBe(false);
  });

  it('is NOT a split for an empty rack', () => {
    expect(isSplit([])).toBe(false);
  });
});
