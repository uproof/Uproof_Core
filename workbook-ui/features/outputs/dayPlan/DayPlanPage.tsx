import { PageHeader, Toggle } from '@/workbook-ui/components/common';
import { DocumentActions } from '@/workbook-ui/components/documents/DocumentActions';
import { formatDate } from '@/workbook-ui/lib/format';
import { DayPlanDocument, useDayPlan } from './DayPlanDocument';

export function DayPlanPage() {
  const { days, skipWeekends, setSkipWeekends, tracking } = useDayPlan();
  const done = Object.values(tracking).filter((t) => t.done).length;
  return (
    <>
      <PageHeader title="Day plan" titleLv="Dienas plāns"
        description={days.length ? `${days.length} days from ${formatDate(days[0].date)}, ${done} marked done.` : undefined}
        actions={<><Toggle checked={skipWeekends} onChange={setSkipWeekends} label="Skip weekends" /><DocumentActions doc="day-plan" /></>} />
      <DayPlanDocument key={String(skipWeekends)} />
    </>
  );
}
