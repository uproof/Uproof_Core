'use client';

import { PageHeader, Toggle } from '@/ui/components/common';
import { DocumentActions } from '@/ui/components/documents/DocumentActions';
import { formatDate } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';
import { DayPlanDocument } from './DayPlanDocument';

export function DayPlanPage() {
  const { outputs, lead, setTerm } = useEstimate();
  const days = outputs?.dayPlan ?? [];
  return (
    <>
      <PageHeader title="Day plan" titleLv="Dienas plāns"
        description={days.length ? `${days.length} days from ${formatDate(new Date(`${days[0].date}T00:00:00`))}.` : undefined}
        actions={<>{lead && <Toggle checked={lead.terms.skipWeekends} onChange={(v) => setTerm('skipWeekends', v)} label="Skip weekends" />}<DocumentActions doc="day-plan" /></>} />
      <DayPlanDocument />
    </>
  );
}
