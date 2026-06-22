"use client";

import CookieConsent from '@/components/CookieConsent';
import GTM from '@/components/GTM';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

type Props = {
  gtmId: string;
};

export default function LayoutClient({gtmId}: Props) {
  return (
    <>
      <GTM gtmId={gtmId} />
      <CookieConsent />
      <WhatsAppFloatingButton />
    </>
  );
}
