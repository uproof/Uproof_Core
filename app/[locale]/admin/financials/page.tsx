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

function getMaterialCategoriesTotals(row: {categories: {
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
}}) {
  return row.categories.wood + row.categories.vehicleParts + row.categories.tools + row.categories.services + row.categories.roofAccessories + row.categories.rentalEquipment + row.categories.other + row.categories.metals + row.categories.membranesSealants + row.categories.gutters + row.categories.fuel + row.categories.fasteners + row.categories.equipment + row.categories.consumables;
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

  const monthlyExpensesRows = dashboardData ? dashboardData.monthlyExpensesByCategory.map((row) => {
    const materialTotal = getMaterialCategoriesTotals(row);
    return [
      row.month,
      row.categories.wood,
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
      materialTotal,
      row.categories.wages,
      materialTotal + row.categories.wages,
    ];
  }) : [];

  const monthlyExpensesTotals = dashboardData ? {
    month: 'Total by category',
    wood: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.wood, 0),
    vehicleParts: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.vehicleParts, 0),
    tools: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.tools, 0),
    services: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.services, 0),
    roofAccessories: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.roofAccessories, 0),
    rentalEquipment: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.rentalEquipment, 0),
    other: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.other, 0),
    metals: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.metals, 0),
    membranesSealants: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.membranesSealants, 0),
    gutters: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.gutters, 0),
    fuel: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.fuel, 0),
    fasteners: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.fasteners, 0),
    equipment: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.equipment, 0),
    consumables: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.consumables, 0),
    wages: dashboardData.monthlyExpensesByCategory.reduce((sum, row) => sum + row.categories.wages, 0),
  } : null;

  const monthlyExpensesTotalRow = monthlyExpensesTotals ? [
    monthlyExpensesTotals.month,
    monthlyExpensesTotals.wood,
    monthlyExpensesTotals.vehicleParts,
    monthlyExpensesTotals.tools,
    monthlyExpensesTotals.services,
    monthlyExpensesTotals.roofAccessories,
    monthlyExpensesTotals.rentalEquipment,
    monthlyExpensesTotals.other,
    monthlyExpensesTotals.metals,
    monthlyExpensesTotals.membranesSealants,
    monthlyExpensesTotals.gutters,
    monthlyExpensesTotals.fuel,
    monthlyExpensesTotals.fasteners,
    monthlyExpensesTotals.equipment,
    monthlyExpensesTotals.consumables,
    Object.values({
      wood: monthlyExpensesTotals.wood,
      vehicleParts: monthlyExpensesTotals.vehicleParts,
      tools: monthlyExpensesTotals.tools,
      services: monthlyExpensesTotals.services,
      roofAccessories: monthlyExpensesTotals.roofAccessories,
      rentalEquipment: monthlyExpensesTotals.rentalEquipment,
      other: monthlyExpensesTotals.other,
      metals: monthlyExpensesTotals.metals,
      membranesSealants: monthlyExpensesTotals.membranesSealants,
      gutters: monthlyExpensesTotals.gutters,
      fuel: monthlyExpensesTotals.fuel,
      fasteners: monthlyExpensesTotals.fasteners,
      equipment: monthlyExpensesTotals.equipment,
      consumables: monthlyExpensesTotals.consumables,
    }).reduce((sum, value) => sum + value, 0),
    monthlyExpensesTotals.wages,
    Object.values({
      wood: monthlyExpensesTotals.wood,
      vehicleParts: monthlyExpensesTotals.vehicleParts,
      tools: monthlyExpensesTotals.tools,
      services: monthlyExpensesTotals.services,
      roofAccessories: monthlyExpensesTotals.roofAccessories,
      rentalEquipment: monthlyExpensesTotals.rentalEquipment,
      other: monthlyExpensesTotals.other,
      metals: monthlyExpensesTotals.metals,
      membranesSealants: monthlyExpensesTotals.membranesSealants,
      gutters: monthlyExpensesTotals.gutters,
      fuel: monthlyExpensesTotals.fuel,
      fasteners: monthlyExpensesTotals.fasteners,
      equipment: monthlyExpensesTotals.equipment,
      consumables: monthlyExpensesTotals.consumables,
    }).reduce((sum, value) => sum + value, 0) + monthlyExpensesTotals.wages,
  ] : [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Financials</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Live financial dashboard</h2>
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
            headers={['Month', 'Wood', 'Vehicle Parts', 'Tools', 'Services', 'Roof Accessories', 'Rental Equipment', 'Other', 'Metals', 'Membranes & Sealants', 'Gutters', 'Fuel', 'Fasteners', 'Equipment', 'Consumables', 'Materials Total', 'Wages', 'Total Costs']}
            rows={[...monthlyExpensesRows, monthlyExpensesTotalRow]}
          />

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
