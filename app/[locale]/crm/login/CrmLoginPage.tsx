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
          mfaLabel: 'MFA-code',
          placeholder: 'Voer CRM-wachtwoord in',
          mfaPlaceholder: '6-cijferige code',
          button: 'Inloggen',
          loading: 'Aan het inloggen…',
          back: '← Terug naar website'
        }
      : locale === 'en'
        ? {
            title: 'UpRoof CRM',
            subtitle: 'Sales login',
          emailLabel: 'Email',
          emailPlaceholder: 'Enter email',
            label: 'Password',
          mfaLabel: 'MFA code',
            placeholder: 'Enter CRM password',
          mfaPlaceholder: '6-digit code',
            button: 'Login',
            loading: 'Logging in…',
            back: '← Back to website'
          }
        : {
            title: 'UpRoof CRM',
            subtitle: 'Pārdošanas piekļuve',
          emailLabel: 'E-pasts',
          emailPlaceholder: 'Ievadi e-pastu',
            label: 'Parole',
            mfaLabel: 'MFA kods',
            placeholder: 'Ievadi CRM paroli',
            mfaPlaceholder: '6 ciparu kods',
            button: 'Ieiet',
            loading: 'Ielāde…',
            back: '← Atpakaļ uz vietni'
          };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
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
        body: JSON.stringify({email, password, otp, role: 'sales'})
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Login failed');
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
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.mfaLabel}
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={copy.mfaPlaceholder}
              required
            />
          </div>
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
          <Link href={`/${locale}`} className="text-sm text-primary-600 hover:text-primary-700">
            {copy.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
