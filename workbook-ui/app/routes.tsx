import { Navigate, useParams, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/workbook-ui/components/layout/AppShell';
import { PrintView } from '@/workbook-ui/components/documents/PrintView';
import { EstimateProvider } from '@/workbook-ui/state/EstimateContext';
import { SettingsPage } from '@/workbook-ui/features/settings/SettingsPage';
import { InputsPage } from '@/workbook-ui/features/inputs/InputsPage';
import { LineItemsPage } from '@/workbook-ui/features/lines/LineItemsPage';
import { OfferPage, OfferDocument } from '@/workbook-ui/features/outputs/offer';
import { F2Page, F2Document } from '@/workbook-ui/features/outputs/f2';
import { SummaryPage } from '@/workbook-ui/features/outputs/summary/SummaryPage';
import { MaterialsListPage, MaterialsListDocument } from '@/workbook-ui/features/outputs/materials';
import { WorkPlanPage, WorkPlanDocument } from '@/workbook-ui/features/outputs/workPlan';
import { DayPlanPage, DayPlanDocument } from '@/workbook-ui/features/outputs/dayPlan';
import { ToolsPage, ToolsDocument } from '@/workbook-ui/features/outputs/tools';
import { CashFlowPage, CashFlowDocument } from '@/workbook-ui/features/outputs/cashFlow';
import type { ComponentType } from 'react';

const DEFAULT_LEAD = 'demo-dimzukalns';

/** Documents that can be rendered alone in a separate window (/leads/:leadId/print/:doc). */
export const PRINTABLE: Record<string, ComponentType> = {
  offer: OfferDocument,
  f2: F2Document,
  materials: MaterialsListDocument,
  'work-plan': WorkPlanDocument,
  'day-plan': DayPlanDocument,
  tools: ToolsDocument,
  payments: CashFlowDocument,
};

function LeadScope({ print = false }: { print?: boolean }) {
  const { leadId = DEFAULT_LEAD } = useParams();
  return <EstimateProvider leadId={leadId}>{print ? <PrintView documents={PRINTABLE} /> : <AppShell />}</EstimateProvider>;
}

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to={`/leads/${DEFAULT_LEAD}/settings`} replace /> },
  { path: '/leads/:leadId/print/:doc', element: <LeadScope print /> },
  {
    path: '/leads/:leadId',
    element: <LeadScope />,
    children: [
      { index: true, element: <Navigate to="settings" replace /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'inputs', element: <InputsPage /> },
      { path: 'lines', element: <LineItemsPage /> },
      { path: 'offer', element: <OfferPage /> },
      { path: 'f2', element: <F2Page /> },
      { path: 'summary', element: <SummaryPage /> },
      { path: 'materials', element: <MaterialsListPage /> },
      { path: 'work-plan', element: <WorkPlanPage /> },
      { path: 'day-plan', element: <DayPlanPage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'payments', element: <CashFlowPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
