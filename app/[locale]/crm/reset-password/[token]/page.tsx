"use client";

import {FormEvent, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const params = useParams<{locale?: string; token?: string}>();
  const locale = typeof params?.locale === 'string' ? params.locale : 'lv';
  const token = typeof params?.token === 'string' ? params.token : '';
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordHint = locale === 'en'
    ? 'Use at least 8 characters with one uppercase letter, one number, and one special symbol.'
    : locale === 'nl-BE'
      ? 'Gebruik minstens 8 tekens met een hoofdletter, een cijfer en een speciaal symbool.'
      : 'Lietojiet vismaz 8 rakstzīmes, vienu lielo burtu, vienu ciparu un vienu speciālo simbolu.';

  const copy =
    locale === 'en'
      ? {
          title: 'Create a new password',
          subtitle: 'MFA stays enabled after the reset.',
          password: 'New password',
          confirm: 'Confirm password',
          submit: 'Save password',
          back: '← Back to login',
        }
      : locale === 'nl-BE'
        ? {
            title: 'Nieuw wachtwoord maken',
            subtitle: 'MFA blijft actief na de reset.',
            password: 'Nieuw wachtwoord',
            confirm: 'Bevestig wachtwoord',
            submit: 'Wachtwoord opslaan',
            back: '← Terug naar login',
          }
        : {
            title: 'Izveidot jaunu paroli',
            subtitle: 'Pēc atiestatīšanas MFA paliek aktīva.',
            password: 'Jaunā parole',
            confirm: 'Apstiprini paroli',
            submit: 'Saglabāt paroli',
            back: '← Atpakaļ uz pieteikšanos',
          };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('/api/crm/security/password-reset/confirm', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token, newPassword}),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Unable to reset password');
      }

      setMessage(locale === 'en' ? 'Password updated. You can log in now.' : locale === 'nl-BE' ? 'Wachtwoord bijgewerkt. Je kunt nu inloggen.' : 'Parole atjaunināta. Tagad vari pieteikties.');
      setTimeout(() => router.push(`/${locale}/crm/login`), 1200);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to reset password');
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
            <label className="mb-2 block text-sm font-medium text-slate-100">{copy.password}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-400"
              required
            />
            <p className="mt-2 text-xs text-slate-300">{passwordHint}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">{copy.confirm}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-400"
              required
            />
          </div>

          {message ? <div className="rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">{message}</div> : null}

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