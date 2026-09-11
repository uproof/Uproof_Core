/**
 * Native UpRoof estimator engine
 * Generates Piedāvājums (customer offer) and F2 forma (detailed estimate)
 * from CRM lead data and reference tables.
 */

import type { CrmEstimatorFormData } from './crmEstimator';
import {
  MATERIAL_PRICE_REFERENCES,
  SHEET_DETAIL_REFERENCES,
  SLOPE_COEFFICIENT_REFERENCES,
  WORK_POSITION_REFERENCES,
  calculateSlopeAdjustedArea,
} from './estimatorReferenceData';

export type EstimatorLineItem = {
  row: number;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  unitLabor: number;
  laborHours?: number;
  mechanisms?: number;
  totalMaterial: number;
  totalLabor: number;
  total: number;
};

export type PiedāvājumsRow = {
  position: number;
  description: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type F2EstimateRow = {
  row: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  unitLabor: number;
  laborHours?: number;
  totalMaterial: number;
  totalLabor: number;
  mechanisms?: number;
  overhead: number;
  profit: number;
  total: number;
};

export type EstimatorOutput = {
  piedāvājums: {
    title: string;
    rows: PiedāvājumsRow[];
    summary: {
      materials: number;
      labor: number;
      overhead: number;
      discount: number;
      subtotal: number;
      vat: number;
      total: number;
    };
  };
  f2Forma: {
    title: string;
    rows: F2EstimateRow[];
    summary: {
      directCosts: number;
      overhead: number;
      profit: number;
      employerTax: number;
      subtotalExVat: number;
      vat: number;
      totalIncVat: number;
    };
  };
  settings?: {
    slopeCoefficient: number;
    materialPrices: Array<Record<string, unknown>>;
    workRates: Array<Record<string, unknown>>;
    sheetMetalDetails: Array<Record<string, unknown>>;
    slopeCoefficients?: Array<{angle: number; multiplier: number}>;
  };
  materials: Array<{
    item: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  workPlan: Array<{
    day: number;
    task: string;
    hours: number;
    crew: number;
    date?: string;
  }>;
  dailyPlan?: Array<{day: number; date: string; tasks: string; crew: number; hours: number; completed: boolean; comments: string}>;
};

/**
 * Core reference tables for UpRoof estimates
 */
export const ESTIMATOR_REFERENCE_DATA = {
  /**
   * Material categories and base pricing
   */
  materialCategories: {
    'Jumta siltumizolācija': { name: 'Thermal insulation', basePrice: 8.74 },
    'Tvaika barjera': { name: 'Vapor barrier', basePrice: 2.99 },
    'Difūzijas membrāna': { name: 'Diffusion membrane', basePrice: 3.57 },
    'Valcprofila segums': { name: 'Metal roofing', basePrice: 13.53 },
    'Noteksistēma': { name: 'Drainage system', basePrice: 21.13 },
    'Vēja kaste': { name: 'Wind box', basePrice: 11.08 },
  },

  /**
   * Labor categories and hourly rates (€ per hour)
   */
  laborRates: {
    'Demontāžas darbi': { rate: 18, description: 'Demolition work' },
    'Latojuma montāža': { rate: 22, description: 'Lathing installation' },
    'Izolācijas ieklāšana': { rate: 20, description: 'Insulation placement' },
    'Valcprofila montāža': { rate: 25, description: 'Metal roofing installation' },
    'Noteksistēmas montāža': { rate: 23, description: 'Drainage installation' },
    'Vēja kastes apdare': { rate: 20, description: 'Wind box finishing' },
  },

  /**
   * Markup multipliers for labor based on complexity
   */
  laborMarkup: {
    standard: 1.7,
    complex: 2.1,
    safety: 1.3,
  },

  /**
   * Overhead and margin percentages
   */
  overheadMargins: {
    overhead: 0.04,     // 4% general overhead
    profit: 0.02,       // 2% profit margin
    employerTax: 0.2359, // 23.59% VSAOI
    vat: 0.21,          // 21% VAT
    safetyAllowance: 0.30, // 30% safety/contingency
  },
  slopeCoefficients: {0: 1, 5: 1.004, 10: 1.015, 15: 1.035, 20: 1.064, 25: 1.103, 30: 1.155, 35: 1.221, 40: 1.305, 45: 1.414, 50: 1.556, 55: 1.743, 60: 2},
  sheetMetalDetails: [
    {name: 'Apakšlāsne', width: 0.24, priceRukki: 5.4, priceZn: 4.44},
    {name: 'Kaitēku siets', width: 0.13, priceRukki: 2.04, priceZn: 1.7},
    {name: 'Lāsene', width: 0.35, priceRukki: 7.85, priceZn: 6.1},
    {name: 'Ventilējama kore', width: 0.25, priceRukki: 6.75, priceZn: 5.5},
  ],
};

function numeric(value: string | number | null | undefined, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slopeCoefficient(value: string) {
  const angle = numeric(value.replace(/[^0-9,.]/g, ''), 0);
  return calculateSlopeAdjustedArea(1, angle, SLOPE_COEFFICIENT_REFERENCES);
}

function referenceSettings(data: CrmEstimatorFormData): NonNullable<EstimatorOutput['settings']> {
  const saved = data.engineOutputs?.settings;
  const savedSettings = saved && typeof saved === 'object' ? saved as Record<string, unknown> : {};
  const materialPrices: NonNullable<EstimatorOutput['settings']>['materialPrices'] = Array.isArray(savedSettings.materialPrices)
    ? savedSettings.materialPrices as NonNullable<EstimatorOutput['settings']>['materialPrices']
    : MATERIAL_PRICE_REFERENCES.map((item) => ({name: item.position, unit: item.unit || '', priceExVat: item.priceWithoutVat, vatRate: item.vatMultiplier, priceWithVat: item.priceWithoutVat * item.vatMultiplier, supplier: item.supplier || ''}));
  const workRates: NonNullable<EstimatorOutput['settings']>['workRates'] = Array.isArray(savedSettings.workRates)
    ? savedSettings.workRates as NonNullable<EstimatorOutput['settings']>['workRates']
    : WORK_POSITION_REFERENCES.map((item) => ({category: item.category, description: item.description || item.position, unit: item.unit, hoursPerUnit: item.hoursPerUnit, rate: item.hourlyRate, markup: item.markup}));
  const sheetMetalDetails: NonNullable<EstimatorOutput['settings']>['sheetMetalDetails'] = Array.isArray(savedSettings.sheetMetalDetails)
    ? savedSettings.sheetMetalDetails as NonNullable<EstimatorOutput['settings']>['sheetMetalDetails']
    : SHEET_DETAIL_REFERENCES;
  const slopeCoefficients = (Array.isArray(savedSettings.slopeCoefficients) ? savedSettings.slopeCoefficients : SLOPE_COEFFICIENT_REFERENCES.map((item) => ({angle: item.angleDegrees, multiplier: item.areaMultiplier}))) as Array<{angle: number; multiplier: number}>;
  return {materialPrices, workRates, sheetMetalDetails, slopeCoefficients, slopeCoefficient: numeric(String(savedSettings.slopeCoefficient ?? ''), slopeCoefficient(data.roofPitch))};
}

function referencePrice(settings: ReturnType<typeof referenceSettings>, name: string, fallback: number) {
  const match = settings.materialPrices.find((item) => String((item as Record<string, unknown>).name || '').toLowerCase().includes(name.toLowerCase()));
  return numeric(String((match as Record<string, unknown> | undefined)?.priceExVat ?? ''), fallback);
}

function referenceRate(settings: ReturnType<typeof referenceSettings>, name: string, fallback: number) {
  const match = settings.workRates.find((item) => String((item as Record<string, unknown>).description || '').toLowerCase().includes(name.toLowerCase()));
  return numeric(String((match as Record<string, unknown> | undefined)?.rate ?? ''), fallback);
}

/**
 * Generate base estimate line items from CRM data
 */
export function generateBaseLineItems(data: CrmEstimatorFormData): EstimatorLineItem[] {
  const items: EstimatorLineItem[] = [];
  let rowNum = 1;

  // Parse roof area
  const roofArea = numeric(data.existingRoofArea);
  if (roofArea <= 0) return [];
  const settings = referenceSettings(data);
  const area = roofArea * settings.slopeCoefficient;
  const add = (item: Omit<EstimatorLineItem, 'row'>) => items.push({...item, row: rowNum++});

  // Demolition work
  if (data.roofProblem) {
    items.push({
      row: rowNum++,
      category: 'Demontāžas darbi',
      description: `Esošā jumta seguma demontāža - ${data.existingRoofCovering || 'nav norādīts'}`,
      unit: 'm²',
      quantity: roofArea,
      unitPrice: referencePrice(settings, 'Būvgružu', 4.50),
      unitLabor: 0.5,
      totalMaterial: roofArea * referencePrice(settings, 'Būvgružu', 4.50),
      totalLabor: roofArea * referenceRate(settings, 'demontāža', 0.5),
      total: roofArea * (referencePrice(settings, 'Būvgružu', 4.50) + referenceRate(settings, 'demontāža', 0.5)),
    });
  }

  // Insulation
  if (data.insulation && data.insulation !== 'Nav nepieciešams') {
    const thickness = parseFloat(data.insulationThickness || '150') / 1000; // Convert mm to m
    const insulationArea = data.insulation.includes('Visa') ? roofArea : roofArea * 0.5;
    items.push({
      row: rowNum++,
      category: 'Jumta siltumizolācija',
      description: `Jumta siltumizolācija ${data.insulationThickness || '150'} mm - Paroc Ultra`,
      unit: 'm²',
      quantity: insulationArea,
      unitPrice: 8.74,
      unitLabor: 0.7,
      totalMaterial: insulationArea * 8.74,
      totalLabor: insulationArea * 0.7,
      total: insulationArea * 9.44,
    });
  }

  // Vapor barrier
  items.push({
    row: rowNum++,
    category: 'Tvaika barjera',
    description: 'Tvaika barjeras plēve 200mkr',
    unit: 'm²',
    quantity: roofArea,
    unitPrice: 2.99,
    unitLabor: 0.3,
    totalMaterial: roofArea * 2.99,
    totalLabor: roofArea * 0.3,
    total: roofArea * 3.29,
  });

  // Diffusion membrane
  items.push({
    row: rowNum++,
    category: 'Difūzijas membrāna',
    description: 'Difūzijas membrāna Rukki 145 ar ieklāšanu',
    unit: 'm²',
    quantity: roofArea,
    unitPrice: 3.57,
    unitLabor: 0.25,
    totalMaterial: roofArea * 3.57,
    totalLabor: roofArea * 0.25,
    total: roofArea * 3.82,
  });

  // Lathing
  items.push({
    row: rowNum++,
    category: 'Latojuma montāža',
    description: 'Jumta latojums 25x50 mm un 25x100 mm ar stiprinājumiem',
    unit: 'm²',
    quantity: roofArea,
    unitPrice: 9.22,
    unitLabor: 1.0,
    totalMaterial: roofArea * 9.22,
    totalLabor: roofArea * 1.0,
    total: roofArea * 10.22,
  });

  // Drainage system
  if (data.gutterSystem && data.gutterSystem !== 'Nav nepieciešams') {
    const gutterLength = roofArea > 100 ? 40 : 24; // Estimate based on area
    items.push({
      row: rowNum++,
      category: 'Noteksistēma',
      description: 'Teknes D125 mm un notekcaurules D100 mm ar komplektējošiem elementiem',
      unit: 'm',
      quantity: gutterLength,
      unitPrice: 21.13,
      unitLabor: 0.5,
      totalMaterial: gutterLength * 21.13,
      totalLabor: gutterLength * 0.5,
      total: gutterLength * 21.63,
    });
  }

  // Metal roofing
  items.push({
    row: rowNum++,
    category: 'Valcprofila segums',
    description: `Valcprofila jumta segums - ${data.desiredRoofCovering || 'Rukki PurMat'} ${data.desiredMaterialColor || ''}`,
    unit: 'm²',
    quantity: roofArea,
    unitPrice: 13.53,
    unitLabor: 0.8,
    totalMaterial: roofArea * 13.53,
    totalLabor: roofArea * 0.8,
    total: roofArea * 14.33,
  });

  // Wind box (if renovation selected)
  if (data.eaveBoxRenovation) {
    items.push({
      row: rowNum++,
      category: 'Vēja kaste',
      description: 'Vēja kastes izbūve ar karkasu un apdares dēļiem',
      unit: 'm²',
      quantity: roofArea * 0.15, // Estimate 15% of roof area
      unitPrice: 11.08,
      unitLabor: 1.2,
      totalMaterial: roofArea * 0.15 * 11.08,
      totalLabor: roofArea * 0.15 * 1.2,
      total: roofArea * 0.15 * 12.28,
    });
  }

  // Safety systems (if requested)
  if (data.snowBarriers === 'Jā' || data.snowBarriers === 'visam jumtam') {
    items.push({
      row: rowNum++,
      category: 'Drošības sistēmas',
      description: 'Sniega barjeru montāža',
      unit: 'm²',
      quantity: roofArea,
      unitPrice: 5.5,
      unitLabor: 0.4,
      totalMaterial: roofArea * 5.5,
      totalLabor: roofArea * 0.4,
      total: roofArea * 5.9,
    });
  }

  // Material handling and waste management
  items.push({
    row: rowNum++,
    category: 'Būvobjekta darbi',
    description: 'Materiālu piegāde, būvgružu utilizācija un objekta iekārtošana',
    unit: 'kpl',
    quantity: 1,
    unitPrice: Math.max(500, roofArea * 3),
    unitLabor: 0,
    totalMaterial: Math.max(500, roofArea * 3),
    totalLabor: 0,
    total: Math.max(500, roofArea * 3),
  });

  return items;
}

/**
 * Calculate totals with overhead, profit, and taxes
 */
export function calculateTotals(
  items: EstimatorLineItem[],
  includeVat: boolean = true,
): { materials: number; labor: number; subtotal: number; vat: number; total: number } {
  const materials = items.reduce((sum, item) => sum + item.totalMaterial, 0);
  const labor = items.reduce((sum, item) => sum + item.totalLabor, 0);
  const overhead = (materials + labor) * ESTIMATOR_REFERENCE_DATA.overheadMargins.overhead;
  const profit = (materials + labor) * ESTIMATOR_REFERENCE_DATA.overheadMargins.profit;
  const subtotal = materials + labor + overhead + profit;
  const vat = includeVat ? subtotal * ESTIMATOR_REFERENCE_DATA.overheadMargins.vat : 0;
  const total = subtotal + vat;

  return { materials, labor: labor + overhead + profit, subtotal, vat, total };
}

/**
 * Generate complete estimator output
 */
export function generateEstimatorOutput(data: CrmEstimatorFormData): EstimatorOutput {
  const items = generateBaseLineItems(data);
  const totals = calculateTotals(items);
  const settings = referenceSettings(data);

  // Piedāvājums rows (simplified for customer)
  const piedāvājumsRows: PiedāvājumsRow[] = items.map((item, index) => ({
    position: index + 1,
    description: item.description,
    specification: item.category,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: parseFloat((item.total / item.quantity).toFixed(2)),
    total: parseFloat(item.total.toFixed(2)),
  }));

  // F2 forma rows (detailed for internal)
  const f2Rows: F2EstimateRow[] = items.map((item) => ({
    row: item.row,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: parseFloat((item.totalMaterial / item.quantity).toFixed(2)),
    unitLabor: parseFloat((item.totalLabor / item.quantity).toFixed(2)),
    laborHours: parseFloat((item.laborHours ?? item.quantity * 0.2).toFixed(2)),
    totalMaterial: parseFloat(item.totalMaterial.toFixed(2)),
    totalLabor: parseFloat(item.totalLabor.toFixed(2)),
    mechanisms: parseFloat((item.mechanisms ?? 0).toFixed(2)),
    overhead: parseFloat(((item.total * ESTIMATOR_REFERENCE_DATA.overheadMargins.overhead) / item.quantity).toFixed(2)),
    profit: parseFloat(
      ((item.total * ESTIMATOR_REFERENCE_DATA.overheadMargins.profit) / item.quantity).toFixed(2),
    ),
    total: parseFloat(item.total.toFixed(2)),
  }));

  // Materials list
  const materials = items
    .filter((item) => item.totalMaterial > 0)
    .map((item) => ({
      item: item.description,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: parseFloat((item.totalMaterial / item.quantity).toFixed(2)),
      total: parseFloat(item.totalMaterial.toFixed(2)),
    }));

  // Work plan (simplified)
  const workPlan = [
    {day: 1, task: 'Būvobjekta iekārtošana un drošības pasākumi', hours: 4, crew: 2},
    {day: 2, task: 'Esošā jumta seguma demontāža', hours: 6, crew: 3},
    {day: 3, task: 'Jumta konstrukciju pārbaude un latojums', hours: 8, crew: 3},
    {day: 4, task: 'Siltināšana un tvaika barjeras ieklāšana', hours: 8, crew: 2},
    {day: 5, task: 'Difūzijas membrāna un valcprofila segums', hours: 8, crew: 3},
    {day: 6, task: 'Teknes, skārda detaļas un vēja kastes', hours: 6, crew: 2},
    {day: 7, task: 'Pārbaude, utilizācija un objekta nodošana', hours: 4, crew: 2},
  ];
  const dailyPlan = workPlan.map((item) => ({day: item.day, date: '', tasks: item.task, crew: item.crew, hours: item.hours, completed: false, comments: ''}));

  return {
    piedāvājums: {
      title: `Piedāvājums jumta renovācijai - ${data.existingRoofArea} m²`,
      rows: piedāvājumsRows,
      summary: {
        materials: parseFloat(totals.materials.toFixed(2)),
        labor: parseFloat(totals.labor.toFixed(2)),
        overhead: parseFloat((totals.subtotal * ESTIMATOR_REFERENCE_DATA.overheadMargins.overhead).toFixed(2)),
        discount: 0,
        subtotal: parseFloat(totals.subtotal.toFixed(2)),
        vat: parseFloat(totals.vat.toFixed(2)),
        total: parseFloat(totals.total.toFixed(2)),
      },
    },
    f2Forma: {
      title: 'Lokālā tāme Nr.1',
      rows: f2Rows,
      summary: {
        directCosts: parseFloat(totals.materials.toFixed(2)),
        overhead: parseFloat((totals.subtotal * ESTIMATOR_REFERENCE_DATA.overheadMargins.overhead).toFixed(2)),
        profit: parseFloat((totals.subtotal * ESTIMATOR_REFERENCE_DATA.overheadMargins.profit).toFixed(2)),
        employerTax: parseFloat((totals.subtotal * ESTIMATOR_REFERENCE_DATA.overheadMargins.employerTax).toFixed(2)),
        subtotalExVat: parseFloat(totals.subtotal.toFixed(2)),
        vat: parseFloat(totals.vat.toFixed(2)),
        totalIncVat: parseFloat(totals.total.toFixed(2)),
      },
    },
    settings: {
      slopeCoefficient: settings.slopeCoefficient,
      materialPrices: settings.materialPrices,
      workRates: settings.workRates,
      sheetMetalDetails: settings.sheetMetalDetails,
      slopeCoefficients: settings.slopeCoefficients as Array<{angle: number; multiplier: number}>,
    },
    materials,
    workPlan,
    dailyPlan,
  };
}
