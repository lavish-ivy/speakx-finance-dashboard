/**
 * Chart math utilities shared across pages.
 *
 * Extracted from CashPage when the Balance Sheet audit needed the same
 * symmetric-tick behaviour for its asset + liability charts. Two copies of a
 * 15-line algorithm is the threshold at which DRY beats YAGNI.
 */

export interface NiceAxis {
  lo: number;
  hi: number;
  ticks: number[];
}

/**
 * Pick a visually clean Y-axis range for a numeric series.
 *
 * - Snaps `lo` and `hi` to multiples of a "nice" step (1, 2, 5 × 10^n).
 * - Produces roughly `targetTicks` gridlines with human-readable values.
 * - Replaces asymmetric `min * 0.9 / max * 1.15` padding which visually
 *   exaggerates small swings and rounds tick labels to awkward numbers.
 */
export function niceAxis(min: number, max: number, targetTicks = 5): NiceAxis {
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.1, 1);
    return niceAxis(min - pad, max + pad, targetTicks);
  }
  const span = max - min;
  const rawStep = span / (targetTicks - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 0.5; v += step) ticks.push(+v.toFixed(6));
  return { lo, hi, ticks };
}
