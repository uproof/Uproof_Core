"use client";

import React, {useEffect, useRef, useState} from 'react';

// Vanta is a client-only library; we import dynamically to avoid SSR issues
// Supports effects like NET, WAVES, FOG, BIRDS. We'll default to NET.

type VantaOpts = {
  color?: number;
  backgroundColor?: number;
  points?: number;
  maxDistance?: number;
  spacing?: number;
};

type Props = {
  effect?: 'NET' | 'WAVES' | 'FOG';
  className?: string;
  /**
   * Use hex like 0x0ea5e9 for Tailwind primary-500, and 0xffffff for white
   */
  options?: VantaOpts;
  /** If true, disables Vanta and renders a gradient fallback. */
  disable?: boolean;
};

export default function VantaBackground({effect = 'NET', className = '', options, disable}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || disable) return;
    let cleanup: (() => void) | undefined;

    async function init() {
      const THREE = await import('three');
      const baseOpts = {
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
      } as any;

      const merged = {
        color: 0x0ea5e9, // primary-500
        backgroundColor: 0xf8fafc, // slate-50-ish
        points: 10.0,
        maxDistance: 20.0,
        spacing: 16.0,
        ...options,
        ...baseOpts,
      } as any;

      if (effect === 'NET') {
        const NET = (await import('vanta/dist/vanta.net.min')).default;
        vantaRef.current = NET(merged);
      } else if (effect === 'WAVES') {
        const WAVES = (await import('vanta/dist/vanta.waves.min')).default;
        vantaRef.current = WAVES(merged);
      } else if (effect === 'FOG') {
        const FOG = (await import('vanta/dist/vanta.fog.min')).default;
        vantaRef.current = FOG(merged);
      }
      cleanup = () => {
        try {
          vantaRef.current?.destroy?.();
        } catch {}
        vantaRef.current = null;
      };
    }

    init();

    return () => {
      cleanup?.();
    };
  }, [mounted, disable, effect, options]);

  // Motion-reduce / SSR fallback: simple gradient background
  return (
    <div
      ref={ref}
      className={
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-none ' + className
      }
      aria-hidden="true"
    >
      {/* Fallback gradient for slow devices or while Vanta initializes */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
    </div>
  );
}
