export type CrmLeadWorkLogEntry = {
  time: string;
  title: string;
  detail: string;
};

export type CrmLead = {
  id: string;
  assignedSalesUserId?: string | null;
  customer: string;
  company: string;
  phone: string;
  email: string;
  address: string;
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
  estimatorData: CrmEstimatorRow[];
};

export type CrmEstimatorRow = {
  label: string;
  measurement: string;
  notes: string;
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
  customer: string;
  status: string;
  amount: string;
  sentAt: string;
  owner: string;
};

export const crmStats: Array<{label: string; value: string; delta: string; tone: string}> = [];

export const crmLeads: CrmLead[] = [];

export const crmCustomers: CrmCustomer[] = [];

export const crmProjects: CrmProject[] = [];

export const crmQuotes: CrmQuote[] = [];
