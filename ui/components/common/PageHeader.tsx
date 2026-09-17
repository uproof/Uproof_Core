'use client';

import type { ReactNode } from 'react';

interface Props { title: string; titleLv?: string; description?: ReactNode; actions?: ReactNode }

export function PageHeader({ title, titleLv, actions }: Props) {
  return (
    <div className="page-header">
      <div>
        <h2>{title} {titleLv && <span className="lv">{titleLv}</span>}</h2>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
