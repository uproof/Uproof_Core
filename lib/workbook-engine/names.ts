/** Display names that point at inputs, materials or other lines. */
import type { Context } from './context';
import { LINES_BY_ID } from './context';
import { BLOCK_NAMES } from './rules';

export function resolveName(c: Context, name: string | null, nameFrom?: string): string {
  if (!nameFrom) return name || '';
  const idx = nameFrom.indexOf(':');
  const kind = nameFrom.slice(0, idx), ref = nameFrom.slice(idx + 1);
  if (kind === 'input') {
    const v = c.raw[ref];
    return typeof v === 'string' && v ? v : ref;
  }
  if (kind === 'material') return c.settings.materials[ref].name;
  if (kind === 'line') {
    const l = LINES_BY_ID.get(ref)!;
    return resolveName(c, l.name, l.nameFrom);
  }
  return name || '';
}

export function blockName(c: Context, blockId: string): string {
  const raw = BLOCK_NAMES[blockId] ?? blockId;
  if (raw.startsWith('in.')) {
    const v = c.raw[raw.slice(3)];
    return typeof v === 'string' && v ? v : raw.slice(3);
  }
  return raw.trim();
}
