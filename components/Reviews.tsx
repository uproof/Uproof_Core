'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {StarIcon} from '@heroicons/react/24/solid';
import {useEffect, useRef, useState} from 'react';

export default function Reviews() {
  const t = useTranslations('reviews');
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAuto, setIsAuto] = useState(true);

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

  // Helper to pause/resume auto sliding
  const pauseAuto = (ms = 5000) => {
    setIsAuto(false);
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current as unknown as number);
      autoTimerRef.current = null;
    }
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current as unknown as number);
    resumeTimerRef.current = setTimeout(() => setIsAuto(true), ms);
  };

  const stepScroll = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const firstCard = track.querySelector<HTMLDivElement>('[data-card]');
    const gap = parseInt(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '16', 10);
    const cardWidth = firstCard ? firstCard.offsetWidth : 320;
    const delta = direction * (cardWidth + gap);
    pauseAuto();
    scroller.scrollBy({ left: delta, behavior: 'smooth' });
    // Looping: if we scroll beyond half, jump back by half (duplicated list)
    setTimeout(() => {
      if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
        scroller.scrollLeft = scroller.scrollLeft - scroller.scrollWidth / 2;
      } else if (scroller.scrollLeft < 0) {
        scroller.scrollLeft = scroller.scrollLeft + scroller.scrollWidth / 2;
      }
    }, 400);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const startAuto = () => {
      if (autoTimerRef.current) return;
      autoTimerRef.current = setInterval(() => {
        // small incremental scroll for smooth continuous movement
        if (!isAuto) return;
        const smallStep = 1; // px
        scroller.scrollLeft += smallStep;
        // seamless loop with duplicated content
        if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
          scroller.scrollLeft = scroller.scrollLeft - scroller.scrollWidth / 2;
        }
      }, 16); // ~60fps
    };

    startAuto();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      pauseAuto(6000);
      // Convert vertical scroll to horizontal
      scroller.scrollLeft += e.deltaY;
      // Seamless loop
      if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
        scroller.scrollLeft = scroller.scrollLeft - scroller.scrollWidth / 2;
      } else if (scroller.scrollLeft <= 0) {
        scroller.scrollLeft = scroller.scrollWidth / 2;
      }
    };
    const onPointerDown = () => pauseAuto(6000);
    scroller.addEventListener('wheel', onWheel, { passive: false });
    scroller.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current as unknown as number);
        autoTimerRef.current = null;
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current as unknown as number);
        resumeTimerRef.current = null;
      }
      scroller.removeEventListener('wheel', onWheel);
      scroller.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isAuto]);

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

      {/* Scrolling + Manual Controls */}
      <div className="relative">
        {/* Controls */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4">
          <button
            aria-label="Previous reviews"
            onClick={() => stepScroll(-1)}
            className="pointer-events-auto rounded-full bg-white/80 hover:bg-white shadow p-2 sm:p-3 border border-gray-200 text-gray-700 hover:text-primary-700 transition"
          >
            ‹
          </button>
          <button
            aria-label="Next reviews"
            onClick={() => stepScroll(1)}
            className="pointer-events-auto rounded-full bg-white/80 hover:bg-white shadow p-2 sm:p-3 border border-gray-200 text-gray-700 hover:text-primary-700 transition"
          >
            ›
          </button>
        </div>

        <div
          ref={scrollerRef}
          className="overflow-x-auto overflow-y-hidden px-4 sm:px-6 touch-pan-x scrollbar-hide"
          onMouseEnter={() => pauseAuto()}
          onTouchStart={() => pauseAuto()}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-6 items-stretch w-max scroll-smooth select-none"
            style={{ willChange: 'transform' }}
          >
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
                data-card
                className="flex-shrink-0 snap-start w-[280px] sm:w-[350px] md:w-[400px] bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border border-gray-100 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
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
      </div>

      {/* no extra CSS needed; using scroll + JS for auto-slide */}
    </section>
  );
}
