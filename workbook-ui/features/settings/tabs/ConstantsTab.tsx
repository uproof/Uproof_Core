import { NumberInput, Panel } from '@/workbook-ui/components/common';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';

type Field = [key: string, label: string, unit: string];

/** Grouping of the constants table for display. Keys match settings_seed.json "constants". */
export const CONSTANT_GROUPS: { title: string; titleLv: string; fields: Field[] }[] = [
  { title: 'Labor', titleLv: 'Darbs', fields: [['labor_rate_eur_h', 'Hourly rate', '€/h'], ['labor_markup_factor', 'Markup on labor', '×'], ['workday_hours', 'Workday', 'h']] },
  { title: 'Taxes and shares', titleLv: 'Nodokļi', fields: [['employer_social_tax_vsaoi', 'Employer VSAOI', 'share'], ['mechanisms_share_of_materials', 'Mechanisms of materials', 'share'], ['procurement_share', 'Procurement of materials', 'share'], ['vat_rate_standard', 'VAT standard', 'share']] },
  { title: 'Offer', titleLv: 'Piedāvājums', fields: [['offer_overhead_share', 'Overhead', 'share'], ['offer_duration_buffer_days', 'Duration buffer', 'days']] },
  { title: 'F2 form', titleLv: 'F2 forma', fields: [['f2_overhead_share', 'Overhead', 'share'], ['f2_profit_share', 'Profit', 'share'], ['f2_labor_safety_share_of_overhead', 'Labor safety in overhead', 'share'], ['f2_vat_rate', 'VAT', 'share']] },
  { title: 'Schedule and payments', titleLv: 'Grafiks', fields: [['schedule_productivity_factor', 'Plan productivity factor', '×'], ['final_payment_share', 'Final payment', 'share'], ['payment_stages', 'Payment stages', 'count']] },
];

export function ConstantsTab() {
  const { settings, overrides, setOverride } = useEstimate();
  const k = settings!.values.k;
  return (
    <div className="card-grid">
      {CONSTANT_GROUPS.map((g) => (
        <Panel key={g.title} title={g.title} titleLv={g.titleLv}>
          {g.fields.map(([key, label, unit]) => {
            const isOver = key in overrides.constants;
            return (
              <label className="field" key={key}>
                <span>{label}<small>{unit}</small></span>
                <NumberInput label={label} value={isOver ? overrides.constants[key] : k[key]} baseValue={isOver ? k[key] : undefined} onChange={(v) => setOverride('constants', key, v)} />
              </label>
            );
          })}
        </Panel>
      ))}
    </div>
  );
}
