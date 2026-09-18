/** Input form layout. `section` ids match inputs_schema.json "section". */
export type SectionLayout = 'fields' | 'chimneys' | 'painting' | 'windows' | 'snowMelt';

export interface InputSection { id: string; title: string; titleLv: string; layout: SectionLayout }

export const INPUT_SECTIONS: InputSection[] = [
  { id: 'conditions', title: 'Site conditions', titleLv: 'Apstākļi', layout: 'fields' },
  { id: 'demolition', title: 'Demolition', titleLv: 'Demontāža', layout: 'fields' },
  { id: 'roofing', title: 'Roof covering and flashings', titleLv: 'Jumta segums un skārds', layout: 'fields' },
  { id: 'gutters', title: 'Gutters', titleLv: 'Teknes', layout: 'fields' },
  { id: 'battens', title: 'Battens', titleLv: 'Latojums', layout: 'fields' },
  { id: 'insulation', title: 'Insulation', titleLv: 'Siltinājums', layout: 'fields' },
  { id: 'structure', title: 'Structure', titleLv: 'Konstrukcijas', layout: 'fields' },
  { id: 'soffit', title: 'Soffit box', titleLv: 'Vēja kaste', layout: 'fields' },
  { id: 'painting', title: 'Painting', titleLv: 'Krāsošana', layout: 'painting' },
  { id: 'safety', title: 'Roof safety', titleLv: 'Drošība', layout: 'fields' },
  { id: 'chimneys', title: 'Chimneys', titleLv: 'Skursteņi', layout: 'chimneys' },
  { id: 'snow_melt', title: 'Snow melting', titleLv: 'Sniega kausēšana', layout: 'snowMelt' },
  { id: 'windows', title: 'Roof windows', titleLv: 'Jumta logi', layout: 'windows' },
  { id: 'site_setup', title: 'Site setup', titleLv: 'Objekta iekārtošana', layout: 'fields' },
];

/** Inputs present in the workbook but not used by any formula (spec section 3). */
export const UNUSED_INPUTS = new Set(['verge_1_width_mm', 'verge_2_width_mm', 'batten_gap_mm', 'snow_guard_sheet_m', 'lightning_rod', 'site_pedestrian_tunnel_m', 'site_construction_lift_days', 'counter_batten_thickness_m', 'counter_batten_width_m', 'cross_batten_thickness_m', 'cross_batten_width_m']);
export const HIDDEN_INPUTS = new Set(['counter_batten_thickness_m', 'counter_batten_width_m', 'cross_batten_thickness_m', 'cross_batten_width_m']);

export const UNIT_LABELS: Record<string, string> = { pcs: 'gb', fraction: 'daļa', deg: '°', people: 'cilv.', nights: 'naktis', months: 'mēn.', days: 'dienas', coats: 'kārtas', x: '×' };
export const unitLabel = (u: string) => UNIT_LABELS[u] ?? u.replace(/ \(.*\)/, '').replace('EUR ex VAT', '€');
