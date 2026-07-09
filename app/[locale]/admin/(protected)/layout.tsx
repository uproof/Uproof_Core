import {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail, getPlainMfaSecret} from '@/lib/crmUsersStore';

export default async function AdminProtectedLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const user = await getCrmUserByEmail(session.email);
  if (!getPlainMfaSecret(user)) {
    redirect(`/${locale}/mfa/setup/admin`);
  }

  return <>{children}</>;
}
