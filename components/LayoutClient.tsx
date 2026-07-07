"use client";

import {usePathname} from 'next/navigation';
import CookieConsent from '@/components/CookieConsent';
import GTM from '@/components/GTM';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

type Props = {
  gtmId: string;
};

export default function LayoutClient({gtmId}: Props) {
  const pathname = usePathname() || '';
  const showWhatsApp = !/^\/(?:[a-z]{2}(?:-[A-Z]{2})?)\/(?:admin|crm)(?:\/|$)/.test(pathname);

  return (
    <>
      <GTM gtmId={gtmId} />
      <CookieConsent />
      {showWhatsApp && <WhatsAppFloatingButton />}
    </>
  );
}
