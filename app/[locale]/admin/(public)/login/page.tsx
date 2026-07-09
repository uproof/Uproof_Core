import {redirect} from 'next/navigation';
import {getAdminSession, getPendingAdminSession} from '@/lib/adminAuth';
import AdminLoginPage from './AdminLoginPage';

type Props = {params: Promise<{locale: string}>; searchParams?: Promise<{redirect?: string}>};

export default async function AdminLoginRoute({params, searchParams}: Props) {
  const {locale} = await params;
  const {redirect: redirectTargetRaw} = await (searchParams || Promise.resolve({redirect: ''}));
  const redirectTarget = typeof redirectTargetRaw === 'string' && redirectTargetRaw.startsWith('/') ? redirectTargetRaw : `/${locale}/admin`;

  const pendingSession = await getPendingAdminSession();
  if (pendingSession?.role === 'superadmin') {
    redirect(`/${locale}/mfa/setup/admin?redirect=${encodeURIComponent(redirectTarget)}`);
  }

  const session = await getAdminSession();
  if (session?.role === 'superadmin') {
    redirect(redirectTarget);
  }
  if (session?.role === 'sales') {
    redirect(`/${locale}/crm`);
  }

  return <AdminLoginPage locale={locale} redirectTarget={redirectTarget} />;
}