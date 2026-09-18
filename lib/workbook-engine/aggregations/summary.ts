/**
 * Kopsavilkums: 53 work groups and pricing model A.
 * Each group sums block totals (materials, labor) of the Tāme lines it covers.
 * Group order matters: payment stages take fixed slices of it (see schedule.ts).
 */
import type { Context } from '../context';
import { ceilUp, total } from '../functions';

interface Group { name: string; unit: string; lines: readonly string[]; qtyInputs?: readonly string[]; qtyLines?: readonly string[] }
export interface SummaryLine { name: string; unit: string; qty: number; materials: number; labor: number; hours: number; total: number }

const range = (n: number, fmt: (i: number) => string) => Array.from({ length: n }, (_, i) => fmt(i + 1));
const DEMO = 'demontaza_ar_nocelsanu';

const LIFT_LINES = [`${DEMO}.nocelsana_gb`, `${DEMO}.nocelsana_1gb_100m2`, `${DEMO}.nocelsana_1gb_100m2_2`, `${DEMO}.nocelsana_1gb_100m2_3`,
  `${DEMO}.nocelsana_gb_2`, `${DEMO}.nocelsana_1gb_100m2_4`, `${DEMO}.nocelsana_1gb_200m2`];
const UP_LINES = ['uzcelsana.latojuma_uzcelsana_1gb_100m2', 'uzcelsana.valcprofila_uzcelsana_1gb_100m2',
  'uzcelsana.jumta_konstrukcijas_uzcelsana_1gb_100m2', 'uzcelsana.jumta_siltinajuma_uzcelsana_1gb_100m2'];

export const GROUPS: Group[] = [
  { name: 'Demontāža ar nocelšanu', unit: 'm2', lines: [`${DEMO}.sifera_demontaza_12kg_m2`, `${DEMO}.valcprofila_demontaza`, `${DEMO}.skarda_loksnu_demontaza`,
    `${DEMO}.sindelu_demontaza`, `${DEMO}.dakstinu_demontaza_50kg_m2`, `${DEMO}.latojuma_demontaza`, `${DEMO}.jumta_konstrukcijas_demontaza`,
    `${DEMO}.noteksistemas_demontaza_m`], qtyInputs: ['demo_slate_m2', 'demo_standing_seam_m2', 'demo_sheet_metal_m2', 'demo_shingles_m2', 'demo_tiles_m2'] },
  { name: 'Nocelšana', unit: 'gb', lines: LIFT_LINES, qtyLines: LIFT_LINES },
  { name: 'Uzcelšana', unit: 'gb', lines: UP_LINES, qtyLines: UP_LINES },
  { name: 'Mūrlatas montāža', unit: 'm', lines: ['murlatas_montaza.n150x150'], qtyInputs: ['wall_plate_150x150_m', 'wall_plate_100x200_m'] },
  { name: 'Spāru montāža', unit: 'gb', lines: ['sparu_montaza.n150x50'], qtyInputs: ['rafters_150x50_count', 'rafters_200x50_count'] },
  { name: 'Jumta kopņu montāža', unit: 'gb', lines: ['jumta_kopnu_montaza.jumta_kopnes_pasutitas_projektetas'], qtyInputs: ['trusses_1_count', 'trusses_2_count'] },
  { name: 'Protēzes', unit: 'gb', lines: ['protezes.proteze_garums_1_5m_videji'], qtyInputs: ['rafter_splices_count'] },
  { name: 'Siltināšana un tvaika barjera', unit: 'm2', lines: ['siltinasana_un_tvaika_barjera.vate_paroc_ultra_150mm_m2'], qtyInputs: ['insulation_150_m2', 'insulation_200_m2'] },
  { name: 'Difūzijas membrāna', unit: 'm2', lines: ['difuzijas_membrana.rukki_145g'], qtyInputs: ['membrane_area_m2'] },
  { name: 'Latojums', unit: 'm2', lines: ['latojums.starplatojums'], qtyInputs: ['batten_area_m2'] },
  { name: 'Ventilējama dzega', unit: 'm', lines: ['ventilejama_dzega.apakslasne_5_15_2_2_24cm'], qtyInputs: ['eaves_ventilated_m'] },
  { name: 'Neventilējama dzega', unit: 'm', lines: ['neventilejama_dzega.apakslasne_5_15_2_2_24cm'], qtyInputs: ['eaves_unventilated_m'] },
  { name: 'Teknes', unit: 'm', lines: ['teknes.teknes_apalas_125_zn'], qtyLines: ['teknes.teknes_apalas_125_zn'] },
  { name: 'Jumta logu montāža 1', unit: 'gb', lines: ['jumta_logu_montaza_1.jumta_logs_komplekts'], qtyInputs: ['roof_window_1_count'] },
  { name: 'Jumta logu montāža 2', unit: 'gb', lines: ['jumta_logu_montaza_2.jumta_logs_komplekts'], qtyInputs: ['roof_window_2_count'] },
  { name: 'Jumta logu pieslēgumi', unit: 'gb', lines: ['jumta_logu_pieslegumu_montaza.loksnu_materials_62_5cm_loga_perimetrs_1'], qtyInputs: ['roof_window_flashing_count'] },
  { name: 'Sateknes montāža', unit: 'm', lines: ['sateknes_montaza.sateknes_profils_2_30_30_2_64cm'], qtyInputs: ['valley_m'] },
  { name: 'Valcprofils Rukki', unit: 'm2', lines: ['valcprofils_rukki.valcprofils_rukki'], qtyLines: ['valcprofils_rukki.valcprofils_rukki'] },
  { name: 'Valcprofils Zn', unit: 'm2', lines: ['valcprofils_zn.valcprofils_zn'], qtyLines: ['valcprofils_zn.valcprofils_zn'] },
  { name: 'Sienas pieslēgums', unit: 'm', lines: ['sienas_pieslegums.uzlocits_skards_30cm'], qtyInputs: ['wall_abutment_m'] },
  { name: 'Skursteņa pieslēgums', unit: 'gb', lines: ['skurstena_pieslegums.loksnu_materials_125cm_skurstena_perimet'], qtyInputs: ['chimney_flashing_count'] },
  { name: 'Ventilējams sienas pieslēgums', unit: 'm', lines: ['ventilejams_sienas_pieslegums_ba.vetikali_piedibelotas_brusas_50x50_ik_pa'], qtyInputs: ['wall_abutment_ventilated_m'] },
  { name: 'Ventilācijas izvads skārda', unit: 'gb', lines: ['ventilacijas_izvada_montaza.skarda_ievalcets_skarda_caurule_d100_150'], qtyInputs: ['vent_outlet_metal_count'] },
  { name: 'Ventilācijas izvads plastmasas', unit: 'gb', lines: ['plastmasas_skruvejama_ventilacij.ventilacijas_izvada_komplekts'], qtyInputs: ['vent_outlet_plastic_count'] },
  { name: 'Jumta lūka ovāla', unit: 'gb', lines: ['jumta_lukas_montaza_ievalcejot_p.jumta_luka_bez_pamatnes_ovala'], qtyInputs: ['roof_hatch_oval_count'] },
  { name: 'Ventilējama kore', unit: 'm', lines: ['ventilejama_kore.lasene_90_gradi_13_3_5_2_2_25cm_kores_ga'], qtyInputs: ['ridge_ventilated_m'] },
  { name: 'Skrūvējama kore', unit: 'm', lines: ['skruvejamajai_korei.apakskores_profils_kores_garums_x_2'], qtyInputs: ['ridge_screwed_m'] },
  { name: 'Vējmalas', unit: 'm', lines: ['vejmalu_montaza_uz_aizkabem.aizkabes_2_8_10cm'], qtyInputs: ['verge_1_m', 'verge_2_m', 'verge_3_m', 'verge_4_m'] },
  { name: 'Parapets', unit: 'm', lines: ['parapeta_montaza.pvc_hidroizolacija_uz_3_skautnem_rulla_p'], qtyInputs: ['parapet_1_m', 'parapet_2_m', 'parapet_3_m'] },
  { name: 'Skursteņa apdare', unit: 'm2', lines: ['skurstena_apdare_valcetas_loksne.cementa_skiedras_plaksne'], qtyInputs: range(7, (i) => `chimney_cladding_${i}_area_m2`) },
];
const CAPS_LINES = ['skurstena_jumtins.skurstena_jumtins_bez_ekrana', 'skurstena_jumtins.skurstena_jumtins_ar_ekranu'];
export const GROUPS_AFTER_CAPS: Group[] = [
  { name: 'Vēja kastes izbūve', unit: 'm2', lines: ['veja_kastes_izbuve.veja_kastes_karkas_solis_60cm_platums'], qtyInputs: ['soffit_area_m2'] },
  { name: 'Vēja kastes krāsošana', unit: 'm2', lines: ['veja_kastes_krasosana.veja_kastes_krasosana_kartas'], qtyInputs: ['paint_soffit_area_m2'] },
  { name: 'Koka fasādes krāsošana', unit: 'm2', lines: ['koka_fasades_krasosana.koka_fasade'], qtyInputs: ['paint_wood_facade_area_m2'] },
  { name: 'Mūra krāsošana', unit: 'm2', lines: ['mura_fasades_krasosana.mura_fasade_kartas'], qtyInputs: ['paint_masonry_area_m2'] },
  { name: 'Sniega barjeras', unit: 'm', lines: ['sniega_barjeras.apalas_caurulveida'], qtyInputs: ['snow_guard_tube_m'] },
  { name: 'Jumta kāpnes', unit: 'gb', lines: ['jumta_kapnes.jumta_kapnes_1_2m_400mm'], qtyInputs: ['roof_ladder_1_2m_count', 'roof_ladder_2_7m_count', 'roof_ladder_3_3m_count'] },
  { name: 'Sienas kāpnes', unit: 'm', lines: ['sienas_kapnes.sienas_kapnes_700mm_karsti_cinkotas_kpl'], qtyInputs: ['wall_ladder_m'] },
  { name: 'Jumta laipas', unit: 'gb', lines: ['jumta_laipas.jumta_laipas_3m_4_stiprinajumi_uz_posmu'], qtyInputs: ['walkway_3m_count', 'walkway_1_4m_count', 'walkway_0_6m_count'] },
  { name: 'Drošības trose', unit: 'm', lines: ['drosibas_trose.drosibas_troses_8mm'], qtyInputs: ['safety_rope_m'] },
  { name: 'Jumta nožogojums', unit: 'm', lines: ['jumta_nozogojums.jumta_nozogojuma_barjera_komplekts_ar_st'], qtyInputs: ['roof_railing_m'] },
  { name: 'Zibens novedēji', unit: 'm', lines: ['zibens_novedeji.zibens_novedejs_pasivais'], qtyInputs: ['fire_hatch_count', 'lightning_rod'] },
  { name: 'Ugunsdroša lūka', unit: 'gb', lines: ['ugunsdrosa_luka.jumta_beninu_ugunsdrosa_luka'], qtyInputs: ['fire_hatch_count', 'lightning_rod'] },
];
const SNOW_MELT_LINES = ['sniega_un_ledus_kausesanas_kabel.snow_melt_kit_1_label', 'sniega_un_ledus_kausesanas_kabel_2.snow_melt_kit_2_label',
  'sniega_un_ledus_kausesanas_kabel_3.snow_melt_kit_3_label', 'electrical_install_label.electrical_install_label'];
export const GROUPS_END: Group[] = [
  { name: 'Skursteņu mūra atjaunošana', unit: 'm2', lines: ['skurstenu_mura_atjaunosana.lodes_kiegeli_250x120x65mm_0_03m2'], qtyInputs: range(6, (i) => `chimney_rebuild_${i}_area_m2`) },
  { name: 'Skursteņu apmetuma atjaunošana', unit: 'm2', lines: ['skurstenu_apmetuma_atjaunosana.stiklskiedras_siets_ct_gewebe_650_caparo'], qtyInputs: range(5, (i) => `chimney_plaster_${i}_area_m2`) },
  { name: 'Būvobjekta iekārtošana', unit: 'kpl', lines: ['buvobjekta_iekartosana.koka_aizsardzibas_materialu_komplekts_ko'] },
  { name: 'Sastatnes', unit: 'm2', lines: ['buvobjekta_iekartosana.sastatnes_noma_eur_m2_menesu_skaits'], qtyInputs: ['site_scaffold_area_m2'] },
  { name: 'Nožogojums', unit: 'm', lines: ['buvobjekta_iekartosana.nozogojums_2x3_5m_gb_noma_diena'], qtyInputs: ['site_fence_length_m'] },
  { name: 'Atkritumu apsaimniekošana', unit: 'kpl', lines: ['atkritumu_apsaimniekosana.buvgruz_konteiners_8m3'] },
];
const NO_LABOR_GROUPS: [string, string][] = [['Komandējuma naktsmītne', 'citi.komandejuma_naktsmitnes_izmaksas'],
  ['Būvdarbu vadītājs', 'citi.buvdarbu_vaditajs'], ['Apdrošināšana', 'citi.apdrosinasana']];
const REPAIR_LINES = ['labosanas_darbi.darba_ilgums_dienas'];
const TRANSPORT_LINE = 'transporta_izmaksas.skarda_piegade_1gb_400m2';

export function summarize(c: Context) {
  const k = c.k;
  const out: SummaryLine[] = [];
  const add = (name: string, unit: string, qty: number, materials: number, labor: number, hours?: number) =>
    out.push({ name, unit, qty, materials, labor, hours: hours === undefined ? labor / k.labor_rate_eur_h : hours, total: materials + labor });
  const addGroup = (g: Group) => {
    const qty = total((g.qtyInputs ?? []).map((key) => c.inp[key])) + c.sumField(g.qtyLines ?? [], 'qty');
    add(g.name, g.unit, qty, c.sumField(g.lines, 'blockMaterials'), c.sumField(g.lines, 'blockLabor'));
  };

  GROUPS.forEach(addGroup);
  const caps = [...range(4, (i) => `chimney_cap_plain_${i}_length_m`), ...range(3, (i) => `chimney_cap_screen_${i}_length_m`)];
  add('Skursteņa jumtiņi', 'gb', c.countFilled(...caps), c.sumField(CAPS_LINES, 'blockMaterials'), c.sumField(CAPS_LINES, 'blockLabor'));
  GROUPS_AFTER_CAPS.forEach(addGroup);
  add('Sniega kausēšana', 'm', total([1, 2, 3].map((i) => c.inp[`snow_melt_kit_${i}_length_m`])),
    c.sumField(SNOW_MELT_LINES, 'qtyRes'), c.sumField(SNOW_MELT_LINES, 'labor'), c.sumField(SNOW_MELT_LINES, 'hours'));
  GROUPS_END.forEach(addGroup);
  add('Labošanas darbi', 'dienas', c.inp.repair_work_days, c.sumField(REPAIR_LINES, 'blockMaterials'), c.sumField(REPAIR_LINES, 'blockLabor'), c.sumField(REPAIR_LINES, 'blockHours'));
  for (const [name, id] of NO_LABOR_GROUPS) add(name, 'kpl', 0, c.value(id, 'blockMaterials'), 0, 0);

  const materials = out.reduce((a, g) => a + g.materials, 0);
  const hours = out.reduce((a, g) => a + g.hours, 0);
  const transport = c.value(TRANSPORT_LINE, 'blockMaterials');
  const mechanisms = materials * k.mechanisms_share_of_materials;
  const hoursCoef = hours * c.inp.travel_coef * c.inp.slope_labor_coef;
  const crew = c.inp.crew_size;
  const days = crew ? ceilUp(hoursCoef / k.workday_hours / crew) : 0;
  const labor = hoursCoef * k.labor_rate_eur_h;
  const vsaoi = labor * k.employer_social_tax_vsaoi;
  const cost = labor + mechanisms + materials + transport + vsaoi;
  const profit = labor * k.labor_markup_factor - labor + (k.kops_profit_extra_eur ?? 0);
  const offer = cost + profit;
  const roofM2 = c.value('valcprofils_rukki.valcprofils_rukki', 'qty') + c.value('valcprofils_zn.valcprofils_zn', 'qty');
  return {
    lines: out, materials, hours, transport, mechanisms, hoursCoef, days, labor, vsaoi, cost, profit, offer,
    perM2: roofM2 ? offer / roofM2 : 0, vat: offer * k.vat_rate_standard, offerVat: offer * (1 + k.vat_rate_standard), roofM2,
  };
}
export type SummaryResult = ReturnType<typeof summarize>;
