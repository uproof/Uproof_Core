import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmProjects} from '@/lib/crmProjectsStore';
import {getProject360SheetConfig, loadProject360Sheets} from '@/lib/googleSheets';

type Props = {params: Promise<{locale: string}>};

type SheetSummary = {
  title: string;
  sheetName: string;
  description: string;
  rows: string[][];
  rowCount: number;
  dataRowCount: number;
  columnCount: number;
};

function getSheetSummary(title: string, sheetName: string, description: string, rows: string[][]): SheetSummary {
  return {
    title,
    sheetName,
    description,
    rows,
    rowCount: rows.length,
    dataRowCount: rows.length > 0 ? Math.max(rows.length - 1, 0) : 0,
    columnCount: rows[0]?.length ?? 0,
  };
}

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
  const [sheets, projects] = await Promise.all([
    config ? loadProject360Sheets(config) : [],
    getCrmProjects({limit: 500}),
  ]);
  const summaries = sheets.map((sheet) => getSheetSummary(sheet.title, sheet.sheetName, sheet.description, sheet.rows));
  const totalRows = summaries.reduce((total, sheet) => total + sheet.dataRowCount, 0);
  const connectedSheets = summaries.filter((sheet) => sheet.rowCount > 0).length;

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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Connected sheets</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{connectedSheets}</p>
          <p className="mt-1 text-sm text-slate-600">Sheets returning rows to the dashboard.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Visible rows</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalRows}</p>
          <p className="mt-1 text-sm text-slate-600">Data rows shown across the connected tabs.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Integration status</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{config ? 'Configured' : 'Not configured'}</p>
          <p className="mt-1 text-sm text-slate-600">Google Sheets API key and spreadsheet ID are required.</p>
        </div>
      </div>

      {!config ? (
        <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Google Sheets is not configured yet, so the Project 360 view is using accepted CRM leads as the project source.
          <div className="mt-2 text-xs text-slate-500">
            Optional ranges: <span className="font-mono">PROJECT_360_OCR_RANGE</span>, <span className="font-mono">PROJECT_360_ESTIMATOR_RANGE</span>, <span className="font-mono">PROJECT_360_FILES_RANGE</span>.
          </div>
        </div>
      ) : null}

      {projects.length > 0 ? (
        <div className="mt-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Accepted CRM projects</h3>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{projects.length} projects</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/${locale}/admin/crm/leads/${encodeURIComponent(project.leadId)}`} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 transition hover:bg-emerald-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{project.phase}</p>
                <h4 className="mt-2 text-xl font-bold text-slate-900">{project.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{project.location}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
                  <span>Owner: {project.owner || 'Unassigned'}</span>
                  <span>{project.budget || '€0'}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Due: {project.dueDate || '—'}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {summaries.map((sheet) => (
          <section key={sheet.title} className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
            <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{sheet.sheetName}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{sheet.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{sheet.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-100">{sheet.rowCount} total rows</span>
                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-100">{sheet.dataRowCount} data rows</span>
                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-emerald-100">{sheet.columnCount} columns</span>
              </div>
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