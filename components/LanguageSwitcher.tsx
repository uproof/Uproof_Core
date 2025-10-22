'use client';

import {usePathname, useRouter} from '@/i18n/routing';
import {useLocale} from 'next-intl';
import {useState, useRef, useEffect} from 'react';
import {ChevronDownIcon, GlobeAltIcon} from '@heroicons/react/24/outline';
import {useParams} from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'lv', name: 'Latviešu', shortName: 'LV', flag: '🇱🇻' },
    { code: 'en', name: 'English', shortName: 'EN', flag: '🇬🇧' },
    { code: 'nl-BE', name: 'Nederlands', shortName: 'NL', flag: '🇧🇪' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale as any});
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <GlobeAltIcon className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-700 text-sm">
          {languages.find(lang => lang.code === currentLocale)?.flag}
        </span>
        <ChevronDownIcon 
          className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {languages.map((lang) => {
              const isActive = currentLocale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs text-gray-500">{lang.shortName}</div>
                  </div>
                  {isActive && (
                    <svg 
                      className="w-5 h-5 text-primary-600" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
