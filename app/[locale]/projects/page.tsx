import {unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProjectCard from '@/components/ProjectCard';
import {projects} from '@/data/projects';

export const metadata: Metadata = {
  title: 'Our Roofing Projects | Portfolio & Case Studies',
  description: 'View our completed roofing projects in Latvia. Metal roofing, tile installation, repairs. See quality workmanship and customer results.',
  alternates: {
    canonical: 'https://uproof.eu/projects'
  }
};

export default function ProjectsPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.projects');

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      {/* Simple gradient header - no Vanta */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white">{t('title')}</h1>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <ProjectCard key={p.id} {...p} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}