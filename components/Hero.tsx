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
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

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
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('title')}
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-2xl lg:text-3xl text-gray-100 font-light mb-8 sm:mb-12 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('subtitle')}
          </motion.p>
          
          {/* Roofmaster-style buttons */}
          <motion.div
            className="flex gap-3 sm:gap-4 justify-center flex-wrap px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href="#contact"
              className="inline-block bg-primary-600 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold uppercase hover:bg-primary-700 transition-all shadow-2xl hover:shadow-primary-600/50 hover:scale-105"
            >
              {t('cta')}
            </Link>
            <Link
              href="/services"
              className="inline-block bg-white text-gray-900 px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold uppercase hover:bg-gray-100 transition-all shadow-2xl hover:scale-105"
            >
              {t('learnMore')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
