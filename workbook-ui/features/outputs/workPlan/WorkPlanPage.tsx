import { PageHeader } from '@/workbook-ui/components/common';
import { DocumentActions } from '@/workbook-ui/components/documents/DocumentActions';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { formatNum } from '@/workbook-ui/lib/format';
import { WorkPlanDocument } from './WorkPlanDocument';

export function WorkPlanPage() {
  const { outputs } = useEstimate();
  return (
    <>
      <PageHeader title="Work plan" titleLv="Darbu plāns"
        description={outputs ? `One crew of ${formatNum(Number(outputs.inputs.crew_size))}, tasks in sequence, productivity factor ${formatNum(outputs.constants.schedule_productivity_factor)}.` : undefined}
        actions={<DocumentActions doc="work-plan" />} />
      <WorkPlanDocument />
    </>
  );
}
