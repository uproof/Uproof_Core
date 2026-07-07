import fs from 'fs/promises';
import path from 'path';

export type CrmAuditAction =
  | 'reveal'
  | 'download'
  | 'quote_pdf_download'
  | 'bulk_export_attempt'
  | 'bulk_export_success'
  | 'lead_create'
  | 'lead_update'
  | 'lead_delete';

export type CrmAuditEvent = {
  action: CrmAuditAction;
  userEmail: string;
  role: string;
  sessionId: string;
  ip: string;
  resource?: string;
  field?: string;
  detail?: string;
  at: string;
};

const AUDIT_LOG_PATH = path.join(process.cwd(), 'data', 'crm-audit.log');

export async function logCrmAudit(event: Omit<CrmAuditEvent, 'at'>) {
  const record: CrmAuditEvent = {
    ...event,
    at: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(AUDIT_LOG_PATH), {recursive: true});
  await fs.appendFile(AUDIT_LOG_PATH, `${JSON.stringify(record)}\n`, 'utf8');
}
