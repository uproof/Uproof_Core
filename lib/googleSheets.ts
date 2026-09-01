import {cookies} from 'next/headers';
import {google} from 'googleapis';
import {createGoogleOAuthClient, gmailTokenCookie, unprotectGoogleTokens} from '@/lib/googleGmail';

export type GoogleSheetTable = {
  title: string;
  description: string;
  sheetName: string;
  range: string;
  rows: string[][];
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

async function fetchSheetValues(spreadsheetId: string, apiKey: string, range: string) {
  const authClient = await getGoogleSheetsAuthClient();
  if (authClient) {
    const sheets = google.sheets({version: 'v4', auth: authClient});
    const response = await sheets.spreadsheets.values.get({spreadsheetId, range});
    return response.data.values ?? [];
  }

  if (!apiKey) {
    return [];
  }

  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), {cache: 'no-store'});
  if (!response.ok) {
    throw new Error(`Google Sheets API request failed for ${range}`);
  }

  const data = await response.json().catch(() => null) as {values?: string[][]} | null;
  return Array.isArray(data?.values) ? data.values : [];
}

export async function loadProject360Sheets(config: Project360SheetConfig): Promise<GoogleSheetTable[]> {
  const tables = await Promise.all(
    config.tables.map(async (table) => {
      try {
        const rows = await fetchSheetValues(config.spreadsheetId, config.apiKey, table.range);
        return {...table, rows};
      } catch {
        return {...table, rows: []};
      }
    })
  );

  return tables;
}