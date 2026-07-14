import {assignLeadToCrmUser, unassignLeadFromCrmUser, getCrmUserById} from '@/lib/crmUsersStore';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {deleteProjectByLeadId} from '@/lib/crmProjectsStore';
import {deleteCrmLead, getCrmLeadById, updateCrmLead} from '@/lib/crmLeadsStore';
import type {CrmLead} from '@/lib/crmMockData';

type ServiceContext = {
  actorEmail: string;
  actorRole: string;
  sessionId: string;
  ip: string;
};

type UpdateInput = ServiceContext & {
  leadId: string;
  updates: Partial<CrmLead>;
  expectedUpdatedAtUtc?: string;
};

type AssignInput = ServiceContext & {
  leadId: string;
  salesUserId: string;
};

type UnassignInput = ServiceContext & {
  leadId: string;
};

export async function assignLead(input: AssignInput) {
  const salesUser = await getCrmUserById(input.salesUserId);
  if (!salesUser || salesUser.role !== 'sales' || !salesUser.isActive) {
    return {ok: false as const, status: 404, error: 'Sales user not found'};
  }

  const currentLead = await getCrmLeadById(input.leadId);
  if (!currentLead) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  if (currentLead.assignedSalesUserId === input.salesUserId) {
    return {ok: true as const, duplicate: true as const, lead: currentLead};
  }

  const result = await assignLeadToCrmUser({
    leadId: input.leadId,
    salesUserId: input.salesUserId,
    assignedBy: input.actorEmail,
  });

  if (!result.assigned) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  await logCrmUserActivity({
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    action: 'lead_assign',
    leadId: input.leadId,
    detail: `assigned_to:${input.salesUserId}`,
    ip: input.ip,
  });

  const lead = await getCrmLeadById(input.leadId);
  return {ok: true as const, duplicate: false as const, lead};
}

export async function unassignLead(input: UnassignInput) {
  const currentLead = await getCrmLeadById(input.leadId);
  if (!currentLead) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  if (!currentLead.assignedSalesUserId) {
    return {ok: true as const, duplicate: true as const, lead: currentLead};
  }

  const result = await unassignLeadFromCrmUser({
    leadId: input.leadId,
    unassignedBy: input.actorEmail,
  });

  if (!result.unassigned) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  await logCrmUserActivity({
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    action: 'lead_unassign',
    leadId: input.leadId,
    detail: 'unassigned_from_sales_user',
    ip: input.ip,
  });

  const lead = await getCrmLeadById(input.leadId);
  return {ok: true as const, duplicate: false as const, lead};
}

export async function updateLead(input: UpdateInput) {
  const currentLead = await getCrmLeadById(input.leadId);
  if (!currentLead) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  if (input.expectedUpdatedAtUtc && currentLead.updatedAtUtc !== input.expectedUpdatedAtUtc) {
    return {ok: false as const, status: 409, error: 'Lead was updated by someone else'};
  }

  const updatedLead = await updateCrmLead(input.leadId, input.updates);
  if (!updatedLead) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  await logCrmUserActivity({
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    action: 'lead_update',
    leadId: input.leadId,
    detail: 'lead_updated_manual',
    ip: input.ip,
  });

  return {ok: true as const, lead: updatedLead};
}

export async function deleteLead(input: ServiceContext & {leadId: string}) {
  const lead = await getCrmLeadById(input.leadId);
  if (!lead) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  const deleted = await deleteCrmLead(input.leadId);
  if (!deleted) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  void deleteProjectByLeadId(input.leadId);

  await logCrmUserActivity({
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    action: 'lead_delete',
    leadId: input.leadId,
    detail: 'lead_deleted_manual',
    ip: input.ip,
  });

  return {ok: true as const};
}
