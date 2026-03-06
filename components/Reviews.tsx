'use client';

import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';
import {motion} from 'framer-motion';
import {StarIcon} from '@heroicons/react/24/solid';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';

export default function Reviews() {
  const t = useTranslations('reviews');
  const locale = useLocale();
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
    },
    {
      id: 4,
      name: t('review4.name'),
      rating: 5,
      text: t('review4.text')
    },
    {
      id: 5,
      name: t('review5.name'),
      rating: 5,
      text: t('review5.text')
    },
    {
      id: 6,
      name: t('review6.name'),
      rating: 5,
      text: t('review6.text')
    },
    {
      id: 7,
      name: t('review7.name'),
      rating: 5,
      text: t('review7.text')
    },
    {
      id: 8,
      name: t('review8.name'),
      rating: 5,
      text: t('review8.text')
    },
    {
      id: 9,
      name: t('review9.name'),
      rating: 5,
      text: t('review9.text')
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
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.6}}
          className="text-center"
        >
          <Link href={`/${locale}/reviews`} className="group inline-block">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary-600 mb-3">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors tracking-tight">
              {t('title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto group-hover:text-gray-800 transition-colors">
              {t('subtitle')}
            </p>
          </Link>
        </motion.div>
      </div>

      {/* Scrolling + Manual Controls */}
      <div className="relative">
        {/* Controls */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-6 z-10">
          <button
            aria-label="Previous reviews"
            onClick={() => stepScroll(-1)}
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-soft hover:shadow-card-hover border border-gray-100 text-gray-600 hover:text-primary-600 transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            aria-label="Next reviews"
            onClick={() => stepScroll(1)}
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-soft hover:shadow-card-hover border border-gray-100 text-gray-600 hover:text-primary-600 transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
            className="flex gap-5 sm:gap-6 items-stretch w-max scroll-smooth select-none py-4"
            style={{ willChange: 'transform' }}
          >
          {/* Duplicate reviews for seamless loop */}
          {[...reviews, ...reviews].map((review, index) => {
            const uniqueId = `${review.id}-${index}`;
            const isExpanded = expandedReview === review.id;
            
            return (
              <motion.div
                key={uniqueId}
                initial={{opacity: 0, scale: 0.95}}
                whileInView={{opacity: 1, scale: 1}}
                viewport={{once: true}}
                transition={{duration: 0.4, delay: index * 0.05}}
                onClick={() => toggleExpand(review.id)}
                data-card
                className="flex-shrink-0 snap-start w-[300px] sm:w-[360px] md:w-[400px] bg-white rounded-2xl shadow-card hover:shadow-card-hover p-6 sm:p-8 border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                {/* Rating Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-amber-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className={`text-sm sm:text-base text-gray-600 mb-5 leading-relaxed transition-all duration-300 ${
                  isExpanded ? '' : 'line-clamp-6'
                }`}>
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Expand Indicator */}
                {!isExpanded && review.text.length > 200 && (
                  <p className="text-xs text-primary-600 font-medium mb-4">
                    Click to read more...
                  </p>
                )}

                {/* Author Info */}
                <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-700">{review.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">Google Reviews</p>
                  </div>
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
