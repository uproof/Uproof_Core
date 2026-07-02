'use client';

import {useEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {useLocale} from 'next-intl';

type Vendor = {
  name: string;
  website: string;
  logo: string;
  fallback: string;
};

const vendors: Vendor[] = [
  {
    name: 'AVR Baltija',
    website: 'https://avrbaltija.lv/',
    logo: 'https://avrbaltija.lv/favicon.ico',
    fallback: 'AVR',
  },
  {
    name: 'Produss',
    website: 'https://produs.lv/lv/metala-jumtu-segumi-un-skarda-jumti-produslv-jumta-risinajumi',
    logo: 'https://produs.lv/favicon.ico',
    fallback: 'PRD',
  },
  {
    name: 'Lebens',
    website: 'https://lebens.lv/categories/metala-jumta-segumi/',
    logo: 'https://lebens.lv/favicon.ico',
    fallback: 'LBN',
  },
  {
    name: 'ProWood',
    website: 'https://www.prowood.lv/',
    logo: 'https://www.prowood.lv/favicon.ico',
    fallback: 'PWD',
  },
  {
    name: 'Kurši',
    website: 'https://www.kursi.lv/',
    logo: 'https://www.kursi.lv/favicon.ico',
    fallback: 'KRS',
  },
  {
    name: 'DEPO',
    website: 'https://online.depo.lv/',
    logo: 'https://online.depo.lv/favicon.ico',
    fallback: 'DPO',
  },
  {
    name: 'Inserv',
    website: 'https://www.inserv.lv/',
    logo: 'https://www.inserv.lv/favicon.ico',
    fallback: 'INV',
  },
];

function VendorLogo({vendor}: {vendor: Vendor}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold tracking-[0.2em] text-white">
        {vendor.fallback}
      </div>
    );
  }

  return (
    <img
      src={vendor.logo}
      alt={`${vendor.name} logo`}
      className="h-14 w-14 rounded-xl object-contain bg-white p-2 shadow-sm ring-1 ring-gray-200"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}

export default function Vendors() {
  const locale = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAuto, setIsAuto] = useState(true);

  const title =
    locale === 'nl-BE'
      ? 'Onze Leveranciers En Partners'
      : locale === 'en'
        ? 'Our Vendors And Partners'
        : 'Mūsu Piegādātāji Un Partneri';

  const subtitle =
    locale === 'nl-BE'
      ? 'Merken En Leveranciers Waarvan We Materialen En Dakoplossingen Gebruiken.'
      : locale === 'en'
        ? 'Trusted Brands And Suppliers We Use For Roofing Materials And Systems.'
        : 'Pārbaudīti Zīmoli Un Piegādātāji, Kuru Materiālus Izmantojam Jumta Risinājumos.';

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
      const firstCard = track.querySelector<HTMLAnchorElement>('[data-vendor-card]');
      const gap = parseInt(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '16', 10);
      const cardWidth = firstCard ? firstCard.offsetWidth : 256;
      const delta = direction * (cardWidth + gap);
      pauseAuto();
      scroller.scrollBy({left: delta, behavior: 'smooth'});
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
          if (!isAuto) return;
          scroller.scrollLeft += 1;
          if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
            scroller.scrollLeft = scroller.scrollLeft - scroller.scrollWidth / 2;
          }
        }, 16);
      };

      startAuto();

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        pauseAuto(6000);
        scroller.scrollLeft += e.deltaY;
        if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
          scroller.scrollLeft = scroller.scrollLeft - scroller.scrollWidth / 2;
        } else if (scroller.scrollLeft <= 0) {
          scroller.scrollLeft = scroller.scrollWidth / 2;
        }
      };

      const onPointerDown = () => pauseAuto(6000);

      scroller.addEventListener('wheel', onWheel, {passive: false});
      scroller.addEventListener('pointerdown', onPointerDown, {passive: true});

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
    <section className="py-16 sm:py-20 bg-white overflow-hidden relative border-y border-gray-100">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.6}}
          className="text-center"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-primary-700 mb-3">Partners</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-6 z-20">
          <button
            aria-label="Previous vendors"
            onClick={() => stepScroll(-1)}
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-soft hover:shadow-card-hover border border-gray-100 text-gray-600 hover:text-primary-600 transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            aria-label="Next vendors"
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
          style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-5 items-stretch w-max scroll-smooth select-none py-4"
            style={{willChange: 'transform'}}
          >
            {[...vendors, ...vendors].map((vendor, index) => (
              <a
                key={`${vendor.name}-${index}`}
                data-vendor-card
                href={vendor.website}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex min-w-[10.5rem] sm:min-w-[11.5rem] max-w-[13rem] min-h-[5.5rem] items-center gap-3 rounded-full border border-gray-200 bg-gray-50/80 px-3 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:bg-white hover:shadow-card"
              >
                <VendorLogo vendor={vendor} />
                <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight text-gray-900 group-hover:text-primary-700">{vendor.name}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}