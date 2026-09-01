import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getFinancialsSheetConfig, loadProject360Sheets} from '@/lib/googleSheets';

type Props = {params: Promise<{locale: string}>};

function renderCell(value: string | undefined, index: number) {
  return <td key={index} className="border-b border-violet-100 px-3 py-2 align-top text-sm text-slate-700">{value || '—'}</td>;
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Status</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{config ? 'Connected' : 'Not configured'}</p>
          <p className="mt-1 text-sm text-slate-600">Requires a valid Google Sheets API key and spreadsheet ID.</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Sheets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{sheets.length}</p>
          <p className="mt-1 text-sm text-slate-600">Financial tabs loaded from the configured spreadsheet.</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Rows</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalRows}</p>
          <p className="mt-1 text-sm text-slate-600">Rows returned from the financial ranges.</p>
        </div>
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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {sheets.length > 0 ? (
          sheets.map((sheet) => (
            <section key={sheet.title} className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
              <div className="border-b border-violet-100 bg-violet-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">{sheet.sheetName}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{sheet.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{sheet.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-violet-100">{sheet.rows.length} rows</span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-violet-100">{sheet.rows[0]?.length ?? 0} columns</span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-violet-100">Range: {sheet.range}</span>
                </div>
              </div>

              <div className="max-h-[40rem] overflow-auto">
                {sheet.rows.length > 0 ? (
                  <table className="min-w-full border-collapse">
                    <tbody>
                      {sheet.rows.slice(0, 30).map((row, rowIndex) => (
                        <tr key={`${sheet.title}-${rowIndex}`} className={rowIndex === 0 ? 'bg-slate-50 font-semibold text-slate-900' : ''}>
                          {row.map((cell, cellIndex) => renderCell(cell, cellIndex))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-5 py-6 text-sm text-slate-500">No data returned for this sheet. Check the spreadsheet ID, sheet name, or range.</div>
                )}
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-3xl border border-violet-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No financial Google Sheet is currently configured. The page will render the sheet automatically once the Financials spreadsheet and API key are added.
          </div>
        )}
      </div>
    </div>
  );
}
