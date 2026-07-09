import {redirect} from 'next/navigation';
import {getAdminSession, getPendingAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail, getPlainMfaSecret} from '@/lib/crmUsersStore';
import CrmLoginPage from './CrmLoginPage';

type Props = {params: Promise<{locale: string}>};

export default async function CrmLoginRoute({params}: Props) {
  const {locale} = await params;
  const pendingSession = await getPendingAdminSession();
  if (pendingSession?.role === 'sales') {
    redirect(`/${locale}/mfa/setup/crm?redirect=/${locale}/crm`);
  }
  if (pendingSession?.role === 'superadmin') {
    redirect(`/${locale}/mfa/setup/admin?redirect=/${locale}/admin`);
  }

  const session = await getAdminSession();
  if (session?.role === 'sales') {
    const user = await getCrmUserByEmail(session.email);
    if (user && getPlainMfaSecret(user)) {
      redirect(`/${locale}/crm`);
    }
    redirect(`/${locale}/mfa/setup/crm?redirect=/${locale}/crm`);
  }
  if (session?.role === 'superadmin') {
    redirect(`/${locale}/admin`);
  }
  return <CrmLoginPage />;
}
