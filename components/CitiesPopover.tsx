'use client';

import { useState, useMemo } from 'react';
import { citiesByLocale, getCityDisplayName, type Locale } from '@/lib/cities';
import { Link } from '@/i18n/routing';

type Props = { locale: Locale };

export default function CitiesPopover({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const cities = useMemo(() => citiesByLocale[locale] || [], [locale]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-primary-700 hover:underline"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {locale==='nl-BE'?'Steden':locale==='en'?'Cities':'Pilsētas'}
      </button>
      {open && (
        <div
          className="absolute z-30 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          role="dialog"
          aria-label={locale==='nl-BE'?'Steden':'Cities'}
        >
          <div className="max-h-64 overflow-y-auto p-2">
            <ul className="space-y-1">
              {cities.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/cities/${slug}`}
                    className="block px-3 py-2 rounded hover:bg-primary-50 text-gray-800"
                  >
                    {getCityDisplayName(locale, slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
