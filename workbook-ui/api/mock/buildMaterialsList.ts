import type { EngineSettings, LineResult } from '@/workbook-ui/engine';
import type { MaterialsListGroup } from '../types';

/** Materials that are services or rent, not purchases. Should become `material.is_service` in the DB. */
const SERVICE_IDS = new Set([113, 115, 117, 118, 119, 126, 127, 129, 134, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 151].map((n) => `MAT_${String(n).padStart(3, '0')}`));
const VARIANT_LABEL: Record<string, string> = { rukki_05: 'Rukki 0.5', zn_05: 'Zn 0.5', perforated_07: 'perforēts 0.7', rukki_06: 'Rukki 0.6' };

export function buildMaterialsList(lines: LineResult[], settings: EngineSettings): MaterialsListGroup[] {
  const mats = Object.fromEntries(settings.materials.map((m) => [m.id, m]));
  const details = Object.fromEntries(settings.sd.map((d) => [d.id, d]));
  const groups = new Map<string, MaterialsListGroup>();
  const items = new Map<string, { group: string; kind: MaterialsListGroup['kind']; name: string; unit: string | null; qty: number; cost: number; usedIn: Set<string> }>();

  for (const l of lines) {
    if (!(l.materials > 0) || l.row >= 333) continue;
    let key: string, group: string, kind: MaterialsListGroup['kind'], name: string;
    if (l.priceRef?.type === 'mat') {
      const m = mats[l.priceRef.id];
      key = `${m.id}|${l.unit}`; name = m.name;
      kind = SERVICE_IDS.has(m.id) ? 'service' : 'supplier';
      group = kind === 'service' ? 'Services and rent' : (m.supplier ?? 'No supplier');
    } else if (l.priceRef?.type === 'sd') {
      const d = details[l.priceRef.id];
      key = `${d.id}:${l.priceRef.variant}|${l.unit}`; name = `${d.name} (${VARIANT_LABEL[l.priceRef.variant]})`;
      kind = 'workshop'; group = 'Sheet-metal workshop';
    } else {
      key = `row${l.row}`; name = l.name; kind = 'input'; group = 'Priced in inputs';
    }
    const it = items.get(key) ?? { group, kind, name, unit: l.unit, qty: 0, cost: 0, usedIn: new Set<string>() };
    it.qty += l.qtyRes; it.cost += l.materials; it.usedIn.add(l.block);
    items.set(key, it);
  }
  for (const it of items.values()) {
    const g = groups.get(it.group) ?? { supplier: it.group, kind: it.kind, total: 0, items: [] };
    g.items.push({ name: it.name, unit: it.unit, qty: it.qty, cost: it.cost, usedIn: [...it.usedIn] });
    g.total += it.cost;
    groups.set(it.group, g);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, items: g.items.sort((a, b) => b.cost - a.cost) }))
    .sort((a, b) => Number(a.kind === 'service') - Number(b.kind === 'service') || b.total - a.total);
}
