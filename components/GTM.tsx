'use client';

import Script from 'next/script';
import {useEffect, useRef, useState} from 'react';

type Props = {
  gtmId: string;
};

// Loads Google Tag Manager when analytics consent is granted.
export default function GTM({gtmId}: Props) {
  const [enabled, setEnabled] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    // Check saved consent on mount
    try {
      const stored = localStorage.getItem('cookie-consent');
      if (stored) {
        const prefs = JSON.parse(stored) as {analytics?: boolean};
        if (prefs.analytics) setEnabled(true);
      }
    } catch {}

    // Listen for consent changes from CookieConsent component
    const onConsent = (e: Event) => {
      const detail: any = (e as CustomEvent).detail;
      if (detail && typeof detail.analytics === 'boolean') {
        setEnabled(detail.analytics === true);
      }
    };
    window.addEventListener('cookie-consent', onConsent as EventListener);
    return () => window.removeEventListener('cookie-consent', onConsent as EventListener);
  }, []);

  // Avoid injecting GTM multiple times
  useEffect(() => {
    if (!enabled || loadedRef.current) return;
    loadedRef.current = true;
  }, [enabled]);

  if (!enabled || !gtmId) return null;

  return (
    <>
      {/* Head script - Next.js will place this in head with afterInteractive strategy */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>

      {/* Body noscript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{display: 'none', visibility: 'hidden'}}
        />
      </noscript>
    </>
  );
}
