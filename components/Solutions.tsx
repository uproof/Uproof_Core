'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import Image from 'next/image';

export default function Solutions() {
  const t = useTranslations('home.solutions');

  const solutions = [
    { key: 'renovation', image: '/images/icons/renovation.svg' },
    { key: 'profiling', image: '/images/icons/profiling.svg' },
    { key: 'repair', image: '/images/icons/repair.svg' },
    { key: 'drainage', image: '/images/icons/drainage.svg' },
    { key: 'painting', image: '/images/icons/painting.svg' },
    { key: 'cleaning', image: '/images/icons/cleaning.svg' },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-800 text-white overflow-hidden">
      {/* Diagonal accent */}
      <div className="absolute top-0 left-0 w-full h-32 bg-white transform -skew-y-2 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-800/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
            {t('title')}
          </h2>
          <div className="w-24 h-1 bg-primary-400 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative h-full"
            >
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm p-3 h-full min-h-[140px] transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-2 border border-white/10 hover:border-primary-400/50">
                {/* Icon/Image Placeholder */}
                <div className="relative w-full aspect-square mb-2 flex items-center justify-center bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300 p-3">
                  <div className="relative w-full h-full">
                    <Image
                      src={solution.image}
                      alt={t(solution.key)}
                      fill
                      className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw"
                      onError={(e) => {
                        // Fallback to a simple icon if image not found
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-center text-xs font-semibold tracking-wide leading-tight">
                  {t(solution.key)}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
