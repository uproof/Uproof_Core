'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {CheckCircleIcon} from '@heroicons/react/24/solid';

export default function Solutions() {
  const t = useTranslations('home.solutions');

  const solutions = [
    { key: 'renovation', icon: '🏗️' },
    { key: 'profiling', icon: '🔧' },
    { key: 'repair', icon: '🛠️' },
    { key: 'drainage', icon: '💧' },
    { key: 'painting', icon: '🎨' },
    { key: 'cleaning', icon: '❄️' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.key}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
            >
              <span className="text-3xl">{solution.icon}</span>
              <CheckCircleIcon className="w-6 h-6 text-accent-400 flex-shrink-0" />
              <span className="text-lg font-medium">{t(solution.key)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
