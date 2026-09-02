import {cookies} from 'next/headers';
import {google} from 'googleapis';
import {createGoogleOAuthClient, gmailTokenCookie, unprotectGoogleTokens} from '@/lib/googleGmail';

export type GoogleSheetCell = {
  value: string;
  backgroundColor?: {r: number; g: number; b: number; a?: number};
  textColor?: {r: number; g: number; b: number; a?: number};
  bold?: boolean;
  horizontalAlignment?: string;
  verticalAlignment?: string;
};

export type GoogleSheetTable = {
  title: string;
  description: string;
  sheetName: string;
  range: string;
  rows: string[][];
  cellMetadata?: GoogleSheetCell[][];
  columnWidths?: number[];
};

export type Project360SheetConfig = {
  spreadsheetId: string;
  apiKey: string;
  tables: Array<{
    title: string;
    description: string;
    sheetName: string;
    range: string;
  }>;
};

export type FinancialSummary = {
  totalSpend: number;
  totalProjects: number;
  totalVendors: number;
  totalMaterials: number;
  totalItemsPurchased: number;
  totalHours: number;
  totalWages: number;
  totalInvoiceCount: number;
};

export type MonthlyExpenseCategories = {
  wood: number;
  wages: number;
  vehicleParts: number;
  tools: number;
  services: number;
  roofAccessories: number;
  rentalEquipment: number;
  other: number;
  metals: number;
  membranesSealants: number;
  gutters: number;
  fuel: number;
  fasteners: number;
  equipment: number;
  consumables: number;
};

export type MonthlyExpenseEntry = {
  month: string;
  categories: MonthlyExpenseCategories;
};

export type ProjectCostEntry = {project: string; totalProjectCost: number};
export type MonthlyTotalExpenseEntry = {month: string; totalAmount: number};
export type ProjectCostBreakdownEntry = {project: string; items: number; wages: number; totalProjectCost: number};
export type VendorExpenseEntry = {vendor: string; totalAmount: number; invoiceCount: number};

export type FinancialDashboardData = {
  summary: FinancialSummary;
  monthlyExpensesByCategory: MonthlyExpenseEntry[];
  projectCosts: ProjectCostEntry[];
  monthlyTotalExpenses: MonthlyTotalExpenseEntry[];
  projectCostBreakdown: ProjectCostBreakdownEntry[];
  vendorExpenses: VendorExpenseEntry[];
};

const financialDashboardTableRanges = {
  summary: 'Dashboard!A1:H2',
  monthlyExpensesByCategory: 'Dashboard!B7:Q14',
  monthlyTotalExpenses: 'Dashboard!E28:F34',
  projectCostBreakdown: 'Dashboard!H28:K41',
  vendorExpenses: 'Dashboard!N28:P87',
} as const;

async function getGoogleSheetsAuthClient() {
  const protectedTokens = (await cookies()).get(gmailTokenCookie)?.value;
  const tokens = protectedTokens ? unprotectGoogleTokens(protectedTokens) : null;
  if (!tokens) {
    return null;
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
  const client = createGoogleOAuthClient(new URL(redirectUri).origin);
  client.setCredentials(tokens as Record<string, unknown>);
  return client;
}

export function getProject360SheetConfig(): Project360SheetConfig | null {
  const spreadsheetId = (process.env.PROJECT_360_SPREADSHEET_ID || '').trim();
  const apiKey = (process.env.GOOGLE_SHEETS_API_KEY || '').trim();

  if (!spreadsheetId) {
    return null;
  }

  return {
    spreadsheetId,
    apiKey,
    tables: [
      {
        title: 'OCR data',
        description: 'Connected OCR financial data sheet',
        sheetName: process.env.PROJECT_360_OCR_SHEET || 'OCR',
        range: process.env.PROJECT_360_OCR_RANGE || 'OCR!A1:Z200',
      },
      {
        title: 'Estimator data',
        description: 'Connected estimator sheet',
        sheetName: process.env.PROJECT_360_ESTIMATOR_SHEET || 'Estimator',
        range: process.env.PROJECT_360_ESTIMATOR_RANGE || 'Estimator!A1:Z200',
      },
      {
        title: 'Project files',
        description: 'Other project-related tracking sheets',
        sheetName: process.env.PROJECT_360_FILES_SHEET || 'Projects',
        range: process.env.PROJECT_360_FILES_RANGE || 'Projects!A1:Z200',
      },
    ],
  };
}

export function getFinancialsSheetConfig(): Project360SheetConfig | null {
  const spreadsheetId = (process.env.FINANCIALS_SPREADSHEET_ID || process.env.PROJECT_360_SPREADSHEET_ID || '').trim();
  const apiKey = (process.env.GOOGLE_SHEETS_API_KEY || '').trim();

  if (!spreadsheetId) {
    return null;
  }

  return {
    spreadsheetId,
    apiKey,
    tables: [
      {title: 'summary', description: 'Summary KPIs', sheetName: 'Dashboard', range: financialDashboardTableRanges.summary},
      {title: 'monthlyExpensesByCategory', description: 'Monthly expenses by category', sheetName: 'Dashboard', range: financialDashboardTableRanges.monthlyExpensesByCategory},
      {title: 'monthlyTotalExpenses', description: 'Monthly total expenses', sheetName: 'Dashboard', range: financialDashboardTableRanges.monthlyTotalExpenses},
      {title: 'projectCostBreakdown', description: 'Project cost breakdown', sheetName: 'Dashboard', range: financialDashboardTableRanges.projectCostBreakdown},
      {title: 'vendorExpenses', description: 'Vendor expenses', sheetName: 'Dashboard', range: financialDashboardTableRanges.vendorExpenses},
    ],
  };
}

function normalizeColor(color?: {r?: number; g?: number; b?: number; a?: number}) {
  if (!color) {
    return undefined;
  }

  const red = Math.max(0, Math.min(255, Math.round((color.r ?? 0) * 255)));
  const green = Math.max(0, Math.min(255, Math.round((color.g ?? 0) * 255)));
  const blue = Math.max(0, Math.min(255, Math.round((color.b ?? 0) * 255)));

  return {r: red, g: green, b: blue, a: color.a ?? 1};
}

function parseCellValue(cell: {formattedValue?: string | null; effectiveValue?: {stringValue?: string | null; numberValue?: number | null}; userEnteredFormat?: {backgroundColor?: {red?: number; green?: number; blue?: number; alpha?: number}; textFormat?: {foregroundColor?: {red?: number; green?: number; blue?: number; alpha?: number}; bold?: boolean}; horizontalAlignment?: string; verticalAlignment?: string}}) {
  const formattedValue = cell.formattedValue ?? cell.effectiveValue?.stringValue ?? (cell.effectiveValue && typeof cell.effectiveValue.numberValue === 'number' ? String(cell.effectiveValue.numberValue) : '');
  const backgroundColor = normalizeColor(cell.userEnteredFormat?.backgroundColor ? {
    r: cell.userEnteredFormat.backgroundColor.red ?? 0,
    g: cell.userEnteredFormat.backgroundColor.green ?? 0,
    b: cell.userEnteredFormat.backgroundColor.blue ?? 0,
    a: cell.userEnteredFormat.backgroundColor.alpha ?? 1,
  } : undefined);

  const textColor = normalizeColor(cell.userEnteredFormat?.textFormat?.foregroundColor ? {
    r: cell.userEnteredFormat.textFormat.foregroundColor.red ?? 0,
    g: cell.userEnteredFormat.textFormat.foregroundColor.green ?? 0,
    b: cell.userEnteredFormat.textFormat.foregroundColor.blue ?? 0,
    a: cell.userEnteredFormat.textFormat.foregroundColor.alpha ?? 1,
  } : undefined);

  return {
    value: formattedValue,
    backgroundColor,
    textColor,
    bold: Boolean(cell.userEnteredFormat?.textFormat?.bold),
    horizontalAlignment: cell.userEnteredFormat?.horizontalAlignment,
    verticalAlignment: cell.userEnteredFormat?.verticalAlignment,
  } satisfies GoogleSheetCell;
}

async function fetchSheetValues(spreadsheetId: string, apiKey: string, range: string) {
  const authClient = await getGoogleSheetsAuthClient();
  if (authClient) {
    const sheets = google.sheets({version: 'v4', auth: authClient});
    const response = await sheets.spreadsheets.get({spreadsheetId, ranges: [range], includeGridData: true});
    const gridData = response.data.sheets?.[0]?.data?.[0];
    const rowData = gridData?.rowData ?? [];
    const cells = rowData.map((row) => (row.values ?? []).map((cell) => parseCellValue(cell as any)));
    const columnWidths = (gridData?.columnMetadata ?? []).map((meta) => Math.max(48, Math.round((meta.pixelSize ?? 100) * 0.96)));

    if (cells.length > 0) {
      return {
        rows: cells.map((row) => row.map((cell) => cell.value)),
        cellMetadata: cells,
        columnWidths,
      };
    }

    const valuesResponse = await sheets.spreadsheets.values.get({spreadsheetId, range});
    const rows = valuesResponse.data.values ?? [];
    const fallbackWidths = Array.from({length: Math.max(1, ...rows.map((row) => row.length))}, () => 110);
    return {
      rows,
      cellMetadata: rows.map((row) => row.map((value) => ({value}))),
      columnWidths: fallbackWidths,
    };
  }

  if (!apiKey) {
    return {rows: [], cellMetadata: [], columnWidths: []};
  }

  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), {cache: 'no-store'});
  if (!response.ok) {
    throw new Error(`Google Sheets API request failed for ${range}`);
  }

  const data = await response.json().catch(() => null) as {values?: string[][]} | null;
  const rows = Array.isArray(data?.values) ? data.values : [];
  const fallbackWidths = Array.from({length: Math.max(1, ...rows.map((row) => row.length))}, () => 110);
  return {
    rows,
    cellMetadata: rows.map((row) => row.map((value) => ({value}))),
    columnWidths: fallbackWidths,
  };
}

export async function loadProject360Sheets(config: Project360SheetConfig): Promise<GoogleSheetTable[]> {
  const tables = await Promise.all(
    config.tables.map(async (table) => {
      try {
        const data = await fetchSheetValues(config.spreadsheetId, config.apiKey, table.range);
        return {...table, rows: data.rows, cellMetadata: data.cellMetadata, columnWidths: data.columnWidths};
      } catch {
        return {...table, rows: [], cellMetadata: [], columnWidths: []};
      }
    })
  );

  return tables;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const raw = String(value).trim();
  if (!raw) {
    return 0;
  }

  const cleaned = raw
    .replace(/€/g, '')
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.\-]/g, '');

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isTotalRow(row: string[]): boolean {
  if (!row.length) {
    return false;
  }

  const firstValue = String(row[0] ?? '').trim().toLowerCase();
  return firstValue === 'kopsumma' || firstValue === 'total' || firstValue === 'sum';
}

function isMonthLike(value: string): boolean {
  const normalized = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized || ['project', 'month', 'vendor', 'kopsumma', 'total', 'sum'].includes(normalized)) {
    return false;
  }

  const monthNames = [
    'jan', 'janv', 'janvāris', 'january',
    'feb', 'febr', 'februāris', 'february',
    'mar', 'marts', 'march',
    'apr', 'aprīlis', 'april',
    'mai', 'maijs', 'may',
    'jun', 'jūn', 'jūnijs', 'june',
    'jul', 'jūl', 'jūlijs', 'july',
    'aug', 'augusts', 'august',
    'sep', 'sept', 'septembris', 'september',
    'oct', 'okt', 'oktobris', 'october',
    'nov', 'novembris', 'november',
    'dec', 'decembris', 'december',
  ];

  return monthNames.some((month) => normalized.startsWith(month)) || /^\d{4}$/.test(normalized) || /^\d{4}[-/\s]\d{1,2}$/.test(normalized);
}

function getSummary(rows: string[][]): FinancialSummary {
  const values = rows[1] ?? [];
  const labels = rows[0] ?? [];

  const summary: FinancialSummary = {
    totalSpend: 0,
    totalProjects: 0,
    totalVendors: 0,
    totalMaterials: 0,
    totalItemsPurchased: 0,
    totalHours: 0,
    totalWages: 0,
    totalInvoiceCount: 0,
  };

  const map: Record<string, keyof FinancialSummary> = {
    'total spend': 'totalSpend',
    'total projects': 'totalProjects',
    'total vendors': 'totalVendors',
    'total materials': 'totalMaterials',
    'total items purchased': 'totalItemsPurchased',
    'total hours': 'totalHours',
    'total amount wages': 'totalWages',
    'total invoice count': 'totalInvoiceCount',
  };

  for (let index = 0; index < labels.length; index += 1) {
    const key = String(labels[index] ?? '').trim().toLowerCase();
    const target = map[key];
    const value = values[index];
    if (target && value !== undefined) {
      summary[target] = toNumber(value);
    }
  }

  return summary;
}

function parseMonthlyExpensesByCategory(rows: string[][]): MonthlyExpenseEntry[] {
  const headerIndex = rows.findIndex((row) => row.some((cell) => String(cell ?? '').trim().toLowerCase() === 'month') && row.some((cell) => String(cell ?? '').trim().toLowerCase() === 'wood'));
  if (headerIndex === -1) {
    return [];
  }

  const header = rows[headerIndex] ?? [];
  const normalized = header.map((value) => String(value ?? '').trim().toLowerCase());
  const fieldMap: Record<number, keyof MonthlyExpenseCategories> = {
    [normalized.indexOf('wood')]: 'wood',
    [normalized.indexOf('wages')]: 'wages',
    [normalized.indexOf('vehicle parts')]: 'vehicleParts',
    [normalized.indexOf('tools')]: 'tools',
    [normalized.indexOf('services')]: 'services',
    [normalized.indexOf('roof accessories')]: 'roofAccessories',
    [normalized.indexOf('rental equipment')]: 'rentalEquipment',
    [normalized.indexOf('other')]: 'other',
    [normalized.indexOf('metals')]: 'metals',
    [normalized.indexOf('membranes & sealants')]: 'membranesSealants',
    [normalized.indexOf('gutters')]: 'gutters',
    [normalized.indexOf('fuel')]: 'fuel',
    [normalized.indexOf('fasteners')]: 'fasteners',
    [normalized.indexOf('equipment')]: 'equipment',
    [normalized.indexOf('consumables')]: 'consumables',
  };

  const output: MonthlyExpenseEntry[] = [];
  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    if (row.length === 0 || !row[0] || isTotalRow(row)) {
      continue;
    }

    const month = String(row[0] ?? '').trim();
    if (!month || month.toLowerCase() === 'month' || !isMonthLike(month)) {
      continue;
    }

    const categories: MonthlyExpenseCategories = {
      wood: 0,
      wages: 0,
      vehicleParts: 0,
      tools: 0,
      services: 0,
      roofAccessories: 0,
      rentalEquipment: 0,
      other: 0,
      metals: 0,
      membranesSealants: 0,
      gutters: 0,
      fuel: 0,
      fasteners: 0,
      equipment: 0,
      consumables: 0,
    };

    for (const [index, key] of Object.entries(fieldMap)) {
      const fieldIndex = Number(index);
      const value = row[fieldIndex];
      if (key && value !== undefined) {
        categories[key] = toNumber(value);
      }
    }

    output.push({month, categories});
  }

  const totals: MonthlyExpenseCategories = {
    wood: 0,
    wages: 0,
    vehicleParts: 0,
    tools: 0,
    services: 0,
    roofAccessories: 0,
    rentalEquipment: 0,
    other: 0,
    metals: 0,
    membranesSealants: 0,
    gutters: 0,
    fuel: 0,
    fasteners: 0,
    equipment: 0,
    consumables: 0,
  };

  for (const entry of output) {
    totals.wood += entry.categories.wood;
    totals.wages += entry.categories.wages;
    totals.vehicleParts += entry.categories.vehicleParts;
    totals.tools += entry.categories.tools;
    totals.services += entry.categories.services;
    totals.roofAccessories += entry.categories.roofAccessories;
    totals.rentalEquipment += entry.categories.rentalEquipment;
    totals.other += entry.categories.other;
    totals.metals += entry.categories.metals;
    totals.membranesSealants += entry.categories.membranesSealants;
    totals.gutters += entry.categories.gutters;
    totals.fuel += entry.categories.fuel;
    totals.fasteners += entry.categories.fasteners;
    totals.equipment += entry.categories.equipment;
    totals.consumables += entry.categories.consumables;
  }

  output.push({month: 'Total by category', categories: totals});

  return output;
}

function parseProjectCosts(rows: string[][]): ProjectCostEntry[] {
  const headerIndex = rows.findIndex((row) => String(row[0] ?? '').trim().toLowerCase() === 'project');
  if (headerIndex === -1) {
    return [];
  }

  const output: ProjectCostEntry[] = [];
  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    if (!row.length || !String(row[0] ?? '').trim() || isTotalRow(row)) {
      continue;
    }

    output.push({
      project: String(row[0] ?? '').trim(),
      totalProjectCost: toNumber(row[1]),
    });
  }

  return output;
}

function parseMonthlyTotalExpenses(rows: string[][]): MonthlyTotalExpenseEntry[] {
  const headerIndex = rows.findIndex((row) => String(row[0] ?? '').trim().toLowerCase() === 'monthly total expenses');
  if (headerIndex === -1) {
    return [];
  }

  const output: MonthlyTotalExpenseEntry[] = [];
  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    if (!row.length || !String(row[0] ?? '').trim() || isTotalRow(row)) {
      continue;
    }

    output.push({
      month: String(row[0] ?? '').trim(),
      totalAmount: toNumber(row[1]),
    });
  }

  return output;
}

function parseProjectCostBreakdown(rows: string[][]): ProjectCostBreakdownEntry[] {
  const headerIndex = rows.findIndex((row) => String(row[0] ?? '').trim().toLowerCase() === 'project' && String(row[1] ?? '').trim().toLowerCase().includes('items'));
  if (headerIndex === -1) {
    return [];
  }

  const output: ProjectCostBreakdownEntry[] = [];
  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    if (!row.length || !String(row[0] ?? '').trim() || isTotalRow(row)) {
      continue;
    }

    output.push({
      project: String(row[0] ?? '').trim(),
      items: toNumber(row[1]),
      wages: toNumber(row[2]),
      totalProjectCost: toNumber(row[3]),
    });
  }

  return output;
}

function parseVendorExpenses(rows: string[][]): VendorExpenseEntry[] {
  const headerIndex = rows.findIndex((row) => String(row[0] ?? '').trim().toLowerCase() === 'vendor');
  if (headerIndex === -1) {
    return [];
  }

  const output: VendorExpenseEntry[] = [];
  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    if (!row.length || !String(row[0] ?? '').trim() || isTotalRow(row)) {
      continue;
    }

    output.push({
      vendor: String(row[0] ?? '').trim(),
      totalAmount: toNumber(row[1]),
      invoiceCount: toNumber(row[2]),
    });
  }

  return output;
}

export async function loadFinancialDashboard(config: Project360SheetConfig): Promise<FinancialDashboardData> {
  const tables = await Promise.all(
    config.tables.map(async (table) => {
      const data = await fetchSheetValues(config.spreadsheetId, config.apiKey, table.range);
      return {title: table.title, rows: data.rows};
    })
  );

  const byTitle = Object.fromEntries(tables.map((table) => [table.title, table.rows]));

  return {
    summary: getSummary(byTitle.summary ?? []),
    monthlyExpensesByCategory: parseMonthlyExpensesByCategory(byTitle.monthlyExpensesByCategory ?? []),
    projectCosts: [],
    monthlyTotalExpenses: parseMonthlyTotalExpenses(byTitle.monthlyTotalExpenses ?? []),
    projectCostBreakdown: parseProjectCostBreakdown(byTitle.projectCostBreakdown ?? []),
    vendorExpenses: parseVendorExpenses(byTitle.vendorExpenses ?? []),
  };
}

export async function loadFinancialDashboardFromEnv(): Promise<FinancialDashboardData | null> {
  const config = getFinancialsSheetConfig();
  if (!config) {
    return null;
  }

  return loadFinancialDashboard(config);
}