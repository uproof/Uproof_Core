import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {isSuperadminRole} from '@/lib/crmRoles';
import AdminLoginPage from './AdminLoginPage';

type Props = {params: Promise<{locale: string}>; searchParams?: Promise<{redirect?: string}>};

export default async function AdminLoginRoute({params, searchParams}: Props) {
  const {locale} = await params;
  const {redirect: redirectTargetRaw} = await (searchParams || Promise.resolve({redirect: ''}));
  const redirectTarget = typeof redirectTargetRaw === 'string' && redirectTargetRaw.startsWith('/') ? redirectTargetRaw : `/${locale}/admin`;

  const session = await getAdminSession();
  if (session && isSuperadminRole(session.role)) {
    redirect(redirectTarget);
  }
  if (session && !isSuperadminRole(session.role)) {
    redirect(`/${locale}/crm`);
  }

  return <AdminLoginPage locale={locale} redirectTarget={redirectTarget} />;
}