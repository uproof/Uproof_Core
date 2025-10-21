'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {HomeIcon, PaintBrushIcon, WrenchScrewdriverIcon} from '@heroicons/react/24/outline';

export default function Services() {
  const t = useTranslations('home.services');

  const services = [
    {
      icon: HomeIcon,
      title: t('construction.title'),
      description: t('construction.description'),
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: PaintBrushIcon,
      title: t('painting.title'),
      description: t('painting.description'),
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: WrenchScrewdriverIcon,
      title: t('maintenance.title'),
      description: t('maintenance.description'),
      gradient: 'from-green-500 to-green-600',
    },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${service.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
