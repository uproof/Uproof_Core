/** Spreadsheet-compatible helpers used by the rule modules. */

export const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const toNumber = (v: unknown): number => (isNum(v) ? v : 0);

/** Excel ROUNDUP(x, 0), evaluated on the 15-significant-digit value (1.1 × 100 gives 110, not 111). */
export function ceilUp(x: number, _digits = 0): number {
  const v = Number(toNumber(x).toPrecision(15));
  return v >= 0 ? Math.ceil(v) : Math.floor(v);
}

/** Excel SUM over numbers and nested arrays; blanks and text count as 0. */
export function total(...values: unknown[]): number {
  let s = 0;
  const stack: unknown[] = [...values];
  while (stack.length) {
    const v = stack.pop();
    if (Array.isArray(v)) stack.push(...v);
    else s += toNumber(v);
  }
  return s;
}

export function if_<T>(condition: unknown, whenTrue: T, whenFalse: T): T {
  return condition ? whenTrue : whenFalse;
}

/** Excel IFERROR: any error or non-finite result (division by zero) gives the fallback. */
export function iferror(compute: () => number, fallback: number): number {
  try {
    const v = compute();
    return Number.isFinite(v) ? v : fallback;
  } catch {
    return fallback;
  }
}
