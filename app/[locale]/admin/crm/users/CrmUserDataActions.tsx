"use client";

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Props = {
  locale: string;
  userId: string;
  userName: string;
  userEmail: string;
};

export default function CrmUserDataActions({locale, userId, userName, userEmail}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<'export' | 'delete' | ''>('');
  const [message, setMessage] = useState('');

  const downloadPayload = (payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userEmail.replace(/[^a-z0-9._-]+/gi, '_')}-export.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportUserData = async () => {
    setBusy('export');
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(userId)}/security`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'export-user-data'}),
      });
      const data = await response.json();
      if (!data.ok || !data.payload) {
        throw new Error(data.error || 'Failed to export user data');
      }
      downloadPayload(data.payload);
      setMessage(locale === 'lv' ? 'Dati lejupielādēti.' : 'Data exported.');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to export user data');
    } finally {
      setBusy('');
    }
  };

  const deleteUser = async () => {
    if (!window.confirm(locale === 'lv' ? `Dzēst ${userName}? Tas atsaistīs līdus un neatgriezeniski noņems ierakstu.` : `Delete ${userName}? This will unassign leads and permanently remove the record.`)) {
      return;
    }

    setBusy('delete');
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(userId)}/security`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'delete-user'}),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      router.push(`/${locale}/admin/crm/users`);
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to delete user');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void exportUserData()}
        disabled={busy !== ''}
        className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'export' ? '...' : locale === 'lv' ? 'Lejupielādēt datus' : 'Download user data'}
      </button>
      <button
        type="button"
        onClick={() => void deleteUser()}
        disabled={busy !== ''}
        className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'delete' ? '...' : locale === 'lv' ? 'Dzēst lietotāju' : 'Delete user'}
      </button>
      {message ? <p className="w-full text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}