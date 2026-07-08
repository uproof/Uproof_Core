"use client";

import {useEffect, useMemo, useState} from 'react';

type Props = {
  brand: string;
  userId: string;
  generatedAt: string;
};

export default function CrmWatermark({brand, userId, generatedAt}: Props) {
  const [now, setNow] = useState(() => new Date(generatedAt));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stamp = useMemo(() => {
    return `${brand} | ${userId} | ${now.toISOString()}`;
  }, [brand, userId, now]);

  const rows = [10, 28, 46, 64, 82];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      {rows.map((top) => (
        <div
          key={top}
          className="absolute left-[-22%] right-[-22%] whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400/40"
          style={{top: `${top}%`, transform: 'rotate(-18deg)'}}
        >
          {Array.from({length: 7}).map((_, index) => (
            <span key={index} className="mx-8">{stamp}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
