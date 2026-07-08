import {randomUUID} from 'crypto';
import {getDb, nowIso} from '@/lib/crmDb';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {getCrmLeadById} from '@/lib/crmLeadsStore';
import {decryptSecret, encryptSecret, hashPassword, normalizeSecretInput, verifyPassword} from '@/lib/secretVault';

export type CrmUserRole = 'sales' | 'superadmin';

export type CrmUser = {
  id: string;
  email: string;
  name: string;
  role: CrmUserRole;
  isActive: boolean;
  password?: string;
  mfaSecret?: string;
  createdAt: string;
  updatedAtUtc: string;
};

type CrmUserRow = {
  id: string;
  email: string;
  name: string;
  role: CrmUserRole;
  is_active: number;
  password: string;
  mfa_secret: string;
  created_at: string;
  updated_at_utc: string;
};

function safeDecryptSecret(value: string) {
  if (!value) {
    return '';
  }

  try {
    return decryptSecret(value);
  } catch {
    return '';
  }
}

function rowToCrmUser(row: CrmUserRow): CrmUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.is_active === 1,
    password: row.password || '',
    mfaSecret: row.mfa_secret || '',
    createdAt: row.created_at,
    updatedAtUtc: row.updated_at_utc,
  };
}

export async function getCrmUsers(): Promise<CrmUser[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .select('id,email,full_name,role,is_active,crm_password,crm_mfa_secret,created_at,updated_at')
      .in('role', ['sales', 'superadmin'])
      .order('created_at', {ascending: true});

    if (!error && data) {
      return data.map((entry: any) => ({
        id: entry.id,
        email: entry.email,
        name: entry.full_name || entry.email,
        role: entry.role,
        isActive: !!entry.is_active,
        password: entry.crm_password || '',
        mfaSecret: entry.crm_mfa_secret || '',
        createdAt: entry.created_at,
        updatedAtUtc: entry.updated_at,
      }));
    }
  }

  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM crm_users WHERE role IN (\'sales\', \'superadmin\') ORDER BY created_at ASC')
    .all() as CrmUserRow[];

  return rows.map(rowToCrmUser);
}

export async function getCrmUserByEmail(email: string): Promise<CrmUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .select('id,email,full_name,role,is_active,crm_password,crm_mfa_secret,created_at,updated_at')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        email: data.email,
        name: data.full_name || data.email,
        role: data.role,
        isActive: !!data.is_active,
        password: data.crm_password || '',
        mfaSecret: data.crm_mfa_secret || '',
        createdAt: data.created_at,
        updatedAtUtc: data.updated_at,
      };
    }
  }

  const db = getDb();
  const row = db
    .prepare('SELECT * FROM crm_users WHERE lower(email) = lower(?) LIMIT 1')
    .get(normalizedEmail) as CrmUserRow | undefined;

  return row ? rowToCrmUser(row) : null;
}

export async function getCrmUserById(id: string): Promise<CrmUser | null> {
  const userId = id.trim();
  if (!userId) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .select('id,email,full_name,role,is_active,crm_password,crm_mfa_secret,created_at,updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        email: data.email,
        name: data.full_name || data.email,
        role: data.role,
        isActive: !!data.is_active,
        password: data.crm_password || '',
        mfaSecret: data.crm_mfa_secret || '',
        createdAt: data.created_at,
        updatedAtUtc: data.updated_at,
      };
    }
  }

  const db = getDb();
  const row = db
    .prepare('SELECT * FROM crm_users WHERE id = ? LIMIT 1')
    .get(userId) as CrmUserRow | undefined;

  return row ? rowToCrmUser(row) : null;
}

type CreateCrmUserInput = {
  email: string;
  name: string;
  role?: CrmUserRole;
  password?: string;
  mfaSecret?: string;
};

export async function createCrmUser(input: CreateCrmUserInput): Promise<CrmUser> {
  const role = input.role || 'sales';
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email || !name) {
    throw new Error('Email and name are required');
  }

  const password = normalizeSecretInput(input.password || '');
  const mfaSecret = normalizeSecretInput(input.mfaSecret || '');
  const passwordHash = hashPassword(password);
  const encryptedMfaSecret = mfaSecret ? encryptSecret(mfaSecret) : '';

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const createAuthResult = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        full_name: name,
        display_name: name,
      },
    });

    if (createAuthResult.error) {
      throw new Error(createAuthResult.error.message || 'Failed to create CRM user in Supabase Auth');
    }

    const {data, error} = await supabase
      .from('user_profiles')
      .insert({
        id: createAuthResult.data.user?.id || randomUUID(),
        email,
        full_name: name,
        role,
        is_active: true,
        crm_password: passwordHash,
        crm_mfa_secret: encryptedMfaSecret,
      })
      .select('id,email,full_name,role,is_active,crm_password,crm_mfa_secret,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create CRM user in Supabase');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email,
      role: data.role,
      isActive: !!data.is_active,
      password: data.crm_password || '',
      mfaSecret: data.crm_mfa_secret || '',
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  const db = getDb();
  const now = nowIso();
  const id = `crm-user-${randomUUID()}`;

  db.prepare(
    `INSERT INTO crm_users (id, email, name, role, is_active, password, mfa_secret, created_at, updated_at_utc)
     VALUES (@id, @email, @name, @role, @isActive, @password, @mfaSecret, @createdAt, @updatedAtUtc)`
  ).run({
    id,
    email,
    name,
    role,
    isActive: 1,
    password: passwordHash,
    mfaSecret: encryptedMfaSecret,
    createdAt: now,
    updatedAtUtc: now,
  });

  return {
    id,
    email,
    name,
    role,
    isActive: true,
    createdAt: now,
    updatedAtUtc: now,
  };
}

type UpdateCrmUserInput = {
  id: string;
  name?: string;
  isActive?: boolean;
  password?: string;
  mfaSecret?: string;
};

export async function updateCrmUser(input: UpdateCrmUserInput): Promise<CrmUser | null> {
  const userId = input.id.trim();
  if (!userId) {
    throw new Error('User id is required');
  }

  const current = await getCrmUserById(userId);
  if (!current || current.role !== 'sales') {
    return null;
  }

  const nextName = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : current.name;
  const nextActive = typeof input.isActive === 'boolean' ? input.isActive : current.isActive;
  const nextPasswordPlain = typeof input.password === 'string' && input.password.trim() ? input.password.trim() : '';
  const nextMfaPlain = typeof input.mfaSecret === 'string' && input.mfaSecret.trim() ? input.mfaSecret.trim() : '';
  const nextPassword = nextPasswordPlain ? hashPassword(nextPasswordPlain) : current.password || '';
  const nextMfaSecret = nextMfaPlain ? encryptSecret(nextMfaPlain) : current.mfaSecret || '';

  if (
    nextName === current.name &&
    nextActive === current.isActive &&
    (!nextPasswordPlain || verifyPassword(nextPasswordPlain, current.password || '')) &&
    (!nextMfaPlain || safeDecryptSecret(current.mfaSecret || '') === nextMfaPlain)
  ) {
    return current;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    if (nextPasswordPlain) {
      const passwordResult = await supabase.auth.admin.updateUserById(userId, {password: nextPasswordPlain});
      if (passwordResult.error) {
        throw new Error(passwordResult.error.message || 'Failed to update CRM user password');
      }
    }

    const {data, error} = await supabase
      .from('user_profiles')
      .update({
        full_name: nextName,
        is_active: nextActive,
        crm_password: nextPassword,
        crm_mfa_secret: nextMfaSecret,
      })
      .eq('id', userId)
      .select('id,email,full_name,role,is_active,crm_password,crm_mfa_secret,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update CRM user');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email,
      role: data.role,
      isActive: !!data.is_active,
      password: data.crm_password || '',
      mfaSecret: data.crm_mfa_secret || '',
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  const db = getDb();
  db.prepare(
    `UPDATE crm_users
     SET name = @name,
         is_active = @isActive,
         password = @password,
         mfa_secret = @mfaSecret,
         updated_at_utc = @updatedAtUtc
     WHERE id = @id`
  ).run({
    id: userId,
    name: nextName,
    isActive: nextActive ? 1 : 0,
    password: nextPassword,
    mfaSecret: nextMfaSecret,
    updatedAtUtc: nowIso(),
  });

  return await getCrmUserById(userId);
}

export async function deleteCrmUser(id: string): Promise<boolean> {
  const userId = id.trim();
  if (!userId) {
    throw new Error('User id is required');
  }

  const current = await getCrmUserById(userId);
  if (!current || current.role !== 'sales') {
    return false;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const now = new Date().toISOString();
    await supabase
      .from('crm_leads')
      .update({
        assigned_sales_user_id: null,
        assigned_by_user_id: null,
        assigned_at: null,
        updated_at: now,
      })
      .eq('assigned_sales_user_id', userId);

    const profileResult = await supabase
      .from('user_profiles')
      .update({is_active: false})
      .eq('id', userId);

    if (profileResult.error) {
      throw new Error(profileResult.error.message || 'Failed to deactivate CRM user');
    }

    await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
    return true;
  }

  const db = getDb();
  db.prepare(
    `UPDATE leads
     SET assigned_sales_user_id = NULL,
         assigned_by = '',
         assigned_at = '',
         updated_at_utc = @updatedAtUtc
     WHERE assigned_sales_user_id = @userId`
  ).run({userId, updatedAtUtc: nowIso()});

  const result = db.prepare('DELETE FROM crm_users WHERE id = ? AND role = ?').run(userId, 'sales');
  return result.changes > 0;
}

type AssignLeadInput = {
  leadId: string;
  salesUserId: string;
  assignedBy: string;
};

type UnassignLeadInput = {
  leadId: string;
  unassignedBy: string;
};

export async function assignLeadToCrmUser(input: AssignLeadInput): Promise<{assigned: boolean; duplicate: boolean}> {
  const salesUserId = input.salesUserId.trim();
  const leadId = input.leadId.trim();
  const assignedBy = input.assignedBy.trim();

  if (!leadId || !salesUserId || !assignedBy) {
    throw new Error('leadId, salesUserId and assignedBy are required');
  }

  const currentLead = await getCrmLeadById(leadId);
  if (!currentLead) {
    return {assigned: false, duplicate: false};
  }

  if (currentLead.assignedSalesUserId === salesUserId) {
    return {assigned: true, duplicate: true};
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const now = new Date().toISOString();
    const {error} = await supabase
      .from('crm_leads')
      .update({
        assigned_sales_user_id: salesUserId,
        assigned_by_user_id: assignedBy,
        assigned_at: now,
        updated_at: now,
      })
      .eq('external_id', leadId);

    if (error) {
      throw new Error(error.message || 'Failed to assign lead in Supabase');
    }

    return {assigned: true, duplicate: false};
  }

  const db = getDb();
  const now = nowIso();
  const result = db
    .prepare(
      `UPDATE leads
       SET assigned_sales_user_id = @salesUserId,
           assigned_by = @assignedBy,
           assigned_at = @assignedAt,
           owner = (SELECT name FROM crm_users WHERE id = @salesUserId LIMIT 1),
           updated_at_utc = @updatedAtUtc
       WHERE id = @leadId`
    )
    .run({
      salesUserId,
      assignedBy,
      assignedAt: now,
      updatedAtUtc: now,
      leadId,
    });

  return {assigned: result.changes > 0, duplicate: false};
}

export async function unassignLeadFromCrmUser(input: UnassignLeadInput): Promise<{unassigned: boolean; duplicate: boolean}> {
  const leadId = input.leadId.trim();
  const unassignedBy = input.unassignedBy.trim();

  if (!leadId || !unassignedBy) {
    throw new Error('leadId and unassignedBy are required');
  }

  const currentLead = await getCrmLeadById(leadId);
  if (!currentLead) {
    return {unassigned: false, duplicate: false};
  }

  if (!currentLead.assignedSalesUserId) {
    return {unassigned: true, duplicate: true};
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const now = new Date().toISOString();
    const {error} = await supabase
      .from('crm_leads')
      .update({
        assigned_sales_user_id: null,
        assigned_by_user_id: null,
        assigned_at: null,
        updated_at: now,
      })
      .eq('external_id', leadId);

    if (error) {
      throw new Error(error.message || 'Failed to unassign lead in Supabase');
    }

    return {unassigned: true, duplicate: false};
  }

  const db = getDb();
  const now = nowIso();
  const result = db
    .prepare(
      `UPDATE leads
       SET assigned_sales_user_id = NULL,
           assigned_by = '',
           assigned_at = '',
           updated_at_utc = @updatedAtUtc
       WHERE id = @leadId AND assigned_sales_user_id IS NOT NULL`
    )
    .run({leadId, updatedAtUtc: now});

  return {unassigned: result.changes > 0, duplicate: false};
}
