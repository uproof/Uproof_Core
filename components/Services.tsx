'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {Link} from '@/i18n/routing';

type ServicesProps = {
  limit?: number;
};

export default function Services({ limit }: ServicesProps) {
  const t = useTranslations('home.services');
  const tButtons = useTranslations('home.services.buttons');

  const services = [
    {
      title: t('construction.title'),
      description: t.rich('construction.description', {
        bold: (chunks) => <strong>{chunks}</strong>,
      }),
      image: '/images/services/construction.webp',
      link: '/services/jumta-buvnieciba'
    },
    {
      title: t('roofStructure.title'),
      description: t.rich('roofStructure.description'),
      image: '/images/services/roof-structure.webp',
      link: '/services/jumta-konstrukciju-montaza'
    },
    {
      title: t('painting.title'),
      description: t.rich('painting.description'),
      image: '/images/services/Painting.webp',
      link: '/services/jumta-krasosana'
    },
    {
      title: t('maintenance.title'),
      description: t.rich('maintenance.description'),
      image: '/images/services/maintenance.webp',
      link: '/services/jumta-apkope-remonts'
    },
    {
      title: t('metalProfile.title'),
      description: t.rich('metalProfile.description'),
      image: '/images/services/metalprofile.webp',
      link: '/services/valcprofila-montaza'
    },
    {
      title: t('tiledRoof.title'),
      description: t.rich('tiledRoof.description'),
      image: '/images/services/tiledroofs.webp',
      link: '/services/dakstinu-montaza'
    },
    {
      title: t('skylights.title'),
      description: t.rich('skylights.description'),
      image: '/images/services/skylights.webp',
      link: '/services/jumta-logu-montaza'
    },
    {
      title: t('gutterSystem.title'),
      description: t.rich('gutterSystem.description'),
      image: '/images/services/guttersystem.webp',
      link: '/services/noteksistemu-uzstadisana'
    },
    {
      title: t('snowRemoval.title'),
      description: t.rich('snowRemoval.description'),
      image: '/images/services/snowremoval.webp',
      link: '/services/jumta-apkope-remonts'
    },
    {
      title: t('leafCleaning.title'),
      description: t.rich('leafCleaning.description'),
      image: '/images/services/leafcleaning.webp',
      link: '/services/jumta-apkope-remonts'
    },
  ];

  const visibleServices = typeof limit === 'number' ? services.slice(0, limit) : services;

  return (
    <section id="services" className="py-6 sm:py-8 md:py-10 bg-gray-50" style={{contentVisibility: 'auto'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 px-2"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('title')}
          </h2>
          <div className="w-20 h-1 bg-primary-600 mx-auto"></div>
        </motion.div>

        <div className="space-y-6 sm:space-y-8">
          {visibleServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`group flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden border border-gray-100`}
            >
              {/* Image Section */}
              <div className="md:w-1/2 relative h-64 sm:h-80 md:h-96 overflow-hidden bg-gray-100">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 767px) 100vw, 50vw"
                  quality={65}
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
                  {service.description}
                </p>
                
                {/* Modern button style */}
                <div className="flex gap-3 flex-wrap">
                  <a
                    href="https://wa.me/37125612440"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold hover:bg-primary-700 transition-all duration-300 rounded-lg shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
                  >
                    {tButtons('orderNow')}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <Link
                    href={service.link}
                    aria-label={`${tButtons('learnMore')} — ${service.title}`}
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold hover:bg-gray-800 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    {tButtons('learnMore')} <span className="sr-only">— {service.title}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
