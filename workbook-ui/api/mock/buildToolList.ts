import type { LineResult } from '@/workbook-ui/engine';
import type { ToolItem } from '../types';

/** Unique tools for lines that are part of the job. Case-insensitive, unlike the workbook's UNIQUE(). */
export function buildToolList(lines: LineResult[]): ToolItem[] {
  const map = new Map<string, { name: string; usedIn: Set<string> }>();
  for (const l of lines) {
    if (!(l.materials + l.labor > 0)) continue;
    for (const raw of l.tools) for (const part of raw.split(/,\s*/)) {
      const name = part.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const t = map.get(key) ?? { name: name[0].toUpperCase() + name.slice(1), usedIn: new Set<string>() };
      t.usedIn.add(l.block);
      map.set(key, t);
    }
  }
  return [...map.entries()]
    .map(([key, t]) => ({ key, name: t.name, usedIn: [...t.usedIn] }))
    .sort((a, b) => b.usedIn.length - a.usedIn.length || a.name.localeCompare(b.name, 'lv'));
}
