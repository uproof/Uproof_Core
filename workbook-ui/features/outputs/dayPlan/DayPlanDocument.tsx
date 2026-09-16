import { useMemo } from 'react';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { useLocalState } from '@/workbook-ui/state/useLocalState';
import { buildDays, type DayTracking } from './buildDays';
import { DayCard } from './DayCard';

export function useDayPlan() {
  const { outputs, lead, leadId } = useEstimate();
  const [skipWeekends, setSkipWeekends] = useLocalState(`skipWeekends:${leadId}`, false);
  const [tracking, setTracking] = useLocalState<Record<number, DayTracking>>(`dayTracking:${leadId}`, {});
  const days = useMemo(
    () => (outputs && lead ? buildDays(outputs.workPlan, lead.terms.startDate, skipWeekends) : []),
    [outputs, lead, skipWeekends],
  );
  return { days, skipWeekends, setSkipWeekends, tracking, setTracking };
}

export function DayPlanDocument() {
  const { days, tracking, setTracking } = useDayPlan();
  if (!days.length) return <p>No work planned yet. Add quantities in Inputs.</p>;
  return (
    <div className="day-grid">
      {days.map((d) => (
        <DayCard key={d.dayNo} day={d} tracking={tracking[d.dayNo] ?? {}} onChange={(t) => setTracking((all) => ({ ...all, [d.dayNo]: t }))} />
      ))}
    </div>
  );
}
