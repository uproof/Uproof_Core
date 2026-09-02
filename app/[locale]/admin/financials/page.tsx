import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getFinancialsSheetConfig, loadProject360Sheets} from '@/lib/googleSheets';

type Props = {params: Promise<{locale: string}>};

function rgbaFromColor(color?: {r: number; g: number; b: number; a?: number}) {
  if (!color) {
    return undefined;
  }

  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;
}

function normalizeFinancialRows(rows: string[][]) {
  return rows
    .map((row) => row.filter((cell) => {
      const value = String(cell ?? '').trim();
      return value.length > 0 && value !== '—';
    }))
    .filter((row) => row.length > 0);
}

function renderCell(value: string | undefined, index: number, isHeader = false, cellStyle?: {backgroundColor?: {r: number; g: number; b: number; a?: number}; textColor?: {r: number; g: number; b: number; a?: number}; bold?: boolean; horizontalAlignment?: string; verticalAlignment?: string}) {
  const background = rgbaFromColor(cellStyle?.backgroundColor);
  const text = rgbaFromColor(cellStyle?.textColor);

  return (
    <td
      key={index}
      className={[
        'border border-slate-300 px-2 py-1 align-top text-[11px] leading-[1.2] tracking-normal',
        'whitespace-nowrap',
      ].join(' ')}
      style={{
        backgroundColor: background ?? (isHeader ? '#eef3ff' : '#ffffff'),
        color: text ?? '#1f2937',
        fontWeight: cellStyle?.bold || isHeader ? 700 : 400,
        textAlign: cellStyle?.horizontalAlignment === 'RIGHT' ? 'right' : cellStyle?.horizontalAlignment === 'CENTER' ? 'center' : 'left',
        verticalAlign: cellStyle?.verticalAlignment === 'MIDDLE' ? 'middle' : 'top',
        borderColor: '#d5d9e0',
      }}
    >
      {value || '—'}
    </td>
  );
}

export default async function AdminFinancialsPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const config = getFinancialsSheetConfig();
  const sheets = config ? await loadProject360Sheets(config) : [];
  const totalRows = sheets.reduce((sum, sheet) => sum + sheet.rows.length, 0);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Financials</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Google Sheets financial dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">This view is connected only to the financial spreadsheet configuration and ignores Project 360 sheet data.</p>
        </div>
        <Link href={`/${locale}/admin`} className="inline-flex items-center rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">
          Back to Dashboard
        </Link>
      </div>

      {!config ? (
        <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Financials is not connected yet. Add the following values to your environment and restart the app:
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500">
            <li>GOOGLE_SHEETS_API_KEY</li>
            <li>FINANCIALS_SPREADSHEET_ID</li>
            <li>FINANCIALS_SHEET_NAME (optional, default: Financials)</li>
            <li>FINANCIALS_RANGE (optional, default: Financials!A1:Z200)</li>
          </ul>
        </div>
      ) : null}

      <div className="mt-6 w-full">
        {sheets.length > 0 ? (
          sheets.map((sheet) => {
            const visibleRows = normalizeFinancialRows(sheet.rows).slice(0, 60);
            const firstRow = visibleRows[0] ?? [];

            return (
              <section key={sheet.title} className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-[#f7f1ff] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">{sheet.sheetName}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{sheet.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{sheet.description}</p>
                </div>

                <div className="w-full overflow-auto bg-white" style={{maxHeight: '44rem', overflowX: 'auto', overflowY: 'auto'}}>
                  {visibleRows.length > 0 ? (
                    <table className="w-full border-collapse border-spacing-0" style={{borderCollapse: 'separate'}}>
                      <thead>
                        <tr>
                          {firstRow.map((cell, cellIndex) => renderCell(cell, cellIndex, true, sheet.cellMetadata?.[0]?.[cellIndex]))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRows.slice(1).map((row, rowIndex) => (
                          <tr key={`${sheet.title}-row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => renderCell(cell, cellIndex, false, sheet.cellMetadata?.[rowIndex + 1]?.[cellIndex]))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-5 py-6 text-sm text-slate-500">No non-empty financial data was returned for this sheet.</div>
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No financial Google Sheet is currently configured. The page will render the sheet automatically once the Financials spreadsheet and API key are added.
          </div>
        )}
      </div>
    </div>
  );
}
