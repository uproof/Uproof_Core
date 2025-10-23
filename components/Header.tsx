'use client';

import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {Link} from '@/i18n/routing';
import {useState, useEffect} from 'react';
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';

type HeaderProps = {
  showText?: boolean;
  largeLogo?: boolean;
};

export default function Header({showText = true, largeLogo = false}: HeaderProps) {
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/35 backdrop-blur-md shadow-2xl' : 'bg-white/25 backdrop-blur-lg shadow-md'
    }`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`relative ${largeLogo ? 'h-16 w-16' : 'h-14 w-14'} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Image
                  src="/logo.svg"
                  alt="UpRoof logo"
                  fill
                  sizes={largeLogo ? '64px' : '56px'}
                  className="object-contain"
                />
              </div>
              {showText && (
                <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                  UpRoof
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link href="/" className="px-3 py-1.5 text-gray-900 hover:text-primary-500 transition-colors font-bold relative group">
              {t('home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/services" className="px-3 py-1.5 text-gray-900 hover:text-primary-500 transition-colors font-bold relative group">
              {t('services')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/projects" className="px-3 py-1.5 text-gray-900 hover:text-primary-500 transition-colors font-bold relative group">
              {t('projects')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/about" className="px-3 py-1.5 text-gray-900 hover:text-primary-500 transition-colors font-bold relative group">
              {t('about')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/blog" className="px-3 py-1.5 text-gray-900 hover:text-primary-500 transition-colors font-bold relative group">
              {t('blog') || 'Blog'}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/contact" className="ml-3 px-5 py-2 bg-primary-500 text-white font-bold hover:bg-primary-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 uppercase tracking-wide text-sm brightness-110">
              {t('contact')}
            </Link>
            <div className="ml-3">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t mt-4 border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-900 hover:text-primary-600 transition-colors font-semibold px-2 py-2 hover:bg-primary-50">
                {t('home')}
              </Link>
              <Link href="/services" className="text-gray-900 hover:text-primary-600 transition-colors font-semibold px-2 py-2 hover:bg-primary-50">
                {t('services')}
              </Link>
              <Link href="/projects" className="text-gray-900 hover:text-primary-600 transition-colors font-semibold px-2 py-2 hover:bg-primary-50">
                {t('projects')}
              </Link>
              <Link href="/about" className="text-gray-900 hover:text-primary-600 transition-colors font-semibold px-2 py-2 hover:bg-primary-50">
                {t('about')}
              </Link>
              <Link href="/contact" className="text-gray-900 hover:text-primary-600 transition-colors font-semibold px-2 py-2 hover:bg-primary-50">
                {t('contact')}
              </Link>
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
