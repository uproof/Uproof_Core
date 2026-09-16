/**
 * Compiles the catalog DSL into JS functions.
 *   T[118].I        -> C('T',118,'I')          single cell of another line
 *   T[2:20].S:T     -> R('T',2,20,'S','T')     range (flattened)
 *   in.key          -> I('key')                lead input
 *   mat.MAT_036.*   -> MAT('MAT_036')          material price
 *   norm.LAB_109.*  -> NORM('LAB_109')         hours per unit
 *   sd.SD_02.rukki_05 -> SD('SD_02','rukki_05') sheet-metal profile price per m
 */
export type CompiledExpr = (env: Record<string, unknown>) => unknown;

/** Excel ROUNDUP works on the 15-significant-digit value (1.1*100 -> 110, not 111). */
export function ceil0(x: number): number {
  const v = Number((x || 0).toPrecision(15));
  return v >= 0 ? Math.ceil(v) : Math.floor(v);
}

function flatten(values: unknown[], out: unknown[] = []): unknown[] {
  for (const v of values) Array.isArray(v) ? flatten(v, out) : out.push(v);
  return out;
}

export function xsum(...values: unknown[]): number {
  return flatten(values).reduce<number>((s, x) => s + (typeof x === 'number' && isFinite(x) ? x : 0), 0);
}

function lazyIferror(src: string): string {
  let out = '';
  let i = 0;
  for (;;) {
    const j = src.indexOf('iferror(', i);
    if (j < 0) return out + src.slice(i);
    out += src.slice(i, j);
    let p = j + 8;
    let depth = 1;
    let comma = -1;
    while (depth) {
      const ch = src[p];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ',' && depth === 1 && comma < 0) comma = p;
      p++;
    }
    out += `iferror(()=>(${lazyIferror(src.slice(j + 8, comma))}),${lazyIferror(src.slice(comma + 1, p - 1))})`;
    i = p;
  }
}

const cache = new Map<string, CompiledExpr>();

export function compileExpr(dsl: string): CompiledExpr {
  const hit = cache.get(dsl);
  if (hit) return hit;
  let s = dsl;
  s = s.replace(/count\(\[([^\]]*)\]\)/g, (_m, g: string) =>
    'countIn([' + g.split(',').map((k) => JSON.stringify(k.trim().slice(3))).join(',') + '])');
  s = s.replace(/\b([TFK])\[(\d+):(\d+)\]\.([A-Z])(?::([A-Z]))?/g, (_m, sh, a, b, c1, c2) => `R('${sh}',${a},${b},'${c1}','${c2 || c1}')`);
  s = s.replace(/\b([TFK])\[(\d+)\]\.([A-Z])/g, (_m, sh, r, c) => `C('${sh}',${r},'${c}')`);
  s = s.replace(/\bin\.(\w+)/g, (_m, k) => `I('${k}')`);
  s = s.replace(/\bmat\.(MAT_\d+)\.(\w+)/g, (_m, id) => `MAT('${id}')`);
  s = s.replace(/\bnorm\.(LAB_\d+)\.(\w+)/g, (_m, id) => `NORM('${id}')`);
  s = s.replace(/\bsd\.(SD_\d+)\.(\w+)/g, (_m, id, v) => `SD('${id}','${v}')`);
  s = s.replace(/\bsetting\.(\w+)/g, () => 'K.labor_rate_eur_h');
  s = s.replace(/<>/g, '!=').replace(/(?<![<>!=])=(?!=)/g, '==');
  s = lazyIferror(s);
  // `with` gives expressions access to the resolver functions; Function bodies run in sloppy mode.
  const fn = new Function('E', 'with(E){return (' + s + ')}') as CompiledExpr;
  cache.set(dsl, fn);
  return fn;
}
