'use client';

import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {useState} from 'react';
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">UpRoof</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="#home" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              {t('home')}
            </Link>
            <Link href="#services" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              {t('services')}
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              {t('about')}
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              {t('contact')}
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="#home" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                {t('home')}
              </Link>
              <Link href="#services" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                {t('services')}
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                {t('about')}
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                {t('contact')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
