import type { ReactNode } from 'react';

export interface KeyValue { label: ReactNode; value: ReactNode; hint?: ReactNode; emphasis?: boolean; divider?: boolean }

export function KeyValueList({ items }: { items: KeyValue[] }) {
  return (
    <dl className="kv">
      {items.map((it, i) => (
        <div key={i} className={[it.emphasis && 'kv-strong', it.divider && 'kv-divider'].filter(Boolean).join(' ') || undefined}>
          <dt>{it.label}{it.hint && <small>{it.hint}</small>}</dt>
          <dd className="num">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
