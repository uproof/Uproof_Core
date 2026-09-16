/** Lazy, memoized evaluation of line rules against one lead's inputs and one settings snapshot. */
import { total } from './functions';
import { definitionOf, type F2Field, type F2RowRule, type LineField, type LineRule } from './line';
import { LINES } from './rules';
import { F2_ROWS } from './rules/f2Form';
import { profilePrice, type Constants, type SettingsSnapshot } from './settings';

export const LINES_BY_ID = new Map(LINES.map((l) => [l.id, l]));
const LINE_ORDER = new Map(LINES.map((l, i) => [l.id, i]));
const F2_BY_ROW = new Map(F2_ROWS.filter((r): r is F2RowRule => r.kind === 'row').map((r) => [r.row, r]));

export type InputValue = number | string | boolean | null;
export type InputValues = Record<string, InputValue>;
export type FieldValues = Record<LineField, number>;
export type F2Values = Record<F2Field, number>;

/** A rule could not be evaluated (for example division by zero because a required input is 0). */
export class CalculationError extends Error {}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** What a rule expression receives. */
export interface RuleContext {
  inp: Record<string, number>;
  k: Constants;
  this: FieldValues;
  line(id: string): FieldValues;
  span(firstId: string, lastId: string, ...fields: LineField[]): number[];
  f2(row: number): F2Values;
  price(materialKey: string): number;
  norm(normKey: string): number;
  profile(detailKey: string, variant: string): number;
  countFilled(...keys: string[]): number;
}

export class Context {
  readonly settings: SettingsSnapshot;
  readonly k: Constants;
  readonly raw: InputValues;
  readonly inp: Record<string, number>;
  private memo = new Map<string, number>();
  private stack = new Set<string>();
  private views = new Map<string, RuleContext>();
  private fieldProxies = new Map<string, FieldValues>();

  constructor(settings: SettingsSnapshot, inputs: InputValues) {
    this.settings = settings;
    this.k = settings.constants;
    this.raw = inputs;
    this.inp = new Proxy({} as Record<string, number>, { get: (_t, key) => num(inputs[key as string]) });
  }

  // ---- resolvers ----
  price(key: string): number {
    const m = this.settings.materials[key];
    if (!m) throw new Error(`Unknown material '${key}'`);
    return num(m.price);
  }
  norm(key: string): number {
    const n = this.settings.laborNorms[key];
    if (!n) throw new Error(`Unknown labor norm '${key}'`);
    return num(n.hoursPerUnit);
  }
  profile(key: string, variant: string): number { return profilePrice(this.settings, key, variant); }
  countFilled(...keys: string[]): number { return keys.filter((k) => typeof this.raw[k] === 'number' || typeof this.raw[k] === 'boolean').length; }

  line(id: string): FieldValues {
    let p = this.fieldProxies.get(id);
    if (!p) {
      p = new Proxy({} as FieldValues, { get: (_t, f) => this.value(id, f as LineField) });
      this.fieldProxies.set(id, p);
    }
    return p;
  }

  span(firstId: string, lastId: string, ...fields: LineField[]): number[] {
    const a = LINE_ORDER.get(firstId)!, b = LINE_ORDER.get(lastId)!;
    const out: number[] = [];
    for (let i = a; i <= b; i++) for (const f of fields) out.push(this.value(LINES[i].id, f));
    return out;
  }

  f2(row: number): F2Values {
    return new Proxy({} as F2Values, { get: (_t, f) => this.f2Value(row, f as F2Field) });
  }

  private view(id: string): RuleContext {
    let v = this.views.get(id);
    if (!v) {
      v = {
        inp: this.inp, k: this.k, this: this.line(id),
        line: (x) => this.line(x), span: (a, b, ...f) => this.span(a, b, ...f), f2: (r) => this.f2(r),
        price: (x) => this.price(x), norm: (x) => this.norm(x), profile: (x, y) => this.profile(x, y), countFilled: (...x) => this.countFilled(...x),
      };
      this.views.set(id, v);
    }
    return v;
  }

  // ---- evaluation ----
  value(lineId: string, field: LineField): number {
    const key = `T|${lineId}|${field}`;
    const hit = this.memo.get(key);
    if (hit !== undefined) return hit;
    if (this.stack.has(key)) throw new CalculationError(`Circular reference at ${lineId}.${field}`);
    const rule = LINES_BY_ID.get(lineId);
    if (!rule) throw new Error(`Unknown line '${lineId}'`);
    const def = definitionOf(rule, field);
    this.stack.add(key);
    let v: unknown;
    try {
      v = typeof def === 'function' ? def(this.view(lineId)) : def;
    } finally {
      this.stack.delete(key);
    }
    if (typeof v === 'number' && !Number.isFinite(v)) throw new CalculationError(`Division by zero in ${lineId}.${field}`);
    const n = num(v);
    this.memo.set(key, n);
    return n;
  }

  f2Value(row: number, field: F2Field): number {
    const key = `F|${row}|${field}`;
    const hit = this.memo.get(key);
    if (hit !== undefined) return hit;
    const r = F2_BY_ROW.get(row);
    const def = r ? r[field] : undefined;
    const v = typeof def === 'function' ? def(this.view(`f2:${row}`)) : def;
    if (typeof v === 'number' && !Number.isFinite(v)) throw new CalculationError(`Division by zero in F2 row ${row}.${field}`);
    const n = num(v);
    this.memo.set(key, n);
    return n;
  }

  sumField(lineIds: readonly string[], field: LineField): number {
    return total(lineIds.map((id) => this.value(id, field)));
  }
}

export type { LineRule };
