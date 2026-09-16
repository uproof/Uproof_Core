import { describe, expect, it } from 'vitest';
import bundleJson from '@/workbook-ui/data/engineBundle.json';
import golden from './__fixtures__/golden.dimzukalns.json';
import { EngineCore, runEstimate, type EngineBundle, type InputValues } from './index';

const bundle = bundleJson as unknown as EngineBundle;
const inputs = Object.fromEntries(bundle.inputs.map((i) => [i.k, i.v])) as InputValues;
const terms = { client: '', address: '', discount: 2000, vatRate: 0, startDate: '2026-09-08' };
const close = (a: number, b: number) => Math.abs((a || 0) - (b || 0)) <= 1e-6 * Math.max(1, Math.abs(b || 0));

describe('parity with workbook (Dimzukalns lead)', () => {
  const core = new EngineCore(bundle);
  const run = runEstimate(bundle, bundle.settings, inputs, terms, core);
  const g = golden as unknown as Record<string, any>;

  it('reproduces every non-zero Tāme cell', () => {
    const misses: string[] = [];
    for (const [row, cells] of Object.entries(g.tame_rows as Record<string, Record<string, number>>))
      for (const [col, v] of Object.entries(cells)) if (typeof v === 'number' && !close(core.C('T', +row, col), v)) misses.push(col + row);
    expect(misses).toEqual([]);
  });
  it('reproduces summary, F2 and offer totals', () => {
    expect(close(run.summary.offer, g.kopsavilkums['Piedāvājamā summa:'])).toBe(true);
    expect(close(run.f2.exVat, g.f2_totals.O299)).toBe(true);
    expect(close(run.f2.hours, g.f2_totals.K292)).toBe(true);
    expect(close(run.offer.total, g.piedavajums.F34.value)).toBe(true);
    expect(run.offer.days).toBe(g.piedavajums.F38.value);
  });
  it('reproduces the work plan', () => {
    run.workPlan.forEach((w, i) => expect(close(w.end, g.work_plan[i].end)).toBe(true));
  });
});
