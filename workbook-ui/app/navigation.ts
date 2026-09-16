/** Single source for sidebar, routes and step order. */
export type NavGroupId = 'estimate' | 'client' | 'internal';

export interface NavItem {
  path: string;          // relative to /leads/:leadId/
  label: string;
  labelLv: string;       // workbook sheet name
  group: NavGroupId;
  step?: number;         // estimate flow steps only
  printable?: boolean;   // can open in its own window
}

export const NAV_ITEMS: NavItem[] = [
  { path: 'settings', label: 'Settings', labelLv: 'Iestatījumi', group: 'estimate', step: 1 },
  { path: 'inputs', label: 'Inputs', labelLv: 'Ievade', group: 'estimate', step: 2 },
  { path: 'lines', label: 'Line items', labelLv: 'Tāme', group: 'estimate', step: 3 },
  { path: 'offer', label: 'Offer', labelLv: 'Piedāvājums', group: 'client', printable: true },
  { path: 'f2', label: 'Estimate form', labelLv: 'F2 forma', group: 'client', printable: true },
  { path: 'summary', label: 'Summary', labelLv: 'Kopsavilkums', group: 'internal' },
  { path: 'materials', label: 'Materials list', labelLv: 'Materiālu saraksts', group: 'internal', printable: true },
  { path: 'work-plan', label: 'Work plan', labelLv: 'Darbu plāns', group: 'internal', printable: true },
  { path: 'day-plan', label: 'Day plan', labelLv: 'Dienas plāns', group: 'internal', printable: true },
  { path: 'tools', label: 'Tools', labelLv: 'Mehānismu saraksts', group: 'internal', printable: true },
  { path: 'payments', label: 'Payments', labelLv: 'Naudas plūsma', group: 'internal', printable: true },
];

export const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  { id: 'estimate', label: 'Estimate' },
  { id: 'client', label: 'Client documents' },
  { id: 'internal', label: 'Internal' },
];

export const leadPath = (leadId: string, path: string) => `/leads/${encodeURIComponent(leadId)}/${path}`;
export const printPath = (leadId: string, path: string) => `/leads/${encodeURIComponent(leadId)}/print/${path}`;
