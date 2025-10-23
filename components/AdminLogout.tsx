"use client";

import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AdminLogout({ locale }: { locale: string }) {
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors; we'll still navigate
    } finally {
      window.location.href = `/${locale}/admin/login`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
      Logout
    </button>
  );
}
