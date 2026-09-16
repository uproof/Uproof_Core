/** Tāme output (one record per line), the purchase list and the tools list. */
import type { Context } from '../context';
import type { PriceRef } from '../line';
import { blockName, resolveName } from '../names';
import { LINES } from '../rules';

const BLOCK_FIRST_ROW = new Map<string, number>();
for (const l of LINES) if (!BLOCK_FIRST_ROW.has(l.block)) BLOCK_FIRST_ROW.set(l.block, l.row);

export interface LineResult {
  id: string; row: number; blockId: string; blockRow: number; block: string; name: string; unit: string | null; laborUnit: string | null; tools: string[];
  qty: number; reserve: number; qtyRes: number; price: number; materials: number; hours: number; labor: number; laborMarked: number; priceRef: PriceRef | null;
}

export function buildLines(c: Context): LineResult[] {
  return LINES.filter((l) => l.id !== 'totals.all').map((l) => {
    const v = (f: Parameters<Context['value']>[1]) => c.value(l.id, f);
    return {
      id: l.id, row: l.row, blockId: l.block, blockRow: BLOCK_FIRST_ROW.get(l.block)!, block: blockName(c, l.block),
      name: resolveName(c, l.name, l.nameFrom), unit: l.unit ?? null, laborUnit: l.laborUnit ?? null, tools: [...(l.tools ?? [])],
      qty: v('qty'), reserve: v('reserve'), qtyRes: v('qtyRes'), price: v('unitPrice'), materials: v('materials'),
      hours: v('hours'), labor: v('labor'), laborMarked: v('laborMarked'), priceRef: l.priceRef ?? null,
    };
  });
}

const VARIANT_LABEL: Record<string, string> = { rukki_05: 'Rukki 0.5', zn_05: 'Zn 0.5', perforated_07: 'perforēts 0.7', rukki_06: 'Rukki 0.6' };
const TRANSPORT_FIRST_ROW = 333;

export interface MaterialsListItem { name: string; unit: string | null; qty: number; cost: number; usedIn: string[] }
export interface MaterialsListGroup { supplier: string; kind: 'supplier' | 'workshop' | 'service' | 'input'; total: number; items: MaterialsListItem[] }

export function buildMaterialsList(c: Context, lines: LineResult[]): MaterialsListGroup[] {
  const items = new Map<string, { group: string; kind: MaterialsListGroup['kind']; name: string; unit: string | null; qty: number; cost: number; usedIn: string[] }>();
  for (const l of lines) {
    if (!(l.materials > 0) || l.row >= TRANSPORT_FIRST_ROW) continue;
    const ref = l.priceRef;
    let key: string, name: string, group: string, kind: MaterialsListGroup['kind'];
    if (ref?.type === 'mat') {
      const m = c.settings.materials[ref.id];
      kind = m.isService ? 'service' : 'supplier';
      key = `${m.key}|${l.unit}`; name = m.name; group = m.isService ? 'Services and rent' : (m.supplier || 'No supplier');
    } else if (ref?.type === 'sd') {
      const d = c.settings.sheetMetal[ref.id];
      kind = 'workshop'; key = `${d.key}:${ref.variant}|${l.unit}`; name = `${d.name} (${VARIANT_LABEL[ref.variant] ?? ref.variant})`; group = 'Sheet-metal workshop';
    } else {
      kind = 'input'; key = `line:${l.id}`; name = l.name; group = 'Priced in inputs';
    }
    let it = items.get(key);
    if (!it) { it = { group, kind, name, unit: l.unit, qty: 0, cost: 0, usedIn: [] }; items.set(key, it); }
    it.qty += l.qtyRes;
    it.cost += l.materials;
    if (!it.usedIn.includes(l.block)) it.usedIn.push(l.block);
  }
  const groups = new Map<string, MaterialsListGroup>();
  for (const it of items.values()) {
    let g = groups.get(it.group);
    if (!g) { g = { supplier: it.group, kind: it.kind, total: 0, items: [] }; groups.set(it.group, g); }
    g.items.push({ name: it.name, unit: it.unit, qty: it.qty, cost: it.cost, usedIn: it.usedIn });
    g.total += it.cost;
  }
  for (const g of groups.values()) g.items.sort((a, b) => b.cost - a.cost);
  return [...groups.values()].sort((a, b) => Number(a.kind === 'service') - Number(b.kind === 'service') || b.total - a.total);
}

export interface ToolItem { key: string; name: string; usedIn: string[] }

const byCodePoint = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function buildTools(lines: LineResult[]): ToolItem[] {
  const tools = new Map<string, ToolItem>();
  for (const l of lines) {
    if (!(l.materials + l.labor > 0)) continue;
    for (const raw of l.tools) for (const part of raw.split(/,\s*/)) {
      const name = part.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      let t = tools.get(key);
      if (!t) { t = { key, name: name[0].toUpperCase() + name.slice(1), usedIn: [] }; tools.set(key, t); }
      if (!t.usedIn.includes(l.block)) t.usedIn.push(l.block);
    }
  }
  return [...tools.values()].sort((a, b) => b.usedIn.length - a.usedIn.length || byCodePoint(a.name, b.name));
}
