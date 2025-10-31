'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {Link} from '@/i18n/routing';

export default function Services() {
  const t = useTranslations('home.services');

  const services = [
    {
      title: t('construction.title'),
      description: t('construction.description'),
      image: '/images/services/construction.webp',
      link: '/services#construction'
    },
    {
      title: t('painting.title'),
      description: t('painting.description'),
      image: '/images/services/painting.webp',
      link: '/services#painting'
    },
    {
      title: t('maintenance.title'),
      description: t('maintenance.description'),
      image: '/images/services/maintenance.webp',
      link: '/services#maintenance'
    },
  ];

  return (
    <section id="services" className="py-12 sm:py-16 md:py-20 bg-gray-50">
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
          {services.map((service, index) => (
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
                    ORDER NOW
                  </a>
                  <Link
                    href={service.link}
                    className="bg-gray-200 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase hover:bg-gray-300 transition-all"
                  >
                    LEARN MORE
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
