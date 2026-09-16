import { ceil0, xsum } from '../dsl';
import type { EngineCore } from '../core';
import type { SummaryLine, SummaryResult } from '../types';

type Group = [name: string, inputKeys: string[], tameRow: number, unit: string];
const range = (n: number, fmt: (i: number) => string) => Array.from({ length: n }, (_, i) => fmt(i + 1));

/** Kopsavilkums: 53 work groups + pricing model A. Order matters (payments stages slice it). */
export function buildSummary(e: EngineCore): SummaryResult {
  const T = (r: number, c: string) => e.C('T', r, c);
  const inp = (keys: string[]) => keys.reduce((a, k) => a + e.I(k), 0);
  const k = e.k;
  const lines: SummaryLine[] = [];
  const add = (name: string, qty: number, materials: number, labor: number, unit: string, hours?: number) =>
    lines.push({ name, unit, qty, materials, labor, hours: hours ?? labor / k.labor_rate_eur_h, total: materials + labor });
  const addGroups = (groups: Group[]) => groups.forEach(([n, keys, r, u]) => add(n, inp(keys), T(r, 'S'), T(r, 'T'), u));
  const sumCol = (rows: number[], c: string) => rows.reduce((a, r) => a + T(r, c), 0);

  const demolition = [2, 6, 8, 10, 12, 15, 17, 19];
  const lifting = [5, 7, 9, 11, 14, 16, 18];
  add('Demontāža ar nocelšanu', inp(['demo_slate_m2', 'demo_standing_seam_m2', 'demo_sheet_metal_m2', 'demo_shingles_m2', 'demo_tiles_m2']), sumCol(demolition, 'S'), sumCol(demolition, 'T'), 'm2');
  add('Nocelšana', sumCol(lifting, 'D'), sumCol(lifting, 'S'), sumCol(lifting, 'T'), 'gb');
  add('Uzcelšana', xsum(e.R('T', 21, 24, 'D', 'D')), xsum(e.R('T', 21, 24, 'S', 'S')), xsum(e.R('T', 21, 24, 'T', 'T')), 'gb');
  addGroups([
    ['Mūrlatas montāža', ['wall_plate_150x150_m', 'wall_plate_100x200_m'], 25, 'm'],
    ['Spāru montāža', ['rafters_150x50_count', 'rafters_200x50_count'], 31, 'gb'],
    ['Jumta kopņu montāža', ['trusses_1_count', 'trusses_2_count'], 42, 'gb'],
    ['Protēzes', ['rafter_splices_count'], 50, 'gb'],
    ['Siltināšana un tvaika barjera', ['insulation_150_m2', 'insulation_200_m2'], 53, 'm2'],
    ['Difūzijas membrāna', ['membrane_area_m2'], 62, 'm2'],
    ['Latojums', ['batten_area_m2'], 70, 'm2'],
    ['Ventilējama dzega', ['eaves_ventilated_m'], 79, 'm'],
    ['Neventilējama dzega', ['eaves_unventilated_m'], 85, 'm'],
  ]);
  add('Teknes', T(89, 'D'), T(89, 'S'), T(89, 'T'), 'm');
  addGroups([
    ['Jumta logu montāža 1', ['roof_window_1_count'], 111, 'gb'],
    ['Jumta logu montāža 2', ['roof_window_2_count'], 113, 'gb'],
    ['Jumta logu pieslēgumi', ['roof_window_flashing_count'], 115, 'gb'],
    ['Sateknes montāža', ['valley_m'], 104, 'm'],
  ]);
  add('Valcprofils Rukki', T(118, 'D'), T(118, 'S'), T(118, 'T'), 'm2');
  add('Valcprofils Zn', T(123, 'D'), T(123, 'S'), T(123, 'T'), 'm2');
  addGroups([
    ['Sienas pieslēgums', ['wall_abutment_m'], 128, 'm'],
    ['Skursteņa pieslēgums', ['chimney_flashing_count'], 149, 'gb'],
    ['Ventilējams sienas pieslēgums', ['wall_abutment_ventilated_m'], 135, 'm'],
    ['Ventilācijas izvads skārda', ['vent_outlet_metal_count'], 152, 'gb'],
    ['Ventilācijas izvads plastmasas', ['vent_outlet_plastic_count'], 157, 'gb'],
    ['Jumta lūka ovāla', ['roof_hatch_oval_count'], 163, 'gb'],
    ['Ventilējama kore', ['ridge_ventilated_m'], 174, 'm'],
    ['Skrūvējama kore', ['ridge_screwed_m'], 184, 'm'],
    ['Vējmalas', ['verge_1_m', 'verge_2_m', 'verge_3_m', 'verge_4_m'], 188, 'm'],
    ['Parapets', ['parapet_1_m', 'parapet_2_m', 'parapet_3_m'], 167, 'm'],
    ['Skursteņa apdare', range(7, (j) => `chimney_cladding_${j}_area_m2`), 194, 'm2'],
  ]);
  const caps = [...range(4, (j) => `chimney_cap_plain_${j}_length_m`), ...range(3, (j) => `chimney_cap_screen_${j}_length_m`)];
  add('Skursteņa jumtiņi', caps.filter((c) => typeof e.inputs[c] === 'number').length, xsum(e.R('T', 210, 213, 'S', 'S')), xsum(e.R('T', 210, 213, 'T', 'T')), 'gb');
  addGroups([
    ['Vēja kastes izbūve', ['soffit_area_m2'], 214, 'm2'],
    ['Vēja kastes krāsošana', ['paint_soffit_area_m2'], 236, 'm2'],
    ['Koka fasādes krāsošana', ['paint_wood_facade_area_m2'], 241, 'm2'],
    ['Mūra krāsošana', ['paint_masonry_area_m2'], 246, 'm2'],
    ['Sniega barjeras', ['snow_guard_tube_m'], 252, 'm'],
    ['Jumta kāpnes', ['roof_ladder_1_2m_count', 'roof_ladder_2_7m_count', 'roof_ladder_3_3m_count'], 257, 'gb'],
    ['Sienas kāpnes', ['wall_ladder_m'], 261, 'm'],
    ['Jumta laipas', ['walkway_3m_count', 'walkway_1_4m_count', 'walkway_0_6m_count'], 263, 'gb'],
    ['Drošības trose', ['safety_rope_m'], 268, 'm'],
    ['Jumta nožogojums', ['roof_railing_m'], 271, 'm'],
    ['Zibens novedēji', ['fire_hatch_count', 'lightning_rod'], 272, 'm'],
    ['Ugunsdroša lūka', ['fire_hatch_count', 'lightning_rod'], 275, 'gb'],
  ]);
  add('Sniega kausēšana', inp(range(3, (j) => `snow_melt_kit_${j}_length_m`)), xsum(e.R('T', 277, 280, 'F', 'F')), xsum(e.R('T', 277, 280, 'O', 'O')), 'm', xsum(e.R('T', 277, 280, 'L', 'L')));
  add('Skursteņu mūra atjaunošana', inp(range(6, (j) => `chimney_rebuild_${j}_area_m2`)), T(281, 'S'), T(281, 'T'), 'm2');
  add('Skursteņu apmetuma atjaunošana', inp(range(5, (j) => `chimney_plaster_${j}_area_m2`)), T(289, 'S'), T(289, 'T'), 'm2');
  add('Būvobjekta iekārtošana', 0, T(312, 'S'), T(312, 'T'), 'kpl');
  add('Sastatnes', e.I('site_scaffold_area_m2'), T(326, 'S'), T(326, 'T'), 'm2');
  add('Nožogojums', e.I('site_fence_length_m'), T(324, 'S'), T(324, 'T'), 'm');
  add('Atkritumu apsaimniekošana', 0, T(309, 'S'), T(309, 'T'), 'kpl');
  add('Komandējuma naktsmītne', 0, T(338, 'S'), 0, 'kpl', 0);
  add('Būvdarbu vadītājs', 0, T(339, 'S'), 0, 'kpl', 0);
  add('Apdrošināšana', 0, T(340, 'S'), 0, 'kpl', 0);

  const materials = lines.reduce((a, l) => a + l.materials, 0);
  const hours = lines.reduce((a, l) => a + l.hours, 0);
  const transport = T(333, 'S');
  const mechanisms = materials * k.mechanisms_share_of_materials;
  const hoursCoef = hours * e.I('travel_coef') * e.I('slope_labor_coef');
  const crew = e.I('crew_size');
  const days = crew ? ceil0(hoursCoef / k.workday_hours / crew) : 0;
  const labor = hoursCoef * k.labor_rate_eur_h;
  const vsaoi = labor * k.employer_social_tax_vsaoi;
  const cost = labor + mechanisms + materials + transport + vsaoi;
  const profit = labor * k.labor_markup_factor - labor + (k.kops_profit_extra_eur || 0);
  const offer = cost + profit;
  const roofM2 = T(118, 'D') + T(123, 'D');
  return {
    lines, materials, hours, transport, mechanisms, hoursCoef, days, labor, vsaoi, cost, profit, offer,
    perM2: roofM2 ? offer / roofM2 : 0, vat: offer * k.vat_rate_standard, offerVat: offer * (1 + k.vat_rate_standard), roofM2,
  };
}
