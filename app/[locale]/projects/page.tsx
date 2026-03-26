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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    },
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
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://uproof.eu/${locale}/projects/${p.id}`,
        item: {
          '@type': 'CreativeWork',
          name: p.id,
          image: p.image ? `https://uproof.eu${p.image}` : undefined,
          areaServed: locale === 'nl-BE' ? 'België' : 'Latvija'
        }
      }))
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      {/* Header */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/images/services/construction.webp')" }} />
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-primary-400 font-semibold uppercase tracking-wider text-sm mb-3">
              {locale === 'nl-BE' ? 'Projecten' : locale === 'en' ? 'Projects' : 'Projekti'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">{t('title')}</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              {locale === 'lv' && 'Apskatiet pabeigtos jumta projektus: metāla jumti, dakstiņu montāža, renovācija un remonts ar kvalitāti, kas balstīta uz pieredzi un 10 gadu garantiju.'}
              {locale === 'en' && 'View completed roofing projects, including metal roofing, tile installation, renovation, and repair work delivered with certified quality and a 10-year warranty.'}
              {locale === 'nl-BE' && 'Bekijk voltooide dakprojecten, waaronder metalen daken, pannendaken, renovatie en herstellingen met gecertificeerde kwaliteit en 10 jaar garantie.'}
            </p>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            background: 'linear-gradient(to top, rgb(249,250,251) 0%, rgba(249,250,251,0.9) 20%, rgba(249,250,251,0.5) 50%, rgba(249,250,251,0) 100%)'
          }}
        />
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