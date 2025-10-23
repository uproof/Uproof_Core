'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {StarIcon} from '@heroicons/react/24/solid';

export default function Reviews() {
  const t = useTranslations('reviews');

  const reviews = [
    {
      id: 1,
      name: t('review1.name'),
      role: t('review1.role'),
      rating: 5,
      text: t('review1.text')
    },
    {
      id: 2,
      name: t('review2.name'),
      role: t('review2.role'),
      rating: 5,
      text: t('review2.text')
    },
    {
      id: 3,
      name: t('review3.name'),
      role: t('review3.role'),
      rating: 5,
      text: t('review3.text')
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.6}}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Scrolling Reviews */}
      <div className="relative">
        <div className="flex animate-scroll space-x-6 px-6">
          {/* Duplicate reviews for seamless loop */}
          {[...reviews, ...reviews].map((review, index) => (
            <motion.div
              key={`${review.id}-${index}`}
              initial={{opacity: 0, scale: 0.9}}
              whileInView={{opacity: 1, scale: 1}}
              viewport={{once: true}}
              transition={{duration: 0.5, delay: index * 0.1}}
              className="flex-shrink-0 w-[400px] bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              {/* Rating Stars */}
              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-6 leading-relaxed line-clamp-6">
                {review.text}
              </p>

              {/* Author Info */}
              <div className="border-t pt-4">
                <p className="font-bold text-gray-900 text-lg">{review.name}</p>
                <p className="text-sm text-gray-500">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
