import {redirect} from 'next/navigation';
import ResetPasswordClient from './ResetPasswordClient';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{token?: string}>;
};

export default async function AdminResetPasswordPage({params, searchParams}: Props) {
  const {locale} = await params;
  const {token = ''} = await searchParams;

  if (!token) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,#f8fcff_0%,#eef8ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">{locale === 'en' ? 'Admin password reset' : locale === 'nl-BE' ? 'Admin wachtwoord reset' : 'Admin paroles atiestatīšana'}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{locale === 'en' ? 'Set a new password' : locale === 'nl-BE' ? 'Stel een nieuw wachtwoord in' : 'Iestati jaunu paroli'}</h1>
          <p className="mt-2 text-sm text-slate-600">{locale === 'en' ? 'Use the reset link to choose a new password for this account.' : locale === 'nl-BE' ? 'Gebruik de resetlink om een nieuw wachtwoord voor dit account in te stellen.' : 'Izmanto atiestatīšanas saiti, lai iestatītu jaunu paroli šim kontam.'}</p>
        </div>

        <ResetPasswordClient locale={locale} token={token} />
      </div>
    </div>
  );
}
