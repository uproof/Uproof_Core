import fs from 'node:fs';
import path from 'node:path';

type SqliteDatabase = {
  prepare: (sql: string) => {
    all: (...args: unknown[]) => unknown[];
    get: (...args: unknown[]) => unknown;
    run: (...args: unknown[]) => {changes: number};
  };
  exec: (sql: string) => void;
  transaction: <T extends (...args: any[]) => any>(fn: T) => T;
};

declare namespace Database {
  export type Database = SqliteDatabase;
}

let database: Database.Database | null = null;

function isoNow() {
  return new Date().toISOString();
}

function hasColumn(db: Database.Database, tableName: string, columnName: string) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{name: string}>;
  return rows.some((row) => row.name === columnName);
}

function ensureLeadColumns(db: Database.Database) {
  if (!hasColumn(db, 'leads', 'assigned_sales_user_id')) {
    db.exec('ALTER TABLE leads ADD COLUMN assigned_sales_user_id TEXT');
  }
  if (!hasColumn(db, 'leads', 'assigned_by')) {
    db.exec("ALTER TABLE leads ADD COLUMN assigned_by TEXT NOT NULL DEFAULT ''");
  }
  if (!hasColumn(db, 'leads', 'assigned_at')) {
    db.exec("ALTER TABLE leads ADD COLUMN assigned_at TEXT NOT NULL DEFAULT ''");
  }
}

function ensureCrmUserColumns(db: Database.Database) {
  if (!hasColumn(db, 'crm_users', 'mfa_secret')) {
    db.exec("ALTER TABLE crm_users ADD COLUMN mfa_secret TEXT NOT NULL DEFAULT ''");
  }
  if (!hasColumn(db, 'crm_users', 'session_valid_after')) {
    db.exec("ALTER TABLE crm_users ADD COLUMN session_valid_after TEXT NOT NULL DEFAULT ''");
  }
  if (!hasColumn(db, 'crm_users', 'archived_at')) {
    db.exec("ALTER TABLE crm_users ADD COLUMN archived_at TEXT NOT NULL DEFAULT ''");
  }
}

function ensureSchema(db: Database.Database) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      problem TEXT NOT NULL DEFAULT '',
      project_address TEXT NOT NULL DEFAULT '',
      client_character_note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      progress TEXT NOT NULL,
      activity_update TEXT NOT NULL,
      deal_progress TEXT NOT NULL,
      note TEXT NOT NULL,
      owner TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      next_action TEXT NOT NULL,
      attachments_json TEXT NOT NULL DEFAULT '[]',
      work_log_json TEXT NOT NULL DEFAULT '[]',
      estimator_data_json TEXT NOT NULL DEFAULT '[]',
      assigned_sales_user_id TEXT,
      assigned_by TEXT NOT NULL DEFAULT '',
      assigned_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      owner TEXT NOT NULL,
      phase TEXT NOT NULL,
      budget TEXT NOT NULL,
      due_date TEXT NOT NULL,
      estimator_data_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      leads INTEGER NOT NULL,
      last_contact TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      status TEXT NOT NULL,
      amount TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      owner TEXT NOT NULL,
      lead_id TEXT,
      created_at TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crm_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      mfa_secret TEXT NOT NULL DEFAULT '',
      session_valid_after TEXT NOT NULL DEFAULT '',
      archived_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crm_recovery_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      used_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES crm_users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_crm_recovery_codes_user_id
      ON crm_recovery_codes (user_id);

    CREATE TABLE IF NOT EXISTS crm_password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      requested_by TEXT NOT NULL DEFAULT '',
      expires_at TEXT NOT NULL,
      used_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES crm_users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_crm_password_reset_tokens_user_id
      ON crm_password_reset_tokens (user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_password_reset_tokens_token_hash
      ON crm_password_reset_tokens (token_hash);

    CREATE TABLE IF NOT EXISTS crm_user_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_email TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      lead_id TEXT,
      detail TEXT,
      ip TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_crm_user_activity_created_at
      ON crm_user_activity (created_at DESC);

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT NOT NULL DEFAULT '',
      read_at TEXT NOT NULL DEFAULT '',
      archived_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email
      ON notifications (recipient_email, created_at DESC);

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      success INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
      ON audit_log (created_at DESC);

    CREATE TABLE IF NOT EXISTS crm_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      aggregate_type TEXT NOT NULL,
      aggregate_id TEXT NOT NULL,
      payload_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_crm_events_created_at
      ON crm_events (created_at DESC);

    CREATE TABLE IF NOT EXISTS rate_limits (
      identifier TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL,
      updated_at_utc TEXT NOT NULL
    );
  `);

  ensureLeadColumns(db);
  ensureCrmUserColumns(db);

  if (hasColumn(db, 'leads', 'assigned_sales_user_id')) {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_leads_assigned_sales_user_id
        ON leads (assigned_sales_user_id);
    `);
  }
}

function seedIfNeeded(db: Database.Database) {
  const now = isoNow();
  const approvedSuperadmins = [
    {
      id: 'superadmin-karlis-nikis',
      email: process.env.SUPERADMIN_EMAIL_1 || '',
      name: 'Karlis Nikis',
    },
  ]
    .map((entry) => ({
      id: entry.id,
      email: entry.email.trim().toLowerCase(),
      name: entry.name,
    }))
    .filter((entry) => entry.email);

  const upsertSuperadmin = db.prepare(`
    INSERT INTO crm_users (
      id, email, name, role, is_active, mfa_secret, session_valid_after, archived_at, created_at, updated_at_utc
    ) VALUES (
      @id, @email, @name, 'superadmin', 1, '', @sessionValidAfter, '', @createdAt, @updatedAtUtc
    )
    ON CONFLICT(email) DO UPDATE SET
      id = excluded.id,
      name = excluded.name,
      role = 'superadmin',
      is_active = 1,
      session_valid_after = excluded.session_valid_after,
      archived_at = '',
      updated_at_utc = excluded.updated_at_utc
  `);

  for (const account of approvedSuperadmins) {
    upsertSuperadmin.run({
      id: account.id,
      email: account.email,
      name: account.name,
      sessionValidAfter: now,
      createdAt: now,
      updatedAtUtc: now,
    });
  }
}

export function getDb(): Database.Database {
  throw new Error('SQLite storage has been removed. Use Supabase storage only.');
}

export function nowIso() {
  return isoNow();
}
