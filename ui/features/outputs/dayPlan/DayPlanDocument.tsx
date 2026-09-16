'use client';

import { useEstimate } from '@/ui/state/EstimateContext';
import { useLocalState } from '@/ui/state/useLocalState';
import { DayCard, type DayTracking } from './DayCard';

export function DayPlanDocument() {
  const { outputs, leadId } = useEstimate();
  const [tracking, setTracking] = useLocalState<Record<number, DayTracking>>(`dayTracking:${leadId}`, {});
  if (!outputs) return null;
  if (!outputs.dayPlan.length) return <p>No work planned yet. Add quantities in Inputs.</p>;
  return (
    <div className="day-grid">
      {outputs.dayPlan.map((d) => (
        <DayCard key={d.dayNo} day={d} tracking={tracking[d.dayNo] ?? {}} onChange={(t) => setTracking((all) => ({ ...all, [d.dayNo]: t }))} />
      ))}
    </div>
  );
}
