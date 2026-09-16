import type { ReactNode } from 'react';

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warning'; children: ReactNode }) {
  return <div className={`notice notice-${tone}`} role={tone === 'warning' ? 'alert' : 'status'}>{children}</div>;
}
