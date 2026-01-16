'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {Link} from '@/i18n/routing';

export default function Hero() {
  const t = useTranslations('home.hero');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, user will need to interact
      });
    }
  }, []);

  return (
    <section id="home" className="relative min-h-[calc(100vh-80px)] sm:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/images/hero-roof.svg"
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Enhanced dark overlay with depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/50 to-gray-900/70" />
        
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Blur transition bar - smoother white-to-transparent blend for visibility */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 md:h-44 backdrop-blur-2xl z-20"
          style={{
            background: `linear-gradient(to top,
              rgba(248,250,252,1.0) 0%,
              rgba(248,250,252,0.95) 25%,
              rgba(248,250,252,0.85) 50%,
              rgba(248,250,252,0.65) 75%,
              rgba(248,250,252,0.0) 100%)`
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('title')}
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 font-light mb-8 sm:mb-12 max-w-2xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('subtitle')}
          </motion.p>
          
          {/* Modern button design */}
          <motion.div
            className="flex gap-4 justify-center flex-wrap px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold hover:bg-primary-500 transition-all duration-300 shadow-xl shadow-primary-600/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-0.5 rounded-lg"
            >
              {t('cta')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-gray-900 px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold hover:bg-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 rounded-lg"
            >
              {t('learnMore')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
