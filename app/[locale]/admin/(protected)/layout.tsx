import {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';

export default async function AdminProtectedLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  return <>{children}</>;
}
