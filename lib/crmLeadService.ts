import {getDb} from '@/lib/crmDb';
import {getCrmUserById} from '@/lib/crmUsersStore';
import {
  assignLeadRow,
  getLeadById,
  insertAuditLog,
  insertEvent,
  insertNotification,
  insertUserActivity,
  unassignLeadRow,
  updateLeadRow,
} from '@/lib/crmLeadRepository';
import {deleteProjectByLeadId} from '@/lib/crmProjectsStore';

type ServiceContext = {
  actorEmail: string;
  actorRole: string;
  sessionId: string;
  ip: string;
};

type UpdateInput = ServiceContext & {
  leadId: string;
  updates: Parameters<typeof updateLeadRow>[2];
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

  const db = getDb();
  const run = db.transaction(() => {
    const result = assignLeadRow(db, input.leadId, input.salesUserId, input.actorEmail);
    if (!result.found) {
      return {ok: false as const, status: 404, error: 'Lead not found'};
    }
    if (result.conflict) {
      return {ok: false as const, status: 409, error: 'Lead was updated by someone else'};
    }
    if (result.duplicate) {
      return {ok: true as const, duplicate: true as const, lead: result.lead};
    }

    insertUserActivity(db, {
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_assign',
      leadId: input.leadId,
      detail: `assigned_to:${input.salesUserId}`,
      ip: input.ip,
    });
    insertAuditLog(db, {
      requestId: input.sessionId,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_assign',
      entityType: 'lead',
      entityId: input.leadId,
      detail: `assigned_to:${input.salesUserId}`,
      success: true,
    });
    insertNotification(db, {
      recipientEmail: salesUser.email,
      title: 'New lead assigned',
      message: `Lead ${input.leadId} has been assigned to you.`,
      link: `/crm/leads/${input.leadId.toLowerCase()}`,
    });
    insertEvent(db, {
      eventType: 'LeadAssigned',
      aggregateType: 'lead',
      aggregateId: input.leadId,
      payload: {
        leadId: input.leadId,
        salesUserId: input.salesUserId,
        assignedBy: input.actorEmail,
      },
    });

    return {ok: true as const, duplicate: false as const, lead: result.lead};
  });

  return run();
}

export async function unassignLead(input: UnassignInput) {
  const db = getDb();
  const run = db.transaction(() => {
    const currentLead = getLeadById(input.leadId);
    if (!currentLead) {
      return {ok: false as const, status: 404, error: 'Lead not found'};
    }

    const result = unassignLeadRow(db, input.leadId, input.actorEmail);
    if (!result.found) {
      return {ok: false as const, status: 404, error: 'Lead not found'};
    }
    if (result.conflict) {
      return {ok: false as const, status: 409, error: 'Lead was updated by someone else'};
    }
    if (result.duplicate) {
      return {ok: true as const, duplicate: true as const, lead: result.lead};
    }

    insertUserActivity(db, {
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_unassign',
      leadId: input.leadId,
      detail: 'unassigned_from_sales_user',
      ip: input.ip,
    });
    insertAuditLog(db, {
      requestId: input.sessionId,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_unassign',
      entityType: 'lead',
      entityId: input.leadId,
      detail: 'unassigned_from_sales_user',
      success: true,
    });
    insertEvent(db, {
      eventType: 'LeadUnassigned',
      aggregateType: 'lead',
      aggregateId: input.leadId,
      payload: {
        leadId: input.leadId,
        previousSalesUserId: currentLead.assignedSalesUserId || '',
        unassignedBy: input.actorEmail,
      },
    });

    return {ok: true as const, duplicate: false as const, lead: result.lead};
  });

  return run();
}

export async function updateLead(input: UpdateInput) {
  const db = getDb();
  const run = db.transaction(() => {
    const result = updateLeadRow(db, input.leadId, input.updates, {
      expectedUpdatedAtUtc: input.expectedUpdatedAtUtc,
    });

    if (!result.found) {
      return {ok: false as const, status: 404, error: 'Lead not found'};
    }
    if (result.conflict) {
      return {ok: false as const, status: 409, error: 'Lead was updated by someone else'};
    }

    insertUserActivity(db, {
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_update',
      leadId: input.leadId,
      detail: 'lead_updated_manual',
      ip: input.ip,
    });
    insertAuditLog(db, {
      requestId: input.sessionId,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_update',
      entityType: 'lead',
      entityId: input.leadId,
      detail: 'lead_updated_manual',
      success: true,
    });
    insertEvent(db, {
      eventType: 'LeadUpdated',
      aggregateType: 'lead',
      aggregateId: input.leadId,
      payload: {
        leadId: input.leadId,
        updatedBy: input.actorEmail,
      },
    });

    return {ok: true as const, lead: result.lead};
  });

  return run();
}

export async function deleteLead(input: ServiceContext & {leadId: string}) {
  const db = getDb();
  const run = db.transaction(() => {
    const lead = getLeadById(input.leadId);
    if (!lead) {
      return {ok: false as const, status: 404, error: 'Lead not found'};
    }

    db.prepare('DELETE FROM leads WHERE id = ?').run(input.leadId);
    void deleteProjectByLeadId(input.leadId);

    insertUserActivity(db, {
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_delete',
      leadId: input.leadId,
      detail: 'lead_deleted_manual',
      ip: input.ip,
    });
    insertAuditLog(db, {
      requestId: input.sessionId,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: 'lead_delete',
      entityType: 'lead',
      entityId: input.leadId,
      detail: 'lead_deleted_manual',
      success: true,
    });
    insertEvent(db, {
      eventType: 'LeadDeleted',
      aggregateType: 'lead',
      aggregateId: input.leadId,
      payload: {
        leadId: input.leadId,
        deletedBy: input.actorEmail,
      },
    });

    return {ok: true as const};
  });

  return run();
}
