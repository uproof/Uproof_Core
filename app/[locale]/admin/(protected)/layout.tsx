import {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {isAdminAuthenticated} from '@/lib/adminAuth';

export default function AdminProtectedLayout({children, params: {locale}}: {children: ReactNode; params: {locale: string}}) {
  const ok = isAdminAuthenticated();
  if (!ok) {
    redirect(`/${locale}/admin/login`);
  }
  return <>{children}</>;
}
