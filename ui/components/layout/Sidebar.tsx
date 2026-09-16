'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS, NAV_ITEMS, leadPath } from '@/ui/navigation';
import { useEstimate } from '@/ui/state/EstimateContext';

export function Sidebar() {
  const { leadId, lead } = useEstimate();
  const pathname = usePathname();
  return (
    <nav className="sidebar" aria-label="Estimate navigation">
      <div className="sidebar-product">Roof Estimator</div>
      <div className="sidebar-lead">
        <small>Lead</small>
        <div>{lead?.terms.address ?? leadId}</div>
      </div>
      {NAV_GROUPS.map((group) => (
        <div className="nav-group" key={group.id} aria-label={group.label}>
          <ul>
            {NAV_ITEMS.filter((i) => i.group === group.id).map((item) => {
              const href = leadPath(leadId, item.path);
              const active = pathname === href;
              return (
                <li key={item.path}>
                  <Link href={href} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>
                    {item.step && <span className="nav-step">{item.step}</span>}
                    <span>
                      {item.label}
                      <small>{item.labelLv}</small>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
