export type EstimatorDayPlanRow = {
  dayNo: string | number;
  taskText: string;
  date: string | Date | null;
};

export type EstimatorTameRow = {
  category?: string;
  material?: string;
  finalQuantity?: string | number;
  unit?: string;
};

export type MaterialDashboardRow = {
  dayNo: string | number;
  taskText: string;
  date: string | Date | null;
  material: string;
  quantity: number | '';
  unit: string;
  leadTime: string | number;
  orderByDate: string | Date | null;
  key: string;
};

export type EstimatorProjectOutputs = {
  materials: MaterialDashboardRow[];
  workPlan: EstimatorDayPlanRow[];
  source: 'estimator-engine';
};

export type TameLineInput = {
  quantity: number;
  reserve: number;
  unitMaterialPrice: number;
  hoursPerUnit: number;
  hourlyRate: number;
  workMarkup?: number;
};

export type TameLineResult = TameLineInput & {
  quantityWithReserve: number;
  materialTotal: number;
  workHours: number;
  labourUnit: number;
  labourTotal: number;
  labourHoursWithMarkup: number;
  labourTotalWithMarkup: number;
  total: number;
};

export function workbookRoundUp(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.ceil(value * factor) / factor;
}

export function workbookIfError<T>(operation: () => T, fallback: T): T {
  try {
    return operation();
  } catch {
    return fallback;
  }
}

/** Mirrors the core Tāme columns D:R from the workbook. */
export function calculateTameLine(input: TameLineInput): TameLineResult {
  const quantityWithReserve = input.quantity * input.reserve;
  const materialTotal = input.unitMaterialPrice * quantityWithReserve;
  const workHours = input.hoursPerUnit * input.quantity;
  const labourUnit = input.hourlyRate * input.hoursPerUnit;
  const labourTotal = workHours * input.hourlyRate;
  const markup = input.workMarkup ?? 1.7;
  const labourHoursWithMarkup = input.hoursPerUnit * markup;
  const labourTotalWithMarkup = labourHoursWithMarkup * input.quantity * input.hourlyRate;

  return {
    ...input,
    quantityWithReserve,
    materialTotal,
    workHours,
    labourUnit,
    labourTotal,
    labourHoursWithMarkup,
    labourTotalWithMarkup,
    total: materialTotal + labourTotal,
  };
}

function normalize(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function toNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(String(value).replace(',', '.'));
  return Number.isNaN(number) ? 0 : number;
}

function dateKey(value: string | Date | null) {
  return value instanceof Date ? value.getTime() : String(value || '');
}

/**
 * Code equivalent of the workbook Procurement -> Refresh Materials Dashboard
 * script. It preserves manual lead times by generated material-row key and only
 * emits materials when an estimator category starts on a new planned day.
 */
export function buildEstimatorProjectOutputs(days: EstimatorDayPlanRow[], tameRows: EstimatorTameRow[], previousLeadTimes: Map<string, string | number> = new Map()): EstimatorProjectOutputs {
  const materialsByCategory = new Map<string, Array<{category: string; material: string; quantity: number; unit: string}>>();
  let currentCategory = '';

  for (const row of tameRows) {
    const category = normalize(row.category);
    if (category) currentCategory = category;

    const material = normalize(row.material);
    const quantity = toNumber(row.finalQuantity);
    const unit = normalize(row.unit);
    if (!currentCategory || !material || quantity <= 0) continue;

    const materials = materialsByCategory.get(currentCategory) || [];
    materials.push({category: currentCategory, material, quantity, unit});
    materialsByCategory.set(currentCategory, materials);
  }

  const categories = [...materialsByCategory.keys()];
  const output: MaterialDashboardRow[] = [];
  let previousActive = new Set<string>();

  for (const day of days) {
    const dayNo = day.dayNo;
    const taskText = normalize(day.taskText);
    const date = day.date;
    if (dayNo === '' && !taskText && !date) continue;

    const active = categories
      .map((category) => ({category, index: taskText.toLowerCase().indexOf(category.toLowerCase())}))
      .filter((entry) => entry.index !== -1)
      .sort((left, right) => left.index - right.index || right.category.length - left.category.length)
      .map((entry) => entry.category);

    const activeSet = new Set(active);
    const newCategories = active.filter((category) => !previousActive.has(category));
    const unique = new Map<string, {category: string; material: string; quantity: number; unit: string}>();

    for (const category of newCategories) {
      for (const material of materialsByCategory.get(category) || []) {
        const key = [material.category, material.material, material.quantity, material.unit].join('|');
        unique.set(key, material);
      }
    }

    const dayKey = `DAY|${dayNo}|${taskText}|${dateKey(date)}`;
    if (unique.size === 0) {
      output.push({dayNo, taskText, date, material: '', quantity: '', unit: '', leadTime: '', orderByDate: null, key: dayKey});
    } else {
      [...unique.values()].forEach((material, index) => {
        const key = [dayNo, taskText, dateKey(date), material.category, material.material, material.quantity, material.unit].join('|');
        const leadTime = previousLeadTimes.get(key) ?? '';
        const orderByDate = leadTime === '' || date === null ? null : new Date(new Date(date).getTime() - toNumber(leadTime) * 86400000);
        output.push({dayNo: index === 0 ? dayNo : '', taskText: index === 0 ? taskText : '', date, material: material.material, quantity: material.quantity, unit: material.unit, leadTime, orderByDate, key});
      });
    }

    previousActive = activeSet;
  }

  return {materials: output, workPlan: days, source: 'estimator-engine'};
}
