"use client";

import {useState} from 'react';
import {useParams, useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';

export default function CrmLoginPage() {
  const params = useParams<{locale?: string}>();
  const searchParams = useSearchParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'lv';
  const copy =
    locale === 'nl-BE'
      ? {
          title: 'UpRoof CRM',
          subtitle: 'Verkoop login',
          emailLabel: 'E-mail',
          emailPlaceholder: 'Voer e-mail in',
          label: 'Wachtwoord',
          placeholder: 'Voer CRM-wachtwoord in',
          mfaLabel: 'CODE',
          mfaPlaceholder: 'Voer 6-cijferige code in',
          button: 'Inloggen',
          loading: 'Aan het inloggen…',
          back: '← Terug naar website',
          forgot: 'Wachtwoord vergeten?',
          recoveryHelp: 'Herstelcodes gebruik je alleen als je authenticator niet beschikbaar is.',
          recoveryToggle: 'Gebruik herstelcode',
          setupHelp: 'Eerste keer? Log in met je wachtwoord en je wordt doorgestuurd naar de authenticator-setup.',
        }
      : locale === 'en'
        ? {
            title: 'UpRoof CRM',
            subtitle: 'Sales login',
          emailLabel: 'Email',
          emailPlaceholder: 'Enter email',
            label: 'Password',
            placeholder: 'Enter CRM password',
            mfaLabel: 'CODE',
            mfaPlaceholder: 'Enter 6-digit code',
            button: 'Login',
            loading: 'Logging in…',
            back: '← Back to website',
            forgot: 'Forgot password?',
            recoveryHelp: 'Recovery codes are only for backup when your authenticator is unavailable.',
            recoveryToggle: 'Use recovery code',
            setupHelp: 'First login uses your password, then you will be sent to authenticator setup before CRM access.',
          }
        : {
            title: 'UpRoof CRM',
            subtitle: 'Pārdošanas piekļuve',
          emailLabel: 'E-pasts',
          emailPlaceholder: 'Ievadi e-pastu',
            label: 'Parole',
            placeholder: 'Ievadi CRM paroli',
            mfaLabel: 'CODE',
            mfaPlaceholder: 'Ievadi 6 ciparu kodu',
            button: 'Ieiet',
            loading: 'Ielāde…',
            back: '← Atpakaļ uz vietni',
            forgot: 'Aizmirsi paroli?',
            recoveryHelp: 'Atjaunošanas kodi ir tikai rezerves variants, ja autentifikators nav pieejams.',
            recoveryToggle: 'Lietot atjaunošanas kodu',
            setupHelp: 'Pirmā pieteikšanās notiek ar paroli, tad jūs novirzīs uz autentifikatora iestatīšanu pirms CRM piekļuves.',
          };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const redirectTo = searchParams.get('redirect');
  const targetPath = typeof redirectTo === 'string' && redirectTo.startsWith('/') ? redirectTo : `/${locale}/crm`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, role: 'sales', mfaCode, recoveryCode})
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Login failed');
      if (data.nextStep === 'mfa-setup') {
        router.replace(`/${locale}/mfa/setup/crm?redirect=${encodeURIComponent(targetPath)}`);
        return;
      }
      router.replace(targetPath);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 to-sky-800 px-4 sm:px-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{copy.title}</h1>
          <p className="text-sm sm:text-base text-gray-600">{copy.subtitle}</p>
          <p className="mt-3 text-xs text-gray-500">{copy.setupHelp}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={copy.emailPlaceholder}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.label}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={copy.placeholder}
              required
            />
          </div>
          <div>
            <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.mfaLabel}
            </label>
            <input
              id="mfaCode"
              inputMode="numeric"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={copy.mfaPlaceholder}
            />
          </div>
          <div className="rounded-lg border border-dashed border-sky-200 bg-sky-50 p-3 text-xs text-slate-600">
            <p>{copy.recoveryHelp}</p>
            <button
              type="button"
              onClick={() => setUseRecoveryCode((current) => !current)}
              className="mt-2 font-semibold text-primary-600 hover:text-primary-700"
            >
              {useRecoveryCode ? 'Hide recovery code' : copy.recoveryToggle}
            </button>
          </div>
          {useRecoveryCode ? (
            <div>
              <label htmlFor="recoveryCode" className="block text-sm font-medium text-gray-700 mb-2">
                Recovery code
              </label>
              <input
                id="recoveryCode"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Enter one-time recovery code"
              />
            </div>
          ) : null}
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-600">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors min-h-[48px] ${
              loading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            {loading ? copy.loading : copy.button}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href={`/${locale}/mfa/setup/crm`} className="mr-4 text-sm text-primary-600 hover:text-primary-700">
            Set up authenticator
          </Link>
          <Link href={`/${locale}/crm/forgot-password`} className="mr-4 text-sm text-primary-600 hover:text-primary-700">
            {copy.forgot}
          </Link>
        </div>
      </div>
    </div>
  );
}
