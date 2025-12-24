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
    <section id="services" className="py-12 sm:py-16 md:py-20 bg-gray-50" style={{contentVisibility: 'auto'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-14 px-2"
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
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`group flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
            >
              {/* Image Section */}
              <div className="md:w-1/2 relative h-64 sm:h-80 md:h-96 overflow-hidden bg-gray-200">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={75}
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=="
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-5 sm:p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 uppercase leading-tight">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6 md:mb-8">
                  {service.description}
                </p>
                
                {/* Roofmaster-style buttons */}
                <div className="flex gap-3 sm:gap-4 flex-wrap">
                  <a
                    href="https://wa.me/37125612440"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-600 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase hover:bg-primary-700 transition-all shadow-lg hover:scale-105"
                  >
                    {tButtons('orderNow')}
                  </a>
                  <Link
                    href={service.link}
                    aria-label={`${tButtons('learnMore')} — ${service.title}`}
                    className="bg-black text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase hover:bg-neutral-900 transition-all shadow-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
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
