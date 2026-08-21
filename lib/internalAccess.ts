import {redirect} from 'next/navigation';
import {getAdminSession, getPendingAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {isSuperadminRole} from '@/lib/crmRoles';

export async function redirectAuthenticatedInternalUser(locale: string) {
  const pendingSession = await getPendingAdminSession();
  if (pendingSession && !isSuperadminRole(pendingSession.role)) {
    redirect(`/${locale}/crm`);
  }
  if (pendingSession && isSuperadminRole(pendingSession.role)) {
    redirect(`/${locale}/admin`);
  }

  const session = await getAdminSession();
  if (session && !isSuperadminRole(session.role)) {
    const user = await getCrmUserByEmail(session.email);
    if (user) {
      redirect(`/${locale}/crm`);
    }
    redirect(`/${locale}/crm/login`);
  }

  if (session && isSuperadminRole(session.role)) {
    redirect(`/${locale}/admin`);
  }
}

export async function requireSalesWorkspace(locale: string) {
  const session = await getAdminSession();
  if (!session || isSuperadminRole(session.role)) {
    redirect(`/${locale}/login`);
  }

  const user = await getCrmUserByEmail(session.email);
  if (!user) {
    redirect(`/${locale}/crm/login`);
  }

  return {session, user};
}

export async function requireSuperadminWorkspace(locale: string) {
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const user = await getCrmUserByEmail(session.email);
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  return {session, user};
}
