'use client';

import { KeyValueList, Panel } from '@/ui/components/common';
import { format2 } from '@/ui/lib/format';
import { useOutputs } from '@/ui/state/EstimateContext';
import { Gantt } from './Gantt';

export function WorkPlanDocument() {
  const outputs = useOutputs();
  if (!outputs) return null;
  const plan = outputs.workPlan;
  return (
    <Panel>
      <Gantt items={plan} />
      <KeyValueList items={[
        { label: 'Planned working days', value: format2(plan.at(-1)?.end ?? 0) },
        { label: 'Summary duration (with coefficients)', value: outputs.summary.days },
        { label: 'Duration promised in offer', value: outputs.offer.days },
      ]} />
    </Panel>
  );
}
