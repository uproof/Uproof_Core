import type { EngineBundle, InputValues } from '@/workbook-ui/engine';

export interface NameContext { bundle: EngineBundle; inputs: InputValues }

/** Some catalog names are references (to another line, a material or an input label). Resolve them for display. */
export function resolveName(value: string | null | undefined, ctx: NameContext): string {
  if (!value) return '';
  let m = value.match(/^T\[(\d+)\]\.B$/);
  if (m) return resolveName(ctx.bundle.tame.find((r) => r.r === Number(m![1]))?.n, ctx);
  m = value.match(/^mat\.(MAT_\d+)\.name$/);
  if (m) return ctx.bundle.settings.materials.find((x) => x.id === m![1])?.name ?? value;
  m = value.match(/^in\.(\w+)$/);
  if (m) {
    const v = ctx.inputs[m[1]];
    if (typeof v === 'string' && v) return v;
    return ctx.bundle.inputs.find((i) => i.k === m![1])?.l ?? m[1];
  }
  return value;
}
