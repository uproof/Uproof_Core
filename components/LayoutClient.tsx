"use client";

import CookieConsent from '@/components/CookieConsent';
import GTM from '@/components/GTM';

type Props = {
  gtmId: string;
};

export default function LayoutClient({gtmId}: Props) {
  return (
    <>
      <GTM gtmId={gtmId} />
      <CookieConsent />
    </>
  );
}
