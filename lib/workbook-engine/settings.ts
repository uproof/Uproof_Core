/** Settings snapshot used by one calculation (from the database, with per-estimate overrides applied). */

export interface Material {
  key: string; name: string; price: number | null; vatFactor: number | null; supplier: string | null;
  isService: boolean; leadTimeDays: number; legacyRow: number | null;
}
export interface LaborNorm {
  key: string; category: string; name: string; operation: string | null; unit: string | null; hoursPerUnit: number | null; legacyRow: number | null;
}
export interface SheetMetalDetail {
  key: string; group: string; name: string; blankWidthM: number | null; folds: number | null; variants: string[]; legacyRow: number | null;
}
export type Constants = Record<string, number>;

export interface SettingsSnapshot {
  versionId: number;
  materials: Record<string, Material>;
  laborNorms: Record<string, LaborNorm>;
  sheetMetal: Record<string, SheetMetalDetail>;
  coilPrices: Record<string, number>;
  foldCostPerM: number;
  slopeAreaFactors: { angle_deg: number; area_multiplier: number }[];
  battenGapRules: { from_deg: number; to_deg: number; gap_mm: number | string }[];
  constants: Constants;
}

/** Per-estimate edits. Same shape as the API request. */
export interface SettingsOverrides {
  materials?: Record<string, number | null>;
  norms?: Record<string, number | null>;
  coil?: Record<string, number>;
  constants?: Record<string, number>;
  materialLeadTimes?: Record<string, number | null>;
}

export function profilePrice(s: SettingsSnapshot, key: string, variant: string): number {
  const d = s.sheetMetal[key];
  if (!d) throw new Error(`Unknown sheet-metal detail '${key}'`);
  if (!d.variants.includes(variant)) return 0;
  return (d.blankWidthM || 0) * (s.coilPrices[variant] || 0) + s.foldCostPerM * (d.folds || 0);
}

export function withOverrides(s: SettingsSnapshot, o?: SettingsOverrides | null): SettingsSnapshot {
  if (!o) return s;
  const materials = Object.fromEntries(Object.entries(s.materials).map(([k, m]) => [k, { ...m }]));
  for (const [k, v] of Object.entries(o.materials ?? {})) if (materials[k]) materials[k].price = v;
  for (const [k, v] of Object.entries(o.materialLeadTimes ?? {})) if (materials[k] && v !== null && v !== undefined) materials[k].leadTimeDays = v;
  const laborNorms = Object.fromEntries(Object.entries(s.laborNorms).map(([k, n]) => [k, { ...n }]));
  for (const [k, v] of Object.entries(o.norms ?? {})) if (laborNorms[k]) laborNorms[k].hoursPerUnit = v;
  return {
    ...s, materials, laborNorms,
    coilPrices: { ...s.coilPrices, ...(o.coil ?? {}) },
    constants: { ...s.constants, ...(o.constants ?? {}) },
  };
}

/** Seed file format (src/server/seed/settings_v1.json). */
export interface SettingsSeed {
  note: string;
  materials: { key: string; legacy_row: number; name: string; price: number | null; vat_factor: number | null; supplier: string | null; is_service: boolean; lead_time_days: number }[];
  labor_norms: { key: string; legacy_row: number; category: string | null; name: string; operation: string | null; unit: string | null; hours_per_unit: number | null }[];
  sheet_metal_details: { key: string; legacy_row: number; group: string | null; name: string; blank_width_m: number | null; folds: number | null; variants: string[] }[];
  coil_prices: Record<string, number>;
  fold_cost_per_m: number;
  slope_area_factors: { angle_deg: number; area_multiplier: number }[];
  batten_gap_rules: { from_deg: number; to_deg: number; gap_mm: number | string }[];
  constants: { key: string; value: number; description: string }[];
}

export function snapshotFromSeed(seed: SettingsSeed, versionId = 1): SettingsSnapshot {
  return {
    versionId,
    materials: Object.fromEntries(seed.materials.map((m) => [m.key, {
      key: m.key, name: m.name, price: m.price, vatFactor: m.vat_factor, supplier: m.supplier, isService: !!m.is_service,
      leadTimeDays: m.lead_time_days ?? 0, legacyRow: m.legacy_row ?? null,
    }])),
    laborNorms: Object.fromEntries(seed.labor_norms.map((n) => [n.key, {
      key: n.key, category: n.category ?? '', name: n.name, operation: n.operation, unit: n.unit, hoursPerUnit: n.hours_per_unit, legacyRow: n.legacy_row ?? null,
    }])),
    sheetMetal: Object.fromEntries(seed.sheet_metal_details.map((d) => [d.key, {
      key: d.key, group: d.group ?? '', name: d.name, blankWidthM: d.blank_width_m, folds: d.folds, variants: d.variants, legacyRow: d.legacy_row ?? null,
    }])),
    coilPrices: { ...seed.coil_prices },
    foldCostPerM: seed.fold_cost_per_m,
    slopeAreaFactors: [...seed.slope_area_factors],
    battenGapRules: [...seed.batten_gap_rules],
    constants: Object.fromEntries(seed.constants.map((c) => [c.key, c.value])),
  };
}
