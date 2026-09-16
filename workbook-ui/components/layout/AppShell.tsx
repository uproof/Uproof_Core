import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';

/** Sidebar + sticky totals bar + routed page. */
export function AppShell() {
  const { status, error } = useEstimate();
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <TopBar />
        <main className="page">
          {status === 'error' && <p role="alert">Calculation failed: {error}</p>}
          {status === 'loading' ? <p>Loading estimate…</p> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
