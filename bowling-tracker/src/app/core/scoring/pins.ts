/**
 * Pin geometry for the standard ten-pin triangle:
 *
 * ```
 *     7  8  9  10
 *      4  5  6
 *       2  3
 *        1
 * ```
 */

/** Pairs of pins that physically touch. */
const ADJACENT: readonly (readonly [number, number])[] = [
  [1, 2], [1, 3],
  [2, 3], [2, 4], [2, 5],
  [3, 5], [3, 6],
  [4, 5], [4, 7], [4, 8],
  [5, 6], [5, 8], [5, 9],
  [6, 9], [6, 10],
  [7, 8],
  [8, 9],
  [9, 10],
];

const NEIGHBOURS: ReadonlyMap<number, readonly number[]> = (() => {
  const m = new Map<number, number[]>();
  for (let p = 1; p <= 10; p++) m.set(p, []);
  for (const [a, b] of ADJACENT) {
    m.get(a)!.push(b);
    m.get(b)!.push(a);
  }
  return m;
})();

/**
 * A split (USBC): after the first ball the headpin (1) is down and the
 * standing pins form two or more non-adjacent groups.
 *
 * `standing` is the set of pin numbers left after the first delivery.
 */
export function isSplit(standing: readonly number[]): boolean {
  const set = new Set(standing);
  if (set.has(1) || set.size < 2) return false;

  // Count connected components among the standing pins.
  const seen = new Set<number>();
  let components = 0;
  for (const pin of set) {
    if (seen.has(pin)) continue;
    components++;
    if (components > 1) return true;
    const stack = [pin];
    while (stack.length) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const nb of NEIGHBOURS.get(cur) ?? []) {
        if (set.has(nb) && !seen.has(nb)) stack.push(nb);
      }
    }
  }
  return components > 1;
}
