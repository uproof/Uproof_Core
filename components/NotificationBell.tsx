"use client";

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {BellIcon, CheckIcon, ChevronDownIcon} from '@heroicons/react/24/outline';
import {usePathname} from 'next/navigation';
import type {NotificationItem} from '@/lib/notificationsStore';

type Props = {
  locale: string;
};

export default function NotificationBell({locale}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/crm/notifications?limit=12', {cache: 'no-store'});
      const data = await response.json();
      if (data?.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(Number(data.unreadCount || 0));
      }
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    void fetchNotifications();
    const timer = window.setInterval(() => void fetchNotifications(), 20000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const localizedHref = (href: string) => {
    if (!href) return '#';
    if (href.startsWith('http')) return href;
    return href.startsWith(`/${locale}`) ? href : `/${locale}${href.startsWith('/') ? '' : '/'}${href}`;
  };

  const markRead = async (id: string) => {
    setNotifications((current) => current.map((item) => (item.id === id ? {...item, readAt: item.readAt || new Date().toISOString()} : item)));
    setUnreadCount((current) => Math.max(0, current - 1));
    await fetch(`/api/crm/notifications/${encodeURIComponent(id)}`, {method: 'PATCH'});
  };

  const sortedNotifications = useMemo(() => notifications.slice(0, 12), [notifications]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 items-center gap-2 rounded-2xl border border-sky-200 bg-white px-3 text-slate-700 shadow-sm transition hover:bg-sky-50"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        <ChevronDownIcon className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[22rem] overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_24px_80px_rgba(14,165,233,0.16)]">
          <div className="flex items-center justify-between border-b border-sky-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">Saved lead actions and CRM activity</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/crm/notifications', {method: 'PATCH'});
                setNotifications((current) => current.map((item) => ({...item, readAt: item.readAt || new Date().toISOString()})));
                setUnreadCount(0);
              }}
              className="rounded-2xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {sortedNotifications.length > 0 ? (
              sortedNotifications.map((item) => (
                <Link
                  key={item.id}
                  href={localizedHref(item.link)}
                  onClick={() => void markRead(item.id)}
                  className={`block border-b border-slate-100 px-4 py-3 transition hover:bg-sky-50 ${item.readAt ? 'bg-white' : 'bg-sky-50/60'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.readAt ? 'bg-slate-300' : 'bg-sky-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        {item.readAt ? <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" /> : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{item.message}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}