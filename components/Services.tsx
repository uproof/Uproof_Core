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
      link: '/services/jumta-seguma-montaza'
    },
    {
      title: t('tiledRoof.title'),
      description: t.rich('tiledRoof.description'),
      image: '/images/services/tiledroofs.webp',
      link: '/services/jumta-seguma-montaza'
    },
    {
      title: t('skylights.title'),
      description: t.rich('skylights.description'),
      image: '/images/services/skylights.webp',
      link: '/services/jumta-seguma-montaza'
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
          className="text-center mb-10 sm:mb-12 md:mb-16"
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
              <div className="md:w-1/2 relative h-64 sm:h-80 md:h-96 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={65}
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 uppercase">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                  {service.description}
                </p>
                
                {/* Roofmaster-style buttons */}
                <div className="flex gap-3 sm:gap-4 flex-wrap">
                  <a
                    href="https://wa.me/37125612440"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase hover:bg-primary-700 transition-all shadow-lg hover:scale-105"
                  >
                    {tButtons('orderNow')}
                  </a>
                  <Link
                    href={service.link}
                    aria-label={`${tButtons('learnMore')} — ${service.title}`}
                    className="bg-gray-200 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase hover:bg-gray-300 transition-all"
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
