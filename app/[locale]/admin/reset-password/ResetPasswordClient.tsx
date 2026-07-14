"use client";

import {FormEvent, useState} from 'react';

export default function ResetPasswordClient({locale, token}: {locale: string; token: string}) {
  const isLv = locale === 'lv';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!newPassword.trim() || newPassword !== confirmPassword) {
      setMessage(isLv ? 'Paroles nesakrīt.' : 'Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token, newPassword}),
      });
      const data = await response.json().catch(() => ({}));
      if (!data?.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage(isLv ? 'Parole ir nomainīta. Pāradresē uz pieteikšanos...' : 'Password updated. Redirecting to login...');
      window.setTimeout(() => {
        window.location.assign(`/${locale}/admin/login`);
      }, 1200);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to reset password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isLv ? 'Jaunā parole' : 'New password'}</label>
      <input
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
        placeholder={isLv ? 'Ievadi jauno paroli' : 'Enter new password'}
      />

      <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isLv ? 'Apstiprini paroli' : 'Confirm password'}</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
        placeholder={isLv ? 'Atkārto paroli' : 'Repeat password'}
      />

      <button
        type="submit"
        disabled={busy || !token}
        className="mt-5 inline-flex items-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? '...' : isLv ? 'Mainīt paroli' : 'Change password'}
      </button>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
