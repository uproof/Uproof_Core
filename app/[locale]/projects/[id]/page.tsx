import {unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import {projects, type Project} from '@/data/projects';
import Image from 'next/image';

type PageProps = { 
  params: { locale: string; id: string } 
};

export async function generateStaticParams() {
  return projects.flatMap(project => [
    { locale: 'lv', id: project.id },
    { locale: 'en', id: project.id },
    { locale: 'nl-BE', id: project.id }
  ]);
}

export function generateMetadata({params}: PageProps): Metadata {
  const {locale, id} = params;
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return {
      title: 'Project Not Found',
      robots: { index: false, follow: false }
    };
  }

  const canonical = `https://uproof.eu/${locale}/projects/${id}`;
  
  const languages: Record<string,string> = {
    lv: `https://uproof.eu/lv/projects/${id}`,
    en: `https://uproof.eu/en/projects/${id}`,
    'nl-BE': `https://uproof.eu/nl-BE/projects/${id}`,
    'x-default': `https://uproof.eu/lv/projects/${id}`
  };

  // Simplified title for now - can be enhanced with translations
  const title = `${project.titleKey.split('.').pop()} | UpRoof Projects`;
  const description = `Roofing project completed in ${project.year}. Services: ${project.services.join(', ')}.`;
  
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: { 
      url: canonical, 
      title, 
      description, 
      type: 'article',
      locale,
      images: project.image ? [{ url: project.image }] : []
    },
    twitter: { 
      title, 
      description, 
      card: 'summary_large_image',
      images: project.image ? [project.image] : []
    }
  };
}

export default function ProjectDetailPage({params: {locale, id}}: PageProps) {
  unstable_setRequestLocale(locale);
  const t = useTranslations();
  const projectT = useTranslations('projects');
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    notFound();
  }

  // JSON-LD Schema for Project
  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: projectT(project.titleKey),
    description: projectT(project.descriptionKey),
    datePublished: `${project.year}-01-01`,
    creator: {
      '@type': 'Organization',
      name: 'UpRoof',
      url: 'https://uproof.eu'
    },
    ...(project.image && {
      image: {
        '@type': 'ImageObject',
        url: `https://uproof.eu${project.image}`,
        contentUrl: `https://uproof.eu${project.image}`
      }
    })
  };

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <Breadcrumbs />
          
          <article className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            {project.image && (
              <div className="relative w-full h-64 sm:h-96 md:h-[500px]">
                <Image
                  src={project.image}
                  alt={projectT(project.titleKey)}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}
            
            <div className="p-6 sm:p-8 md:p-12">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {project.year}
                </span>
                {project.services.map(service => (
                  <span 
                    key={service}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {projectT(project.titleKey)}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                📍 {projectT(project.locationKey)}
              </p>
              
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {projectT('projectDetails')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {projectT(project.descriptionKey)}
                </p>
                
                <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {projectT('servicesProvided')}
                  </h3>
                  <ul className="space-y-2">
                    {project.services.map(service => (
                      <li key={service} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-200">
                <a 
                  href={`/${locale}/contact`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  {t('common.contactUs')}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </article>
          
          <div className="mt-12">
            <a 
              href={`/${locale}/projects`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {projectT('backToProjects')}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
