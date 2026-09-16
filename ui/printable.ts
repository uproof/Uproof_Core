'use client';

import type { ComponentType } from 'react';
import { OfferDocument } from '@/ui/features/outputs/offer';
import { F2Sheet } from '@/ui/features/outputs/f2';
import { MaterialsListDocument } from '@/ui/features/outputs/materials';
import { WorkPlanDocument } from '@/ui/features/outputs/workPlan';
import { DayPlanDocument } from '@/ui/features/outputs/dayPlan';
import { ToolsDocument } from '@/ui/features/outputs/tools';
import { CashFlowDocument } from '@/ui/features/outputs/cashFlow';
import { ProcurementDocument } from '@/ui/features/outputs/procurement';

/** Documents that can open in their own window (/leads/:leadId/print/:doc). */
export const PRINTABLE: Record<string, ComponentType> = {
  offer: OfferDocument,
  f2: F2Sheet as ComponentType,
  procurement: ProcurementDocument as ComponentType,
  materials: MaterialsListDocument,
  'work-plan': WorkPlanDocument,
  'day-plan': DayPlanDocument,
  tools: ToolsDocument,
  payments: CashFlowDocument,
};
