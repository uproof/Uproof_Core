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
    <section className="relative py-28 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-800 text-white overflow-hidden">
      {/* Diagonal accent */}
      <div className="absolute top-0 left-0 w-full h-32 bg-white transform -skew-y-2 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-800/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 uppercase tracking-tight">
            {t('title')}
          </h2>
          <div className="w-24 h-1 bg-primary-400 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative"
            >
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm p-6 transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 border border-white/10 hover:border-primary-400/50">
                <span className="text-4xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{solution.icon}</span>
                <CheckCircleIcon className="w-7 h-7 text-primary-400 flex-shrink-0" />
                <span className="text-lg font-semibold tracking-wide">{t(solution.key)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
