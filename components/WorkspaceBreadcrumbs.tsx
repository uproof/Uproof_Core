'use client';

import Link from 'next/link';
import {ArrowLeftIcon} from '@heroicons/react/24/outline';

type Crumb = {label: string; href?: string};

type Props = {items: Crumb[]; backHref?: string};

export default function WorkspaceBreadcrumbs({items, backHref}: Props) {
  return <div className="flex items-center gap-2 text-sm">
    {backHref ? <Link href={backHref} aria-label="Back" className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><ArrowLeftIcon className="h-4 w-4" /></Link> : null}
    {items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2">
      {index > 0 ? <span className="text-slate-400">/</span> : null}
      {item.href ? <Link href={item.href} className="font-semibold text-sky-700 hover:text-sky-900">{item.label}</Link> : <span className="font-semibold text-slate-700">{item.label}</span>}
    </span>)}
  </div>;
}
