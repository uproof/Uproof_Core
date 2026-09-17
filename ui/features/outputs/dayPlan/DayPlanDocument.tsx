'use client';

import { useEstimate } from '@/ui/state/EstimateContext';
import { DayCard, type DayTracking } from './DayCard';
import { EmptyOutputState } from '@/ui/components/EmptyOutputState';

export function DayPlanDocument() {
  const { outputs, lead, setDayTracking } = useEstimate();
  const tracking = lead?.dayTracking || {};
  if (!outputs) return <EmptyOutputState title="Day plan" cards={['Planned days', 'Tasks', 'Crew', 'Hours']} />;
  if (!outputs.dayPlan.length) return <p>No work planned yet. Add quantities in Inputs.</p>;
  return (
    <div className="day-grid">
      {outputs.dayPlan.map((d) => (
        <DayCard key={d.dayNo} day={d} tracking={tracking[d.dayNo] ?? {}} onChange={(t) => setDayTracking(d.dayNo, t)} />
      ))}
    </div>
  );
}
