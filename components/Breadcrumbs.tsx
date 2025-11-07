'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('breadcrumbs');

  // Remove locale from pathname and split
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const segments = pathWithoutLocale.split('/').filter(Boolean);

  // Map route names to translation keys
  const routeNames: Record<string, string> = {
    services: t('services'),
    projects: t('projects'),
    about: t('about'),
    contact: t('contact'),
    blog: t('blog'),
  };

  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home */}
          <li>
            <Link 
              href={`/${locale}`}
              className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="sr-only">{t('home')}</span>
            </Link>
          </li>

          {/* Dynamic segments */}
          {segments.map((segment, index) => {
            const href = `/${locale}/${segments.slice(0, index + 1).join('/')}`;
            const isLast = index === segments.length - 1;
            const name = routeNames[segment] || segment;

            return (
              <li key={segment} className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isLast ? (
                  <span className="text-gray-900 font-medium" aria-current="page">
                    {name}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {/* Structured Data for Breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: t('home'),
                  item: `https://uproof.eu/${locale}`
                },
                ...segments.map((segment, index) => ({
                  '@type': 'ListItem',
                  position: index + 2,
                  name: routeNames[segment] || segment,
                  item: `https://uproof.eu/${locale}/${segments.slice(0, index + 1).join('/')}`
                }))
              ]
            })
          }}
        />
      </div>
    </nav>
  );
}
