/** All Tāme line rules, in workbook order. */
import type { LineRule } from '../line';
import { LINES as demolitionLifting } from './demolition_lifting';
import { LINES as structure } from './structure';
import { LINES as insulationMembrane } from './insulation_membrane';
import { LINES as battensEaves } from './battens_eaves';
import { LINES as guttersValleyWindows } from './gutters_valley_windows';
import { LINES as roofCovering } from './roof_covering';
import { LINES as flashingsVents } from './flashings_vents';
import { LINES as ridgeVerges } from './ridge_verges';
import { LINES as chimneyCladdingCaps } from './chimney_cladding_caps';
import { LINES as soffitPainting } from './soffit_painting';
import { LINES as roofSafetySnowMelt } from './roof_safety_snow_melt';
import { LINES as chimneyMasonry } from './chimney_masonry';
import { LINES as siteLogistics } from './site_logistics';
import { LINES as repairs } from './repairs';

export const LINES: LineRule[] = [
  ...demolitionLifting,
  ...structure,
  ...insulationMembrane,
  ...battensEaves,
  ...guttersValleyWindows,
  ...roofCovering,
  ...flashingsVents,
  ...ridgeVerges,
  ...chimneyCladdingCaps,
  ...soffitPainting,
  ...roofSafetySnowMelt,
  ...chimneyMasonry,
  ...siteLogistics,
  ...repairs,
];

/** Display names of blocks (workbook column A). Values starting with "in." come from an input label. */
export const BLOCK_NAMES: Record<string, string> = {
  "demontaza_ar_nocelsanu": "Demontāža ar nocelšanu, m2",
  "uzcelsana": "Uzcelšana",
  "murlatas_montaza": "Mūrlatas montāža, m",
  "sparu_montaza": "Spāru montāža gb",
  "jumta_kopnu_montaza": "Jumta kopņu montāža gb",
  "protezes": "Protēzes gb",
  "siltinasana_un_tvaika_barjera": "Siltināšana un tvaika barjera, m2",
  "difuzijas_membrana": "Difūzijas membrāna, m2",
  "latojums": "Latojums, m2",
  "ventilejama_dzega": "Ventilējama Dzega, m",
  "neventilejama_dzega": "Neventilējama dzega, m",
  "teknes": "Teknes, m",
  "sateknes_montaza": "Sateknes montāža, m",
  "jumta_logu_montaza_1": "Jumta logu montāža 1, gb",
  "jumta_logu_montaza_2": "Jumta logu montāža 2, gb",
  "jumta_logu_pieslegumu_montaza": "Jumta logu pieslēgumu montāža, m",
  "valcprofils_rukki": "Valcprofils Rukki, m2",
  "valcprofils_zn": "Valcprofils Zn, m2",
  "sienas_pieslegums": "Sienas pieslēgums, m",
  "ventilejams_sienas_pieslegums_ba": "Ventilējams sienas pieslēgums bāņu galā, m",
  "skurstena_pieslegums": "Skursteņa pieslēgums, m",
  "ventilacijas_izvada_montaza": "Ventilācijas izvada montāža, gb",
  "plastmasas_skruvejama_ventilacij": "Plastmasas, skrūvējama ventilācijas izvada montāža, gb",
  "jumta_lukas_montaza_ievalcejot_p": "Jumta lūkas montāža Ievalcējot pa vidu loksnei, gb",
  "ievalcejot_starp_divam_loksnem": "Ievalcējot starp divām loksnēm, gb",
  "parapeta_montaza": "Parapeta montāža, m",
  "ventilejama_kore": "Ventilējama kore, m",
  "skruvejamajai_korei": "Skrūvējamajai korei, m",
  "vejmalu_montaza_uz_aizkabem": "Vējmalu montāža uz aizkabēm, m",
  "skurstena_apdare_valcetas_loksne": "Skursteņa apdare, valcētas loksnes, m2",
  "skurstena_jumtins": "Skursteņa jumtiņs, gb",
  "veja_kastes_izbuve": "Vēja kastes izbūve, m2",
  "veja_kastes_krasosana": "Vēja kastes krāsošana, m2",
  "koka_fasades_krasosana": "Koka fasādes krāsošana, m2",
  "mura_fasades_krasosana": "Mūra fasādes krāsošana, m2",
  "sniega_barjeras": "Sniega barjeras, m",
  "jumta_kapnes": "Jumta kāpnes, gb",
  "sienas_kapnes": "Sienas kāpnes, m",
  "jumta_laipas": "Jumta laipas, gb",
  "drosibas_trose": "Drošības trose, m",
  "jumta_nozogojums": "Jumta nožogojums, m",
  "zibens_novedeji": "Zibens novedēji",
  "ugunsdrosa_luka": "Ugunsdroša lūka, gb",
  "sniega_un_ledus_kausesanas_kabel": "Sniega un ledus kausēšanas kabeļa montāža, m",
  "sniega_un_ledus_kausesanas_kabel_2": "Sniega un ledus kausēšanas kabeļa montāža, m",
  "sniega_un_ledus_kausesanas_kabel_3": "Sniega un ledus kausēšanas kabeļa montāža, m",
  "electrical_install_label": "in.electrical_install_label",
  "skurstenu_mura_atjaunosana": "Skursteņu mūra atjaunošana, m2",
  "skurstenu_apmetuma_atjaunosana": "Skursteņu apmetuma atjaunošana, m2",
  "atkritumu_apsaimniekosana": "Atkritumu apsaimniekošana",
  "buvobjekta_iekartosana": "Būvobjekta iekārtošana",
  "transporta_izmaksas": "Transporta izmaksas ",
  "citi": "Citi",
  "labosanas_darbi": "Labošanas darbi",
  "kopa": "Kopā:"
};
