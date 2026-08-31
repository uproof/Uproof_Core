import type {CrmEstimatorFormData} from '@/lib/crmEstimator';

export type CrmLeadWorkLogEntry = {
  time: string;
  title: string;
  detail: string;
};

export type CrmLead = {
  id: string;
  assignedSalesUserId?: string | null;
  createdAt?: string;
  createdAtUtc?: string;
  customer: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  title?: string;
  problem: string;
  projectAddress: string;
  clientCharacterNote: string;
  status: string;
  progress: string;
  activityUpdate: string;
  dealProgress: string;
  note: string;
  owner: string;
  value: string;
  updatedAt: string;
  updatedAtUtc?: string;
  nextAction: string;
  attachments: string[];
  workLog: CrmLeadWorkLogEntry[];
  estimatorData: CrmEstimatorFormData;
};

export type CrmCustomer = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  leads: number;
  lastContact: string;
};

export type CrmProject = {
  id: string;
  customer: string;
  phase: string;
  owner: string;
  budget: string;
  dueDate: string;
};

export type CrmQuote = {
  id: string;
  leadId?: string;
  revisionNo?: number;
  customer: string;
  status: string;
  amount: string;
  sentAt: string;
  owner: string;
  acceptedAt?: string;
  acceptedProjectId?: string;
  estimateRevisionId?: string;
  acceptUrl?: string;
};

// Production CRM data is stored via the Supabase-backed stores in lib/*.ts.
// This module intentionally keeps only shared type definitions and no mock dataset exports.
