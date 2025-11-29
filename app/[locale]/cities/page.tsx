import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { citiesByLocale, getCityDisplayName } from '@/lib/cities';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Cities' });
  const title = t('title', { default: 'Cities we serve' });
  const description = t('description', { default: 'Find roofing services in your city.' });
  const canonical = `https://uproof.eu/${params.locale}/cities`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'lv': 'https://uproof.eu/lv/cities',
        'en': 'https://uproof.eu/en/cities',
        'nl-BE': 'https://uproof.eu/nl-BE/cities',
      },
    },
  };
}

export default async function CitiesIndex({ params }: { params: { locale: keyof typeof citiesByLocale } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'Cities' });
  const title = t('title', { default: 'Cities we serve' });
  const subtitle = t('subtitle', { default: 'Choose your city to see local services and projects.' });

  const cities = citiesByLocale[locale] ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">{title}</h1>
      <p className="text-sm text-gray-600 mb-6">{subtitle}</p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {cities.map((city) => (
          <li key={city}>
            <Link
              href={`/${locale}/cities/${city}`}
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <span className="truncate">{getCityDisplayName(locale, city, t)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
