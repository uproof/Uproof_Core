import type { InputValues, OfferResult, OfferTemplate } from '@/ui/api';

/** Input keys whose sum is shown as the offer line quantity (workbook Piedāvājums column E). */
const QTY_KEYS: Record<number, string[]> = {
  8: ['demo_slate_m2', 'demo_standing_seam_m2', 'demo_sheet_metal_m2', 'demo_shingles_m2', 'demo_tiles_m2'],
  9: ['insulation_150_m2', 'insulation_200_m2'], 10: ['batten_area_m2'], 11: ['eaves_ventilated_m'], 12: ['gutter_m'],
  13: ['seam_zn_m2', 'seam_rukki_m2'], 14: ['ridge_ventilated_m'], 15: ['verge_1_m', 'verge_2_m', 'verge_3_m', 'verge_4_m'],
  16: ['valley_m'], 17: ['wall_abutment_m'], 18: ['vent_outlet_metal_count', 'vent_outlet_plastic_count'], 19: ['soffit_area_m2'], 21: ['site_scaffold_area_m2'],
};

export interface OfferLine { line: number; description: string; specification: string; unit: string; quantity: number; amount: number }

/** Combines calculated offer amounts with the offer text template from the API. */
export function buildOfferLines(offer: OfferResult, inputs: InputValues, template: OfferTemplate): OfferLine[] {
  const num = (k: string) => Number(inputs[k]) || 0;
  const cover = num('seam_rukki_m2') > 0 ? 'Rukki Purmat 0.5mm' : num('seam_zn_m2') > 0 ? 'Skārds Zn 0.5mm' : '';
  const insulation = num('insulation_150_m2') > 0 ? 'Paroc Ultra 150mm' : num('insulation_200_m2') > 0 ? 'Paroc Ultra 200mm' : '';
  const spec: Record<number, string> = { 9: insulation, 10: 'C24', 11: cover, 12: 'PE 0.5mm', 13: cover, 14: cover, 15: cover, 16: cover, 17: cover };
  const out: OfferLine[] = [];
  for (let line = 8; line <= 26; line++) {
    const amount = offer.lines[String(line)];
    const text = template[String(line)] as { desc: string; unit: string } | undefined;
    if (!amount || !text) continue;
    out.push({
      line, description: text.desc.replace(/\s+/g, ' ').trim(), specification: spec[line] ?? '', unit: text.unit,
      quantity: QTY_KEYS[line] ? QTY_KEYS[line].reduce((a, k) => a + num(k), 0) : 1, amount,
    });
  }
  return out;
}

export const offerFooter = (template: OfferTemplate): string[] =>
  ((template.footer as string[] | undefined) ?? []).map((t) => String(t).replace(/^\d+\.\s*/, ''));
