 'use client';

import {motion} from 'framer-motion';
import Image from 'next/image';
import {useTranslations} from 'next-intl';

type Props = {
  titleKey: string;
  locationKey: string;
  year: number;
  services: string[];
  descriptionKey: string;
  image?: string;
};

export default function ProjectCard({titleKey, locationKey, year, services, descriptionKey, image}: Props) {
  const t = useTranslations();
  const tServiceTags = useTranslations('serviceTags');
  
  return (
    <motion.div
      initial={{opacity: 0, y: 30}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      transition={{duration: 0.6}}
      className="group relative overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      {/* Image with overlay */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={image || '/images/projects/placeholder.svg'}
          alt={t(titleKey)}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transform group-hover:scale-110 transition-transform duration-700"
          priority={false}
        />
        {/* Dark overlay that lightens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
        
        {/* Year badge */}
        <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 font-bold text-sm">
          {year}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
          {t(titleKey)}
        </h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-primary-600"></span>
          {t(locationKey)}
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">{t(descriptionKey)}</p>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <span key={s} className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 uppercase tracking-wide hover:bg-primary-600 hover:text-white transition-colors duration-300">
              {tServiceTags(s)}
            </span>
          ))}
        </div>
        
        {/* Bottom accent line */}
        <div className="mt-6 h-1 w-0 bg-gradient-to-r from-primary-600 to-primary-400 group-hover:w-full transition-all duration-500"></div>
      </div>
    </motion.div>
  );
}