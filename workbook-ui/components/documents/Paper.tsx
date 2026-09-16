import type { ReactNode } from 'react';

/** Page-like frame for client documents. `wide` for landscape tables (F2). */
export function Paper({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="paper-frame">
      <article className={wide ? 'paper paper-wide' : 'paper'}>{children}</article>
    </div>
  );
}
