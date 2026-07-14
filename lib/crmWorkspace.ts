import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';

export async function resolveCrmWorkspace() {
  const session = await getAdminSession();
  const salesUser = session?.role === 'sales' ? await getCrmUserByEmail(session.email) : null;

  return {
    session,
    salesUser,
    isSalesView: session?.role === 'sales',
  };
}
