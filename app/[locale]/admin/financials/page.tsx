import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getFinancialsSheetConfig, loadFinancialDashboardFromEnv, type FinancialDashboardData} from '@/lib/googleSheets';

type Props = {params: Promise<{locale: string}>};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR', maximumFractionDigits: 2}).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('de-DE', {maximumFractionDigits: 2}).format(value || 0);
}

function SummaryCard({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DataTable({title, headers, rows}: {title: string; headers: string[]; rows: Array<Array<string | number>>}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {headers.map((header) => (
                <th key={header} className="px-3 py-2 font-semibold text-slate-700">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`} className="border-b border-slate-100 last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top text-slate-700">
                    {typeof cell === 'number' ? (cellIndex === 0 ? formatNumber(cell) : formatCurrency(cell)) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
  const dashboardData: FinancialDashboardData | null = config ? await loadFinancialDashboardFromEnv() : null;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Financials</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Live financial dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">This page reads the Dashboard tab as six independent source tables and exposes their normalized values in the CMS.</p>
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

      {dashboardData ? (
        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Spend" value={formatCurrency(dashboardData.summary.totalSpend)} />
            <SummaryCard label="Total Projects" value={formatNumber(dashboardData.summary.totalProjects)} />
            <SummaryCard label="Total Vendors" value={formatNumber(dashboardData.summary.totalVendors)} />
            <SummaryCard label="Total Materials" value={formatNumber(dashboardData.summary.totalMaterials)} />
            <SummaryCard label="Items Purchased" value={formatNumber(dashboardData.summary.totalItemsPurchased)} />
            <SummaryCard label="Total Hours" value={formatNumber(dashboardData.summary.totalHours)} />
            <SummaryCard label="Total Wages" value={formatCurrency(dashboardData.summary.totalWages)} />
            <SummaryCard label="Invoice Count" value={formatNumber(dashboardData.summary.totalInvoiceCount)} />
          </section>

          <DataTable
            title="Monthly Expenses by Category"
            headers={['Month', 'Wood', 'Wages', 'Vehicle Parts', 'Tools', 'Services', 'Roof Accessories', 'Rental Equipment', 'Other', 'Metals', 'Membranes & Sealants', 'Gutters', 'Fuel', 'Fasteners', 'Equipment', 'Consumables']}
            rows={dashboardData.monthlyExpensesByCategory.map((row) => [
              row.month,
              row.categories.wood,
              row.categories.wages,
              row.categories.vehicleParts,
              row.categories.tools,
              row.categories.services,
              row.categories.roofAccessories,
              row.categories.rentalEquipment,
              row.categories.other,
              row.categories.metals,
              row.categories.membranesSealants,
              row.categories.gutters,
              row.categories.fuel,
              row.categories.fasteners,
              row.categories.equipment,
              row.categories.consumables,
            ])}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <DataTable
              title="Project Costs"
              headers={['Project', 'Total Project Cost, without VAT']}
              rows={dashboardData.projectCosts.map((row) => [row.project, row.totalProjectCost])}
            />

            <DataTable
              title="Monthly Total Expenses"
              headers={['Month', 'Total Amount, without VAT']}
              rows={dashboardData.monthlyTotalExpenses.map((row) => [row.month, row.totalAmount])}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <DataTable
              title="Project Cost Breakdown"
              headers={['Project', 'Items (without VAT)', 'Wages', 'Total Project Cost']}
              rows={dashboardData.projectCostBreakdown.map((row) => [row.project, row.items, row.wages, row.totalProjectCost])}
            />

            <DataTable
              title="Vendor Expenses"
              headers={['Vendor', 'Total Amount, without VAT', 'Invoice Count']}
              rows={dashboardData.vendorExpenses.map((row) => [row.vendor, row.totalAmount, row.invoiceCount])}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No financial Google Sheet is currently configured. The page will render the dashboard automatically once the financial spreadsheet is added.
        </div>
      )}
    </div>
  );
}
