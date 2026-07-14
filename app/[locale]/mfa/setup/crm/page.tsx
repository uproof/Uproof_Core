import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getMfaSetupSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import MfaSetupPanel from '@/components/MfaSetupPanel';

function SignedOutCard({locale}: {locale: string}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7fd_100%)] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Authenticator setup</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Sign in first</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You need to sign in to start authenticator setup for your account.
          </p>
          <Link href={`/${locale}/login`} className="mt-6 inline-flex rounded-2xl border border-sky-200 bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function CrmMfaSetupPage({params, searchParams}: {params: Promise<{locale: string}>; searchParams?: Promise<{redirect?: string}>}) {
  const {locale} = await params;
  const {redirect: redirectTargetRaw} = await (searchParams || Promise.resolve({redirect: ''}));
  const redirectTarget = typeof redirectTargetRaw === 'string' && redirectTargetRaw.startsWith('/') ? redirectTargetRaw : `/${locale}/crm`;
  const session = await getMfaSetupSession();
  if (!session || session.role !== 'sales') {
    return <SignedOutCard locale={locale} />;
  }

  const user = await getCrmUserByEmail(session.email);
  if (!user) {
    return <SignedOutCard locale={locale} />;
  }

  return (
    <MfaSetupPanel
      locale={locale}
      scope="crm"
      title={locale === 'en' ? 'Set up your authenticator' : locale === 'nl-BE' ? 'Stel je authenticator in' : 'Iestatīt autentifikatoru'}
      subtitle={locale === 'en' ? 'Scan the QR code in Google Authenticator, Authy, Microsoft Authenticator, or another authenticator app.' : locale === 'nl-BE' ? 'Scan de QR-code met Google Authenticator, Authy, Microsoft Authenticator of een andere authenticator app.' : 'Noskenē QR kodu Google Authenticator, Authy, Microsoft Authenticator vai citā autentifikatora lietotnē.'}
      backHref={redirectTarget}
      completedHref={redirectTarget}
    />
  );
}