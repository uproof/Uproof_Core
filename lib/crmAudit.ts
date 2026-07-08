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

async function sendToExternalSink(record: CrmAuditEvent) {
  const sinkUrl = process.env.CRM_AUDIT_WEBHOOK_URL?.trim();
  if (!sinkUrl) {
    return;
  }

  const sinkSecret = process.env.CRM_AUDIT_WEBHOOK_SECRET?.trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    await fetch(sinkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sinkSecret ? {Authorization: `Bearer ${sinkSecret}`} : {}),
      },
      body: JSON.stringify(record),
      signal: controller.signal,
    });
  } catch {
    // External sinks must never break the privileged action path.
  } finally {
    clearTimeout(timeout);
  }
}

export async function logCrmAudit(event: Omit<CrmAuditEvent, 'at'>) {
  const record: CrmAuditEvent = {
    ...event,
    at: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(AUDIT_LOG_PATH), {recursive: true});
  await fs.appendFile(AUDIT_LOG_PATH, `${JSON.stringify(record)}\n`, 'utf8');
  await sendToExternalSink(record);
}
