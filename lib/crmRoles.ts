export type CrmRole =
  | 'superadmin'
  | 'admin'
  | 'sales-manager'
  | 'sales'
  | 'estimator'
  | 'project-manager'
  | 'finance'
  | 'worker';

export const CRM_ROLES: CrmRole[] = [
  'superadmin',
  'admin',
  'sales-manager',
  'sales',
  'estimator',
  'project-manager',
  'finance',
  'worker',
];

export function isCrmRole(role: unknown): role is CrmRole {
  return typeof role === 'string' && CRM_ROLES.includes(role as CrmRole);
}

export function isSuperadminRole(role: unknown): role is 'superadmin' {
  return role === 'superadmin';
}

export function isSalesWorkspaceRole(role: unknown): role is Extract<CrmRole, 'sales-manager' | 'sales' | 'estimator' | 'project-manager' | 'finance' | 'worker'> {
  return role === 'sales-manager' || role === 'sales' || role === 'estimator' || role === 'project-manager' || role === 'finance' || role === 'worker';
}

export function normalizeCrmRole(role: unknown): CrmRole | null {
  return isCrmRole(role) ? role : null;
}

export function getCrmRoleDisplayName(role: CrmRole) {
  switch (role) {
    case 'superadmin':
      return 'Superadmin';
    case 'admin':
      return 'Admin';
    case 'sales-manager':
      return 'Sales manager';
    case 'sales':
      return 'Sales user';
    case 'estimator':
      return 'Estimator';
    case 'project-manager':
      return 'Project manager';
    case 'finance':
      return 'Finance user';
    case 'worker':
      return 'Worker / subcontractor';
    default:
      return role;
  }
}