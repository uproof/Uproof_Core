export type MaterialPriceReference = {
  position: string;
  unit?: string;
  priceWithoutVat: number;
  vatMultiplier: number;
  supplier?: string;
};

export type WorkPositionReference = {
  category: string;
  position: string;
  unit: string;
  hoursPerUnit: number;
  hourlyRate: number;
  markup: number;
  description?: string;
};

export type SheetDetailReference = {
  category: string;
  name: string;
  layoutWidth: number;
  foldCount: number;
  rukkiPrice: number;
  zincPrice: number;
  perforatedPrice: number;
  rukki06Price: number;
  foldingPricePerFold: number;
};

const materialRows = `
Valcprofils Rukki|m2|11.4|1.00|Lebens
Valcprofils ZN|m2|7.1|1.00|C95
Ruļļa materiāls cena/m Rukki|m|14.25|1.00|Lebens
Ruļļa materiāls cena/m ZN|m|7.5|1.00|C95
Klemmeri|gb|0.045|1.21|AVR
Klemmeri slīdošie|gb|0.09|1.21|AVR
Klemmeru skrūves PZ 4.5x25|gb|0.00876|1.21|DEPO
Valcgēls|gb|13|1.21|E-Roof
Teknes apaļās 125 ZN|m|2.99|1.21|C95
Āķi, garie 125 ZN|gb|4.485|1.21|C95
Frēzes uzgaļi, 1gb/30 āķi|gb|3.9|1.21|DEPO
Teknes ārējie stūri ZN 125|gb|8.84|1.21|C95
Teknes iekšējie stūri ZN 125|gb|8.84|1.21|C95
Teknes gali ZN 125|gb|2.73|1.21|C95
Teknes piltuves 125/100|gb|3.705|1.21|C95
Noteces caurule D100 Zn|m|3.77|1.21|C95
Sienas stiprinājumu komplekts, Zn 100mm|gb|3.25|1.21|C95
Augšējo līkumu komplekts ZN 100mm|gb|8.58|1.21|C95
Apakšējais līkums ZN 100mm|gb|4.29|1.21|C95
Tapskrūves 200mm|gb|0.43|1.21|DEPO
Kniedes 3.2mm|gb|0.02|1.21|DEPO
Hermētiķis SIKA|gb|6.45|1.21|DEPO
Regulējošā skrūve 6x80|gb|0.12|1.21|DEPO
Kokmateriāli impregnēti|m3|330|1.00|MDD grupa
Apdares dēļi|m3|460|1.00|MDD grupa
Sniega barjeras stieņu pāri, PE, 2m|pāris|36|1.21|C95
Sniega barjera stiprinājums Valcprofilam, PE|gb|7.5|1.21|C95
Stieņu posmu savienojumu pāri|pāris|6.6|1.21|C95
Basic naglu lenta|m|0.3|1.21|Rīgas Būvservis
Naglas pneimatiskai pistolei Ø3.1xL90mm 34°|gb|0.018|1.21|DEPO
Distanceris/ķīlis|gb|0.05|1.21|DEPO
Difūzijas membrāna Rukki 145g 75m2 rullis|rullis|85.12|1.21|DEPO
Skavas 10mm|gb|0.0006|1.21|DEPO
Difūzijas līmlente Gerband 50mm/25m|rullis|17.8|1.21|Kurši
Piebriestoša poliuretāna lenta|m|2|1.21|Kurši
Jumta skrūves 4.8x50|gb|0.057|1.21|DEPO
Jumta skrūves 4.8x35|gb|0.041|1.21|DEPO
Dībeļnaglas ar gremdgalvu 6x50mm|gb|0.013|1.21|DEPO
Urbis betonam 7mm|gb|2|1.21|DEPO
Dībeļnaglas ar gremdgalvu 8x100mm|gb|0.063|1.21|DEPO
Urbis betonam 9mm|gb|3|1.21|DEPO
Vītņstieņi M12 30cm komplekts|gb|1.3|1.21|DEPO
Ķīmiskais Enkurs|gb|15|1.21|DEPO
Plastmasas ventilācijas izvada komplekts|gb|75|1.21|DEPO
Skursteņa jumtiņš bez ekrāna cena/m2|m2|250|1.21|AVR
Skursteņa jumtiņš ar ekrānu cena/m2|m2|350|1.21|AVR
Saplāksnis mitrumizturīgs 12mm|m2|24|1.21|DEPO
Jumta lūka bez pamatnes, Zn|gb|75|1.21|C95
Jumta lūka ar pamatni 625x130, Zn|gb|100|1.21|C95
PVC hidroizolācija 25cm|m|0.18|1.21|Kurši
Jumta laipa 600mm|gb|26.35|1.21|Lebens
Jumta laipa 1400mm|gb|62.9|1.21|Lebens
Jumta laipa 3000mm|gb|104.8|1.21|Lebens
Jumta laipas stiprinājums, valcprofils|gb|18.75|1.21|Lebens
Jumta kāpnes 1.2m 400mm|gb|41.2|1.21|Lebens
Jumta kāpnes 2.7m 400mm|gb|80.6|1.21|Lebens
Jumta kāpnes 3.3m 400mm|gb|98.4|1.21|Lebens
Sienas kāpnes 700mm cinkotas|m|120|1.21|ORIMA
Ugunsdroša EI30 jumta lūka 600x800|gb|1195|1.21|?
Cementa šķiedras plāksne|m2|15|1.21|DEPO
Koka fasādes krāsa|l|13|1.21|DEPO
Nosegšanas plēve|m2|0.2|1.21|DEPO
Krāsošanas palīgmateriālu komplekts 30m2|kpl|19|1.21|DEPO
Lodes ķieģeļi 250x120x65mm|gb|1.03|1.21|DEPO
Mūrēšanas java Sakret ZM 25kg|maiss|3.6|1.21|Būvniecības ABC
Stiklšķiedras siets CT Gewebe 650|m2|1.1|1.21|DEPO
Apmetums Sakret CLP+25kg|maiss|4.5|1.21|DEPO
Vate Paroc Ultra 150mm|m2|6.6|1.21|Kurši
Vate Paroc Ultra 200mm|m2|8.1|1.21|Kurši
Tvaika barjera 200mkr|m2|0.6|1.21|Būvniecības ABC
Toaletes noma+apkalpošana/mēnesī|mēn|100|1.21|tualetes.lv
Būvtāfele|gb|145|1.21|DEPO
Būvgružu konteiners 8m3|gb|425|1.21|DEPO
Šīfera utilizācija EUR/m2|m2|6.8|1.21|Asbestos.lv
Būvgružu maisi 55x100cm|gb|0.27|1.21|DEPO
Big bag 90x90x110cm|gb|6|1.21|DEPO
Materiālu pārklājs 4x6m|gb|19|1.21|Kurši
Ugunsdzēsības inventārs|kpl|15|1.21|DEPO
Sastatnes noma EUR/m2/mēn|m2|1.6|1.21|ALFA rent
Sastatnes aizsargtīkls|m2|1.1|1.21|ALFA rent
Sastatnes montāža|m2|2.8|1.21|ALFA rent
Sastatnes demontāža|m2|1.9|1.21|ALFA rent
Sastatnes piegāde|kpl|1.25|1.21|ALFA rent
Materiālu nocelšana|gb|35|1.21|Manipulātors 15m
Materiālu uzcelšana|gb|35|1.21|Manipulātors 15m
Transports uz objektu EUR/km|km|0.3|1.21|Mūsu transports
Darba vadītāja izmaksas 1 mēn|mēn|400|1.21|Valdis
Koka laipas izbūve bēniņos|m|52|1.21|Detaļas, kokmateriāli
Beramvate 1m3|m3|31.55|1.21|Rīgas Būvservis
Beramvates iestrāde 1m3|m3|15.7|1.21|Rīgas Būvservis
Velux jumta logs 94x140cm|gb|484|1.21|Rīgas Būvservis
Difūzijas membrāna ar sietu Eurovent|m2|4.2|1.21|Produss
`;

export const MATERIAL_PRICE_REFERENCES: MaterialPriceReference[] = materialRows.trim().split('\n').map((row) => {
  const [position, unit, priceWithoutVat, vatMultiplier, supplier] = row.split('|');
  return {position, unit, priceWithoutVat: Number(priceWithoutVat), vatMultiplier: Number(vatMultiplier), supplier};
});

const workRows = `
Valcprofils|Klemmeri, aizvalcēšana|m2|0.55|18|1.70
Valcprofils|Valcgēls, ja slīpums zem 18 grādiem|gb|0.5|18|1.70
Teknes|Teknes apaļās 125|m|0.3|18|1.70
Teknes|Āķi, garie solis 60|gb|0.15|18|1.70
Teknes|Teknes ārējie stūri|gb|0.2|18|1.70
Teknes|Teknes iekšējie stūri|gb|0.2|18|1.70
Teknes|Teknes gali 125|gb|0.07|18|1.70
Teknes|Teknes piltuves|gb|0.2|18|1.70
Teknes|Noteces D100|m|0.5|18|1.70
Latojums|Starplatojums|m|0.12|18|1.70
Latojums|Naglu lenta|m|0.02|18|1.70
Latojums|Šķērslatojums sprauga 100mm|m2|0.22|18|1.70
Latojums|Līmeņošana starplatas|m2|0.22|18|1.70
Difūzijas membrāna|Rukki 145g|m2|0.08|18|1.70
Difūzijas membrāna|Membrānas līmlenta|m|0.02|18|1.70
Dzega|Apakšlāsne|m|0.15|18|1.70
Dzega|Kaitēku siets perforēts|m|0.1|18|1.70
Dzega|Lāsene|m|0.15|18|1.70
Ventilējama kore|Brusas 50x50|m|0.15|18|1.70
Ventilējama kore|Perforēts skārds|m|0.1|18|1.70
Ventilējama kore|Dēlis 25x100|m|0.1|18|1.70
Ventilējama kore|Kores nosegelements|m|0.1|18|1.70
Sateknes montāža|Sateknes profils|m|0.9|18|1.70
Sienas pieslēgums|Uzlocīts skārds|m|0.5|18|1.70
Skursteņa apdare|Cementa šķiedras plāksne|m2|0.5|18|1.70
Skursteņa apdare|Valcprofila loksnes|m2|0.6|18|1.70
Jumta logu montāža|Jumta logs, komplekts|gb|2|18|1.70
Ventilācijas izvads|Skārda caurule D100-150|gb|1.6|18|1.70
Jumta lūkas montāža|Jumta lūka|gb|1.33|18|1.70
Vēja kastes izbūve|Karkasa montāža|m|0.8|18|1.70
Vēja kastes izbūve|Apdares dēļi|m2|1.7|18|1.70
Sniega barjeras|Apaļās cauruļveida|m|0.4|18|1.70
Jumta drošības elementi|Jumta kāpnes|gb|2|18|1.70
Jumta drošības elementi|Jumta laipas|gb|1.5|18|1.70
Jumta drošības elementi|Drošības troses|m|0.2|18|1.70
Siltināšana|Vate 150mm|m2|0.12|18|1.70
Siltināšana|Tvaika barjera|m2|0.1|18|1.70
Demontāža|Šīfera demontāža|m2|0.1|18|1.70
Demontāža|Valcprofila demontāža|m2|0.2|18|1.70
Demontāža|Noteksistēmas demontāža|m|0.1|18|1.70
Uzcelšana/nocelšana|Uzcelšana|gb|1|18|1.70
Uzcelšana/nocelšana|Nocelšana|gb|1|18|1.70
`;

export const WORK_POSITION_REFERENCES: WorkPositionReference[] = workRows.trim().split('\n').map((row) => {
  const [category, position, unit, hoursPerUnit, hourlyRate, markup] = row.split('|');
  return {category, position, unit, hoursPerUnit: Number(hoursPerUnit), hourlyRate: Number(hourlyRate), markup: Number(markup), description: position};
});

export const SHEET_DETAIL_REFERENCES: SheetDetailReference[] = [
  {category: 'Dzega', name: 'Apakšlāsne (5+15+2+2=24cm)', layoutWidth: 0.24, foldCount: 3, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Dzega', name: 'Kaitēku siets perforēts (5+8=13cm)', layoutWidth: 0.13, foldCount: 1, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Dzega', name: 'Lāsene (13+3+15+2+2=35cm)', layoutWidth: 0.35, foldCount: 4, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Ventilējama kore', name: 'Lāsene 90 grādi', layoutWidth: 0.25, foldCount: 4, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Ventilējama kore', name: 'Perforēts skārds', layoutWidth: 0.07, foldCount: 1, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Ventilējama kore', name: 'Kores nosegelements', layoutWidth: 0.44, foldCount: 3, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Skrūvējamā kore', name: 'Apakškores profils', layoutWidth: 0.52, foldCount: 3, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Vējmalu montāža', name: 'Vējmalas 1', layoutWidth: 0.285, foldCount: 3, rukkiPrice: 10, zincPrice: 6, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Sateknes montāža', name: 'Sateknes profils', layoutWidth: 0.64, foldCount: 3, rukkiPrice: 9.4, zincPrice: 6.84, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
  {category: 'Sienas pieslēgums', name: 'Skārda noseglīste', layoutWidth: 0.16, foldCount: 3, rukkiPrice: 4.6, zincPrice: 3.96, perforatedPrice: 8, rukki06Price: 11, foldingPricePerFold: 1},
];

export const SLOPE_COEFFICIENT_REFERENCES: SlopeCoefficientReference[] = [
  [0, 1], [5, 1.004], [10, 1.015], [15, 1.035], [20, 1.064], [25, 1.103], [30, 1.155], [35, 1.221], [40, 1.305], [45, 1.414], [50, 1.556], [55, 1.743], [60, 2],
].map(([angleDegrees, areaMultiplier]) => ({angleDegrees, areaMultiplier}));

export type SlopeCoefficientReference = {
  angleDegrees: number;
  areaMultiplier: number;
};

export type EstimatorReferenceData = {
  materialPrices: MaterialPriceReference[];
  workPositions: WorkPositionReference[];
  sheetDetails: SheetDetailReference[];
  slopeCoefficients: SlopeCoefficientReference[];
};

export function calculateMaterialPrice(reference: MaterialPriceReference, quantity: number) {
  return reference.priceWithoutVat * reference.vatMultiplier * quantity;
}

export function calculateWorkPosition(reference: WorkPositionReference, quantity: number) {
  const hours = reference.hoursPerUnit * quantity;
  const labour = hours * reference.hourlyRate;
  return {
    hours,
    labour,
    labourWithMarkup: hours * reference.hourlyRate * reference.markup,
    unitCost: reference.hourlyRate * reference.hoursPerUnit,
  };
}

export function calculateSheetDetail(reference: SheetDetailReference, quantity: number, material: 'rukki' | 'zinc' | 'perforated' | 'rukki06') {
  const materialPrice = material === 'rukki' ? reference.rukkiPrice : material === 'zinc' ? reference.zincPrice : material === 'perforated' ? reference.perforatedPrice : reference.rukki06Price;
  const foldingCost = reference.foldCount * reference.foldingPricePerFold;
  return (reference.layoutWidth * materialPrice + foldingCost) * quantity;
}

export function calculateSlopeAdjustedArea(area2d: number, angleDegrees: number, coefficients: SlopeCoefficientReference[]) {
  if (!Number.isFinite(area2d) || area2d < 0) return 0;
  if (coefficients.length === 0) return area2d;
  const nearest = [...coefficients].sort((left, right) => Math.abs(left.angleDegrees - angleDegrees) - Math.abs(right.angleDegrees - angleDegrees))[0];
  return area2d * nearest.areaMultiplier;
}
