'use client';

import {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {motion, AnimatePresence} from 'framer-motion';

export default function CookieConsent() {
  const t = useTranslations('cookies');
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      const saved = JSON.parse(consent);
      setPreferences(saved);
      
      // Enable analytics if consented
      if (saved.analytics) {
        enableAnalytics();
      }
    }
  }, []);

  const enableAnalytics = () => {
    // Vercel Analytics is automatically enabled when component is loaded
    // Google Analytics would be enabled here if you add it
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allConsent));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(allConsent);
    // Notify listeners (e.g., GTM loader)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent', {detail: allConsent}));
    }
    enableAnalytics();
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(necessaryOnly);
    // Notify listeners (e.g., GTM loader)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent', {detail: necessaryOnly}));
    }
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Notify listeners (e.g., GTM loader)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent', {detail: preferences}));
    }

    if (preferences.analytics) {
      enableAnalytics();
    }
    
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{y: 100, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        exit={{y: 100, opacity: 0}}
        transition={{duration: 0.3}}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary-600 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('title')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('description')}
              </p>
              
              {/* Cookie Types */}
              <div className="space-y-2 mb-4 lg:mb-0">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="w-4 h-4 rounded border-gray-300 text-primary-600"
                  />
                  <span className="font-medium">{t('necessary.title')}</span>
                  <span className="text-gray-500">({t('necessary.required')})</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 cursor-pointer"
                  />
                  <span className="font-medium">{t('analytics.title')}</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={handleAcceptNecessary}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                {t('rejectAll')}
              </button>
              
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 text-sm font-semibold text-primary-600 border-2 border-primary-600 hover:bg-primary-50 transition-colors whitespace-nowrap"
              >
                {t('savePreferences')}
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors whitespace-nowrap"
              >
                {t('acceptAll')}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            {t('learnMore')}{' '}
            <a href="/privacy-policy" className="text-primary-600 hover:underline">
              {t('privacyPolicy')}
            </a>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
