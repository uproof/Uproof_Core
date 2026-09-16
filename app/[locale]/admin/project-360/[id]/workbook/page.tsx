import WorkbookApp from '@/workbook-ui/WorkbookApp';

export default async function WorkbookEstimatorPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  return <WorkbookApp leadId={id} />;
}
