'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Solutions() {
  const t = useTranslations('home.solutions');

  const solutions = [
    { key: 'renovation', image: '/images/icons/renovation.webp' },
    { key: 'profiling', image: '/images/icons/profiling.webp' },
    { key: 'repair', image: '/images/icons/repair.webp' },
    { key: 'drainage', image: '/images/icons/drainage.webp' },
    { key: 'painting', image: '/images/icons/painting.webp' },
    { key: 'cleaning', image: '/images/icons/cleaning.webp' },
  ];

  return (
  <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-gray-800 text-white lg:overflow-hidden py-6 sm:py-8" style={{contentVisibility: 'auto'}}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight px-2">
            {t('title')}
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-primary-400 mx-auto mt-3 sm:mt-4" />
        </div>

  {/* Responsive grid: stack on mobile, 2x3 on large screens; avoid fixed heights on mobile */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 sm:gap-6 w-full">
          {solutions.map((solution, index) => (
            <div
              key={solution.key}
              className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-white/10 shadow-lg"
            >
              <div className="relative">
                {/* Fixed aspect ratio to ensure image height on mobile (when rows are auto-sized) */}
                <div className="relative w-full aspect-[4/3] bg-gray-800">
                  <Image
                    src={solution.image}
                    alt={t(solution.key)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={80}
                    priority={index < 3}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFmMjkzNyIvPjwvc3ZnPg=="
                  />
                </div>

                <div className="p-3 sm:p-4 text-center bg-black/40 backdrop-blur-sm">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold tracking-wide leading-tight px-1">
                    {t(solution.key)}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional bottom gradient tint */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
