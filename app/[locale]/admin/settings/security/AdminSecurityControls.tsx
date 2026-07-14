"use client";

import {useState} from 'react';

type Props = {
  locale: string;
  userId: string;
  email: string;
};

export default function AdminSecurityControls({locale, userId, email}: Props) {
  const isLv = locale === 'lv';
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<'password' | 'revoke' | ''>('');
  const passwordHint = isLv
    ? 'Parolei jābūt vismaz 8 rakstzīmēm ar lielo burtu, ciparu un speciālu simbolu.'
    : 'Password must be at least 8 characters with one uppercase letter, one number, and one special symbol.';

  const postAction = async (action: string, payload: Record<string, unknown> = {}) => {
    const response = await fetch(`/api/crm/users/${encodeURIComponent(userId)}/security`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action, ...payload}),
    });
    return response.json();
  };

  const changePassword = async () => {
    if (!newPassword.trim()) return;
    setBusy('password');
    setMessage('');
    try {
      const data = await postAction('set-password', {newPassword});
      if (!data.ok) throw new Error(data.error || 'Failed to change password');
      setMessage(isLv ? 'Parole atjaunināta.' : 'Password updated.');
      setNewPassword('');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to change password');
    } finally {
      setBusy('');
    }
  };

  const revokeSessions = async () => {
    setBusy('revoke');
    setMessage('');
    try {
      const data = await postAction('revoke-sessions');
      if (!data.ok) throw new Error(data.error || 'Failed to revoke sessions');
      setMessage(isLv ? 'Sesijas atsauktas.' : 'Sessions revoked.');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to revoke sessions');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Superadmin profile' : 'Superadmin profile'}</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">{email}</h3>
        <p className="mt-1 text-sm text-slate-600">{isLv ? 'Šie ir apstiprinātie superadmini CMS pārvaldībai.' : 'These are the approved superadmin accounts for CMS management.'}</p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isLv ? 'Jaunā parole' : 'New password'}</label>
            <div className="flex gap-2">
              <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" placeholder={isLv ? 'Ievadi jauno paroli' : 'Enter new password'} className="min-w-0 flex-1 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400" />
              <button type="button" onClick={() => void changePassword()} disabled={busy !== '' || !newPassword.trim()} className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">{busy === 'password' ? '...' : isLv ? 'Saglabāt' : 'Save'}</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{passwordHint}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void revokeSessions()} disabled={busy !== ''} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60">{busy === 'revoke' ? '...' : isLv ? 'Revoke access' : 'Revoke access'}</button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Notes' : 'Notes'}</p>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <p>{isLv ? 'Superadmin kontam nav aktivācijas/deaktivācijas pogu.' : 'The superadmin account does not have activate/deactivate controls.'}</p>
          <p>{isLv ? 'CRM lietotāju drošības iestatījumi paliek CRM lietotājiem, bet CMS superadmin tos pārvalda no user management.' : 'CRM user security stays with CRM users, while the CMS superadmin manages those profiles from user management.'}</p>
        </div>
        {message ? <div className="mt-4 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700">{message}</div> : null}
      </div>
    </div>
  );
}