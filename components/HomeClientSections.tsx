"use client";

import type {ReactNode} from 'react';
import Vendors from '@/components/Vendors';
import Reviews from '@/components/Reviews';
import FAQ from '@/components/FAQ';

type Props = {
  children?: ReactNode;
};

export default function HomeClientSections({children}: Props) {
  return (
    <>
      <Vendors />
      <Reviews />
      {children}
      <FAQ />
    </>
  );
}
