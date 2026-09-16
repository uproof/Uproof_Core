import { ceil0, compileExpr, xsum } from './dsl';
import type { CellDef, EngineBundle, EngineSettings, InputValues, LineResult, MaterialSetting, LaborNormSetting, SheetMetalDetailSetting, Constants } from './types';

type Sheet = 'T' | 'F';
const cols = (a: string, b: string) => Array.from({ length: b.charCodeAt(0) - a.charCodeAt(0) + 1 }, (_, i) => String.fromCharCode(a.charCodeAt(0) + i));
const keyOf = (row: number, col: string) => row * 100 + col.charCodeAt(0);

/**
 * Cell evaluator for the line catalogs (Tāme = 'T', F2 forma = 'F').
 * Lazy + memoized: a cell is computed the first time something asks for it.
 */
export class EngineCore {
  readonly bundle: EngineBundle;
  private defs: Record<Sheet, Map<number, CellDef>> = { T: new Map(), F: new Map() };
  private memo = new Map<string, number>();
  private stack = new Set<string>();
  private env: Record<string, unknown>;

  settings!: EngineSettings;
  inputs!: InputValues;
  k!: Constants;
  private mat: Record<string, MaterialSetting> = {};
  private norm: Record<string, LaborNormSetting> = {};
  private sd: Record<string, SheetMetalDetailSetting> = {};

  constructor(bundle: EngineBundle) {
    this.bundle = bundle;
    for (const r of bundle.tame) for (const [c, d] of Object.entries(r.x)) this.defs.T.set(keyOf(r.r, c), d);
    for (const r of bundle.f2) if (r.x) for (const [c, d] of Object.entries(r.x)) this.defs.F.set(keyOf(r.r, c), d);
    this.env = {
      ceil0,
      sum: xsum,
      IF: (c: unknown, a: unknown, b: unknown) => (c ? a : b),
      iferror: (fn: () => number, alt: number) => { try { const v = fn(); return isFinite(v) ? v : alt; } catch { return alt; } },
      countIn: (ks: string[]) => ks.filter((k) => typeof this.inputs[k] === 'number').length,
      R: (sh: Sheet, a: number, b: number, c1: string, c2: string) => this.R(sh, a, b, c1, c2),
      C: (sh: Sheet, r: number, c: string) => this.C(sh, r, c),
      I: (k: string) => this.I(k),
      MAT: (id: string) => Number(this.mat[id]?.price) || 0,
      NORM: (id: string) => Number(this.norm[id]?.hours) || 0,
      SD: (id: string, v: string) => this.sheetMetalPrice(id, v),
      K: null,
    };
  }

  /** Load a settings snapshot (with overrides applied) and lead inputs; clears the cache. */
  setData(settings: EngineSettings, inputs: InputValues): void {
    this.settings = settings;
    this.inputs = inputs;
    this.k = settings.k;
    this.env.K = settings.k;
    this.mat = Object.fromEntries(settings.materials.map((m) => [m.id, m]));
    this.norm = Object.fromEntries(settings.norms.map((n) => [n.id, n]));
    this.sd = Object.fromEntries(settings.sd.map((d) => [d.id, d]));
    this.memo.clear();
  }

  I(k: string): number {
    const v = this.inputs[k];
    return typeof v === 'number' && isFinite(v) ? v : 0;
  }

  sheetMetalPrice(id: string, variant: string): number {
    const d = this.sd[id];
    if (!d || !d.has[variant]) return 0;
    return (d.w || 0) * (this.settings.coil[variant] || 0) + this.settings.fold_cost * (d.folds || 0);
  }

  C(sh: Sheet, row: number, col: string): number {
    const key = sh + row + col;
    const hit = this.memo.get(key);
    if (hit !== undefined) return hit;
    const d = this.defs[sh].get(keyOf(row, col));
    let v: unknown;
    if (sh === 'F' && d === undefined) {
      const std = this.f2Standard(row, col);
      if (std === null) return 0;
      v = std;
    } else {
      if (d === undefined || this.stack.has(key)) return 0;
      this.stack.add(key);
      try {
        v = d.e !== undefined ? compileExpr(d.e)(this.env) : d.c;
      } finally {
        this.stack.delete(key);
      }
    }
    const n = typeof v === 'number' && isFinite(v) ? v : 0;
    this.memo.set(key, n);
    return n;
  }

  R(sh: Sheet, r1: number, r2: number, c1: string, c2: string): number[] {
    const out: number[] = [];
    for (let r = r1; r <= r2; r++) for (const c of cols(c1, c2)) out.push(this.C(sh, r, c));
    return out;
  }

  /** F2 columns that follow the same formula on every row. */
  private f2Standard(row: number, col: string): number | null {
    const rate = this.k.labor_rate_eur_h;
    const mech = this.k.mechanisms_share_of_materials;
    const C = (c: string) => this.C('F', row, c);
    switch (col) {
      case 'G': return C('E') * rate;
      case 'I': return C('H') * mech;
      case 'J': return C('G') + C('H') + C('I');
      case 'K': return C('E') * C('D');
      case 'L': return C('K') * rate;
      case 'M': return C('H') * C('D');
      case 'N': return C('I') * C('D');
      case 'O': return C('L') + C('M') + C('N');
      default: return null;
    }
  }

  /** Tāme rows as typed results. */
  lines(): LineResult[] {
    return this.bundle.tame.filter((r) => r.r < 342).map((r) => {
      const g = (c: string) => this.C('T', r.r, c);
      const expr = r.x.H?.e ?? '';
      const m = expr.match(/^mat\.(MAT_\d+)/);
      const s = expr.match(/^sd\.(SD_\d+)\.(\w+)/);
      return {
        row: r.r, block: r.b, blockRow: r.br, name: r.n, unit: r.u, laborUnit: r.lu, tools: r.t,
        qty: g('D'), reserve: g('E'), qtyRes: g('F'), price: g('H'), materials: g('I'), hours: g('L'), labor: g('O'), laborMarked: g('Q'),
        priceRef: m ? { type: 'mat', id: m[1] } : s ? { type: 'sd', id: s[1], variant: s[2] } : null,
      };
    });
  }
}
