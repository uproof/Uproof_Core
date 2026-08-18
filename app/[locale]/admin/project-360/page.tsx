import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getProject360SheetConfig, loadProject360Sheets} from '@/lib/googleSheets';

type Props = {params: Promise<{locale: string}>};

function renderCell(value: string | undefined, index: number) {
  return <td key={index} className="border-b border-slate-100 px-3 py-2 align-top text-sm text-slate-700">{value || '—'}</td>;
}

export default async function AdminProject360Page({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const config = getProject360SheetConfig();
  const sheets = config ? await loadProject360Sheets(config) : [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Project 360</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Connected project dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">OCR, estimator, financial, and project files pulled from Google Sheets.</p>
        </div>
        <Link href={`/${locale}/admin`} className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
          Back to Dashboard
        </Link>
      </div>

      {!config ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Set <span className="font-semibold text-slate-900">GOOGLE_SHEETS_API_KEY</span> and <span className="font-semibold text-slate-900">PROJECT_360_SPREADSHEET_ID</span> in the CRM env file to connect the dashboard.
          <div className="mt-2 text-xs text-slate-500">
            Optional ranges: <span className="font-mono">PROJECT_360_OCR_RANGE</span>, <span className="font-mono">PROJECT_360_ESTIMATOR_RANGE</span>, <span className="font-mono">PROJECT_360_FILES_RANGE</span>.
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {sheets.map((sheet) => (
          <section key={sheet.title} className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
            <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{sheet.sheetName}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{sheet.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{sheet.description}</p>
            </div>

            <div className="max-h-[34rem] overflow-auto">
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
                <div className="px-5 py-6 text-sm text-slate-500">No rows returned yet. Check the sheet name, range, or API key.</div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}