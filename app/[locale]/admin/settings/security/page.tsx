import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import MfaSetupPanel from '@/components/MfaSetupPanel';
import AdminSecurityControls from './AdminSecurityControls';

export default async function AdminSecuritySettingsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();
  if (!session || session.role !== 'superadmin') {
    redirect(`/${locale}/admin/login`);
  }

  const user = await getCrmUserByEmail(session.email);
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,#f8fcff_0%,#eef8ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">{locale === 'en' ? 'CMS security' : locale === 'nl-BE' ? 'CMS beveiliging' : 'CMS drošība'}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{locale === 'en' ? 'Superadmin security' : locale === 'nl-BE' ? 'Superadmin beveiliging' : 'Superadmin drošība'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{locale === 'en' ? 'Manage the signed-in superadmin profile, password, MFA, and active sessions.' : locale === 'nl-BE' ? 'Beheer het aangemelde superadmin-profiel, wachtwoord, MFA en actieve sessies.' : 'Pārvaldi pieslēgto superadmin profilu, paroli, MFA un aktīvās sesijas.'}</p>
        </div>

        <AdminSecurityControls locale={locale} userId={user.id} email={user.email} />

        <MfaSetupPanel
          locale={locale}
          scope="admin"
          title={locale === 'en' ? 'Authenticator setup' : locale === 'nl-BE' ? 'Authenticator instellen' : 'Autentifikatora iestatīšana'}
          subtitle={locale === 'en' ? 'Scan the QR code in Google Authenticator, Authy, Microsoft Authenticator, or another authenticator app.' : locale === 'nl-BE' ? 'Scan de QR-code met Google Authenticator, Authy, Microsoft Authenticator of een andere authenticator app.' : 'Noskenē QR kodu Google Authenticator, Authy, Microsoft Authenticator vai citā autentifikatora lietotnē.'}
          backHref={`/${locale}/admin`}
          completedHref={`/${locale}/admin/settings/security`}
        />
      </div>
    </div>
  );
}