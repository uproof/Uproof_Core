import {redirect} from 'next/navigation';
import Link from 'next/link';

export default async function CrmMfaSetupPage({params, searchParams}: {params: Promise<{locale: string}>; searchParams?: Promise<{redirect?: string}>}) {
  const {locale} = await params;
  redirect(`/${locale}/crm/login`);
}