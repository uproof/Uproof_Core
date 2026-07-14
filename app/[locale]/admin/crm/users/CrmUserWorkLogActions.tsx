"use client";

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Props = {
  locale: string;
  userId: string;
  userName: string;
};

export default function CrmUserWorkLogActions({locale, userId, userName}: Props) {
  const router = useRouter();
  const isLv = locale === 'lv';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const clearWorkLogs = async () => {
    if (!window.confirm(isLv ? `Notīrīt visus darba žurnālus lietotājam ${userName}?` : `Clear all work logs for ${userName}?`)) {
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(userId)}/activity`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to clear work logs');
      }

      setMessage(isLv ? 'Darba žurnāli notīrīti.' : 'Work logs cleared.');
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to clear work logs');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={() => void clearWorkLogs()}
        disabled={busy}
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? '...' : isLv ? 'Notīrīt darba žurnālus' : 'Clear work logs'}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}