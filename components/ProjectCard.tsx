 'use client';

import {motion} from 'framer-motion';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

type Props = {
  id: string;
  titleKey: string;
  locationKey: string;
  year: number;
  services: string[];
  descriptionKey: string;
  image?: string;
};

export default function ProjectCard({id, titleKey, locationKey, year, services, descriptionKey, image}: Props) {
  const t = useTranslations();
  const tServiceTags = useTranslations('serviceTags');
  
  return (
    <motion.article
      initial={{opacity: 0, y: 20}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: "-50px"}}
      transition={{duration: 0.4}}
      className="group relative overflow-hidden bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-500 border border-gray-100"
    >
      <Link href={`/projects/${id}`} aria-label={t(titleKey)} className="block focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded-2xl">
        {/* Image with overlay */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={image || '/images/projects/placeholder.svg'}
            alt={t(titleKey)}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transform group-hover:scale-105 transition-transform duration-700"
            priority={false}
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>

          {/* Year badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 font-semibold text-sm rounded-lg shadow-sm">
            {year}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t(locationKey)}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300 tracking-tight">
            {t(titleKey)}
          </h3>
          <p className="text-gray-600 mb-5 leading-relaxed text-sm line-clamp-3">{t(descriptionKey)}</p>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span key={s} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors duration-300">
                {tServiceTags(s)}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}