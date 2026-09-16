'use client';

import { KeyValueList, Panel } from '@/ui/components/common';
import { formatEur, format2, formatNum, formatPct } from '@/ui/lib/format';
import type { EstimateOutputs } from '@/ui/api';

export function ModelABreakdown({ outputs }: { outputs: EstimateOutputs }) {
  const { summary: s, constants: k, inputs } = outputs;
  return (
    <Panel title="Model A breakdown" titleLv="Izmaksas un peļņa">
      <KeyValueList items={[
        { label: 'Materials', value: formatEur(s.materials) },
        { label: 'Transport', value: formatEur(s.transport) },
        { label: `Mechanisms ${formatPct(k.mechanisms_share_of_materials)}`, value: formatEur(s.mechanisms) },
        { label: 'Work hours with coefficients', value: `${format2(s.hoursCoef)} h`, hint: `${format2(s.hours)} h × travel ${formatNum(Number(inputs.travel_coef))} × slope ${formatNum(Number(inputs.slope_labor_coef))}` },
        { label: 'Labor', value: formatEur(s.labor) },
        { label: `VSAOI ${formatPct(k.employer_social_tax_vsaoi)}`, value: formatEur(s.vsaoi) },
        { label: 'Cost', value: formatEur(s.cost), divider: true },
        { label: `Profit (${formatPct(k.labor_markup_factor - 1)} of labor)`, value: formatEur(s.profit), hint: `${s.days} days` },
        { label: 'Offer excl. VAT', value: formatEur(s.offer), emphasis: true, divider: true },
        { label: 'Per m² roof', value: formatEur(s.perM2) },
        { label: `Incl. VAT ${formatPct(k.vat_rate_standard)}`, value: formatEur(s.offerVat) },
      ]} />
    </Panel>
  );
}
