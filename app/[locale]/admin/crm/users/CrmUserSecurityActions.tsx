"use client";

import {useState} from 'react';
import {useRouter} from 'next/navigation';

type Props = {
  locale: string;
  userId: string;
  userName: string;
};

export default function CrmUserSecurityActions({locale, userId, userName}: Props) {
  const router = useRouter();
  const isLv = locale === 'lv';
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<'revoke' | ''>('');

  const revokeAccess = async () => {
    if (!window.confirm(isLv ? `Atsaukt piekļuvi lietotājam ${userName}?` : `Revoke access for ${userName}?`)) {
      return;
    }

    setBusy('revoke');
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(userId)}/security`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'revoke-sessions'}),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to revoke access');
      }

      setMessage(isLv ? 'Piekļuve atsaukta.' : 'Access revoked.');
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to revoke access');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void revokeAccess()}
          disabled={busy !== ''}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === 'revoke' ? '...' : isLv ? 'Atsaukt piekļuvi' : 'Revoke access'}
        </button>
      </div>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}