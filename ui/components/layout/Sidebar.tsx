'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS, NAV_ITEMS, leadPath } from '@/ui/navigation';
import { useEstimate } from '@/ui/state/EstimateContext';

export function Sidebar() {
  const { leadId } = useEstimate();
  const pathname = usePathname();
  const primaryGroups = NAV_GROUPS.filter((group) => group.id !== 'internal');
  const internalGroup = NAV_GROUPS.find((group) => group.id === 'internal');
  const renderGroup = (group: typeof NAV_GROUPS[number]) => (
    <div className="nav-group" key={group.id} aria-label={group.label}>
      <ul>
        {NAV_ITEMS.filter((i) => i.group === group.id).map((item) => {
          const href = leadPath(leadId, item.path);
          const active = pathname === href;
          return <li key={item.path}>
            <Link href={href} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>
              {item.step && <span className="nav-step">{item.step}</span>}
              <span>{item.label}<small>{item.labelLv}</small></span>
            </Link>
          </li>;
        })}
      </ul>
    </div>
  );
  return (
    <nav className="sidebar" aria-label="Estimate navigation">
      <div className="sidebar-inner">
        <div className="sidebar-product">Roof Estimator</div>
        <div className="nav-row nav-primary">{primaryGroups.map(renderGroup)}</div>
      </div>
      {internalGroup ? <div className="nav-row-wrap"><div className="sidebar-inner"><div className="nav-row nav-secondary">{renderGroup(internalGroup)}</div></div></div> : null}
    </nav>
  );
}
