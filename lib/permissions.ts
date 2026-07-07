import type {AdminRole} from '@/lib/adminAuth';

export type PermissionAction =
  | 'viewCrmDashboard'
  | 'viewAssignedLeads'
  | 'updateAssignedLeads'
  | 'viewLeadDetails'
  | 'downloadAssignedDocs'
  | 'viewOwnActivity'
  | 'viewAllActivity'
  | 'createCrmUsers'
  | 'viewCrmUsers'
  | 'assignLeads'
  | 'reassignLeads'
  | 'unassignLeads'
  | 'exportCrm'
  | 'manageCms'
  | 'deleteLeads'
  | 'createLeads';

const PERMISSIONS: Record<AdminRole, Record<PermissionAction, boolean>> = {
  sales: {
    viewCrmDashboard: true,
    viewAssignedLeads: true,
    updateAssignedLeads: true,
    viewLeadDetails: true,
    downloadAssignedDocs: true,
    viewOwnActivity: true,
    viewAllActivity: false,
    createCrmUsers: false,
    viewCrmUsers: false,
    assignLeads: false,
    reassignLeads: false,
    unassignLeads: false,
    exportCrm: false,
    manageCms: false,
    deleteLeads: false,
    createLeads: false,
  },
  superadmin: {
    viewCrmDashboard: true,
    viewAssignedLeads: true,
    updateAssignedLeads: true,
    viewLeadDetails: true,
    downloadAssignedDocs: true,
    viewOwnActivity: true,
    viewAllActivity: true,
    createCrmUsers: true,
    viewCrmUsers: true,
    assignLeads: true,
    reassignLeads: true,
    unassignLeads: true,
    exportCrm: true,
    manageCms: true,
    deleteLeads: true,
    createLeads: true,
  },
};

export function canPerform(role: AdminRole | null | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  return PERMISSIONS[role][action];
}

export function requirePermission(role: AdminRole | null | undefined, action: PermissionAction) {
  if (!canPerform(role, action)) {
    throw new Error(`Missing permission: ${action}`);
  }
}
