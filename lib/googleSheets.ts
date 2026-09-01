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
      {
        title: 'Financial overview',
        description: 'Connected financial dashboard sheet',
        sheetName: process.env.FINANCIALS_SHEET_NAME || 'Financials',
        range: process.env.FINANCIALS_RANGE || 'Financials!A1:Z200',
      },
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
    return {rows: [], cellMetadata: []};
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