"use client";

import {FormEvent, useState} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const params = useParams<{locale?: string}>();
  const locale = typeof params?.locale === 'string' ? params.locale : 'lv';
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const copy =
    locale === 'en'
      ? {
          title: 'Reset your password',
          subtitle: 'Request a reset link and keep MFA unchanged.',
          emailLabel: 'Email',
          emailPlaceholder: 'Enter your email',
          submit: 'Send reset link',
          back: '← Back to login',
          success: 'If the account exists, a reset link is ready.',
        }
      : locale === 'nl-BE'
        ? {
            title: 'Wachtwoord opnieuw instellen',
            subtitle: 'Vraag een resetlink aan en MFA blijft actief.',
            emailLabel: 'E-mail',
            emailPlaceholder: 'Voer je e-mail in',
            submit: 'Resetlink sturen',
            back: '← Terug naar login',
            success: 'Als het account bestaat, is de resetlink klaar.',
          }
        : {
            title: 'Atiestatīt paroli',
            subtitle: 'Pieprasi atiestatīšanas saiti, MFA paliek aktīva.',
            emailLabel: 'E-pasts',
            emailPlaceholder: 'Ievadi e-pastu',
            submit: 'Sūtīt atiestatīšanas saiti',
            back: '← Atpakaļ uz pieteikšanos',
            success: 'Ja konts pastāv, atiestatīšanas saite ir sagatavota.',
          };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setResetUrl('');

    try {
      const response = await fetch('/api/crm/security/password-reset/request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Unable to request reset link');
      }
      setMessage(copy.success);
      if (typeof data.resetUrl === 'string') {
        setResetUrl(data.resetUrl);
      }
    } catch (error: any) {
      setMessage(error?.message || 'Unable to request reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <p className="mt-2 text-sm text-slate-200">{copy.subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">{copy.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={copy.emailPlaceholder}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-400"
              required
            />
          </div>

          {message ? <div className="rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">{message}</div> : null}
          {resetUrl ? (
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 break-all">{resetUrl}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
          >
            {loading ? '...' : copy.submit}
          </button>
        </form>

        <div className="mt-6">
          <Link href={`/${locale}/crm/login`} className="text-sm text-sky-200 hover:text-sky-100">
            {copy.back}
          </Link>
        </div>
      </div>
    </div>
  );
}