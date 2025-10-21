'use client';

import {usePathname, useRouter} from 'next/navigation';
import {useLocale} from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const languages = [
    { code: 'lv', name: 'LV', flag: '🇱🇻' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'nl-BE', name: 'NL', flag: '🇧🇪' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.replace(`/${currentLocale}`, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentLocale === lang.code
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  );
}
