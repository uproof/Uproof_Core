import { NavLink } from 'react-router-dom';
import { NAV_GROUPS, NAV_ITEMS, leadPath } from '@/workbook-ui/app/navigation';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';

export function Sidebar() {
  const { leadId, lead } = useEstimate();
  return (
    <nav className="sidebar" aria-label="Estimate navigation">
      <div className="sidebar-product">Roof Estimator</div>
      <div className="sidebar-lead">
        <small>Lead</small>
        <div>{lead?.terms.address ?? leadId}</div>
      </div>
      {NAV_GROUPS.map((group) => (
        <div className="nav-group" key={group.id}>
          <h4>{group.label}</h4>
          <ul>
            {NAV_ITEMS.filter((i) => i.group === group.id).map((item) => (
              <li key={item.path}>
                <NavLink to={leadPath(leadId, item.path)} className="nav-link">
                  {item.step && <span className="nav-step">{item.step}</span>}
                  <span>
                    {item.label}
                    <small>{item.labelLv}</small>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="sidebar-footer">Engine v0.1, compat mode</div>
    </nav>
  );
}
