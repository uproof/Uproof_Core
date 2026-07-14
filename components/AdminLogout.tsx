"use client";

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import {UserCircleIcon, ChevronDownIcon} from '@heroicons/react/24/outline';

type Props = {
  locale: string;
  redirectPath?: string;
  email?: string;
  securityHref?: string;
};

export default function AdminLogout({ locale, redirectPath, email, securityHref }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors; we'll still navigate
    } finally {
      window.location.href = redirectPath || `/${locale}/login`;
    }
  };

  return (
    <div ref={menuRef} className="flex items-center gap-2">
      {email && securityHref ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <UserCircleIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Profile</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>

          {open ? (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_24px_80px_rgba(14,165,233,0.16)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">Signed in</p>
              <div className="mt-2 break-words text-sm font-semibold text-slate-900">{email}</div>
              <div className="mt-3 space-y-2">
                <Link href={securityHref} onClick={() => setOpen(false)} className="flex w-full items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100">
                  Change password
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
