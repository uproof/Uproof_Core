'use client';

import { KeyValueList, Panel } from '@/ui/components/common';
import { format2 } from '@/ui/lib/format';
import { useOutputs } from '@/ui/state/EstimateContext';
import { Gantt } from './Gantt';
import { EmptyOutputState } from '@/ui/components/EmptyOutputState';

export function WorkPlanDocument() {
  const outputs = useOutputs();
  if (!outputs) return <EmptyOutputState title="Work plan" columns={['Task', 'Quantity', 'Hours', 'Days', 'Start', 'End']} />;
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
