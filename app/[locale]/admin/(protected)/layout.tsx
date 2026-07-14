import {ReactNode} from 'react';
import {requireSuperadminWorkspace} from '@/lib/internalAccess';

export default async function AdminProtectedLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  await requireSuperadminWorkspace(locale);

  return <>{children}</>;
}
