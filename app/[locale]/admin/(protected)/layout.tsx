import {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {isAdminAuthenticated} from '@/lib/adminAuth';

export default async function AdminProtectedLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const ok = await isAdminAuthenticated();
  if (!ok) {
    redirect(`/${locale}/admin/login`);
  }
  return <>{children}</>;
}
