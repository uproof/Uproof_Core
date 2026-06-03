import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import {Link} from '@/i18n/routing';
import {projects} from '@/data/projects';
import {getServicePath} from '@/lib/serviceSeo';

type PageProps = {
  params: Promise<{locale: string; slug: string}>;
};

const locales = ['lv', 'en', 'nl-BE'] as const;

const serviceToSlug: Record<string, string> = {
  construction: 'jumta-buvnieciba',
  profiling: 'valcprofila-montaza',
  insulation: 'jumta-renovacija',
  renovation: 'jumta-renovacija',
  maintenance: 'jumta-apkope-remonts',
  painting: 'jumta-krasosana',
  tiling: 'dakstinu-montaza',
  skylights: 'jumta-logu-montaza',
  gutters: 'noteksistemu-uzstadisana',
  chimney: 'skurstena-piesleguma-montaza-labosana'
};

export function generateStaticParams() {
  return locales.flatMap((locale) => projects.map((project) => ({locale, slug: project.id})));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) {
    return {};
  }

  const t = await getTranslations({locale});
  const projectTitle = t(project.titleKey);
  const projectLocation = t(project.locationKey);
  const projectDescription = t(project.descriptionKey);
  const canonical = `https://uproof.eu/${locale}/projects/${slug}`;
  const languages = {
    lv: `https://uproof.eu/lv/projects/${slug}`,
    en: `https://uproof.eu/en/projects/${slug}`,
    'nl-BE': `https://uproof.eu/nl-BE/projects/${slug}`,
    'x-default': `https://uproof.eu/lv/projects/${slug}`
  };

  const title = `${projectTitle} | UpRoof`;
  const description = `${projectDescription} ${projectLocation} (${project.year}).`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      locale,
      images: project.image ? [project.image] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.image ? [project.image] : undefined
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function ProjectDetailPage({params}: PageProps) {
  const {locale, slug} = await params;

  const project = projects.find((p) => p.id === slug);
  if (!project) {
    notFound();
  }

  const t = await getTranslations({locale});
  const title = t(project.titleKey);
  const location = t(project.locationKey);
  const description = t(project.descriptionKey);
  const backLabel = t('projects.backToProjects');
  const detailsLabel = t('projects.projectDetails');
  const servicesLabel = t('projects.servicesProvided');

  const linkedServices = project.services
    .map((serviceKey) => ({
      serviceKey,
      slug: serviceToSlug[serviceKey]
    }))
    .filter((s) => Boolean(s.slug));

  const projectUrl = `https://uproof.eu/${locale}/projects/${project.id}`;
  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${projectUrl}#project`,
    name: title,
    description,
    datePublished: `${project.year}-01-01`,
    inLanguage: locale === 'lv' ? 'lv-LV' : locale === 'en' ? 'en-US' : 'nl-BE',
    image: project.image ? `https://uproof.eu${project.image}` : undefined,
    locationCreated: {
      '@type': 'Place',
      name: location
    },
    provider: {
      '@type': 'RoofingContractor',
      name: 'UpRoof',
      url: 'https://uproof.eu'
    },
    about: linkedServices.map((s) => ({
      '@type': 'Service',
      name: t(`serviceTags.${s.serviceKey}`),
      url: `https://uproof.eu/${locale}/services/${s.slug}`
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'lv' ? 'Sākums' : 'Home',
        item: `https://uproof.eu/${locale}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'lv' ? 'Projekti' : locale === 'nl-BE' ? 'Projecten' : 'Projects',
        item: `https://uproof.eu/${locale}/projects`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: projectUrl
      }
    ]
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumbs />

      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: `url('${project.image || '/images/services/construction.webp'}')`}} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">
          <p className="text-primary-400 font-semibold uppercase tracking-wider text-sm mb-3">{location}</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">{title}</h1>
          <p className="text-gray-300 text-lg max-w-3xl leading-relaxed">{description}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/projects" className="inline-flex items-center text-primary-700 hover:text-primary-800 font-semibold">
              ← {backLabel}
            </Link>
          </div>

          <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{detailsLabel}</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{description}</p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="px-3 py-1.5 text-sm font-semibold bg-gray-900 text-white rounded-lg">{project.year}</span>
              <span className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg">{location}</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">{servicesLabel}</h3>
            <ul className="flex flex-wrap gap-3">
              {linkedServices.map((s) => (
                <li key={s.serviceKey}>
                  <Link
                    href={getServicePath(locale, s.slug)}
                    className="inline-flex px-3 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
                  >
                    {t(`serviceTags.${s.serviceKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(projectSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
      <Footer />
    </main>
  );
}
