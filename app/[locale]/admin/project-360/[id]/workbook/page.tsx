import {redirect} from 'next/navigation';

export default async function WorkbookEstimatorPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  redirect(`/${locale}/admin/project-360/${encodeURIComponent(id)}/workbook/settings`);
}
