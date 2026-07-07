"use client";

import {useEffect, useMemo, useState} from 'react';

type Props = {
  email: string;
  role: string;
  ip: string;
  sessionId: string;
  generatedAt: string;
};

export default function CrmWatermark({email, role, ip, sessionId, generatedAt}: Props) {
  const [now, setNow] = useState(() => new Date(generatedAt));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stamp = useMemo(() => {
    const shortSid = sessionId.length > 12 ? `${sessionId.slice(0, 12)}...` : sessionId;
    return `${email} | ${role} | ${now.toISOString()} | ${ip} | ${shortSid}`;
  }, [email, role, now, ip, sessionId]);

  const rows = [22, 58, 86];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none">
      {rows.map((top) => (
        <div
          key={top}
          className="absolute left-[-16%] right-[-16%] whitespace-nowrap text-[9px] font-normal uppercase tracking-[0.12em] text-slate-400/[0.01]"
          style={{top: `${top}%`, transform: 'rotate(-18deg)'}}
        >
          {Array.from({length: 4}).map((_, index) => (
            <span key={index} className="mx-12">{stamp}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
