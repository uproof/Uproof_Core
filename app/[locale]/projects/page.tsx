import {unstable_setRequestLocale} from 'next-intl/server';
import {use} from 'react';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProjectCard from '@/components/ProjectCard';
import {projects} from '@/data/projects';

type PageProps = { params: Promise<{ locale: string }> };

// Localized metadata generation similar to service pages
export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}/projects`;
  const titleMap: Record<string,string> = {
    lv: 'Mūsu jumta projekti | Portfolio un gadījumu izpēte | UpRoof',
    en: 'Our Roofing Projects | Portfolio & Case Studies | UpRoof',
    'nl-BE': 'Onze Dakprojecten | Portfolio & Cases | UpRoof'
  };
  const descMap: Record<string,string> = {
    lv: 'Apskatiet pabeigtos jumta projektus: metāla jumti, dakstiņu montāža, renovācija, remonts. Kvalitāte ar 10 gadu garantiju.',
    en: 'View completed roofing projects: metal roofing, tile installation, renovation, repairs. Certified quality with 10-year warranty.',
    'nl-BE': 'Bekijk voltooide dakprojecten: metalen dak, pannendaken, renovatie, herstellingen. Gecertificeerde kwaliteit met 10 jaar garantie.'
  };
  const languages: Record<string,string> = {
    lv: 'https://uproof.eu/lv/projects',
    en: 'https://uproof.eu/en/projects',
    'nl-BE': 'https://uproof.eu/nl-BE/projects',
    'x-default': 'https://uproof.eu/lv/projects'
  };
  const title = titleMap[locale] || titleMap.lv;
  const description = descMap[locale] || descMap.lv;
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: { url: canonical, title, description, type: 'website', locale },
    twitter: { title, description, card: 'summary_large_image' }
  };
}

export default function ProjectsPage({params}: PageProps) {
  const {locale} = use(params);
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.projects');

  // JSON-LD for CollectionPage / ItemList of projects
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('title'),
    url: `https://uproof.eu/${locale}/projects`,
    hasPart: projects.map((p, idx) => ({
      '@type': 'CreativeWork',
      position: idx + 1,
      name: p.id,
      areaServed: locale === 'nl-BE' ? 'België' : 'Latvija'
    }))
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      {/* Header */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white">{t('title')}</h1>
        </div>
      </section>
      {/* Projects Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <ProjectCard key={p.id} {...p} />
          ))}
        </div>
      </section>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(itemListSchema)}} />
    </main>
  );
}