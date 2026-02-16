'use client';

import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {Link} from '@/i18n/routing';
import {useState, useEffect, useRef} from 'react';
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
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 20;
        setScrolled(prev => (prev !== next ? next : prev));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // initialize immediately
    onScroll();
    return () => window.removeEventListener('scroll', onScroll as EventListener);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-gray-100/50' 
        : 'bg-white/70 backdrop-blur-lg'
    }`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group" aria-label="UpRoof Home">
              <div className={`relative ${largeLogo ? 'h-20 w-20' : 'h-[4.375rem] w-[4.375rem]'} transform group-hover:scale-105 transition-transform duration-300`}>
                  <Image
                    src="/logo.svg"
                  alt="UpRoof logo"
                  fill
                  sizes={largeLogo ? '80px' : '70px'}
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>
              {showText && (
                <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 tracking-tight">
                  UpRoof
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link href="/" prefetch={false} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-all font-medium relative group rounded-lg hover:bg-gray-50">
              {t('home')}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link href="/services" prefetch={false} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-all font-medium relative group rounded-lg hover:bg-gray-50">
              {t('services')}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link href="/projects" prefetch={false} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-all font-medium relative group rounded-lg hover:bg-gray-50">
              {t('projects')}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            {/* Cities link removed from global header per request */}
            <Link href="/about" prefetch={false} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-all font-medium relative group rounded-lg hover:bg-gray-50">
              {t('about')}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link href="/blog" prefetch={false} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-all font-medium relative group rounded-lg hover:bg-gray-50">
              {t('blog') || 'Blog'}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link href="/urgency/sniega-tirisana" prefetch={false} className="px-4 py-2 text-red-700 hover:text-red-800 transition-all font-semibold relative group rounded-lg hover:bg-red-50 text-sm">
              {t('snowRemoval') || 'Sniega tīrīšana'}
            </Link>
            <Link href="/contact" className="ml-4 px-6 py-2.5 bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 rounded-lg text-sm tracking-wide">
              {t('contact')}
            </Link>
            <div className="ml-4">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="text-gray-700 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className="md:hidden py-6 border-t mt-4 border-gray-100/50 animate-fade-in">
            <div className="flex flex-col space-y-1">
              <Link href="/" prefetch={false} className="text-gray-900 hover:text-primary-600 transition-colors font-medium px-4 py-3 hover:bg-primary-50 rounded-lg">
                {t('home')}
              </Link>
              <Link href="/services" prefetch={false} className="text-gray-900 hover:text-primary-600 transition-colors font-medium px-4 py-3 hover:bg-primary-50 rounded-lg">
                {t('services')}
              </Link>
              <Link href="/projects" prefetch={false} className="text-gray-900 hover:text-primary-600 transition-colors font-medium px-4 py-3 hover:bg-primary-50 rounded-lg">
                {t('projects')}
              </Link>
              {/* Cities navigation removed from mobile header per request */}
              <Link href="/about" prefetch={false} className="text-gray-900 hover:text-primary-600 transition-colors font-medium px-4 py-3 hover:bg-primary-50 rounded-lg">
                {t('about')}
              </Link>
              <Link href="/contact" prefetch={false} className="text-gray-900 hover:text-primary-600 transition-colors font-medium px-4 py-3 hover:bg-primary-50 rounded-lg">
                {t('contact')}
              </Link>
              <Link href="/urgency/sniega-tirisana" prefetch={false} className="text-red-700 hover:text-red-800 transition-colors font-semibold px-4 py-3 hover:bg-red-50 rounded-lg">
                {t('snowRemoval') || 'Sniega tīrīšana'}
              </Link>
              <div className="pt-4 px-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
