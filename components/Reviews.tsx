'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {StarIcon} from '@heroicons/react/24/solid';
import {useState} from 'react';

export default function Reviews() {
  const t = useTranslations('reviews');
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  const reviews = [
    {
      id: 1,
      name: t('review1.name'),
      rating: 5,
      text: t('review1.text')
    },
    {
      id: 2,
      name: t('review2.name'),
      rating: 5,
      text: t('review2.text')
    },
    {
      id: 3,
      name: t('review3.name'),
      rating: 5,
      text: t('review3.text')
    }
  ];

  const toggleExpand = (id: number) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.6}}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Scrolling Reviews */}
      <div className="relative">
        <div className="flex animate-scroll space-x-4 sm:space-x-6 px-4 sm:px-6">
          {/* Duplicate reviews for seamless loop */}
          {[...reviews, ...reviews].map((review, index) => {
            const uniqueId = `${review.id}-${index}`;
            const isExpanded = expandedReview === review.id;
            
            return (
              <motion.div
                key={uniqueId}
                initial={{opacity: 0, scale: 0.9}}
                whileInView={{opacity: 1, scale: 1}}
                viewport={{once: true}}
                transition={{duration: 0.5, delay: index * 0.1}}
                onClick={() => toggleExpand(review.id)}
                className="flex-shrink-0 w-[280px] sm:w-[350px] md:w-[400px] bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border border-gray-100 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {/* Rating Stars */}
                <div className="flex mb-3 sm:mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className={`text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed transition-all duration-300 ${
                  isExpanded ? '' : 'line-clamp-6'
                }`}>
                  {review.text}
                </p>

                {/* Expand Indicator */}
                {!isExpanded && review.text.length > 200 && (
                  <p className="text-xs text-primary-600 font-semibold mb-4">
                    Click to read more...
                  </p>
                )}

                {/* Author Info */}
                <div className="border-t pt-3 sm:pt-4">
                  <p className="font-bold text-gray-900 text-base sm:text-lg">{review.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">On Google Reviews</p>
                </div>
              </motion.div>
            );
          })}
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
          animation: scroll 15s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
