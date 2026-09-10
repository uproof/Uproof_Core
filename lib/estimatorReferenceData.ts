export type MaterialPriceReference = {
  position: string;
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
