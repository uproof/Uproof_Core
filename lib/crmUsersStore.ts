import {createHash, randomBytes, randomUUID} from 'crypto';
import {nowIso} from '@/lib/crmDb';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';
import {findCrmLeadRowById, getCrmLeadById} from '@/lib/crmLeadsStore';
import {decryptSecret, encryptSecret, normalizeSecretInput, validatePasswordPolicy} from '@/lib/secretVault';

export type CrmUserRole = 'sales' | 'superadmin';

export type CrmUser = {
  id: string;
  email: string;
  name: string;
  role: CrmUserRole;
  isActive: boolean;
  mfaSecret?: string;
  sessionValidAfter?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAtUtc: string;
};

type CrmUserRow = {
  id: string;
  email: string;
  name: string;
  role: CrmUserRole;
  is_active: number;
  mfa_secret: string;
  session_valid_after: string;
  archived_at: string;
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

export function getPlainMfaSecret(user: Pick<CrmUser, 'mfaSecret'> | null | undefined) {
  return safeDecryptSecret(user?.mfaSecret || '');
}

async function getCrmUserProfileIdByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!error && data?.id) {
      return String(data.id);
    }
  }

  return null;
}

function rowToCrmUser(row: CrmUserRow): CrmUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.is_active === 1,
    mfaSecret: row.mfa_secret || '',
    sessionValidAfter: row.session_valid_after || '',
    archivedAt: row.archived_at || '',
    createdAt: row.created_at,
    updatedAtUtc: row.updated_at_utc,
  };
}

export async function getCrmUsers(): Promise<CrmUser[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .in('role', ['sales', 'superadmin'])
      .order('created_at', {ascending: true});

    if (!error && data) {
      return data.map((entry: any) => ({
        id: entry.id,
        email: entry.email,
        name: entry.full_name || entry.email,
        role: entry.role,
        isActive: !!entry.is_active,
        mfaSecret: entry.crm_mfa_secret || '',
        sessionValidAfter: entry.session_valid_after || '',
        archivedAt: entry.archived_at || '',
        createdAt: entry.created_at,
        updatedAtUtc: entry.updated_at,
      }));
    }
  }

  return [];
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
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        email: data.email,
        name: data.full_name || data.email,
        role: data.role,
        isActive: !!data.is_active,
        mfaSecret: data.crm_mfa_secret || '',
        sessionValidAfter: data.session_valid_after || '',
        archivedAt: data.archived_at || '',
        createdAt: data.created_at,
        updatedAtUtc: data.updated_at,
      };
    }
  }

  return null;
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
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        email: data.email,
        name: data.full_name || data.email,
        role: data.role,
        isActive: !!data.is_active,
        mfaSecret: data.crm_mfa_secret || '',
        sessionValidAfter: data.session_valid_after || '',
        archivedAt: data.archived_at || '',
        createdAt: data.created_at,
        updatedAtUtc: data.updated_at,
      };
    }
  }

  return null;
}

type CreateCrmUserInput = {
  email: string;
  name: string;
  role?: CrmUserRole;
  password?: string;
  mfaSecret?: string;
};

async function findAuthUserIdByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page += 1) {
    const {data, error} = await supabase.auth.admin.listUsers({page, perPage: 100});
    if (error) {
      return null;
    }

    const users = data?.users || [];
    const matched = users.find((entry) => String(entry.email || '').trim().toLowerCase() === target);
    if (matched?.id) {
      return matched.id;
    }

    if (users.length < 100) {
      break;
    }
  }

  return null;
}

export async function createCrmUser(input: CreateCrmUserInput): Promise<CrmUser> {
  const role = input.role || 'sales';
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email || !name) {
    throw new Error('Email and name are required');
  }

  const password = normalizeSecretInput(input.password || '');
  const mfaSecret = normalizeSecretInput(input.mfaSecret || '');
  const encryptedMfaSecret = mfaSecret ? encryptSecret(mfaSecret) : '';
  const createdAt = nowIso();

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for CRM user storage');
  }

  const {data: existingProfile} = await supabase
    .from('user_profiles')
    .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile) {
    throw new Error('A user with this email already exists');
  }

  let authUserId = '';
  const createAuthResult = await supabase.auth.admin.createUser({
    email,
    password: password || undefined,
    email_confirm: true,
    user_metadata: {
      role,
      full_name: name,
      display_name: name,
    },
  });

  if (createAuthResult.error) {
    const authMessage = createAuthResult.error.message || 'Failed to create CRM user in Supabase Auth';
    if (/already been registered|already exists|duplicate/i.test(authMessage)) {
      const recoveredAuthUserId = await findAuthUserIdByEmail(email);
      if (!recoveredAuthUserId) {
        throw new Error('A user with this email already exists in Auth, but profile recovery failed');
      }
      authUserId = recoveredAuthUserId;
    } else {
      throw new Error(authMessage);
    }
  } else {
    authUserId = createAuthResult.data.user?.id || '';
  }

  const {data, error} = await supabase
    .from('user_profiles')
    .upsert({
      id: authUserId || randomUUID(),
      email,
      full_name: name,
      role,
      is_active: true,
      crm_mfa_secret: encryptedMfaSecret,
      session_valid_after: createdAt,
      archived_at: null,
    }, {onConflict: 'id'})
    .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
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
    mfaSecret: data.crm_mfa_secret || '',
    sessionValidAfter: data.session_valid_after || '',
    archivedAt: data.archived_at || '',
    createdAt: data.created_at,
    updatedAtUtc: data.updated_at,
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
  const nextMfaSecret = nextMfaPlain ? encryptSecret(nextMfaPlain) : current.mfaSecret || '';

  if (
    nextName === current.name &&
    nextActive === current.isActive &&
    (!nextMfaPlain || safeDecryptSecret(current.mfaSecret || '') === nextMfaPlain)
  ) {
    return current;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const passwordChanged = !!nextPasswordPlain;
    if (nextPasswordPlain) {
      const passwordResult = await supabase.auth.admin.updateUserById(userId, {password: nextPasswordPlain});
      if (passwordResult.error) {
        throw new Error(passwordResult.error.message || 'Failed to update CRM user password');
      }
    }

    const sessionValidAfter = passwordChanged ? nowIso() : current.sessionValidAfter || null;

    const {data, error} = await supabase
      .from('user_profiles')
      .update({
        full_name: nextName,
        is_active: nextActive,
        crm_mfa_secret: nextMfaSecret,
        session_valid_after: sessionValidAfter,
      })
      .eq('id', userId)
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
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
      mfaSecret: data.crm_mfa_secret || '',
      sessionValidAfter: data.session_valid_after || '',
      archivedAt: data.archived_at || '',
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  throw new Error('Supabase is required for CRM user storage');
}

function normalizeSecurityCode(input: string) {
  return input.trim().replace(/\s+/g, '').toUpperCase();
}

function hashSecurityValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function generateRecoveryCode() {
  const segments = randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g);
  return segments ? segments.join('-') : randomBytes(8).toString('hex').toUpperCase();
}

function generatePasswordResetToken() {
  return randomBytes(32).toString('base64url');
}

export async function revokeCrmUserSessions(userId: string): Promise<CrmUser | null> {
  const current = await getCrmUserById(userId);
  if (!current) {
    return null;
  }

  const now = nowIso();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .update({session_valid_after: now})
      .eq('id', userId)
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to revoke CRM user sessions');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email,
      role: data.role,
      isActive: !!data.is_active,
      mfaSecret: data.crm_mfa_secret || '',
      sessionValidAfter: data.session_valid_after || now,
      archivedAt: data.archived_at || '',
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  return null;
}

export async function resetCrmUserMfa(userId: string): Promise<CrmUser | null> {
  const current = await getCrmUserById(userId);
  if (!current) {
    return null;
  }

  const now = nowIso();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .update({crm_mfa_secret: '', session_valid_after: now})
      .eq('id', userId)
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to reset CRM user MFA');
    }

    await supabase.from('crm_recovery_codes').delete().eq('user_id', userId);

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email,
      role: data.role,
      isActive: !!data.is_active,
      mfaSecret: data.crm_mfa_secret || '',
      sessionValidAfter: data.session_valid_after || now,
      archivedAt: data.archived_at || '',
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  return null;
}

export async function disableCrmUser(userId: string): Promise<CrmUser | null> {
  const current = await getCrmUserById(userId);
  if (!current) {
    return null;
  }

  const now = nowIso();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .update({is_active: false})
      .eq('id', userId)
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to disable CRM user');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email,
      role: data.role,
      isActive: !!data.is_active,
      mfaSecret: data.crm_mfa_secret || '',
      sessionValidAfter: data.session_valid_after || '',
      archivedAt: data.archived_at || '',
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  throw new Error('Supabase is required for CRM user storage');
}

export async function archiveCrmUser(userId: string): Promise<CrmUser | null> {
  const current = await getCrmUserById(userId);
  if (!current) {
    return null;
  }

  const now = nowIso();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .update({is_active: false, archived_at: now, session_valid_after: now})
      .eq('id', userId)
        .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to archive CRM user');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email,
      role: data.role,
      isActive: !!data.is_active,
      mfaSecret: data.crm_mfa_secret || '',
      sessionValidAfter: data.session_valid_after || now,
      archivedAt: data.archived_at || now,
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  return null;
}

export async function replaceRecoveryCodes(userId: string, count = 10): Promise<string[]> {
  const current = await getCrmUserById(userId);
  if (!current) {
    throw new Error('User not found');
  }

  const recoveryCodes = Array.from({length: count}, () => generateRecoveryCode());
  const now = nowIso();
  const codeRows = recoveryCodes.map((code) => ({userId, codeHash: hashSecurityValue(normalizeSecurityCode(code)), createdAt: now}));

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {error: deleteError} = await supabase.from('crm_recovery_codes').delete().eq('user_id', userId);
    if (deleteError) {
      throw new Error(deleteError.message || 'Failed to replace recovery codes');
    }

    const {error: insertError} = await supabase.from('crm_recovery_codes').insert(
      codeRows.map((row) => ({user_id: row.userId, code_hash: row.codeHash, used_at: '', created_at: row.createdAt}))
    );

    if (insertError) {
      throw new Error(insertError.message || 'Failed to store recovery codes');
    }

    return recoveryCodes;
  }

  throw new Error('Supabase is required for CRM user storage');
}

export async function consumeRecoveryCode(userId: string, code: string): Promise<boolean> {
  const current = await getCrmUserById(userId);
  if (!current) {
    return false;
  }

  const normalizedCode = normalizeSecurityCode(code);
  if (!normalizedCode) {
    return false;
  }

  const codeHash = hashSecurityValue(normalizedCode);
  const now = nowIso();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('crm_recovery_codes')
      .select('id')
      .eq('user_id', userId)
      .eq('code_hash', codeHash)
      .eq('used_at', '')
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    const {error: updateError} = await supabase.from('crm_recovery_codes').update({used_at: now}).eq('id', data.id);
    return !updateError;
  }

  return false;
}

type PasswordResetTokenRecord = {
  token: string;
  expiresAt: string;
};

export async function issuePasswordResetToken(userId: string, requestedBy = ''): Promise<PasswordResetTokenRecord> {
  const current = await getCrmUserById(userId);
  if (!current) {
    throw new Error('User not found');
  }

  const token = generatePasswordResetToken();
  const tokenHash = hashSecurityValue(token);
  const now = nowIso();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from('crm_password_reset_tokens').delete().eq('user_id', userId).eq('used_at', '');
    const {error} = await supabase.from('crm_password_reset_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      requested_by: requestedBy,
      expires_at: expiresAt,
      used_at: '',
      created_at: now,
    });

    if (error) {
      throw new Error(error.message || 'Failed to create password reset token');
    }

    return {token, expiresAt};
  }

  throw new Error('Supabase is required for CRM user storage');
}

export async function consumePasswordResetToken(token: string, nextPassword: string): Promise<CrmUser | null> {
  const normalizedToken = String(token || '').trim();
  const password = normalizeSecretInput(nextPassword);
  if (!normalizedToken || !password) {
    return null;
  }

  const tokenHash = hashSecurityValue(normalizedToken);
  const now = nowIso();

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('crm_password_reset_tokens')
      .select('id,user_id,expires_at,used_at')
      .eq('token_hash', tokenHash)
      .eq('used_at', '')
      .maybeSingle();

    if (error || !data || new Date(data.expires_at).getTime() <= Date.now()) {
      return null;
    }

    const {error: updateTokenError} = await supabase.from('crm_password_reset_tokens').update({used_at: now}).eq('id', data.id);
    if (updateTokenError) {
      return null;
    }

    const {error: authError} = await supabase.auth.admin.updateUserById(data.user_id, {password});
    if (authError) {
      return null;
    }

    const {data: userData, error: updateUserError} = await supabase
      .from('user_profiles')
      .update({session_valid_after: now})
      .eq('id', data.user_id)
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .single();

    if (updateUserError) {
      throw new Error(updateUserError.message || 'Failed to update password');
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.full_name || userData.email,
      role: userData.role,
      isActive: !!userData.is_active,
      mfaSecret: userData.crm_mfa_secret || '',
      sessionValidAfter: userData.session_valid_after || now,
      archivedAt: userData.archived_at || '',
      createdAt: userData.created_at,
      updatedAtUtc: userData.updated_at,
    };
  }

  return null;
}

export async function changeCrmUserPassword(userId: string, nextPassword: string): Promise<CrmUser | null> {
  const password = normalizeSecretInput(nextPassword);
  if (!password) {
    return null;
  }

  const passwordPolicyError = validatePasswordPolicy(password);
  if (passwordPolicyError) {
    throw new Error(passwordPolicyError);
  }

  const now = nowIso();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {error} = await supabase.auth.admin.updateUserById(userId, {password});

    if (error) {
      throw new Error(error.message || 'Failed to update CRM user password');
    }

    const {error: profileError} = await supabase
      .from('user_profiles')
      .update({session_valid_after: now})
      .eq('id', userId);

    if (profileError) {
      throw new Error(profileError.message || 'Failed to revoke CRM user sessions after password change');
    }

    return await getCrmUserById(userId);
  }

  throw new Error('Supabase Auth is required to change CRM user passwords');
}

export async function setCrmUserMfaSecret(userId: string, nextMfaSecret: string): Promise<CrmUser | null> {
  const mfaSecret = normalizeSecretInput(nextMfaSecret);
  if (!mfaSecret) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('user_profiles')
      .update({crm_mfa_secret: encryptSecret(mfaSecret)})
      .eq('id', userId)
      .select('id,email,full_name,role,is_active,crm_mfa_secret,session_valid_after,archived_at,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update CRM user MFA secret');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email,
      role: data.role,
      isActive: !!data.is_active,
      mfaSecret: data.crm_mfa_secret || '',
      sessionValidAfter: data.session_valid_after || '',
      archivedAt: data.archived_at || '',
      createdAt: data.created_at,
      updatedAtUtc: data.updated_at,
    };
  }

  throw new Error('Supabase is required for CRM user storage');
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

    await supabase.from('crm_user_activity').update({actor_user_id: null}).eq('actor_user_id', userId);
    await supabase.from('crm_password_reset_tokens').delete().eq('user_id', userId);
    await supabase.from('crm_recovery_codes').delete().eq('user_id', userId);

    const profileResult = await supabase.from('user_profiles').delete().eq('id', userId);

    if (profileResult.error) {
      throw new Error(profileResult.error.message || 'Failed to delete CRM user');
    }

    await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
    return true;
  }

  return false;
}

export async function getCrmUserActivitySnapshot(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return [];

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('crm_user_activity')
      .select('id,actor_email,actor_role,action,lead_id,detail,ip,created_at')
      .eq('actor_email', normalizedEmail)
      .order('created_at', {ascending: false});

    if (!error && Array.isArray(data)) {
      return data;
    }
  }

  return [];
}

export async function getCrmLeadStatusSnapshot(userId: string) {
  const targetUserId = userId.trim();
  if (!targetUserId) return [];

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('crm_leads')
      .select('id,external_id,status,progress,activity_update,deal_progress,owner,assigned_sales_user_id,updated_at')
      .eq('assigned_sales_user_id', targetUserId)
      .order('updated_at', {ascending: false});

    if (!error && Array.isArray(data)) {
      return data;
    }
  }

  return [];
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

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const now = new Date().toISOString();
    const leadRow = await findCrmLeadRowById(leadId);

    if (!leadRow) {
      console.error('assignLeadToCrmUser lookup failed', {
        leadId,
        salesUserId,
      });
      return {assigned: false, duplicate: false};
    }

    if (leadRow.assigned_sales_user_id === salesUserId) {
      return {assigned: true, duplicate: true};
    }

    const actorProfileId = await getCrmUserProfileIdByEmail(assignedBy);
    const {error} = await supabase
      .from('crm_leads')
      .update({
        assigned_sales_user_id: salesUserId,
        assigned_by_user_id: actorProfileId,
        assigned_at: now,
        updated_at: now,
      })
      .eq('id', leadRow.id);

    if (error) {
      throw new Error(error.message || 'Failed to assign lead in Supabase');
    }

    return {assigned: true, duplicate: false};
  }

  return {assigned: false, duplicate: false};
}

export async function unassignLeadFromCrmUser(input: UnassignLeadInput): Promise<{unassigned: boolean; duplicate: boolean}> {
  const leadId = input.leadId.trim();
  const unassignedBy = input.unassignedBy.trim();

  if (!leadId || !unassignedBy) {
    throw new Error('leadId and unassignedBy are required');
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const now = new Date().toISOString();
    const leadRow = await findCrmLeadRowById(leadId);

    if (!leadRow) {
      console.error('unassignLeadFromCrmUser lookup failed', {
        leadId,
      });
      return {unassigned: false, duplicate: false};
    }

    if (!leadRow.assigned_sales_user_id) {
      return {unassigned: true, duplicate: true};
    }

    const {error} = await supabase
      .from('crm_leads')
      .update({
        assigned_sales_user_id: null,
        assigned_by_user_id: null,
        assigned_at: null,
        updated_at: now,
      })
      .eq('id', leadRow.id);

    if (error) {
      throw new Error(error.message || 'Failed to unassign lead in Supabase');
    }

    return {unassigned: true, duplicate: false};
  }

  return {unassigned: false, duplicate: false};
}
