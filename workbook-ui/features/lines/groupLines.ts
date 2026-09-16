import type { LineResult } from '@/workbook-ui/engine';

export interface LineBlock { blockRow: number; name: string; lines: LineResult[]; materials: number; hours: number; labor: number; firstRow: number; lastRow: number }

export const isActiveLine = (l: LineResult) => !!(l.qty || l.materials || l.hours);

/** Groups Tāme rows into their blocks and applies search / "only active" filters. */
export function groupLines(lines: LineResult[], opts: { query: string; activeOnly: boolean }): LineBlock[] {
  const q = opts.query.toLowerCase();
  const blocks: LineBlock[] = [];
  for (const l of lines) {
    let b = blocks[blocks.length - 1];
    if (!b || b.blockRow !== l.blockRow) {
      b = { blockRow: l.blockRow, name: l.block, lines: [], materials: 0, hours: 0, labor: 0, firstRow: l.row, lastRow: l.row };
      blocks.push(b);
    }
    b.materials += l.materials; b.hours += l.hours; b.labor += l.labor; b.lastRow = l.row;
    const matches = !q || `${l.name} ${l.block}`.toLowerCase().includes(q);
    if (matches && (!opts.activeOnly || isActiveLine(l))) b.lines.push(l);
  }
  return blocks.filter((b) => b.lines.length > 0);
}
